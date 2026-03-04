import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/get-user';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const user = await getServerUser(request);
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/accounts?error=linkedin_denied', request.url));
    }

    const cookieStore = await cookies();
    const savedState = cookieStore.get('linkedin_oauth_state')?.value;

    if (!state || state !== savedState || !code) {
        return NextResponse.redirect(new URL('/accounts?error=linkedin_invalid_state', request.url));
    }

    cookieStore.delete('linkedin_oauth_state');

    try {
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/connect/linkedin/callback`;

        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: callbackUrl,
                client_id: process.env.LINKEDIN_CLIENT_ID!,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
            }),
        });

        const tokens = await tokenResponse.json();
        if (!tokens.access_token) {
            throw new Error('Failed to obtain LinkedIn access token');
        }

        const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const linkedinUser = await userResponse.json();

        const platformId = linkedinUser.sub;
        const username = linkedinUser.name || linkedinUser.email || 'LinkedIn User';
        const profileImage = linkedinUser.picture;

        await prisma.socialAccount.upsert({
            where: { platform_platformId: { platform: 'LINKEDIN', platformId } },
            update: {
                username,
                profileImage,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token ?? null,
                expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
                status: 'ACTIVE',
                userId: user.id,
            },
            create: {
                platform: 'LINKEDIN',
                platformId,
                username,
                profileImage,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token ?? null,
                expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
                status: 'ACTIVE',
                userId: user.id,
            },
        });

        return NextResponse.redirect(new URL('/accounts?success=linkedin', request.url));
    } catch (err) {
        console.error('LinkedIn OAuth error:', err);
        return NextResponse.redirect(new URL('/accounts?error=linkedin_failed', request.url));
    }
}
