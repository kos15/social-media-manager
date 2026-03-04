import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getPlatformCredential } from '@/lib/platform-credentials';

/**
 * POST /api/connect/twitter/revoke
 *
 * Revokes an X (Twitter) OAuth 2.0 access token.
 * Docs: https://docs.x.com/fundamentals/authentication/oauth-2-0/user-access-token
 *
 * Revoke endpoint: POST https://api.x.com/2/oauth2/revoke
 * Params: token, client_id (public) or Basic auth (confidential)
 */
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountId } = await request.json();

    try {
        const account = await prisma.socialAccount.findFirst({
            where: { id: accountId, userId: session.user.id!, platform: 'TWITTER' },
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const creds = await getPlatformCredential('TWITTER');

        // Best-effort revocation — don't block if it fails
        if (creds && account.accessToken) {
            const basicAuth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
            await fetch('https://api.x.com/2/oauth2/revoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicAuth}`,
                },
                body: new URLSearchParams({
                    token: account.accessToken,
                    client_id: creds.clientId,
                }),
            }).catch(err => console.warn('[X Revoke] Revocation request failed:', err));
        }

        // Remove from DB regardless of revocation success
        await prisma.socialAccount.delete({ where: { id: accountId } });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('[X Revoke] Error:', err);
        return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 });
    }
}
