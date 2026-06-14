import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import type { User } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// ── Helper: ensure a Prisma User row exists for the Supabase user ───
// Supabase uses UUIDs; our Prisma schema uses cuid() for User.id.
// We upsert on email so the Prisma row is always present before
// any foreign-key-constrained operation on Post.
async function ensurePrismaUser(supabaseUser: User): Promise<string> {
  const email = supabaseUser.email ?? `${supabaseUser.id}@unknown.local`;

  const user = await prisma.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id, // use the Supabase UUID as the Prisma id
      email,
      name: supabaseUser.user_metadata?.full_name ?? email.split("@")[0],
    },
    update: {}, // no updates needed if row already exists
    select: { id: true },
  });

  return user.id;
}

// ── Map DB row → frontend ScheduledPost shape ──────────────────────
function toFrontendPost(p: {
  id: string;
  content: string;
  mediaUrls: string[];
  scheduledFor: Date | null;
  platformIds: string[];
  status?: string;
  updatedAt?: Date;
}) {
  return {
    id: p.id,
    content: p.content,
    mediaUrls: p.mediaUrls,
    scheduledDate: (p.scheduledFor ?? new Date()).toISOString(),
    platforms: p.platformIds,
    ...(p.status ? { status: p.status } : {}),
    ...(p.updatedAt ? { updatedAt: p.updatedAt.toISOString() } : {}),
  };
}

const STATUS_FILTERS: Record<
  string,
  ("DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED")[]
> = {
  DRAFT: ["DRAFT"],
  SCHEDULED: ["SCHEDULED"],
  PUBLISHED: ["PUBLISHED"],
  FAILED: ["FAILED"],
};

// ── GET /api/posts ─────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = await ensurePrismaUser(user);

    const statusParam = new URL(request.url).searchParams.get("status");
    const statuses =
      (statusParam && STATUS_FILTERS[statusParam.toUpperCase()]) ||
      (["SCHEDULED", "PUBLISHED"] as const);

    const posts = await prisma.post.findMany({
      where: {
        userId,
        status: { in: [...statuses] },
      },
      orderBy:
        statuses.length === 1 && statuses[0] === "DRAFT"
          ? { updatedAt: "desc" }
          : { scheduledFor: "asc" },
      select: {
        id: true,
        content: true,
        mediaUrls: true,
        scheduledFor: true,
        platformIds: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(posts.map(toFrontendPost));
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

// ── POST /api/posts ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    console.log("[DEBUG /api/posts] Incoming request body:", body);
    const {
      content,
      mediaUrls = [],
      scheduledDate,
      platforms = [],
      status,
    } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const userId = await ensurePrismaUser(user);

    const post = await prisma.post.create({
      data: {
        userId,
        content,
        mediaUrls,
        scheduledFor: scheduledDate ? new Date(scheduledDate) : new Date(),
        platformIds: platforms,
        status: status === "DRAFT" ? "DRAFT" : "SCHEDULED",
      },
    });

    return NextResponse.json(toFrontendPost(post));
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}

// ── PUT /api/posts ─────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      id,
      content,
      mediaUrls = [],
      scheduledDate,
      platforms = [],
      status,
    } = body;

    if (!id)
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    const userId = await ensurePrismaUser(user);

    const existing = await prisma.post.findFirst({ where: { id, userId } });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const post = await prisma.post.update({
      where: { id },
      data: {
        content: content ?? existing.content,
        mediaUrls: content !== undefined ? mediaUrls : existing.mediaUrls,
        scheduledFor: scheduledDate
          ? new Date(scheduledDate)
          : existing.scheduledFor,
        platformIds: content !== undefined ? platforms : existing.platformIds,
        status: status === "DRAFT" ? "DRAFT" : "SCHEDULED",
      },
    });

    return NextResponse.json(toFrontendPost(post));
  } catch (error) {
    console.error("PUT /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}

// ── DELETE /api/posts ──────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Post ID required" }, { status: 400 });

  try {
    const userId = await ensurePrismaUser(user);
    await prisma.post.deleteMany({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
