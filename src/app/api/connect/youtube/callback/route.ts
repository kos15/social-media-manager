import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { getAppUrl } from "@/lib/utils";
import { getPlatformCredential } from "@/lib/platform-credentials";

export const dynamic = "force-dynamic";

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
      new URL("/accounts?error=youtube_denied", request.url),
    );
  }

  const cookieStore = cookies();
  const savedState = cookieStore.get("youtube_oauth_state")?.value;

  if (!state || state !== savedState || !code) {
    return NextResponse.redirect(
      new URL("/accounts?error=youtube_invalid_state", request.url),
    );
  }

  cookieStore.delete("youtube_oauth_state");

  try {
    const creds = await getPlatformCredential("YOUTUBE");
    if (!creds) {
      return NextResponse.redirect(
        new URL("/accounts?error=youtube_not_configured", request.url),
      );
    }

    const callbackUrl = `${getAppUrl()}/api/connect/youtube/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();
    if (!tokens.access_token) {
      console.error("[YouTube OAuth] Token exchange failed", tokens);
      throw new Error("Failed to obtain Google access token");
    }

    // Fetch Google user info for profile image
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    const googleUser = await userResponse.json();

    // Fetch YouTube channel details
    const ytResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    const ytData = await ytResponse.json();

    if (!ytData.items?.[0]) {
      console.error("[YouTube OAuth] No channel found", ytData);
      return NextResponse.redirect(
        new URL("/accounts?error=youtube_no_channel", request.url),
      );
    }

    const channel = ytData.items[0];
    const channelId: string = channel.id;
    const channelName: string = channel.snippet.title;
    const channelThumbnail: string =
      channel.snippet.thumbnails?.default?.url ?? googleUser.picture ?? "";

    await prisma.socialAccount.upsert({
      where: {
        platform_platformId: { platform: "YOUTUBE", platformId: channelId },
      },
      update: {
        username: channelName,
        profileImage: channelThumbnail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        status: "ACTIVE",
        userId: user.id,
      },
      create: {
        platform: "YOUTUBE",
        platformId: channelId,
        username: channelName,
        profileImage: channelThumbnail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        status: "ACTIVE",
        userId: user.id,
      },
    });

    return NextResponse.redirect(
      new URL("/accounts?success=youtube", request.url),
    );
  } catch (err) {
    console.error("[YouTube OAuth] Callback error:", err);
    return NextResponse.redirect(
      new URL("/accounts?error=youtube_failed", request.url),
    );
  }
}
