import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";

type Platform = "TWITTER" | "LINKEDIN" | "INSTAGRAM" | "YOUTUBE";

export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const creds = await prisma.platformCredential.findMany({
      orderBy: { platform: "asc" },
    });

    const masked = creds.map(
      (c: {
        platform: string;
        clientId: string;
        clientSecret: string;
        webhookVerifyToken: string | null;
        updatedAt: Date;
      }) => ({
        platform: c.platform,
        clientId: c.clientId,
        clientSecretMasked: `••••••••${c.clientSecret.slice(-4)}`,
        webhookVerifyToken: c.webhookVerifyToken ?? null,
        updatedAt: c.updatedAt,
      }),
    );

    return NextResponse.json(masked);
  } catch (error) {
    console.error("Failed to fetch credentials:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { platform, clientId, clientSecret, webhookVerifyToken } = body;

  if (!platform || !clientId?.trim() || !clientSecret?.trim()) {
    return NextResponse.json(
      { error: "platform, clientId, and clientSecret are all required" },
      { status: 400 },
    );
  }

  const validPlatforms: Platform[] = [
    "TWITTER",
    "LINKEDIN",
    "INSTAGRAM",
    "YOUTUBE",
  ];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const verifyToken =
    typeof webhookVerifyToken === "string" && webhookVerifyToken.trim()
      ? webhookVerifyToken.trim()
      : null;

  try {
    await prisma.platformCredential.upsert({
      where: { platform },
      update: {
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        ...(verifyToken !== undefined && { webhookVerifyToken: verifyToken }),
      },
      create: {
        platform,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        webhookVerifyToken: verifyToken,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save credentials:", error);
    return NextResponse.json(
      { error: "Failed to save credentials" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") as Platform;

  if (!platform) {
    return NextResponse.json({ error: "Platform required" }, { status: 400 });
  }

  try {
    await prisma.platformCredential.deleteMany({ where: { platform } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove credentials:", error);
    return NextResponse.json(
      { error: "Failed to remove credentials" },
      { status: 500 },
    );
  }
}
