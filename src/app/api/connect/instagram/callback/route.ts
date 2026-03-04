import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error_reason');

    if (error) {
        return NextResponse.redirect(new URL('/accounts?error=instagram_denied', request.url));
    }

    const cookieStore = cookies();
    const savedState = cookieStore.get('instagram_oauth_state')?.value;

    if (!state || state !== savedState || !code) {
        return NextResponse.redirect(new URL('/accounts?error=instagram_invalid_state', request.url));
    }

    cookieStore.delete('instagram_oauth_state');

    try {
        const callbackUrl = `${process.env.NEXTAUTH_URL}/api/connect/instagram/callback`;

        // Exchange code for short-lived token
        const formData = new FormData();
        formData.append('client_id', process.env.INSTAGRAM_CLIENT_ID!);
        formData.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET!);
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', callbackUrl);
        formData.append('code', code);

        const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            body: formData,
        });

        const shortToken = await tokenResponse.json();
        if (!shortToken.access_token) {
            throw new Error('Failed to obtain Instagram access token');
        }

        // Exchange short-lived for long-lived token (60 days)
        const longLivedResponse = await fetch(
            `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${shortToken.access_token}`
        );
        const longToken = await longLivedResponse.json();
        const accessToken = longToken.access_token ?? shortToken.access_token;

        // Fetch user profile
        const userResponse = await fetch(
            `https://graph.instagram.com/me?fields=id,username,profile_picture_url&access_token=${accessToken}`
        );
        const igUser = await userResponse.json();

        await prisma.socialAccount.upsert({
            where: { platform_platformId: { platform: 'INSTAGRAM', platformId: igUser.id } },
            update: {
                username: `@${igUser.username}`,
                profileImage: igUser.profile_picture_url,
                accessToken,
                refreshToken: null,
                expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
                status: 'ACTIVE',
                userId: session.user.id!,
            },
            create: {
                platform: 'INSTAGRAM',
                platformId: igUser.id,
                username: `@${igUser.username}`,
                profileImage: igUser.profile_picture_url,
                accessToken,
                refreshToken: null,
                expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                status: 'ACTIVE',
                userId: session.user.id!,
            },
        });

        return NextResponse.redirect(new URL('/accounts?success=instagram', request.url));
    } catch (err) {
        console.error('Instagram OAuth error:', err);
        return NextResponse.redirect(new URL('/accounts?error=instagram_failed', request.url));
    }
}
