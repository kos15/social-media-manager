import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cookies } from 'next/headers';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.redirect('/login');
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: 'LinkedIn OAuth not configured. Set LINKEDIN_CLIENT_ID in .env' }, { status: 500 });
    }

    const state = crypto.randomUUID();
    const cookieStore = cookies();
    cookieStore.set('linkedin_oauth_state', state, { httpOnly: true, secure: false, maxAge: 600 });

    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/connect/linkedin/callback`;
    const scope = 'openid profile email w_member_social';

    const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', callbackUrl);
    url.searchParams.set('scope', scope);
    url.searchParams.set('state', state);

    return NextResponse.redirect(url.toString());
}
