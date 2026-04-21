import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import {
  getYouTubeVideos,
  deleteYouTubeVideo,
  refreshYouTubeTokenIfNeeded,
} from "@/lib/platforms/youtube";

export const dynamic = "force-dynamic";

/**
 * GET /api/youtube/videos
 *
 * Returns the authenticated user's YouTube channel videos fetched live
 * from YouTube Data API v3, with view/like/comment counts.
 *
 * Query params:
 *   accountId — (optional) specific SocialAccount ID; defaults to the user's first YOUTUBE account
 */
export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountIdParam = searchParams.get("accountId");

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
            "No active YouTube account connected. Please connect your account first.",
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

    const videos = await getYouTubeVideos(account.platformId, activeToken);

    return NextResponse.json({
      account: {
        id: account.id,
        username: account.username,
        profileImage: account.profileImage,
        expiresAt: account.expiresAt,
      },
      videos,
    });
  } catch (error: unknown) {
    console.error("[YouTube Videos API Error]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/youtube/videos?videoId={youtubeVideoId}&accountId={id}
 *
 * Deletes a published YouTube video both from YouTube and from our database.
 * YouTube Data API v3 supports deleting videos owned by the authenticated user.
 *
 * Query params:
 *   videoId   — YouTube video ID (native platform ID, e.g. "dQw4w9WgXcQ")
 *   accountId — (optional) SocialAccount ID for the connected YouTube account
 */
export async function DELETE(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const accountIdParam = searchParams.get("accountId");

  if (!videoId) {
    return NextResponse.json({ error: "videoId is required" }, { status: 400 });
  }

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
        { error: "No active YouTube account found." },
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

    // Delete from YouTube
    const ytResult = await deleteYouTubeVideo(videoId, activeToken);
    if (!ytResult.success) {
      return NextResponse.json(
        { error: `YouTube deletion failed: ${ytResult.error}` },
        { status: 400 },
      );
    }

    // Remove matching post from our DB (best-effort — don't fail if not found)
    try {
      const matchingPost = await prisma.post.findFirst({
        where: { userId: user.id, status: "PUBLISHED" },
      });
      if (matchingPost) {
        await prisma.post.delete({ where: { id: matchingPost.id } });
      }
    } catch {
      // Non-fatal — video was deleted from YouTube
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[YouTube Delete Video Error]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
