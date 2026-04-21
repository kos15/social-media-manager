import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { getAppUrl } from "@/lib/utils";
import { getPlatformCredential } from "@/lib/platform-credentials";

export const dynamic = "force-dynamic";

/**
 * Instagram OAuth callback (via Facebook Graph API).
 *
 * Flow:
 *  1. Validate CSRF state
 *  2. Exchange code → short-lived Facebook user access token
 *  3. Exchange → long-lived user access token (60 days)
 *  4. GET /me/accounts → list Facebook pages the user manages
 *  5. For each page, find the linked Instagram Business Account
 *  6. GET /{ig-user-id} → fetch IG username & profile picture
 *  7. Upsert SocialAccount with platformId = IG Business Account ID
 *
 * Token storage:
 *  - accessToken  = Page access token (used for publishing via Graph API)
 *  - refreshToken = Long-lived user token (used to renew expiring tokens)
 *  - expiresAt    = ~60 days from now
 */
export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/accounts?error=instagram_denied", request.url),
    );
  }

  const cookieStore = cookies();
  const savedState = cookieStore.get("instagram_oauth_state")?.value;

  if (!state || state !== savedState || !code) {
    return NextResponse.redirect(
      new URL("/accounts?error=instagram_invalid_state", request.url),
    );
  }

  cookieStore.delete("instagram_oauth_state");

  try {
    const creds = await getPlatformCredential("INSTAGRAM");
    if (!creds) {
      return NextResponse.redirect(
        new URL("/accounts?error=instagram_not_configured", request.url),
      );
    }

    const callbackUrl = `${getAppUrl()}/api/connect/instagram/callback`;

    // ── Step 1: Exchange code for short-lived user access token ──────
    const shortTokenRes = await fetch(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          redirect_uri: callbackUrl,
          code,
        }),
      },
    );
    const shortTokenData = await shortTokenRes.json();
    if (!shortTokenData.access_token) {
      throw new Error(
        `Token exchange failed: ${shortTokenData.error?.message ?? JSON.stringify(shortTokenData)}`,
      );
    }
    const shortToken: string = shortTokenData.access_token;

    // ── Step 2: Exchange short-lived → long-lived user token (60 days) ──
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${creds.clientId}` +
        `&client_secret=${creds.clientSecret}` +
        `&access_token=${shortToken}`,
    );
    const longTokenData = await longTokenRes.json();
    const longToken: string = longTokenData.access_token ?? shortToken;
    // Facebook long-lived tokens expire in ~60 days (expires_in is in seconds)
    const expiresIn: number = longTokenData.expires_in ?? 60 * 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // ── Step 3: Get the user's Facebook pages ────────────────────────
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts` +
        `?fields=id,name,access_token,instagram_business_account` +
        `&access_token=${longToken}`,
    );
    const pagesData = await pagesRes.json();
    const pages: Array<{
      id: string;
      name: string;
      access_token: string;
      instagram_business_account?: { id: string };
    }> = pagesData.data ?? [];

    // ── Step 4: Find first page with a linked Instagram Business Account ──
    let igBusinessAccountId: string | null = null;
    let pageAccessToken: string = longToken;

    for (const page of pages) {
      if (page.instagram_business_account?.id) {
        igBusinessAccountId = page.instagram_business_account.id;
        pageAccessToken = page.access_token ?? longToken;
        break;
      }
    }

    if (!igBusinessAccountId) {
      console.error(
        "[Instagram OAuth] No Instagram Business Account found. Pages:",
        JSON.stringify(pages),
      );
      return NextResponse.redirect(
        new URL("/accounts?error=instagram_no_business_account", request.url),
      );
    }

    // ── Step 5: Fetch Instagram account details ──────────────────────
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${igBusinessAccountId}` +
        `?fields=id,username,profile_picture_url,name` +
        `&access_token=${pageAccessToken}`,
    );
    const igUser = await igRes.json();

    if (!igUser.id) {
      throw new Error(
        `Failed to fetch Instagram account details: ${JSON.stringify(igUser)}`,
      );
    }

    const igUsername: string =
      igUser.username ?? igUser.name ?? `ig_${igUser.id}`;
    const igProfilePicture: string | null = igUser.profile_picture_url ?? null;

    // ── Step 6: Upsert SocialAccount ─────────────────────────────────
    await prisma.socialAccount.upsert({
      where: {
        platform_platformId: {
          platform: "INSTAGRAM",
          platformId: igBusinessAccountId,
        },
      },
      update: {
        username: `@${igUsername}`,
        profileImage: igProfilePicture,
        accessToken: pageAccessToken, // Page access token for publishing
        refreshToken: longToken, // Long-lived user token for renewal
        expiresAt,
        status: "ACTIVE",
        userId: user.id,
      },
      create: {
        platform: "INSTAGRAM",
        platformId: igBusinessAccountId,
        username: `@${igUsername}`,
        profileImage: igProfilePicture,
        accessToken: pageAccessToken,
        refreshToken: longToken,
        expiresAt,
        status: "ACTIVE",
        userId: user.id,
      },
    });

    return NextResponse.redirect(
      new URL("/accounts?success=instagram", request.url),
    );
  } catch (err) {
    console.error("[Instagram OAuth Error]", err);
    return NextResponse.redirect(
      new URL("/accounts?error=instagram_failed", request.url),
    );
  }
}
