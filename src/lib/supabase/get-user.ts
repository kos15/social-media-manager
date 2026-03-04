import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';

/**
 * Extracts the authenticated Supabase user from a Next.js API route request.
 * Drop-in replacement for `auth()` from NextAuth.
 *
 * Usage:
 *   const user = await getServerUser(request);
 *   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   const userId = user.id;
 */
export async function getServerUser(request: NextRequest): Promise<User | null> {
    const response = new Response();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        const headers = new Headers(response.headers);
                        headers.append(
                            'Set-Cookie',
                            `${name}=${value}; Path=/; ${options?.httpOnly ? 'HttpOnly;' : ''} ${options?.secure ? 'Secure;' : ''} SameSite=${options?.sameSite ?? 'Lax'}`
                        );
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
