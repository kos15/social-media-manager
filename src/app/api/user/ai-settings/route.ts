import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import { encryptKey } from "@/lib/encrypt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const setting = await prisma.userAISetting.findUnique({
      where: { userId: user.id },
    });

    // Return config without exposing full keys — just masked presence
    return NextResponse.json({
      provider: setting?.provider || null,
      model: setting?.model || null,
      hasOpenAIKey: !!setting?.openaiKey,
      hasAnthropicKey: !!setting?.anthropicKey,
      hasGoogleKey: !!setting?.googleKey,
    });
  } catch {
    return NextResponse.json({
      provider: null,
      model: null,
      hasOpenAIKey: false,
      hasAnthropicKey: false,
      hasGoogleKey: false,
    });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { provider, model, openaiKey, anthropicKey, googleKey } =
      await req.json();

    // Ensure User row exists (Supabase auth users aren't auto-synced to Prisma User table)
    await prisma.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email: user.email ?? undefined },
      update: {},
    });

    const data: Record<string, string> = {};
    if (provider) data.provider = provider;
    if (model) data.model = model;
    if (openaiKey) data.openaiKey = encryptKey(openaiKey);
    if (anthropicKey) data.anthropicKey = encryptKey(anthropicKey);
    if (googleKey) data.googleKey = encryptKey(googleKey);

    await prisma.userAISetting.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("AI settings save error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getServerUser(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await req.json(); // key: "openaiKey" | "anthropicKey" | "googleKey"
  const allowed = [
    "openaiKey",
    "anthropicKey",
    "googleKey",
    "provider",
    "model",
  ];
  if (!allowed.includes(key))
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });

  await prisma.userAISetting.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: { [key]: null },
  });

  return NextResponse.json({ success: true });
}
