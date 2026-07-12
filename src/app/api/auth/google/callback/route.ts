import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const loginError = (msg: string) =>
    NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, request.url)
    );

  if (error) return loginError("google_denied");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_auth_state")?.value;
  cookieStore.delete("google_auth_state");

  if (!state || state !== savedState || !code) {
    return loginError("invalid_state");
  }

  try {
    const appUrl = getAppUrl();
    const callbackUrl = `${appUrl}/api/auth/google/callback`;

    // Exchange code for Google tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error("Google token exchange failed:", tokens);
      return loginError("google_token_failed");
    }

    // Get Google user profile
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const googleUser = await profileRes.json();

    if (!googleUser.email) {
      return loginError("google_no_email");
    }

    const supabase = createAdminClient();

    // Try to create user — if they already exist, createUser returns an error we can ignore
    const { data: created, error: createErr } =
      await supabase.auth.admin.createUser({
        email: googleUser.email,
        email_confirm: true,
        user_metadata: {
          full_name: googleUser.name,
          avatar_url: googleUser.picture,
          provider: "google",
          google_id: googleUser.id,
        },
      });

    // Update metadata for existing users too
    if (createErr && created?.user) {
      await supabase.auth.admin.updateUserById(created.user.id, {
        user_metadata: {
          full_name: googleUser.name,
          avatar_url: googleUser.picture,
          provider: "google",
          google_id: googleUser.id,
        },
      });
    }

    // Generate a magic-link sign-in token — works for both new and existing users
    // generateLink auto-creates user if not found, so this is safe regardless
    const { data: linkData, error: linkErr } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: googleUser.email,
        options: { redirectTo: `${appUrl}/auth/callback` },
      });

    if (linkErr || !linkData?.properties?.action_link) {
      console.error("generateLink error:", linkErr);
      return loginError("session_create_failed");
    }

    // Redirect through Supabase's magic-link verify → /auth/callback → /dashboard
    return NextResponse.redirect(linkData.properties.action_link);
  } catch (err) {
    console.error("Google auth callback error:", err);
    return loginError("google_auth_failed");
  }
}
