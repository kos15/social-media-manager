import prisma from '@/lib/prisma';

type Platform = 'TWITTER' | 'LINKEDIN' | 'INSTAGRAM' | 'YOUTUBE';


/**
 * Reads OAuth credentials for a platform: DB first, then ENV fallback.
 */
export async function getPlatformCredential(platform: Platform): Promise<{ clientId: string; clientSecret: string } | null> {
    // 1. Try database first
    try {
        const dbCred = await prisma.platformCredential.findUnique({ where: { platform } });
        if (dbCred?.clientId && dbCred?.clientSecret) {
            return { clientId: dbCred.clientId, clientSecret: dbCred.clientSecret };
        }
    } catch {
        // Fall through to env
    }

    // 2. Fallback to environment variables
    const envMap: Record<Platform, { clientId?: string; clientSecret?: string }> = {
        TWITTER: {
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
        },
        LINKEDIN: {
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        },
        INSTAGRAM: {
            clientId: process.env.INSTAGRAM_CLIENT_ID,
            clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        },
        YOUTUBE: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    };

    const env = envMap[platform];
    if (env.clientId && env.clientSecret) {
        return { clientId: env.clientId, clientSecret: env.clientSecret };
    }

    return null;
}
