import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/get-user';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const user = await getServerUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const accounts = await prisma.socialAccount.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                platform: true,
                username: true,
                profileImage: true,
                status: true,
                expiresAt: true,
                createdAt: true,
            },
        });
        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Failed to fetch accounts:', error);
        return NextResponse.json([]);
    }
}

export async function DELETE(request: NextRequest) {
    const user = await getServerUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    try {
        await prisma.socialAccount.deleteMany({
            where: { id, userId: user.id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to disconnect account:', error);
        return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 });
    }
}
