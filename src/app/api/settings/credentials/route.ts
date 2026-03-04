import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

type Platform = 'TWITTER' | 'LINKEDIN' | 'INSTAGRAM' | 'YOUTUBE';

// GET - fetch all platform credentials (masks client_secret)
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const creds = await prisma.platformCredential.findMany({
            orderBy: { platform: 'asc' },
        });

        // Mask the client secret — only expose last 4 chars
        const masked = creds.map((c: { platform: string; clientId: string; clientSecret: string; updatedAt: Date }) => ({
            platform: c.platform,
            clientId: c.clientId,
            clientSecretMasked: `••••••••${c.clientSecret.slice(-4)}`,
            updatedAt: c.updatedAt,
        }));

        return NextResponse.json(masked);
    } catch (error) {
        console.error('Failed to fetch credentials (DB may not be configured):', error);
        return NextResponse.json([]);
    }
}

// POST - save/update credentials for a platform
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platform, clientId, clientSecret } = body;

    if (!platform || !clientId?.trim() || !clientSecret?.trim()) {
        return NextResponse.json({ error: 'platform, clientId, and clientSecret are all required' }, { status: 400 });
    }

    const validPlatforms: Platform[] = ['TWITTER', 'LINKEDIN', 'INSTAGRAM', 'YOUTUBE'];
    if (!validPlatforms.includes(platform)) {
        return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    try {
        await prisma.platformCredential.upsert({
            where: { platform },
            update: { clientId: clientId.trim(), clientSecret: clientSecret.trim() },
            create: { platform, clientId: clientId.trim(), clientSecret: clientSecret.trim() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save credentials:', error);
        return NextResponse.json({ error: 'Failed to save credentials' }, { status: 500 });
    }
}

// DELETE - remove credentials for a platform
export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') as Platform;

    if (!platform) {
        return NextResponse.json({ error: 'Platform required' }, { status: 400 });
    }

    try {
        await prisma.platformCredential.deleteMany({ where: { platform } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to remove credentials:', error);
        return NextResponse.json({ error: 'Failed to remove credentials' }, { status: 500 });
    }
}
