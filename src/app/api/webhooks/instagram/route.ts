import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function verifySignature(
  request: NextRequest,
  rawBody: string,
): Promise<boolean> {
  const signature = request.headers.get("x-hub-signature-256");
  if (!signature) return false;

  const cred = await prisma.platformCredential.findUnique({
    where: { platform: "INSTAGRAM" },
    select: { clientSecret: true },
  });
  if (!cred?.clientSecret) return false;

  const expected = `sha256=${createHmac("sha256", cred.clientSecret).update(rawBody).digest("hex")}`;
  return signature === expected;
}

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
  const rawBody = await request.text();

  const valid = await verifySignature(request, rawBody);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await handleWebhookEvent(body);
  } catch (err) {
    console.error("Instagram webhook processing error:", err);
  }

  // Always return 200 quickly — Meta retries on non-2xx
  return NextResponse.json({ received: true });
}

type MetaEntry = {
  id: string;
  time: number;
  changes?: { field: string; value: Record<string, unknown> }[];
  messaging?: { sender: { id: string }; [key: string]: unknown }[];
};

async function handleWebhookEvent(body: Record<string, unknown>) {
  if (body.object !== "instagram") return;

  const entries = (body.entry as MetaEntry[]) ?? [];

  for (const entry of entries) {
    const accountId = entry.id;

    const account = await prisma.socialAccount.findFirst({
      where: { platform: "INSTAGRAM", platformId: accountId },
      select: { userId: true, username: true },
    });

    for (const change of entry.changes ?? []) {
      await processChange(change.field, change.value, account, accountId);
    }

    for (const msg of entry.messaging ?? []) {
      await processMessaging(msg, account);
    }
  }
}

async function processChange(
  field: string,
  value: Record<string, unknown>,
  account: { userId: string; username: string } | null,
  accountId: string,
) {
  const userId = account?.userId;
  const handle = account?.username ?? accountId;

  switch (field) {
    case "comments": {
      const commenter =
        (value.from as { username?: string })?.username ?? "Someone";
      const text = (value.text as string) ?? "";
      if (userId) {
        await prisma.notification.create({
          data: {
            userId,
            title: "New Instagram Comment",
            message: `${commenter} commented on your post: "${text.slice(0, 100)}"`,
            type: "SYSTEM",
          },
        });
      }
      break;
    }

    case "live_comments": {
      const commenter =
        (value.from as { username?: string })?.username ?? "Someone";
      const text = (value.text as string) ?? "";
      if (userId) {
        await prisma.notification.create({
          data: {
            userId,
            title: "New Live Comment",
            message: `${commenter} commented on your live: "${text.slice(0, 100)}"`,
            type: "SYSTEM",
          },
        });
      }
      break;
    }

    case "mentions": {
      const mediaId = value.media_id as string | undefined;
      const commentId = value.comment_id as string | undefined;
      const context = mediaId ? "a post" : commentId ? "a comment" : "content";
      if (userId) {
        await prisma.notification.create({
          data: {
            userId,
            title: "Instagram Mention",
            message: `${handle} was mentioned in ${context}`,
            type: "SYSTEM",
          },
        });
      }
      break;
    }

    case "story_insights":
      console.log("Instagram story_insights:", JSON.stringify(value));
      break;

    default:
      console.log(`Unhandled Instagram webhook field: ${field}`, value);
  }
}

async function processMessaging(
  msg: Record<string, unknown>,
  account: { userId: string; username: string } | null,
) {
  const userId = account?.userId;
  const sender = (msg.sender as { id?: string })?.id ?? "unknown";

  if (msg.message) {
    const message = msg.message as { text?: string; attachments?: unknown[] };
    const preview = message.text
      ? `"${message.text.slice(0, 100)}"`
      : message.attachments
        ? "[attachment]"
        : "";
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title: "New Instagram DM",
          message: `New message from ${sender}${preview ? `: ${preview}` : ""}`,
          type: "SYSTEM",
        },
      });
    }
  }

  if (msg.reaction) {
    const reaction = msg.reaction as { reaction?: string };
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title: "Instagram Message Reaction",
          message: `${sender} reacted ${reaction.reaction ?? "👍"} to your message`,
          type: "SYSTEM",
        },
      });
    }
  }
}
