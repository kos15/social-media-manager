import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getPlatformCredential } from '@/lib/platform-credentials';

/**
 * POST /api/connect/twitter/refresh
 *
 * Refreshes an X (Twitter) access token using the stored refresh token.
 * Docs: https://docs.x.com/fundamentals/authentication/oauth-2-0/user-access-token#refresh-tokens
 *
 * Token endpoint: POST https://api.x.com/2/oauth2/token
 * grant_type: refresh_token
 * Confidential clients: Authorization: Basic base64(clientId:clientSecret)
 */
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId } = await request.json();
    if (!accountId) {
        return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    try {
        // Fetch the stored social account
        const account = await prisma.socialAccount.findFirst({
            where: {
                id: accountId,
                userId: session.user.id!,
                platform: 'TWITTER',
            },
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        if (!account.refreshToken) {
            return NextResponse.json({ error: 'No refresh token stored — user must reconnect' }, { status: 400 });
        }

        const creds = await getPlatformCredential('TWITTER');
        if (!creds) {
            return NextResponse.json({ error: 'Twitter credentials not configured' }, { status: 400 });
        }

        // Refresh token — confidential client uses Basic auth
        const basicAuth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');

        const tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: account.refreshToken,
                client_id: creds.clientId,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.access_token) {
            console.error('[X Refresh] Token refresh failed:', tokenData);
            // Mark account as EXPIRED so user knows to reconnect
            await prisma.socialAccount.update({
                where: { id: accountId },
                data: { status: 'EXPIRED' },
            });
            return NextResponse.json({ error: 'Token refresh failed — please reconnect' }, { status: 400 });
        }

        // Update account with new tokens
        await prisma.socialAccount.update({
            where: { id: accountId },
            data: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token ?? account.refreshToken,
                expiresAt: tokenData.expires_in
                    ? new Date(Date.now() + tokenData.expires_in * 1000)
                    : null,
                status: 'ACTIVE',
            },
        });

        return NextResponse.json({ success: true, message: 'Token refreshed successfully' });

    } catch (err) {
        console.error('[X Refresh] Error:', err);
        return NextResponse.json({ error: 'Internal error during token refresh' }, { status: 500 });
    }
}
