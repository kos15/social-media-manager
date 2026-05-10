import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ADMIN_EMAIL env var lets you bootstrap admin access before setting role in DB
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function checkAdmin(req: NextRequest) {
  const supaUser = await getServerUser(req);
  if (!supaUser) return null;

  // Check by email env var (bootstrap)
  if (ADMIN_EMAIL && supaUser.email === ADMIN_EMAIL) return supaUser;

  // Check by DB role
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: supaUser.id },
      select: { role: true },
    });
    if (dbUser?.role === "ADMIN") return supaUser;
  } catch {
    // DB may not have user yet
  }
  return null;
}

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dbSettings: Record<string, string> = {};
  try {
    const rows = await prisma.appSetting.findMany();
    for (const r of rows) dbSettings[r.key] = r.value;
  } catch {
    // AppSetting table not yet created — run `prisma db push`
  }

  return NextResponse.json({
    provider: dbSettings["ai.provider"] || process.env.AI_PROVIDER || "openai",
    model: dbSettings["ai.model"] || process.env.AI_MODEL || "gpt-4o-mini",
    hasOpenAIKey: !!(dbSettings["ai.openai_key"] || process.env.OPENAI_API_KEY),
    hasAnthropicKey: !!(
      dbSettings["ai.anthropic_key"] || process.env.ANTHROPIC_API_KEY
    ),
    hasGoogleKey: !!(
      dbSettings["ai.google_key"] || process.env.GOOGLE_AI_API_KEY
    ),
    source: Object.keys(dbSettings).length > 0 ? "db" : "env",
  });
}

export async function PUT(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { provider, model, openaiKey, anthropicKey, googleKey } =
    await req.json();

  const updates: { key: string; value: string }[] = [];
  if (provider) updates.push({ key: "ai.provider", value: provider });
  if (model) updates.push({ key: "ai.model", value: model });
  if (openaiKey) updates.push({ key: "ai.openai_key", value: openaiKey });
  if (anthropicKey)
    updates.push({ key: "ai.anthropic_key", value: anthropicKey });
  if (googleKey) updates.push({ key: "ai.google_key", value: googleKey });

  try {
    for (const { key, value } of updates) {
      await prisma.appSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
  } catch {
    return NextResponse.json(
      {
        error:
          "Database not ready. Run `npx prisma db push` to create the AppSetting table.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ success: true });
}
