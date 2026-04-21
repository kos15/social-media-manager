import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import { cookies } from "next/headers";
import { getAppUrl } from "@/lib/utils";
import { getPlatformCredential } from "@/lib/platform-credentials";

export const dynamic = "force-dynamic";

/**
 * Initiates YouTube OAuth via Google OAuth 2.0.
 *
 * Required APIs to enable in Google Cloud Console:
 *  1. YouTube Data API v3 — for uploading videos and channel management
 *  2. YouTube Analytics API v2 — for channel and video-level metrics
 *
 * Required scopes:
 *  - youtube.upload: upload videos
 *  - youtube.readonly: read channel info and video list
 *  - yt-analytics.readonly: read analytics
 *  - userinfo.profile / userinfo.email: identify the connecting user
 *
 * The connecting Google account must be the owner of the YouTube channel.
 * The Google OAuth App must have these scopes approved (use test users during development).
 */
export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const creds = await getPlatformCredential("YOUTUBE");
  if (!creds) {
    return NextResponse.redirect(
      new URL(
        "/settings?tab=integrations&error=youtube_not_configured",
        request.url,
      ),
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = cookies();
  cookieStore.set("youtube_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    sameSite: "lax",
  });

  const callbackUrl = `${getAppUrl()}/api/connect/youtube/callback`;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", creds.clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set(
    "scope",
    [
      "https://www.googleapis.com/auth/youtube.upload", // Upload videos
      "https://www.googleapis.com/auth/youtube.readonly", // Read channel + video list
      "https://www.googleapis.com/auth/yt-analytics.readonly", // Analytics
      "https://www.googleapis.com/auth/userinfo.profile", // User identity
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  );
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "consent"); // Always show consent to ensure refresh_token is returned

  return NextResponse.redirect(url.toString());
}
