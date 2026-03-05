import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/get-user';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/oauth-utils';
import { getPlatformCredential } from '@/lib/platform-credentials';
import { cookies } from 'next/headers';
import { getAppUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/connect/twitter
 *
 * Initiates X (Twitter) OAuth 2.0 Authorization Code Flow with PKCE.
 * Docs: https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code
 *
 * Authorization endpoint: https://x.com/i/oauth2/authorize
 * Required params: response_type, client_id, redirect_uri, scope, state, code_challenge, code_challenge_method
 * Scopes: tweet.read users.read offline.access
 */
export async function GET(request: NextRequest) {
    const user = await getServerUser(request);
    if (!user) {
        return NextResponse.redirect(`${getAppUrl()}/login`);
    }

    // Load credentials from DB first, then env fallback
    const creds = await getPlatformCredential('TWITTER');
    if (!creds) {
        return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/settings?tab=integrations&error=twitter_not_configured`
        );
    }

    // Generate PKCE code verifier + challenge (S256 method per X docs)
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = crypto.randomUUID();

    // Store in httpOnly cookies for CSRF protection & PKCE verification at callback
    const cookieStore = cookies();
    cookieStore.set('x_oauth_verifier', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
    });
    cookieStore.set('x_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
    });

    const callbackUrl = `${getAppUrl()}/api/connect/twitter/callback`;

    // Build X authorization URL — using https://x.com/i/oauth2/authorize (correct endpoint per docs)
    const url = new URL('https://x.com/i/oauth2/authorize');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', creds.clientId);
    url.searchParams.set('redirect_uri', callbackUrl);
    // offline.access is required to receive a refresh_token
    url.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    return NextResponse.redirect(url.toString());
}
