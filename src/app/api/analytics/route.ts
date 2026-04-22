import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import { refreshTwitterTokenIfNeeded } from "@/lib/platforms/twitter";
import {
  refreshInstagramTokenIfNeeded,
  getInstagramAccountInsights,
} from "@/lib/platforms/instagram";
import {
  refreshYouTubeTokenIfNeeded,
  getYouTubeChannelAnalytics,
} from "@/lib/platforms/youtube";

export const dynamic = "force-dynamic";

type PlatformStatus =
  | "active"
  | "disconnected"
  | "limited"
  | "error"
  | "no_data";
type RangeLabel = "7d" | "30d" | "365d";

export interface PlatformResult {
  status: PlatformStatus;
  username?: string;
  primaryMetric: string;
  total: number;
  error?: string;
}

interface DailyData {
  date: string; // YYYY-MM-DD
  value: number;
}

interface SocialAccountRow {
  id: string;
  platformId: string;
  username: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  status: string;
}

export interface ChartDataPoint {
  date: string;
  Twitter?: number;
  LinkedIn?: number;
  Instagram?: number;
  YouTube?: number;
}

export interface AnalyticsResponse {
  range: { since: string; until: string; label: RangeLabel };
  summary: {
    totalEngagement: number;
    totalImpressions: number;
    prevEngagement: number;
    bestTimeToPost: string | null;
  };
  chartData: ChartDataPoint[];
  platforms: {
    TWITTER: PlatformResult;
    LINKEDIN: PlatformResult;
    INSTAGRAM: PlatformResult;
    YOUTUBE: PlatformResult;
  };
  topPosts: Array<{
    id: string;
    content: string;
    platformIds: string[];
    publishedAt: string;
    engagement: number;
    impressions: number;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRangeDates(range: RangeLabel) {
  const until = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 365;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const prevSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);
  return { since, until, prevSince, days };
}

function generateDateStrings(since: Date, until: Date): string[] {
  const dates: string[] = [];
  const cursor = new Date(since);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(until);
  end.setHours(23, 59, 59, 999);
  while (cursor <= end) {
    dates.push(cursor.toISOString().split("T")[0]);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function formatDayLabel(dateStr: string): string {
  // Parse as UTC midnight to avoid timezone shifting the day
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatMonthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  return date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
}

function aggregateToMonthly(daily: DailyData[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const { date, value } of daily) {
    const month = date.slice(0, 7); // YYYY-MM
    map.set(month, (map.get(month) ?? 0) + value);
  }
  return map;
}

// Build chart data merging daily data from multiple platforms.
// For 7d/30d: one entry per day. For 365d: one entry per month.
function buildChartData(
  range: RangeLabel,
  since: Date,
  until: Date,
  platformData: Partial<Record<keyof ChartDataPoint, DailyData[]>>,
): ChartDataPoint[] {
  if (range === "365d") {
    // Collect all YYYY-MM keys
    const allMonths = new Set<string>();
    const cursor = new Date(since);
    cursor.setDate(1);
    const endMonth = `${until.getFullYear()}-${String(until.getMonth() + 1).padStart(2, "0")}`;
    while (true) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      allMonths.add(key);
      if (key >= endMonth) break;
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const monthlyByPlatform: Partial<Record<string, Map<string, number>>> = {};
    for (const [platform, data] of Object.entries(platformData)) {
      if (data) monthlyByPlatform[platform] = aggregateToMonthly(data);
    }

    return Array.from(allMonths)
      .sort()
      .map((month) => {
        const entry: ChartDataPoint = { date: formatMonthLabel(month) };
        for (const [platform, map] of Object.entries(monthlyByPlatform)) {
          (entry as Record<string, number | string>)[platform] =
            map?.get(month) ?? 0;
        }
        return entry;
      });
  }

  // Daily view
  const allDates = generateDateStrings(since, until);
  const byDateByPlatform: Partial<Record<string, Map<string, number>>> = {};
  for (const [platform, data] of Object.entries(platformData)) {
    if (data) {
      const map = new Map<string, number>();
      for (const { date, value } of data) map.set(date, value);
      byDateByPlatform[platform] = map;
    }
  }

  return allDates.map((dateStr) => {
    const entry: ChartDataPoint = { date: formatDayLabel(dateStr) };
    for (const [platform, map] of Object.entries(byDateByPlatform)) {
      (entry as Record<string, number | string>)[platform] =
        map?.get(dateStr) ?? 0;
    }
    return entry;
  });
}

// ── Platform fetchers ─────────────────────────────────────────────────────────

async function fetchTwitter(
  account: SocialAccountRow | undefined,
  since: Date,
  until: Date,
  range: RangeLabel,
): Promise<{ result: PlatformResult; daily: DailyData[] }> {
  if (!account) {
    return {
      result: { status: "disconnected", primaryMetric: "Engagement", total: 0 },
      daily: [],
    };
  }
  if (account.status !== "ACTIVE") {
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "Engagement",
        total: 0,
        error: "Please reconnect your Twitter account.",
      },
      daily: [],
    };
  }

  let activeToken: string;
  try {
    activeToken = await refreshTwitterTokenIfNeeded(account);
  } catch {
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: "EXPIRED" },
    });
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "Engagement",
        total: 0,
        error: "Twitter token expired. Please reconnect.",
      },
      daily: [],
    };
  }

  // Twitter free tier only allows last 7 days with time filters.
  // Try with time filter; if 400 date-range error, retry without.
  const fetchTweets = async (withTimeRange: boolean) => {
    const params = new URLSearchParams({
      "tweet.fields": "public_metrics,created_at",
      max_results: "100",
    });
    if (withTimeRange) {
      params.set("start_time", since.toISOString());
      params.set("end_time", until.toISOString());
    }
    return fetch(
      `https://api.x.com/2/users/${account.platformId}/tweets?${params}`,
      { headers: { Authorization: `Bearer ${activeToken}` } },
    );
  };

  try {
    let res = await fetchTweets(true);
    let data: {
      data?: Array<{
        created_at: string;
        public_metrics: {
          like_count: number;
          retweet_count: number;
          reply_count: number;
          quote_count: number;
        };
      }>;
      errors?: Array<{ message: string }>;
      detail?: string;
    } = await res.json();

    // Free tier date-range rejection → retry without time params
    if (
      res.status === 400 ||
      (res.status === 403 &&
        (data.errors?.[0]?.message ?? "").toLowerCase().includes("time"))
    ) {
      res = await fetchTweets(false);
      data = await res.json();
    }

    if (res.status === 429) {
      return {
        result: {
          status: "error",
          username: account.username,
          primaryMetric: "Engagement",
          total: 0,
          error: "Twitter rate limit reached. Try again later.",
        },
        daily: [],
      };
    }
    if (res.status === 401 || res.status === 403) {
      return {
        result: {
          status: "error",
          username: account.username,
          primaryMetric: "Engagement",
          total: 0,
          error: "Please reconnect your Twitter account.",
        },
        daily: [],
      };
    }
    if (!res.ok) {
      return {
        result: {
          status: "error",
          username: account.username,
          primaryMetric: "Engagement",
          total: 0,
          error: data.detail ?? `Twitter API error (HTTP ${res.status})`,
        },
        daily: [],
      };
    }

    if (!data.data || data.data.length === 0) {
      return {
        result: {
          status: "no_data",
          username: account.username,
          primaryMetric: "Engagement",
          total: 0,
        },
        daily: [],
      };
    }

    // Group tweets by creation date, sum engagement
    const byDate = new Map<string, number>();
    for (const tweet of data.data) {
      const dateStr = tweet.created_at.split("T")[0];
      const m = tweet.public_metrics;
      const eng =
        m.like_count + m.retweet_count + m.reply_count + m.quote_count;
      byDate.set(dateStr, (byDate.get(dateStr) ?? 0) + eng);
    }

    // Only keep dates within the requested range (matters when time filter was skipped)
    const sinceStr = since.toISOString().split("T")[0];
    const untilStr = until.toISOString().split("T")[0];
    const daily: DailyData[] = [];
    for (const [date, value] of byDate) {
      if (range !== "7d" || (date >= sinceStr && date <= untilStr)) {
        daily.push({ date, value });
      }
    }

    const total = daily.reduce((s, d) => s + d.value, 0);
    return {
      result: {
        status: total > 0 ? "active" : "no_data",
        username: account.username,
        primaryMetric: "Engagement",
        total,
      },
      daily,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "Engagement",
        total: 0,
        error: msg,
      },
      daily: [],
    };
  }
}

async function fetchLinkedIn(
  account: SocialAccountRow | undefined,
): Promise<{ result: PlatformResult; daily: DailyData[] }> {
  if (!account) {
    return {
      result: { status: "disconnected", primaryMetric: "N/A", total: 0 },
      daily: [],
    };
  }
  if (account.status !== "ACTIVE") {
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "N/A",
        total: 0,
        error: "Please reconnect your LinkedIn account.",
      },
      daily: [],
    };
  }
  // r_member_social scope not requested during OAuth — analytics unavailable
  return {
    result: {
      status: "limited",
      username: account.username,
      primaryMetric: "N/A",
      total: 0,
      error:
        "LinkedIn analytics require the r_member_social permission. Go to Settings → Integrations → LinkedIn, remove the current credentials, save new ones, then reconnect.",
    },
    daily: [],
  };
}

async function fetchInstagram(
  account: SocialAccountRow | undefined,
  since: Date,
  until: Date,
): Promise<{ result: PlatformResult; daily: DailyData[] }> {
  if (!account) {
    return {
      result: {
        status: "disconnected",
        primaryMetric: "Impressions",
        total: 0,
      },
      daily: [],
    };
  }
  if (account.status !== "ACTIVE") {
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "Impressions",
        total: 0,
        error: "Please reconnect your Instagram account.",
      },
      daily: [],
    };
  }

  let activeToken: string;
  try {
    activeToken = await refreshInstagramTokenIfNeeded(account);
  } catch {
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: "EXPIRED" },
    });
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "Impressions",
        total: 0,
        error: "Instagram token expired. Please reconnect.",
      },
      daily: [],
    };
  }

  try {
    const insights = await getInstagramAccountInsights(
      account.platformId,
      activeToken,
      since,
      until,
    );

    if (insights.length === 0) {
      return {
        result: {
          status: "no_data",
          username: account.username,
          primaryMetric: "Impressions",
          total: 0,
        },
        daily: [],
      };
    }

    const daily: DailyData[] = insights.map((d) => ({
      date: d.date,
      value: d.impressions,
    }));
    const total = daily.reduce((s, d) => s + d.value, 0);
    return {
      result: {
        status: "active",
        username: account.username,
        primaryMetric: "Impressions",
        total,
      },
      daily,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "Impressions",
        total: 0,
        error: msg,
      },
      daily: [],
    };
  }
}

async function fetchYouTube(
  account: SocialAccountRow | undefined,
  since: Date,
  until: Date,
): Promise<{ result: PlatformResult; daily: DailyData[] }> {
  if (!account) {
    return {
      result: { status: "disconnected", primaryMetric: "Views", total: 0 },
      daily: [],
    };
  }
  if (account.status !== "ACTIVE") {
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "Views",
        total: 0,
        error: "Please reconnect your YouTube account.",
      },
      daily: [],
    };
  }

  let activeToken: string;
  try {
    activeToken = await refreshYouTubeTokenIfNeeded(account);
  } catch {
    await prisma.socialAccount.update({
      where: { id: account.id },
      data: { status: "EXPIRED" },
    });
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "Views",
        total: 0,
        error: "YouTube token expired. Please reconnect.",
      },
      daily: [],
    };
  }

  try {
    const analytics = await getYouTubeChannelAnalytics(
      account.platformId,
      activeToken,
      since,
      until,
    );

    if (analytics.length === 0) {
      return {
        result: {
          status: "no_data",
          username: account.username,
          primaryMetric: "Views",
          total: 0,
        },
        daily: [],
      };
    }

    const daily: DailyData[] = analytics.map((d) => ({
      date: d.date,
      value: d.views,
    }));
    const total = daily.reduce((s, d) => s + d.value, 0);
    return {
      result: {
        status: "active",
        username: account.username,
        primaryMetric: "Views",
        total,
      },
      daily,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return {
      result: {
        status: "error",
        username: account.username,
        primaryMetric: "Views",
        total: 0,
        error: msg,
      },
      daily: [],
    };
  }
}

// ── Summary from DB ───────────────────────────────────────────────────────────

async function computeSummary(
  userId: string,
  since: Date,
  until: Date,
  prevSince: Date,
) {
  const [curr, prev, recentPosts] = await Promise.all([
    prisma.postAnalytics.findMany({
      where: {
        post: {
          userId,
          status: "PUBLISHED",
          createdAt: { gte: since, lte: until },
        },
      },
      select: { impressions: true, likes: true, comments: true, shares: true },
    }),
    prisma.postAnalytics.findMany({
      where: {
        post: {
          userId,
          status: "PUBLISHED",
          createdAt: { gte: prevSince, lt: since },
        },
      },
      select: { likes: true, comments: true, shares: true },
    }),
    // Best time to post: published posts in last 90 days with analytics
    prisma.post.findMany({
      where: {
        userId,
        status: "PUBLISHED",
        scheduledFor: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        analytics: { isNot: null },
      },
      select: {
        scheduledFor: true,
        analytics: { select: { likes: true, comments: true, shares: true } },
      },
    }),
  ]);

  const totalEngagement = curr.reduce(
    (s, a) => s + a.likes + a.comments + a.shares,
    0,
  );
  const totalImpressions = curr.reduce((s, a) => s + a.impressions, 0);
  const prevEngagement = prev.reduce(
    (s, a) => s + a.likes + a.comments + a.shares,
    0,
  );

  // Compute best time from recent posts
  const slotMap = new Map<string, { total: number; count: number }>();
  for (const post of recentPosts) {
    if (!post.scheduledFor || !post.analytics) continue;
    const d = post.scheduledFor;
    const key = `${d.getDay()}-${d.getHours()}`;
    const eng =
      (post.analytics.likes ?? 0) +
      (post.analytics.comments ?? 0) +
      (post.analytics.shares ?? 0);
    const slot = slotMap.get(key) ?? { total: 0, count: 0 };
    slotMap.set(key, { total: slot.total + eng, count: slot.count + 1 });
  }

  let bestTimeToPost: string | null = null;
  let bestAvg = -1;
  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  for (const [key, { total, count }] of slotMap) {
    const avg = total / count;
    if (avg > bestAvg) {
      bestAvg = avg;
      const [day, hour] = key.split("-").map(Number);
      const h = hour % 12 || 12;
      const ampm = hour < 12 ? "AM" : "PM";
      bestTimeToPost = `${DAYS[day]}, ${h} ${ampm}`;
    }
  }

  return { totalEngagement, totalImpressions, prevEngagement, bestTimeToPost };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rangeParam = new URL(request.url).searchParams.get("range");
  const range: RangeLabel =
    rangeParam === "7d" || rangeParam === "365d" ? rangeParam : "30d";

  const { since, until, prevSince } = getRangeDates(range);

  // Load all social accounts (any status) so we can distinguish never-connected vs expired
  const accounts = await prisma.socialAccount.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      platform: true,
      platformId: true,
      username: true,
      accessToken: true,
      refreshToken: true,
      expiresAt: true,
      status: true,
    },
  });

  const byPlatform = new Map<string, SocialAccountRow>();
  for (const acc of accounts) {
    // If multiple accounts for same platform, prefer ACTIVE one
    const existing = byPlatform.get(acc.platform);
    if (!existing || acc.status === "ACTIVE") {
      byPlatform.set(acc.platform, acc);
    }
  }

  // Fetch all platforms in parallel — failures are isolated
  const [
    twitterRes,
    linkedinRes,
    instagramRes,
    youtubeRes,
    summaryRes,
    topPostsRes,
  ] = await Promise.allSettled([
    fetchTwitter(byPlatform.get("TWITTER"), since, until, range),
    fetchLinkedIn(byPlatform.get("LINKEDIN")),
    fetchInstagram(byPlatform.get("INSTAGRAM"), since, until),
    fetchYouTube(byPlatform.get("YOUTUBE"), since, until),
    computeSummary(user.id, since, until, prevSince),
    prisma.post.findMany({
      where: {
        userId: user.id,
        status: "PUBLISHED",
        createdAt: { gte: since, lte: until },
        analytics: { isNot: null },
      },
      include: { analytics: true },
      orderBy: { analytics: { likes: "desc" } },
      take: 10,
    }),
  ]);

  const twitterData =
    twitterRes.status === "fulfilled"
      ? twitterRes.value
      : {
          result: {
            status: "error" as const,
            primaryMetric: "Engagement",
            total: 0,
            error: "Failed to fetch Twitter data.",
          },
          daily: [] as DailyData[],
        };

  const linkedinData =
    linkedinRes.status === "fulfilled"
      ? linkedinRes.value
      : {
          result: {
            status: "error" as const,
            primaryMetric: "N/A",
            total: 0,
            error: "Failed to fetch LinkedIn data.",
          },
          daily: [] as DailyData[],
        };

  const instagramData =
    instagramRes.status === "fulfilled"
      ? instagramRes.value
      : {
          result: {
            status: "error" as const,
            primaryMetric: "Impressions",
            total: 0,
            error: "Failed to fetch Instagram data.",
          },
          daily: [] as DailyData[],
        };

  const youtubeData =
    youtubeRes.status === "fulfilled"
      ? youtubeRes.value
      : {
          result: {
            status: "error" as const,
            primaryMetric: "Views",
            total: 0,
            error: "Failed to fetch YouTube data.",
          },
          daily: [] as DailyData[],
        };

  const summary =
    summaryRes.status === "fulfilled"
      ? summaryRes.value
      : {
          totalEngagement: 0,
          totalImpressions: 0,
          prevEngagement: 0,
          bestTimeToPost: null,
        };

  const topPostsRaw =
    topPostsRes.status === "fulfilled" ? topPostsRes.value : [];

  // Build chart data — only include platforms with active status
  const platformDailyData: Partial<Record<keyof ChartDataPoint, DailyData[]>> =
    {};
  if (twitterData.result.status === "active")
    platformDailyData.Twitter = twitterData.daily;
  if (instagramData.result.status === "active")
    platformDailyData.Instagram = instagramData.daily;
  if (youtubeData.result.status === "active")
    platformDailyData.YouTube = youtubeData.daily;
  // LinkedIn never has active status (no analytics scope)

  const chartData = buildChartData(range, since, until, platformDailyData);

  const topPosts = topPostsRaw.map((p) => ({
    id: p.id,
    content: p.content.slice(0, 100),
    platformIds: p.platformIds,
    publishedAt: (p.createdAt ?? p.updatedAt).toISOString(),
    engagement:
      (p.analytics?.likes ?? 0) +
      (p.analytics?.comments ?? 0) +
      (p.analytics?.shares ?? 0),
    impressions: p.analytics?.impressions ?? 0,
  }));

  const response: AnalyticsResponse = {
    range: {
      since: since.toISOString(),
      until: until.toISOString(),
      label: range,
    },
    summary,
    chartData,
    platforms: {
      TWITTER: twitterData.result,
      LINKEDIN: linkedinData.result,
      INSTAGRAM: instagramData.result,
      YOUTUBE: youtubeData.result,
    },
    topPosts,
  };

  return NextResponse.json(response);
}
