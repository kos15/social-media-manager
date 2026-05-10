import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAdmin(req: NextRequest) {
  const supaUser = await getServerUser(req);
  if (!supaUser) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: supaUser.id },
    select: { role: true },
  });
  return dbUser?.role === "ADMIN" ? supaUser : null;
}

const DEFAULT_FLAGS: Record<
  string,
  { label: string; description: string; default: boolean }
> = {
  ai_content_suggestions: {
    label: "AI Content Suggestions",
    description: "AI writing assistance in the composer",
    default: true,
  },
  analytics_advanced: {
    label: "Advanced Analytics",
    description: "Extended metrics and chart views in Analytics",
    default: false,
  },
  media_library: {
    label: "Media Library",
    description: "Browse and reuse uploaded media assets",
    default: false,
  },
  scheduled_posting: {
    label: "Scheduled Posting",
    description: "Allow posts to be queued for future delivery",
    default: true,
  },
  team_collaboration: {
    label: "Team Collaboration",
    description: "Enable team workspaces and member management",
    default: false,
  },
};

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const keys = Object.keys(DEFAULT_FLAGS).map((k) => `feature.${k}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (prisma as any).appSetting.findMany({
    where: { key: { in: keys } },
  });
  const stored = Object.fromEntries(
    rows.map((r: { key: string; value: string }) => [r.key, r.value]),
  );

  const flags = Object.entries(DEFAULT_FLAGS).map(([id, meta]) => ({
    id,
    label: meta.label,
    description: meta.description,
    enabled:
      stored[`feature.${id}`] !== undefined
        ? stored[`feature.${id}`] === "true"
        : meta.default,
  }));

  return NextResponse.json(flags);
}

export async function PUT(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, enabled } = await req.json();
  if (!id || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!DEFAULT_FLAGS[id]) {
    return NextResponse.json({ error: "Unknown flag" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).appSetting.upsert({
    where: { key: `feature.${id}` },
    update: { value: String(enabled) },
    create: { key: `feature.${id}`, value: String(enabled) },
  });

  return NextResponse.json({ id, enabled });
}
