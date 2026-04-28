import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/meta/data-deletion
 *
 * Meta Data Deletion Callback — called by Meta when a user removes
 * SocialPulse from their Facebook/Instagram app settings.
 *
 * Meta sends a signed_request (base64url encoded) containing the user's
 * Facebook user ID. We parse it, verify the signature, delete all
 * associated data, and return a confirmation URL.
 *
 * Docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.formData();
        const signedRequest = body.get('signed_request') as string | null;

        if (!signedRequest) {
            return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 });
        }

        const appSecret = process.env.INSTAGRAM_CLIENT_SECRET || process.env.META_APP_SECRET;
        if (!appSecret) {
            console.error('[Meta Data Deletion] No app secret configured');
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        // Parse and verify the signed_request
        const [encodedSig, payload] = signedRequest.split('.');
        if (!encodedSig || !payload) {
            return NextResponse.json({ error: 'Invalid signed_request format' }, { status: 400 });
        }

        // Verify HMAC-SHA256 signature
        const expectedSig = createHmac('sha256', appSecret)
            .update(payload)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        if (encodedSig !== expectedSig) {
            console.warn('[Meta Data Deletion] Signature mismatch');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Decode the payload
        const decoded = JSON.parse(
            Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
        );

        const metaUserId: string | undefined = decoded.user_id;
        if (!metaUserId) {
            return NextResponse.json({ error: 'No user_id in payload' }, { status: 400 });
        }

        console.log(`[Meta Data Deletion] Received request for Meta user ID: ${metaUserId}`);

        // Find and delete the SocialAccount linked to this Meta/Instagram user
        const deleted = await prisma.socialAccount.deleteMany({
            where: {
                platform: { in: ['INSTAGRAM', 'FACEBOOK'] as any[] },
                platformId: metaUserId,
            },
        });

        console.log(`[Meta Data Deletion] Deleted ${deleted.count} account(s) for Meta user ${metaUserId}`);

        // Generate a confirmation code for Meta to show the user
        const confirmationCode = `SP-${metaUserId.slice(-8)}-${Date.now().toString(36).toUpperCase()}`;

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialpulse.app';

        return NextResponse.json({
            url: `${appUrl}/data-deletion?code=${confirmationCode}`,
            confirmation_code: confirmationCode,
        });

    } catch (error) {
        console.error('[Meta Data Deletion] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Meta may also GET this endpoint to verify it exists
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        description: 'Meta Data Deletion Callback — SocialPulse',
    });
}
