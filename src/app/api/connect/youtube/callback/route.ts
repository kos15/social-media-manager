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
        return NextResponse.redirect(new URL('/accounts?error=youtube_denied', request.url));
    }

    const cookieStore = await cookies();
    const savedState = cookieStore.get('youtube_oauth_state')?.value;

    if (!state || state !== savedState || !code) {
        return NextResponse.redirect(new URL('/accounts?error=youtube_invalid_state', request.url));
    }

    cookieStore.delete('youtube_oauth_state');

    try {
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/connect/youtube/callback`;

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: callbackUrl,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();
        if (!tokens.access_token) {
            throw new Error('Failed to obtain Google access token');
        }

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser = await userResponse.json();

        let channelName = googleUser.name;
        let channelId = googleUser.id;
        try {
            const ytResponse = await fetch(
                'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
                { headers: { Authorization: `Bearer ${tokens.access_token}` } }
            );
            const ytData = await ytResponse.json();
            if (ytData.items?.[0]) {
                channelName = ytData.items[0].snippet.title;
                channelId = ytData.items[0].id;
            }
        } catch {
            // Fall back to Google profile
        }

        await prisma.socialAccount.upsert({
            where: { platform_platformId: { platform: 'YOUTUBE', platformId: channelId } },
            update: {
                username: channelName,
                profileImage: googleUser.picture,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token ?? null,
                expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
                status: 'ACTIVE',
                userId: user.id,
            },
            create: {
                platform: 'YOUTUBE',
                platformId: channelId,
                username: channelName,
                profileImage: googleUser.picture,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token ?? null,
                expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
                status: 'ACTIVE',
                userId: user.id,
            },
        });

        return NextResponse.redirect(new URL('/accounts?success=youtube', request.url));
    } catch (err) {
        console.error('YouTube OAuth error:', err);
        return NextResponse.redirect(new URL('/accounts?error=youtube_failed', request.url));
    }
}
