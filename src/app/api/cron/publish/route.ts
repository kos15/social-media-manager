import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { publishToTwitter } from '@/lib/platforms/twitter';
import { publishToLinkedIn } from '@/lib/platforms/linkedin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // 1. Verify Vercel Cron Secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('[Cron Publisher] Triggered at', new Date().toISOString());

        // 2. Find all SCHEDULED posts where scheduledFor <= now
        const limitCount = 20; // Process in batches to avoid Vercel Function timeout (max 10-60s)
        const duePosts = await prisma.post.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledFor: {
                    lte: new Date(),
                },
            },
            include: {
                user: true, // We need user info to find their social accounts, or we can query accounts directly
            },
            take: limitCount,
        });

        if (duePosts.length === 0) {
            return NextResponse.json({ success: true, message: 'No due posts' });
        }

        console.log(`[Cron Publisher] Found ${duePosts.length} due posts.`);

        // 3. Mark all as PUBLISHING immediately to prevent duplicate cron processing
        // if this run takes too long or fails mid-way
        await prisma.post.updateMany({
            where: { id: { in: duePosts.map((p: any) => p.id) } },
            data: { status: 'PUBLISHING' },
        });

        const results = [];

        // 4. Process each post sequentially (or in parallel depending on rate limits)
        for (const post of duePosts) {
            console.log(`[Cron Publisher] Processing post ${post.id} for user ${post.userId}`);

            // Assume we need to publish to these platforms
            // The post has `platformIds` like ['TWITTER', 'LINKEDIN']
            let successAll = true;
            const errors: string[] = [];

            // A single post might go to multiple platforms.
            // In our schema, `socialAccountId` might be set if it's 1:1, but typically in apps like this
            // we look up the user's active connection for each platform in `platformIds`.
            const userAccounts = await prisma.socialAccount.findMany({
                where: {
                    userId: post.userId,
                    status: 'ACTIVE',
                    platform: {
                        in: post.platformIds as any[], // Cast to Prisma enum array
                    }
                }
            });

            if (userAccounts.length === 0) {
                successAll = false;
                errors.push('No active connected accounts found for the configured platforms.');
            }

            for (const platformId of post.platformIds) {
                // Find matching social account
                const account = userAccounts.find((a: any) => a.platform === platformId);
                if (!account) {
                    successAll = false;
                    errors.push(`Not connected to ${platformId}`);
                    continue;
                }

                if (platformId === 'TWITTER') {
                    const result = await publishToTwitter(post.content, account.id);
                    if (!result.success) {
                        successAll = false;
                        errors.push(`Twitter: ${result.error}`);
                    }
                } else if (platformId === 'LINKEDIN') {
                    const result = await publishToLinkedIn(post.content, account.id);
                    if (!result.success) {
                        successAll = false;
                        errors.push(`LinkedIn: ${result.error}`);
                    }
                } else {
                    // Placeholder for LinkedIn, Instagram, etc.
                    successAll = false;
                    errors.push(`${platformId} publishing is not yet implemented.`);
                }
            }

            // 5. Update Post status and create user Notification
            const finalStatus = successAll ? 'PUBLISHED' : 'FAILED';

            await prisma.post.update({
                where: { id: post.id },
                data: { status: finalStatus },
            });

            await prisma.notification.create({
                data: {
                    userId: post.userId,
                    type: successAll ? 'POST_PUBLISHED' : 'POST_FAILED',
                    title: successAll ? 'Post Published Successfully' : 'Failed to Publish Post',
                    message: successAll
                        ? `Your scheduled post has been published to ${post.platformIds.join(', ')}.`
                        : `Your post failed to publish: ${errors.join(' | ')}`,
                }
            });

            results.push({
                postId: post.id,
                status: finalStatus,
                errors: errors.length ? errors : undefined,
            });
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results,
        });

    } catch (error: unknown) {
        console.error('[Cron Publisher Error]', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: errorMessage || 'Internal cron error' }, { status: 500 });
    }
}
