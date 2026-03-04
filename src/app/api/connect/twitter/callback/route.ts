import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getPlatformCredential } from '@/lib/platform-credentials';

/**
 * GET /api/connect/twitter/callback
 *
 * Handles the OAuth 2.0 callback from X after user authorisation.
 * Docs: https://docs.x.com/fundamentals/authentication/oauth-2-0/user-access-token
 *
 * Token endpoint: POST https://api.x.com/2/oauth2/token
 * - Confidential clients: send Authorization: Basic <base64(clientId:clientSecret)>
 * - Public clients: send client_id in body
 *
 * User lookup: GET https://api.x.com/2/users/me
 */
export async function GET(request: NextRequest) {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.redirect(new URL('/login', baseUrl));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // User denied access
    if (error) {
        console.warn('[X OAuth] User denied access or error:', error, errorDescription);
        return NextResponse.redirect(new URL('/accounts?error=twitter_denied', baseUrl));
    }

    const cookieStore = cookies();
    const savedState = cookieStore.get('x_oauth_state')?.value;
    const codeVerifier = cookieStore.get('x_oauth_verifier')?.value;

    // Validate CSRF state
    if (!state || state !== savedState || !code || !codeVerifier) {
        console.error('[X OAuth] Invalid state or missing code/verifier');
        return NextResponse.redirect(new URL('/accounts?error=twitter_invalid_state', baseUrl));
    }

    // Clear OAuth cookies
    cookieStore.delete('x_oauth_state');
    cookieStore.delete('x_oauth_verifier');

    // Load credentials from DB / env
    const creds = await getPlatformCredential('TWITTER');
    if (!creds) {
        return NextResponse.redirect(new URL('/settings?tab=integrations&error=twitter_not_configured', baseUrl));
    }

    const callbackUrl = `${baseUrl}/api/connect/twitter/callback`;

    try {
        // -----------------------------------------------------------------------
        // Step 1: Exchange authorisation code for access + refresh tokens
        // POST https://api.x.com/2/oauth2/token
        //
        // Confidential clients must use Basic auth header:
        //   Authorization: Basic base64(clientId:clientSecret)
        // -----------------------------------------------------------------------
        const basicAuth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');

        const tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: callbackUrl,
                code_verifier: codeVerifier,
                // client_id is included in body for public clients; Basic auth covers confidential clients
                client_id: creds.clientId,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.access_token) {
            console.error('[X OAuth] Token exchange failed:', tokenData);
            throw new Error(`Token exchange failed: ${tokenData.error ?? tokenData.detail ?? 'unknown'}`);
        }

        const {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresIn,
            token_type: tokenType,
        } = tokenData;

        console.log('[X OAuth] Token exchange successful. Token type:', tokenType);

        // -----------------------------------------------------------------------
        // Step 2: Fetch authenticated user's X profile
        // GET https://api.x.com/2/users/me
        // fields: id, name, username, profile_image_url
        // -----------------------------------------------------------------------
        const userRes = await fetch(
            'https://api.x.com/2/users/me?user.fields=id,name,username,profile_image_url,description,public_metrics',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const userData = await userRes.json();

        if (!userRes.ok || !userData.data) {
            console.error('[X OAuth] Failed to fetch user profile:', userData);
            throw new Error('Failed to fetch X user profile');
        }

        const { id: xId, username, name, profile_image_url: profileImage } = userData.data;

        // -----------------------------------------------------------------------
        // Step 3: Upsert SocialAccount in DB
        // -----------------------------------------------------------------------
        await prisma.socialAccount.upsert({
            where: {
                platform_platformId: { platform: 'TWITTER', platformId: xId },
            },
            update: {
                username: `@${username}`,
                profileImage: profileImage ?? null,
                accessToken,
                refreshToken: refreshToken ?? null,
                expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
                status: 'ACTIVE',
                userId: session.user.id!,
            },
            create: {
                platform: 'TWITTER',
                platformId: xId,
                username: `@${username}`,
                profileImage: profileImage ?? null,
                accessToken,
                refreshToken: refreshToken ?? null,
                expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
                status: 'ACTIVE',
                userId: session.user.id!,
            },
        });

        console.log(`[X OAuth] Successfully connected account @${username} (${name})`);
        return NextResponse.redirect(new URL('/accounts?success=twitter', baseUrl));

    } catch (err) {
        console.error('[X OAuth] Error during callback:', err);
        return NextResponse.redirect(new URL('/accounts?error=twitter_failed', baseUrl));
    }
}
