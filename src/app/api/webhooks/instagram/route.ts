import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

// Meta's client certificate CN for mTLS verification
// Docs: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/#mtls-for-webhooks
// NOTE: Starting March 31, 2026, Meta switches to its own CA — update MTLS_ROOT_CERT by then.
// Vercel terminates TLS at edge so true mTLS requires a proxy (Nginx/ALB) in front.
// When a proxy forwards the verified client cert CN, set these env vars:
//   INSTAGRAM_WEBHOOK_MTLS=true
//   MTLS_CLIENT_CN_HEADER=X-SSL-Client-CN   (nginx: $ssl_client_s_dn_cn)
//
// Nginx snippet:
//   ssl_client_certificate /path/to/DigiCertHighAssuranceEVRootCA.crt;
//   ssl_verify_client optional_no_ca;
//   proxy_set_header X-SSL-Client-CN $ssl_client_s_dn_cn;
//
// AWS ALB: enable mutual authentication, set trust store to DigiCert root,
//   ALB forwards X-Amzn-Mtls-Clientcert-Subject header.
function verifyMtls(request: NextRequest): boolean {
  if (process.env.INSTAGRAM_WEBHOOK_MTLS !== "true") return true; // opt-in

  const header = process.env.MTLS_CLIENT_CN_HEADER ?? "X-SSL-Client-CN";
  const cn = request.headers.get(header);
  return cn === "client.webhooks.fbclientcerts.com";
}

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
  // mTLS client cert CN check (opt-in via INSTAGRAM_WEBHOOK_MTLS=true)
  if (!verifyMtls(request)) {
    return NextResponse.json(
      { error: "Client certificate invalid" },
      { status: 403 },
    );
  }

  const rawBody = await request.text();

  const valid = await verifySignature(request, rawBody);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  // Deduplication — Meta retries for up to 36h; use signature as stable unique key
  // TTL of 48h ensures we cover the full retry window
  const signature = request.headers.get("x-hub-signature-256")!;
  const dedupKey = `ig_webhook:${signature}`;
  try {
    const redis = getRedis();
    const seen = await redis.get(dedupKey);
    if (seen) {
      return NextResponse.json({ received: true }); // idempotent early exit
    }
    // Mark before processing — if we crash mid-process Meta will retry but
    // the event won't duplicate; at-least-once is preferable to at-most-once here
    await redis.set(dedupKey, "1", "EX", 172800); // 48h
  } catch (redisErr) {
    // Redis unavailable — log and proceed without dedup rather than dropping events
    console.error("Instagram webhook dedup check failed:", redisErr);
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

  // Always return 200 — Meta retries on non-2xx
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
