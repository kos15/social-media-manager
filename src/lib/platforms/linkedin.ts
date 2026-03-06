import prisma from '@/lib/prisma';
import { getPlatformCredential } from '@/lib/platform-credentials';

interface LinkedInPublishResult {
    success: boolean;
    postId?: string;
    error?: string;
}

/**
 * Checks if the LinkedIn access token is expired (or expires in < 5 mins).
 * If so, uses the refresh token to get a new access token.
 */
export async function refreshLinkedInTokenIfNeeded(socialAccount: {
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
        const creds = await getPlatformCredential('LINKEDIN');
        if (!creds) throw new Error('LinkedIn credentials not configured');

        const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: socialAccount.refreshToken,
                client_id: creds.clientId,
                client_secret: creds.clientSecret,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.access_token) {
            console.error('[LinkedIn Refresh Error]', tokenData);
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

        console.log(`[LinkedIn Renewed Token] Account ID: ${updated.platformId}`);
        return updated.accessToken;

    } catch (error) {
        console.error('[LinkedIn Token Refresh Failed]', error);
        // We'll throw so the publisher knows the account needs re-authentication
        throw error;
    }
}

/**
 * Publishes a post to LinkedIn using the v2/ugcPosts API.
 * Automatically handles token refresh if needed.
 */
export async function publishToLinkedIn(
    content: string,
    socialAccountId: string
): Promise<LinkedInPublishResult> {
    try {
        const account = await prisma.socialAccount.findUnique({
            where: { id: socialAccountId },
        });

        if (!account || account.platform !== 'LINKEDIN') {
            return { success: false, error: 'Social account not found or is not LinkedIn' };
        }

        if (account.status !== 'ACTIVE') {
            return { success: false, error: 'LinkedIn account is not active (needs reconnect)' };
        }

        // 1. Ensure token is valid
        let activeToken: string;
        try {
            activeToken = await refreshLinkedInTokenIfNeeded(account);
        } catch (tokenErr: unknown) {
            // Token refresh failed permanently
            await prisma.socialAccount.update({
                where: { id: account.id },
                data: { status: 'DISCONNECTED' },
            });
            const errorMessage = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
            return { success: false, error: `Authentication expired. Please reconnect: ${errorMessage}` };
        }

        // 2. Publish to v2 API
        // POST https://api.linkedin.com/v2/ugcPosts
        const authorUrn = `urn:li:person:${account.platformId}`;

        const requestBody = {
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: content
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        };

        const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${activeToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
            },
            body: JSON.stringify(requestBody),
        });

        let data;
        try {
            data = await res.json();
        } catch (e) {
            // Sometimes APIs return 201 Created with no JSON body
            data = {};
        }

        if (!res.ok) {
            console.error('[LinkedIn Publish Error]', res.status, data);
            return { success: false, error: data.message || `HTTP ${res.status} from LinkedIn` };
        }

        return {
            success: true,
            postId: data.id, // Native LinkedIn URN ID
        };

    } catch (error: unknown) {
        console.error('[LinkedIn Publish Exception]', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage || 'Unknown network error during publish' };
    }
}
