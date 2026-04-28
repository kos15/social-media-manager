import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        SocialPulse
                    </Link>
                    <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="/data-deletion" className="hover:text-foreground transition-colors">Data Deletion</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
                {children}
            </main>

            <footer className="border-t border-border mt-16">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
                    <span>© {new Date().getFullYear()} SocialPulse. All rights reserved.</span>
                    <nav className="flex gap-6">
                        <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="/data-deletion" className="hover:text-foreground transition-colors">Data Deletion</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
