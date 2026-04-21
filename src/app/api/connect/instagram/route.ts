import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import { cookies } from "next/headers";
import { getAppUrl } from "@/lib/utils";
import { getPlatformCredential } from "@/lib/platform-credentials";

export const dynamic = "force-dynamic";

/**
 * Initiates Instagram OAuth via Facebook Graph API.
 *
 * Instagram publishing, analytics, and account management require the
 * Instagram Graph API, which is accessed through a Facebook App — NOT
 * the Instagram Basic Display API.
 *
 * Prerequisites:
 *  1. Facebook Developer App with Instagram Graph API product added
 *  2. App permissions: instagram_basic, instagram_content_publish,
 *     instagram_manage_insights, pages_show_list, pages_read_engagement
 *  3. User must have an Instagram Professional account (Business/Creator)
 *     connected to a Facebook Page they manage
 *
 * The INSTAGRAM_CLIENT_ID / INSTAGRAM_CLIENT_SECRET credentials stored in
 * Settings > API Integrations should be the Facebook App ID and App Secret.
 */
export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const creds = await getPlatformCredential("INSTAGRAM");
  if (!creds) {
    return NextResponse.redirect(
      new URL(
        "/settings?tab=integrations&error=instagram_not_configured",
        request.url,
      ),
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = cookies();
  cookieStore.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    sameSite: "lax",
  });

  const callbackUrl = `${getAppUrl()}/api/connect/instagram/callback`;

  // Facebook OAuth — grants access to Instagram Graph API
  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id", creds.clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set(
    "scope",
    [
      "instagram_basic", // Read IG professional account info
      "instagram_content_publish", // Create and publish posts
      "instagram_manage_insights", // Read post & account analytics
      "pages_show_list", // List Facebook pages (to find linked IG account)
      "pages_read_engagement", // Required for page-level access
    ].join(","),
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return NextResponse.redirect(url.toString());
}
