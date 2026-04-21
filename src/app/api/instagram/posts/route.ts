import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import {
  getInstagramPosts,
  refreshInstagramTokenIfNeeded,
} from "@/lib/platforms/instagram";

export const dynamic = "force-dynamic";

/**
 * GET /api/instagram/posts
 *
 * Returns the authenticated user's recent Instagram posts fetched live from the
 * Instagram Graph API, merged with any matching analytics records from our DB.
 *
 * Query params:
 *   accountId — (optional) specific SocialAccount ID; defaults to the user's first INSTAGRAM account
 */
export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const accountIdParam = searchParams.get("accountId");

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
            "No active Instagram account connected. Please connect your account first.",
        },
        { status: 404 },
      );
    }

    // Refresh token if needed before making the API call
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

    const posts = await getInstagramPosts(account.platformId, activeToken);

    return NextResponse.json({
      account: {
        id: account.id,
        username: account.username,
        profileImage: account.profileImage,
        expiresAt: account.expiresAt,
      },
      posts,
    });
  } catch (error: unknown) {
    console.error("[Instagram Posts API Error]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/instagram/posts?nativePostId={id}&accountId={id}
 *
 * Instagram Graph API does NOT support deleting published posts — this is a
 * hard platform restriction enforced by Meta. This endpoint removes the post
 * record from our database only and returns a warning to the user.
 *
 * To actually remove the post from Instagram, the user must do so manually
 * through the Instagram app or website.
 */
export async function DELETE(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId"); // Our internal post ID

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  try {
    // Verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.userId !== user.id) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete from our database
    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({
      success: true,
      warning:
        post.status === "PUBLISHED"
          ? "The post has been removed from SocialPulse. Instagram does not allow deleting published posts via API — please delete it manually on Instagram."
          : null,
    });
  } catch (error: unknown) {
    console.error("[Instagram Delete Post Error]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
