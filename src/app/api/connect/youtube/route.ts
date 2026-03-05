import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/get-user';
import { cookies } from 'next/headers';
import { getAppUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const user = await getServerUser(request);
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: 'Google/YouTube OAuth not configured. Set GOOGLE_CLIENT_ID in .env' }, { status: 500 });
    }

    const state = crypto.randomUUID();
    const cookieStore = cookies();
    cookieStore.set('youtube_oauth_state', state, { httpOnly: true, secure: false, maxAge: 600 });

    const callbackUrl = `${getAppUrl()}/api/connect/youtube/callback`;

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('state', state);
    url.searchParams.set('prompt', 'consent');

    return NextResponse.redirect(url.toString());
}
