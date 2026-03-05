import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/supabase/get-user';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper: ensure Prisma user exists (same pattern as /api/posts)
async function ensurePrismaUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, string> }) {
    const email = supabaseUser.email ?? `${supabaseUser.id}@unknown.local`;
    return prisma.user.upsert({
        where: { email },
        create: {
            id: supabaseUser.id,
            email,
            name: supabaseUser.user_metadata?.full_name ?? email.split('@')[0],
        },
        update: {},
        select: { id: true, name: true, email: true },
    });
}

// ── GET /api/profile ────────────────────────────────────────────────
export async function GET(request: NextRequest) {
    const user = await getServerUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const dbUser = await ensurePrismaUser(user);
        return NextResponse.json({ name: dbUser.name ?? '', email: dbUser.email ?? '' });
    } catch (error) {
        console.error('GET /api/profile error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

// ── PUT /api/profile ────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
    const user = await getServerUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { name, email } = body as { name?: string; email?: string };

        if (!name?.trim() && !email?.trim()) {
            return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
        }

        // Ensure the row exists first
        const dbUser = await ensurePrismaUser(user);

        // Build update payload
        const updateData: { name?: string; email?: string } = {};
        if (name?.trim()) updateData.name = name.trim();

        // If email changed, update it — Prisma unique constraint will catch duplicates
        if (email?.trim() && email.trim() !== dbUser.email) {
            updateData.email = email.trim();
        }

        const updated = await prisma.user.update({
            where: { id: dbUser.id },
            data: updateData,
            select: { name: true, email: true },
        });

        return NextResponse.json({ name: updated.name ?? '', email: updated.email ?? '' });
    } catch (error: unknown) {
        console.error('PUT /api/profile error:', error);
        // Prisma unique constraint on email
        if (
            typeof error === 'object' && error !== null &&
            'code' in error && (error as { code: string }).code === 'P2002'
        ) {
            return NextResponse.json({ error: 'That email is already in use' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
