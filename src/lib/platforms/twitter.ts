import prisma from '@/lib/prisma';
import { getPlatformCredential } from '@/lib/platform-credentials';

interface TwitterPublishResult {
    success: boolean;
    postId?: string;
    error?: string;
}

/**
 * Checks if the Twitter access token is expired (or expires in < 5 mins).
 * If so, uses the refresh token to get a new access token.
 */
export async function refreshTwitterTokenIfNeeded(socialAccount: {
    id: string;
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date | null;
}) {
    // If no expiration or no refresh token, we can't refresh
    if (!socialAccount.expiresAt || !socialAccount.refreshToken) {
        return socialAccount.accessToken;
    }

    // Refresh if within 5 minutes of expiration
    const fiveMinsFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (socialAccount.expiresAt > fiveMinsFromNow) {
        return socialAccount.accessToken; // Still valid
    }

    try {
        const creds = await getPlatformCredential('TWITTER');
        if (!creds) throw new Error('Twitter credentials not configured');

        const basicAuth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');

        const tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: socialAccount.refreshToken,
                client_id: creds.clientId, // Required per OAuth 2.0 PKCE spec
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.access_token) {
            console.error('[Twitter Refresh Error]', tokenData);
            throw new Error(`Failed to refresh token: ${tokenData.error_description || tokenData.error}`);
        }

        const newExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

        // Update DB
        const updated = await prisma.socialAccount.update({
            where: { id: socialAccount.id },
            data: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token || socialAccount.refreshToken,
                expiresAt: newExpiresAt,
            },
        });

        console.log(`[Twitter Renewed Token] Account ID: ${updated.platformId}`);
        return updated.accessToken;

    } catch (error) {
        console.error('[Twitter Token Refresh Failed]', error);
        // We'll throw so the publisher knows the account needs re-authentication
        throw error;
    }
}

/**
 * Publishes a post to Twitter using the v2/tweets API.
 * Automatically handles token refresh if needed.
 */
export async function publishToTwitter(
    content: string,
    socialAccountId: string
): Promise<TwitterPublishResult> {
    try {
        const account = await prisma.socialAccount.findUnique({
            where: { id: socialAccountId },
        });

        if (!account || account.platform !== 'TWITTER') {
            return { success: false, error: 'Social account not found or is not Twitter' };
        }

        if (account.status !== 'ACTIVE') {
            return { success: false, error: 'Twitter account is not active (needs reconnect)' };
        }

        // 1. Ensure token is valid
        let activeToken: string;
        try {
            activeToken = await refreshTwitterTokenIfNeeded(account);
        } catch (tokenErr: any) {
            // Token refresh failed permanently
            await prisma.socialAccount.update({
                where: { id: account.id },
                data: { status: 'DISCONNECTED' },
            });
            return { success: false, error: `Authentication expired. Please reconnect: ${tokenErr.message}` };
        }

        // 2. Publish to v2 API
        // POST https://api.x.com/2/tweets
        const res = await fetch('https://api.x.com/2/tweets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${activeToken}`,
            },
            body: JSON.stringify({
                text: content,
                // If we supported media uploads, we'd add media: { media_ids: [...] } here
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('[Twitter Publish Error]', data);
            return { success: false, error: data.detail || `HTTP ${res.status} from Twitter` };
        }

        return {
            success: true,
            postId: data.data.id, // Native Twitter ID
        };

    } catch (error: any) {
        console.error('[Twitter Publish Exception]', error);
        return { success: false, error: error.message || 'Unknown network error during publish' };
    }
}
