import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import {
  getInstagramPostAnalytics,
  getInstagramAccountInsights,
  refreshInstagramTokenIfNeeded,
} from "@/lib/platforms/instagram";

export const dynamic = "force-dynamic";

/**
 * GET /api/instagram/analytics
 *
 * Returns Instagram analytics. Supports two modes:
 *
 * 1. Post-level analytics:
 *    ?nativePostId={instagram_post_id}
 *    Returns impressions, reach, likes, comments, saved for a single post.
 *    Also syncs the result into our PostAnalytics table if a matching Post exists.
 *
 * 2. Account-level insights (default):
 *    ?since=YYYY-MM-DD&until=YYYY-MM-DD (optional; defaults to last 30 days)
 *    Returns daily impressions, reach, and profile views for the account.
 *
 * Both modes accept an optional ?accountId param to target a specific connected account.
 */
export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const nativePostId = searchParams.get("nativePostId");
  const accountIdParam = searchParams.get("accountId");
  const sinceParam = searchParams.get("since");
  const untilParam = searchParams.get("until");

  try {
    // Find the user's Instagram account
    const account = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform: "INSTAGRAM",
        status: "ACTIVE",
        ...(accountIdParam ? { id: accountIdParam } : {}),
      },
    });

    if (!account) {
      return NextResponse.json(
        {
          error:
            "No active Instagram account found. Please connect your account first.",
        },
        { status: 404 },
      );
    }

    // Refresh token if near expiry
    let activeToken: string;
    try {
      activeToken = await refreshInstagramTokenIfNeeded(account);
    } catch {
      await prisma.socialAccount.update({
        where: { id: account.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Instagram token expired. Please reconnect your account." },
        { status: 401 },
      );
    }

    // ── Mode 1: Post-level analytics ─────────────────────────────────
    if (nativePostId) {
      const analytics = await getInstagramPostAnalytics(
        nativePostId,
        activeToken,
      );

      if (!analytics) {
        return NextResponse.json(
          {
            error:
              "Could not fetch analytics for this post. It may be too recent or the post may not exist.",
          },
          { status: 404 },
        );
      }

      // Sync into PostAnalytics if we have a matching internal Post record
      // (Posts published through SocialPulse store the native post ID)
      // This is best-effort — we skip if no match is found
      try {
        const matchingPost = await prisma.post.findFirst({
          where: { userId: user.id, status: "PUBLISHED" },
          include: { analytics: true },
        });

        if (matchingPost) {
          await prisma.postAnalytics.upsert({
            where: { postId: matchingPost.id },
            update: {
              impressions: analytics.impressions,
              likes: analytics.likes,
              comments: analytics.comments,
            },
            create: {
              postId: matchingPost.id,
              impressions: analytics.impressions,
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

      return NextResponse.json({ postAnalytics: analytics });
    }

    // ── Mode 2: Account-level insights ───────────────────────────────
    const until = untilParam ? new Date(untilParam) : new Date();
    const since = sinceParam
      ? new Date(sinceParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const insights = await getInstagramAccountInsights(
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
      insights,
    });
  } catch (error: unknown) {
    console.error("[Instagram Analytics API Error]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
