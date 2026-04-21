import prisma from "@/lib/prisma";

const GRAPH_API = "https://graph.facebook.com/v19.0";

export interface InstagramPublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export interface InstagramPostAnalytics {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  saved: number;
}

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  timestamp: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
}

// ── Token management ─────────────────────────────────────────────────────────

/**
 * Refreshes a long-lived Instagram access token when it is close to expiring.
 *
 * Instagram long-lived tokens last 60 days. They can be refreshed up to 60 days
 * from issuance using the ig_refresh_token grant, extending them by another 60 days.
 * The token stored in `refreshToken` is the long-lived user token used for renewal.
 *
 * We refresh when within 5 days of expiry to give the cron job a safe window.
 */
export async function refreshInstagramTokenIfNeeded(socialAccount: {
  id: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}): Promise<string> {
  if (!socialAccount.expiresAt) return socialAccount.accessToken;

  const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  if (socialAccount.expiresAt > fiveDaysFromNow) {
    return socialAccount.accessToken;
  }

  // Use the stored long-lived user token for the refresh call
  const tokenToRefresh =
    socialAccount.refreshToken ?? socialAccount.accessToken;

  try {
    const res = await fetch(
      `https://graph.instagram.com/refresh_access_token` +
        `?grant_type=ig_refresh_token&access_token=${tokenToRefresh}`,
    );
    const data = await res.json();

    if (!res.ok || !data.access_token) {
      console.error("[Instagram Refresh Error]", data);
      throw new Error(
        `Token refresh failed: ${data.error?.message ?? JSON.stringify(data)}`,
      );
    }

    const newExpiresAt = new Date(Date.now() + data.expires_in * 1000);

    const updated = await prisma.socialAccount.update({
      where: { id: socialAccount.id },
      data: {
        accessToken: data.access_token,
        refreshToken: data.access_token, // Refreshed token also becomes the next refresh source
        expiresAt: newExpiresAt,
      },
    });

    console.log(`[Instagram] Token renewed for account ${socialAccount.id}`);
    return updated.accessToken;
  } catch (error) {
    console.error("[Instagram Token Refresh Failed]", error);
    throw error;
  }
}

// ── Publishing ────────────────────────────────────────────────────────────────

/**
 * Publishes a post to Instagram via the Graph API Content Publishing endpoint.
 *
 * Two-step process:
 *  1. Create a media container (image_url / video_url + caption)
 *  2. Publish the container → returns the live post ID
 *
 * IMPORTANT LIMITATIONS:
 *  - Instagram does NOT support text-only posts — at least one image or video is required.
 *  - Only Instagram Professional accounts (Business or Creator) can publish via API.
 *  - Instagram does NOT provide an API to delete published posts. Deletion must be done
 *    manually on Instagram. Posts can be removed from our database only.
 *  - Carousel posts (multiple images) require a different endpoint pattern; this
 *    implementation supports single image and single video/reel posts.
 */
export async function publishToInstagram(
  content: string,
  mediaUrls: string[],
  socialAccountId: string,
): Promise<InstagramPublishResult> {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!account || account.platform !== "INSTAGRAM") {
      return {
        success: false,
        error: "Social account not found or is not Instagram",
      };
    }

    if (account.status !== "ACTIVE") {
      return {
        success: false,
        error: "Instagram account is not active. Please reconnect.",
      };
    }

    if (mediaUrls.length === 0) {
      return {
        success: false,
        error:
          "Instagram does not support text-only posts. Please attach at least one image or video.",
      };
    }

    // ── Refresh token if needed ──────────────────────────────────────
    let activeToken: string;
    try {
      activeToken = await refreshInstagramTokenIfNeeded(account);
    } catch (tokenErr: unknown) {
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: { status: "EXPIRED" },
      });
      const msg =
        tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
      return {
        success: false,
        error: `Token expired. Please reconnect your Instagram account: ${msg}`,
      };
    }

    const igUserId = account.platformId;
    const mediaUrl = mediaUrls[0];
    const isVideo = /\.(mp4|mov|avi|webm|m4v)$/i.test(mediaUrl);

    // ── Step 1: Create media container ──────────────────────────────
    const containerBody = new URLSearchParams({
      caption: content,
      access_token: activeToken,
    });

    if (isVideo) {
      containerBody.set("video_url", mediaUrl);
      containerBody.set("media_type", "REELS");
    } else {
      containerBody.set("image_url", mediaUrl);
    }

    const containerRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: containerBody,
    });

    const containerData = await containerRes.json();

    if (!containerRes.ok || !containerData.id) {
      console.error("[Instagram] Container creation failed", containerData);
      return {
        success: false,
        error:
          containerData.error?.message ??
          `Container creation failed (HTTP ${containerRes.status})`,
      };
    }

    const containerId: string = containerData.id;

    // ── For video/reels: poll until processing is FINISHED ──────────
    if (isVideo) {
      try {
        await pollContainerStatus(containerId, activeToken);
      } catch (pollErr: unknown) {
        const msg =
          pollErr instanceof Error ? pollErr.message : String(pollErr);
        return { success: false, error: `Video processing failed: ${msg}` };
      }
    }

    // ── Step 2: Publish the container ───────────────────────────────
    const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: activeToken,
      }),
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok || !publishData.id) {
      console.error("[Instagram] Publish failed", publishData);
      return {
        success: false,
        error:
          publishData.error?.message ??
          `Publish failed (HTTP ${publishRes.status})`,
      };
    }

    console.log(
      `[Instagram] Published post ${publishData.id} for account ${igUserId}`,
    );
    return { success: true, postId: publishData.id };
  } catch (error: unknown) {
    console.error("[Instagram Publish Exception]", error);
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: msg ?? "Unknown error during Instagram publish",
    };
  }
}

/**
 * Polls the media container status until it is FINISHED processing.
 * Videos and Reels require server-side processing before they can be published.
 * Times out after 90 seconds.
 */
async function pollContainerStatus(
  containerId: string,
  accessToken: string,
  maxWaitMs = 90_000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 5_000));

    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code,status&access_token=${accessToken}`,
    );
    const data = await res.json();

    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") {
      throw new Error(
        `Video processing error: ${data.status ?? JSON.stringify(data)}`,
      );
    }
    // IN_PROGRESS → keep polling
  }
  throw new Error("Video processing timed out after 90 seconds");
}

// ── Analytics ─────────────────────────────────────────────────────────────────

/**
 * Fetches engagement metrics for a specific published Instagram post.
 * Metrics: impressions, reach, likes, comments, saved.
 *
 * Note: Instagram Insights are only available for Professional accounts.
 * The `nativePostId` is the Instagram post ID returned by publishToInstagram.
 */
export async function getInstagramPostAnalytics(
  nativePostId: string,
  accessToken: string,
): Promise<InstagramPostAnalytics | null> {
  try {
    const metrics = ["impressions", "reach", "likes", "comments", "saved"].join(
      ",",
    );
    const res = await fetch(
      `${GRAPH_API}/${nativePostId}/insights?metric=${metrics}&access_token=${accessToken}`,
    );
    const data = await res.json();

    if (!res.ok || !data.data) {
      console.error("[Instagram Analytics Error]", data);
      return null;
    }

    const result: Record<string, number> = {};
    for (const item of data.data as Array<{
      name: string;
      values: Array<{ value: number }>;
    }>) {
      result[item.name] = item.values?.[0]?.value ?? 0;
    }

    return {
      impressions: result.impressions ?? 0,
      reach: result.reach ?? 0,
      likes: result.likes ?? 0,
      comments: result.comments ?? 0,
      saved: result.saved ?? 0,
    };
  } catch (error) {
    console.error("[Instagram Analytics Exception]", error);
    return null;
  }
}

/**
 * Fetches account-level Instagram insights for a date range.
 * Returns daily totals for impressions, reach, and profile views.
 */
export async function getInstagramAccountInsights(
  igUserId: string,
  accessToken: string,
  since: Date,
  until: Date,
): Promise<
  Array<{
    date: string;
    impressions: number;
    reach: number;
    profile_views: number;
  }>
> {
  try {
    const params = new URLSearchParams({
      metric: "impressions,reach,profile_views",
      period: "day",
      since: Math.floor(since.getTime() / 1000).toString(),
      until: Math.floor(until.getTime() / 1000).toString(),
      access_token: accessToken,
    });

    const res = await fetch(`${GRAPH_API}/${igUserId}/insights?${params}`);
    const data = await res.json();

    if (!res.ok || !data.data) {
      console.error("[Instagram Account Insights Error]", data);
      return [];
    }

    // Pivot from per-metric time series → per-date objects
    const byDate: Record<
      string,
      { impressions: number; reach: number; profile_views: number }
    > = {};

    for (const metricSeries of data.data as Array<{
      name: string;
      values: Array<{ value: number; end_time: string }>;
    }>) {
      for (const point of metricSeries.values) {
        const date = point.end_time.split("T")[0];
        if (!byDate[date])
          byDate[date] = { impressions: 0, reach: 0, profile_views: 0 };
        if (metricSeries.name === "impressions")
          byDate[date].impressions = point.value;
        if (metricSeries.name === "reach") byDate[date].reach = point.value;
        if (metricSeries.name === "profile_views")
          byDate[date].profile_views = point.value;
      }
    }

    return Object.entries(byDate).map(([date, metrics]) => ({
      date,
      ...metrics,
    }));
  } catch (error) {
    console.error("[Instagram Account Insights Exception]", error);
    return [];
  }
}

// ── Post listing ──────────────────────────────────────────────────────────────

/**
 * Fetches the user's recent Instagram posts (up to 25).
 * Returned posts can be used to sync analytics back into our PostAnalytics table.
 */
export async function getInstagramPosts(
  igUserId: string,
  accessToken: string,
): Promise<InstagramMediaItem[]> {
  try {
    const fields =
      "id,caption,timestamp,media_type,media_url,thumbnail_url,permalink";
    const res = await fetch(
      `${GRAPH_API}/${igUserId}/media?fields=${fields}&limit=25&access_token=${accessToken}`,
    );
    const data = await res.json();

    if (!res.ok || !data.data) {
      console.error("[Instagram Get Posts Error]", data);
      return [];
    }

    return data.data as InstagramMediaItem[];
  } catch (error) {
    console.error("[Instagram Get Posts Exception]", error);
    return [];
  }
}
