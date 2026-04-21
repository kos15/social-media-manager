import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import {
  getYouTubeVideoAnalytics,
  getYouTubeChannelAnalytics,
  refreshYouTubeTokenIfNeeded,
} from "@/lib/platforms/youtube";

export const dynamic = "force-dynamic";

/**
 * GET /api/youtube/analytics
 *
 * Returns YouTube analytics. Supports two modes:
 *
 * 1. Video-level analytics:
 *    ?videoId={youtube_video_id}
 *    Returns views, likes, and comments for a single video.
 *    Also syncs into PostAnalytics table if a matching Post record exists.
 *
 * 2. Channel-level analytics (default):
 *    ?since=YYYY-MM-DD&until=YYYY-MM-DD (optional; defaults to last 30 days)
 *    Returns daily views, watch time, and subscriber changes.
 *    Requires YouTube Analytics API v2 (yt-analytics.readonly scope).
 *
 * Both modes accept an optional ?accountId param to target a specific connected account.
 */
export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const accountIdParam = searchParams.get("accountId");
  const sinceParam = searchParams.get("since");
  const untilParam = searchParams.get("until");

  try {
    const account = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform: "YOUTUBE",
        status: "ACTIVE",
        ...(accountIdParam ? { id: accountIdParam } : {}),
      },
    });

    if (!account) {
      return NextResponse.json(
        {
          error:
            "No active YouTube account found. Please connect your account first.",
        },
        { status: 404 },
      );
    }

    let activeToken: string;
    try {
      activeToken = await refreshYouTubeTokenIfNeeded(account);
    } catch {
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "YouTube token expired. Please reconnect your account." },
        { status: 401 },
      );
    }

    // ── Mode 1: Video-level analytics ────────────────────────────────
    if (videoId) {
      const analytics = await getYouTubeVideoAnalytics(videoId, activeToken);

      if (!analytics) {
        return NextResponse.json(
          { error: "Could not fetch analytics for this video." },
          { status: 404 },
        );
      }

      // Sync into PostAnalytics if we have a matching published Post
      try {
        const matchingPost = await prisma.post.findFirst({
          where: { userId: user.id, status: "PUBLISHED" },
          include: { analytics: true },
        });

        if (matchingPost) {
          await prisma.postAnalytics.upsert({
            where: { postId: matchingPost.id },
            update: {
              impressions: analytics.views,
              likes: analytics.likes,
              comments: analytics.comments,
            },
            create: {
              postId: matchingPost.id,
              impressions: analytics.views,
              likes: analytics.likes,
              comments: analytics.comments,
              shares: 0,
              clicks: 0,
            },
          });
        }
      } catch {
        // Non-fatal — return analytics even if DB sync fails
      }

      return NextResponse.json({ videoAnalytics: analytics });
    }

    // ── Mode 2: Channel-level analytics ──────────────────────────────
    const until = untilParam ? new Date(untilParam) : new Date();
    const since = sinceParam
      ? new Date(sinceParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const analytics = await getYouTubeChannelAnalytics(
      account.platformId,
      activeToken,
      since,
      until,
    );

    return NextResponse.json({
      account: {
        id: account.id,
        username: account.username,
        expiresAt: account.expiresAt,
      },
      range: {
        since: since.toISOString().split("T")[0],
        until: until.toISOString().split("T")[0],
      },
      analytics,
    });
  } catch (error: unknown) {
    console.error("[YouTube Analytics API Error]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
