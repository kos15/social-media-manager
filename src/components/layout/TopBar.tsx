import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Bell, Menu } from "lucide-react";

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
    return (
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
            <div className="flex-1 flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-lg bg-surface hover:bg-surface-elevated transition-colors border border-border"
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5 text-text-secondary" />
                </button>
                {/* Search or context could go here */}
            </div>

            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-lg bg-surface hover:bg-surface-elevated transition-colors border border-border relative">
                    <Bell className="w-5 h-5 text-text-secondary" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
                </button>

                <ThemeToggle />

                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent border border-border overflow-hidden">
                    {/* Avatar placeholder */}
                </div>
            </div>
        </header>
    );
}
