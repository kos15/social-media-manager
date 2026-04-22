"use client";

import { useEffect, useState, useCallback } from "react";
import { PlatformChart } from "@/components/dashboard/PlatformChart";
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart2,
  AlertCircle,
  Clock,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import type { AnalyticsResponse } from "@/app/api/analytics/route";

type RangeLabel = "7d" | "30d" | "365d";

const RANGE_OPTIONS: { value: RangeLabel; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "365d", label: "This Year" },
];

const PLATFORM_META = {
  TWITTER: {
    name: "Twitter / X",
    Icon: Twitter,
    color: "text-[#1DA1F2]",
    bg: "bg-[#1DA1F2]/10",
    border: "border-[#1DA1F2]/20",
  },
  LINKEDIN: {
    name: "LinkedIn",
    Icon: Linkedin,
    color: "text-[#0A66C2]",
    bg: "bg-[#0A66C2]/10",
    border: "border-[#0A66C2]/20",
  },
  INSTAGRAM: {
    name: "Instagram",
    Icon: Instagram,
    color: "text-[#E1306C]",
    bg: "bg-[#E1306C]/10",
    border: "border-[#E1306C]/20",
  },
  YOUTUBE: {
    name: "YouTube",
    Icon: Youtube,
    color: "text-[#FF0000]",
    bg: "bg-[#FF0000]/10",
    border: "border-[#FF0000]/20",
  },
} as const;

type PlatformKey = keyof typeof PLATFORM_META;

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success border border-success/20",
  },
  disconnected: {
    label: "Not Connected",
    className: "bg-text-secondary/10 text-text-secondary border border-border",
  },
  limited: {
    label: "Limited Access",
    className: "bg-warning/10 text-warning border border-warning/20",
  },
  error: {
    label: "Reconnect Needed",
    className: "bg-error/10 text-error border border-error/20",
  },
  no_data: {
    label: "No Data",
    className: "bg-text-secondary/10 text-text-secondary border border-border",
  },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function percentChange(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-elevated ${className ?? ""}`}
    />
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

// ── Platform card ─────────────────────────────────────────────────────────────

function PlatformCard({
  platformKey,
  result,
}: {
  platformKey: PlatformKey;
  result: AnalyticsResponse["platforms"][PlatformKey];
}) {
  const meta = PLATFORM_META[platformKey];
  const badge = STATUS_BADGE[result.status] ?? STATUS_BADGE.disconnected;
  const { Icon } = meta;

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${meta.bg}`}>
            <Icon className={`w-4 h-4 ${meta.color}`} />
          </div>
          <span className="text-sm font-medium">{meta.name}</span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      {result.username && (
        <p className="text-xs text-text-secondary truncate">
          @{result.username}
        </p>
      )}
      <div className="mt-1">
        <p className="text-xs text-text-secondary">{result.primaryMetric}</p>
        <p className="text-xl font-bold mt-0.5">
          {result.status === "active" ? formatNumber(result.total) : "—"}
        </p>
      </div>
    </div>
  );
}

// ── Platform notice (below chart) ─────────────────────────────────────────────

function PlatformNotice({
  platformKey,
  result,
}: {
  platformKey: PlatformKey;
  result: AnalyticsResponse["platforms"][PlatformKey];
}) {
  const meta = PLATFORM_META[platformKey];
  const { Icon } = meta;

  if (result.status === "active" || result.status === "disconnected")
    return null;

  const iconClass =
    result.status === "limited" || result.status === "error"
      ? "text-warning"
      : "text-text-secondary";

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-surface border border-border text-sm">
      <div className={`p-1 rounded ${meta.bg} shrink-0`}>
        <Icon className={`w-4 h-4 ${meta.color}`} />
      </div>
      <div className="min-w-0">
        <span className="font-medium">{meta.name}: </span>
        {result.status === "no_data" && (
          <span className="text-text-secondary">
            No data found for this period.
          </span>
        )}
        {(result.status === "limited" || result.status === "error") &&
          result.error && <span className={iconClass}>{result.error}</span>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeLabel>("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async (r: RangeLabel) => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/analytics?range=${r}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AnalyticsResponse = await res.json();
      setData(json);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Failed to load analytics.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  if (loading) return <PageSkeleton />;

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle className="w-12 h-12 text-error/60" />
        <h2 className="text-lg font-semibold">Failed to load analytics</h2>
        <p className="text-text-secondary text-sm max-w-xs">{fetchError}</p>
        <button
          onClick={() => load(range)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const platforms = data.platforms;
  const platformKeys = Object.keys(platforms) as PlatformKey[];

  // Check if ALL platforms are disconnected
  const allDisconnected = platformKeys.every(
    (k) => platforms[k].status === "disconnected",
  );

  // Platforms with active data for the chart
  const activePlatformNames = platformKeys
    .filter((k) => platforms[k].status === "active")
    .map((k) => {
      const map: Record<PlatformKey, string> = {
        TWITTER: "Twitter",
        LINKEDIN: "LinkedIn",
        INSTAGRAM: "Instagram",
        YOUTUBE: "YouTube",
      };
      return map[k];
    });

  const hasChartData =
    activePlatformNames.length > 0 &&
    data.chartData.some((d) =>
      activePlatformNames.some((p) => (d as Record<string, unknown>)[p] !== 0),
    );

  // Engagement % change
  const engPct = percentChange(
    data.summary.totalEngagement,
    data.summary.prevEngagement,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Analytics
        </h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeLabel)}
          className="bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none w-full sm:w-auto cursor-pointer"
        >
          {RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* All-disconnected empty state */}
      {allDisconnected ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center">
            <BarChart2 className="w-8 h-8 text-text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1">
              No accounts connected
            </h2>
            <p className="text-text-secondary text-sm max-w-sm">
              Connect your social media accounts to start tracking analytics
              across all your platforms.
            </p>
          </div>
          <Link
            href="/accounts"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <LinkIcon className="w-4 h-4" />
            Connect Accounts
          </Link>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {/* Total Engagement */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Total Engagement
              </h4>
              <span className="text-3xl font-bold">
                {formatNumber(data.summary.totalEngagement)}
              </span>
              {engPct !== null ? (
                <span
                  className={`text-sm flex items-center mt-2 px-2 py-1 rounded-full ${
                    engPct > 0
                      ? "text-success bg-success/10"
                      : engPct < 0
                        ? "text-error bg-error/10"
                        : "text-text-secondary bg-surface"
                  }`}
                >
                  {engPct > 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : engPct < 0 ? (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  ) : (
                    <Minus className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(engPct)}% vs last period
                </span>
              ) : data.summary.totalEngagement === 0 ? (
                <span className="text-xs text-text-secondary mt-2">
                  No engagement data yet
                </span>
              ) : (
                <span className="text-xs text-text-secondary mt-2">
                  No previous period data
                </span>
              )}
            </div>

            {/* Total Impressions */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Total Impressions
              </h4>
              <span className="text-3xl font-bold">
                {formatNumber(data.summary.totalImpressions)}
              </span>
              {data.summary.totalImpressions === 0 ? (
                <span className="text-xs text-text-secondary mt-2">
                  Synced from published posts
                </span>
              ) : (
                <span className="text-xs text-text-secondary mt-2">
                  From your published posts
                </span>
              )}
            </div>

            {/* Best Time to Post */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
              <h4 className="text-sm font-medium text-text-secondary mb-2">
                Best Time to Post
              </h4>
              {data.summary.bestTimeToPost ? (
                <>
                  <span className="text-2xl font-bold">
                    {data.summary.bestTimeToPost}
                  </span>
                  <span className="text-xs text-text-secondary mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Based on your top posts
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-text-secondary">
                    —
                  </span>
                  <span className="text-xs text-text-secondary mt-2">
                    Publish more posts to see insights
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Platform status cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platformKeys.map((k) => (
              <PlatformCard key={k} platformKey={k} result={platforms[k]} />
            ))}
          </div>

          {/* Chart + Top Posts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 md:p-6 flex flex-col">
              <h3 className="font-semibold text-lg mb-1">
                Platform Engagement
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                {range === "7d"
                  ? "Daily for last 7 days"
                  : range === "30d"
                    ? "Daily for last 30 days"
                    : "Monthly for this year"}
              </p>

              {activePlatformNames.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <BarChart2 className="w-10 h-10 text-text-secondary/40" />
                  <p className="text-sm text-text-secondary max-w-xs">
                    Connect at least one social account with analytics access to
                    see engagement data.
                  </p>
                  <Link
                    href="/accounts"
                    className="text-xs text-primary underline underline-offset-2"
                  >
                    Go to Accounts →
                  </Link>
                </div>
              ) : !hasChartData ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <BarChart2 className="w-10 h-10 text-text-secondary/40" />
                  <p className="text-sm text-text-secondary">
                    No activity in the selected period.
                  </p>
                </div>
              ) : (
                <div className="flex-1 w-full min-h-[250px] md:min-h-[300px]">
                  <PlatformChart
                    data={data.chartData}
                    activePlatforms={activePlatformNames}
                  />
                </div>
              )}

              {/* Per-platform notices */}
              {platformKeys.some(
                (k) =>
                  platforms[k].status !== "active" &&
                  platforms[k].status !== "disconnected",
              ) && (
                <div className="mt-4 space-y-2">
                  {platformKeys.map((k) => (
                    <PlatformNotice
                      key={k}
                      platformKey={k}
                      result={platforms[k]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Top Posts */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 md:p-6 flex flex-col">
              <h3 className="font-semibold text-lg mb-4">
                Top Performing Posts
              </h3>

              {data.topPosts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <BarChart2 className="w-10 h-10 text-text-secondary/40" />
                  <p className="text-sm text-text-secondary max-w-xs">
                    No published posts with analytics yet. Start publishing to
                    see your top content here.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto -mx-1">
                  <div className="min-w-[500px] px-1">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-text-secondary uppercase bg-surface">
                        <tr>
                          <th className="px-4 py-3 rounded-l-lg">Post</th>
                          <th className="px-4 py-3">Platforms</th>
                          <th className="px-4 py-3">Engagement</th>
                          <th className="px-4 py-3 rounded-r-lg">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topPosts.map((post) => (
                          <tr
                            key={post.id}
                            className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                          >
                            <td className="px-4 py-4 font-medium max-w-[160px]">
                              <span
                                className="block truncate"
                                title={post.content}
                              >
                                {post.content}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {post.platformIds.map((p) => (
                                  <span
                                    key={p}
                                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                      PLATFORM_META[p as PlatformKey]?.bg ??
                                      "bg-surface"
                                    } ${
                                      PLATFORM_META[p as PlatformKey]?.color ??
                                      "text-text-secondary"
                                    }`}
                                  >
                                    {p.charAt(0) + p.slice(1).toLowerCase()}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {post.engagement > 0
                                ? formatNumber(post.engagement)
                                : "—"}
                            </td>
                            <td className="px-4 py-4 text-text-secondary whitespace-nowrap">
                              {new Date(post.publishedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading indicator when refetching on range change */}
          {loading && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface-elevated border border-border rounded-full px-4 py-2 shadow-lg text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          )}
        </>
      )}
    </div>
  );
}
