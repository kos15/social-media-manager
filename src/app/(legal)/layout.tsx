import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
            <header className="border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        SocialPulse
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                            Terms &amp; Conditions
                        </Link>
                        <Link
                            href="/login"
                            className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-zinc-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            Sign in
                        </Link>
                    </nav>
                    {/* Mobile nav */}
                    <Link href="/terms" className="md:hidden text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        Legal
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
                {children}
            </main>

            <footer className="border-t border-gray-200 dark:border-zinc-800 mt-16">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 text-sm text-gray-400 dark:text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
                    <span>© {new Date().getFullYear()} SocialPulse. All rights reserved.</span>
                    <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
                        <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Legal Hub</Link>
                        <Link href="/privacy-policy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms of Service</Link>
                        <Link href="/data-deletion" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Data Deletion</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
