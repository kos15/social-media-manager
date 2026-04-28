import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/get-user';
import { getPlatformCredential } from '@/lib/platform-credentials';
import { cookies } from 'next/headers';
import { getAppUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const user = await getServerUser(request);
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const creds = await getPlatformCredential('INSTAGRAM');
    if (!creds || !creds.clientId) {
        return NextResponse.redirect(new URL('/settings?error=instagram_not_configured', request.url));
    }

    const state = crypto.randomUUID();
    const cookieStore = cookies();
    cookieStore.set('instagram_oauth_state', state, { httpOnly: true, secure: false, maxAge: 600 });

    const callbackUrl = `${getAppUrl()}/api/connect/instagram/callback`;
    const scope = 'user_profile,user_media';

    const url = new URL('https://api.instagram.com/oauth/authorize');
    url.searchParams.set('client_id', creds.clientId);
    url.searchParams.set('redirect_uri', callbackUrl);
    url.searchParams.set('scope', scope);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);

    return NextResponse.redirect(url.toString());
}
