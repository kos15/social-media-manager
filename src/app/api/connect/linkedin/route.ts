import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/get-user';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const user = await getServerUser(request);
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: 'LinkedIn OAuth not configured. Set LINKEDIN_CLIENT_ID in .env' }, { status: 500 });
    }

    const state = crypto.randomUUID();
    const cookieStore = cookies();
    cookieStore.set('linkedin_oauth_state', state, { httpOnly: true, secure: false, maxAge: 600 });

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/connect/linkedin/callback`;
    const scope = 'openid profile email w_member_social';

    const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', callbackUrl);
    url.searchParams.set('scope', scope);
    url.searchParams.set('state', state);

    return NextResponse.redirect(url.toString());
}
