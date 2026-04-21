import prisma from "@/lib/prisma";
import { getPlatformCredential } from "@/lib/platform-credentials";

const YT_API = "https://www.googleapis.com/youtube/v3";
const YT_ANALYTICS_API = "https://youtubeanalytics.googleapis.com/v2";
const YT_UPLOAD_API = "https://www.googleapis.com/upload/youtube/v3";

export interface YouTubePublishResult {
  success: boolean;
  videoId?: string;
  error?: string;
}

export interface YouTubeVideoAnalytics {
  views: number;
  likes: number;
  comments: number;
  estimatedMinutesWatched: number;
  averageViewDuration: number;
}

export interface YouTubeChannelAnalytics {
  date: string;
  views: number;
  estimatedMinutesWatched: number;
  subscribersGained: number;
  subscribersLost: number;
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

// ── Token management ──────────────────────────────────────────────────────────

/**
 * Refreshes a Google OAuth access token when it is close to expiring.
 * Google access tokens last 1 hour. We refresh within 5 minutes of expiry.
 * Requires a refresh_token (only issued on first consent or `prompt=consent`).
 */
export async function refreshYouTubeTokenIfNeeded(socialAccount: {
  id: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}): Promise<string> {
  if (!socialAccount.expiresAt) return socialAccount.accessToken;

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  if (socialAccount.expiresAt > fiveMinutesFromNow) {
    return socialAccount.accessToken;
  }

  if (!socialAccount.refreshToken) {
    throw new Error(
      "No refresh token available. User must reconnect their YouTube account.",
    );
  }

  const creds = await getPlatformCredential("YOUTUBE");
  if (!creds) {
    throw new Error("YouTube credentials not configured.");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: socialAccount.refreshToken,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    console.error("[YouTube Refresh Error]", data);
    throw new Error(
      `Token refresh failed: ${data.error_description ?? JSON.stringify(data)}`,
    );
  }

  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000);

  const updated = await prisma.socialAccount.update({
    where: { id: socialAccount.id },
    data: {
      accessToken: data.access_token,
      expiresAt: newExpiresAt,
      // refresh_token not returned unless revoked/reissued — keep existing
    },
  });

  console.log(`[YouTube] Token refreshed for account ${socialAccount.id}`);
  return updated.accessToken;
}

// ── Publishing ────────────────────────────────────────────────────────────────

/**
 * Uploads a video to YouTube using the resumable upload API.
 *
 * The `content` field is used as: first line → video title, rest → description.
 * `mediaUrls[0]` must be a publicly accessible video URL (e.g. Cloudinary).
 *
 * YouTube publishing requires:
 *  - youtube.upload scope
 *  - A valid refresh_token (prompt=consent during OAuth)
 *  - Video file in a supported format (MP4, MOV, AVI, etc.)
 *
 * Note: YouTube videos go through server-side processing after upload.
 * They will not be immediately visible but are accessible via the API.
 */
export async function publishToYouTube(
  content: string,
  mediaUrls: string[],
  socialAccountId: string,
): Promise<YouTubePublishResult> {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!account || account.platform !== "YOUTUBE") {
      return {
        success: false,
        error: "Social account not found or is not YouTube",
      };
    }

    if (account.status !== "ACTIVE") {
      return {
        success: false,
        error: "YouTube account is not active. Please reconnect.",
      };
    }

    if (mediaUrls.length === 0) {
      return {
        success: false,
        error: "YouTube requires a video file. Please attach a video.",
      };
    }

    // Refresh token if needed
    let activeToken: string;
    try {
      activeToken = await refreshYouTubeTokenIfNeeded(account);
    } catch (tokenErr: unknown) {
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: { status: "EXPIRED" },
      });
      const msg =
        tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
      return {
        success: false,
        error: `Token expired. Please reconnect your YouTube account: ${msg}`,
      };
    }

    // Parse title (first line) and description (rest)
    const lines = content.split("\n");
    const title = lines[0]?.trim() || "Untitled Video";
    const description = lines.slice(1).join("\n").trim();

    const videoUrl = mediaUrls[0];

    // Download video from Cloudinary/URL into a buffer for upload
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      return {
        success: false,
        error: `Failed to fetch video from URL: HTTP ${videoResponse.status}`,
      };
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const contentType =
      videoResponse.headers.get("content-type") ?? "video/mp4";
    const contentLength = videoBuffer.byteLength;

    // Initiate resumable upload session
    const initRes = await fetch(
      `${YT_UPLOAD_API}/videos?uploadType=resumable&part=snippet,status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": contentType,
          "X-Upload-Content-Length": String(contentLength),
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
            categoryId: "22", // People & Blogs (generic default)
          },
          status: {
            privacyStatus: "public",
            selfDeclaredMadeForKids: false,
          },
        }),
      },
    );

    if (!initRes.ok) {
      const errData = await initRes.json().catch(() => ({}));
      console.error("[YouTube] Resumable upload init failed", errData);
      return {
        success: false,
        error:
          (errData as { error?: { message?: string } }).error?.message ??
          `Upload init failed (HTTP ${initRes.status})`,
      };
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) {
      return { success: false, error: "No upload URL returned by YouTube" };
    }

    // Upload the video bytes
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(contentLength),
      },
      body: videoBuffer,
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.id) {
      console.error("[YouTube] Video upload failed", uploadData);
      return {
        success: false,
        error:
          (uploadData as { error?: { message?: string } }).error?.message ??
          `Video upload failed (HTTP ${uploadRes.status})`,
      };
    }

    console.log(
      `[YouTube] Published video ${uploadData.id} for account ${account.platformId}`,
    );
    return { success: true, videoId: uploadData.id };
  } catch (error: unknown) {
    console.error("[YouTube Publish Exception]", error);
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: msg ?? "Unknown error during YouTube publish",
    };
  }
}

// ── Video management ──────────────────────────────────────────────────────────

/**
 * Fetches the channel's uploaded videos from the uploads playlist.
 * Returns up to 25 most recent videos with statistics.
 */
export async function getYouTubeVideos(
  channelId: string,
  accessToken: string,
): Promise<YouTubeVideoItem[]> {
  try {
    // Get uploads playlist ID from channel
    const channelRes = await fetch(
      `${YT_API}/channels?part=contentDetails&id=${channelId}&access_token=${accessToken}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const channelData = await channelRes.json();
    const uploadsPlaylistId =
      channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      console.error("[YouTube] Could not find uploads playlist", channelData);
      return [];
    }

    // Fetch video IDs from uploads playlist
    const playlistRes = await fetch(
      `${YT_API}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=25`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const playlistData = await playlistRes.json();
    const videoIds: string[] =
      (
        playlistData.items as Array<{ contentDetails: { videoId: string } }>
      )?.map((item) => item.contentDetails.videoId) ?? [];

    if (videoIds.length === 0) return [];

    // Fetch video details + statistics in one call
    const videosRes = await fetch(
      `${YT_API}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const videosData = await videosRes.json();

    return (
      videosData.items?.map(
        (v: {
          id: string;
          snippet: {
            title: string;
            description: string;
            publishedAt: string;
            thumbnails?: {
              medium?: { url?: string };
              default?: { url?: string };
            };
          };
          contentDetails: { duration: string };
          statistics: {
            viewCount?: string;
            likeCount?: string;
            commentCount?: string;
          };
        }) => ({
          id: v.id,
          title: v.snippet.title,
          description: v.snippet.description,
          thumbnailUrl:
            v.snippet.thumbnails?.medium?.url ??
            v.snippet.thumbnails?.default?.url ??
            "",
          publishedAt: v.snippet.publishedAt,
          duration: v.contentDetails.duration,
          viewCount: parseInt(v.statistics.viewCount ?? "0", 10),
          likeCount: parseInt(v.statistics.likeCount ?? "0", 10),
          commentCount: parseInt(v.statistics.commentCount ?? "0", 10),
        }),
      ) ?? []
    );
  } catch (error) {
    console.error("[YouTube Get Videos Exception]", error);
    return [];
  }
}

/**
 * Deletes a YouTube video by its video ID.
 * YouTube Data API v3 supports deletion for videos owned by the authenticated user.
 */
export async function deleteYouTubeVideo(
  videoId: string,
  accessToken: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${YT_API}/videos?id=${videoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 204 || res.ok) {
      return { success: true };
    }

    const data = await res.json().catch(() => ({}));
    console.error("[YouTube Delete Error]", data);
    return {
      success: false,
      error:
        (data as { error?: { message?: string } }).error?.message ??
        `Delete failed (HTTP ${res.status})`,
    };
  } catch (error) {
    console.error("[YouTube Delete Exception]", error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}

// ── Analytics ─────────────────────────────────────────────────────────────────

/**
 * Fetches statistics for a specific YouTube video.
 * Uses YouTube Data API v3 — no Analytics API needed for basic stats.
 */
export async function getYouTubeVideoAnalytics(
  videoId: string,
  accessToken: string,
): Promise<YouTubeVideoAnalytics | null> {
  try {
    const res = await fetch(`${YT_API}/videos?part=statistics&id=${videoId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    const stats = data.items?.[0]?.statistics;
    if (!stats) {
      console.error("[YouTube Video Analytics] No stats found", data);
      return null;
    }

    return {
      views: parseInt(stats.viewCount ?? "0", 10),
      likes: parseInt(stats.likeCount ?? "0", 10),
      comments: parseInt(stats.commentCount ?? "0", 10),
      estimatedMinutesWatched: 0, // Requires YouTube Analytics API — not available per-video in Data API
      averageViewDuration: 0,
    };
  } catch (error) {
    console.error("[YouTube Video Analytics Exception]", error);
    return null;
  }
}

/**
 * Fetches daily channel-level analytics for a date range.
 * Uses YouTube Analytics API v2 — requires yt-analytics.readonly scope.
 *
 * Returns daily totals for views, watch time, subscribers gained/lost.
 */
export async function getYouTubeChannelAnalytics(
  channelId: string,
  accessToken: string,
  since: Date,
  until: Date,
): Promise<YouTubeChannelAnalytics[]> {
  try {
    const startDate = since.toISOString().split("T")[0];
    const endDate = until.toISOString().split("T")[0];

    const params = new URLSearchParams({
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      metrics:
        "views,estimatedMinutesWatched,subscribersGained,subscribersLost",
      dimensions: "day",
      sort: "day",
    });

    const res = await fetch(`${YT_ANALYTICS_API}/reports?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();

    if (!res.ok || !data.rows) {
      console.error("[YouTube Channel Analytics Error]", data);
      return [];
    }

    // rows: [date, views, estimatedMinutesWatched, subscribersGained, subscribersLost]
    return (
      (data.rows as Array<[string, number, number, number, number]>).map(
        ([
          date,
          views,
          estimatedMinutesWatched,
          subscribersGained,
          subscribersLost,
        ]) => ({
          date,
          views,
          estimatedMinutesWatched,
          subscribersGained,
          subscribersLost,
        }),
      ) ?? []
    );
  } catch (error) {
    console.error("[YouTube Channel Analytics Exception]", error);
    return [];
  }
}
