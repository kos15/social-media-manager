import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cookies } from 'next/headers';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.redirect('/login');
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: 'Instagram OAuth not configured. Set INSTAGRAM_CLIENT_ID in .env' }, { status: 500 });
    }

    const state = crypto.randomUUID();
    const cookieStore = cookies();
    cookieStore.set('instagram_oauth_state', state, { httpOnly: true, secure: false, maxAge: 600 });

    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/connect/instagram/callback`;
    // Instagram Basic Display API scope
    const scope = 'user_profile,user_media';

    const url = new URL('https://api.instagram.com/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', callbackUrl);
    url.searchParams.set('scope', scope);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);

    return NextResponse.redirect(url.toString());
}
