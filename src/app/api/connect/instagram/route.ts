import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/get-user";
import { cookies } from "next/headers";
import { getAppUrl } from "@/lib/utils";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getServerUser(request);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prefer DB-stored credentials; fall back to env vars
  const dbCred = await prisma.platformCredential.findUnique({
    where: { platform: "INSTAGRAM" },
    select: { clientId: true },
  });
  const clientId = dbCred?.clientId ?? process.env.INSTAGRAM_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Instagram OAuth not configured. Add credentials in Settings." },
      { status: 500 },
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = cookies();
  cookieStore.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: false,
    maxAge: 600,
  });

  const callbackUrl = `${getAppUrl()}/api/connect/instagram/callback`;

  // Instagram Login (Business Login for Instagram) — replaces deprecated Basic Display API (killed Sep 2024)
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set(
    "scope",
    "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments",
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return NextResponse.redirect(url.toString());
}
