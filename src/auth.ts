import NextAuth, { Session } from 'next-auth';
// @ts-expect-error next-auth beta missing types
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextRequest } from 'next/server';

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET || "super_secret_for_development_purposes_only_do_not_use_in_prod",
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }: { auth: Session | null, request: NextRequest }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') ||
                nextUrl.pathname.startsWith('/calendar') ||
                nextUrl.pathname.startsWith('/composer') ||
                nextUrl.pathname.startsWith('/ai-studio') ||
                nextUrl.pathname.startsWith('/analytics') ||
                nextUrl.pathname.startsWith('/accounts') ||
                nextUrl.pathname.startsWith('/settings');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        session({ session, token }: { session: Session; token: JWT }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
            }
            return session;
        }
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: Record<string, string> | undefined) {
                // Mock authorization for now
                if (credentials?.email === 'admin@admin.com') {
                    return { id: '1', email: 'admin@admin.com', name: 'Admin User' };
                }
                return null;
            }
        }),
    ],
});
