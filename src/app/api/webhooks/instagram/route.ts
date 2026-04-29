import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Meta webhook verification handshake
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return NextResponse.json(
      { error: "Invalid verification request" },
      { status: 400 },
    );
  }

  try {
    const cred = await prisma.platformCredential.findUnique({
      where: { platform: "INSTAGRAM" },
      select: { webhookVerifyToken: true },
    });

    if (!cred?.webhookVerifyToken || cred.webhookVerifyToken !== token) {
      return NextResponse.json(
        { error: "Verification token mismatch" },
        { status: 403 },
      );
    }

    return new NextResponse(challenge, { status: 200 });
  } catch (err) {
    console.error("Instagram webhook verification error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Incoming webhook events from Meta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Instagram webhook event:", JSON.stringify(body));
    // TODO: process specific event types (comments, mentions, story insights, etc.)
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Instagram webhook event error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
