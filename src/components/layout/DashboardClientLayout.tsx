"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, PenTool, Sparkles, BarChart, Users, Settings, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Composer", href: "/composer", icon: PenTool },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "AI Studio", href: "/ai-studio", icon: Sparkles },
    { name: "Analytics", href: "/analytics", icon: BarChart },
    { name: "Accounts", href: "/accounts", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardClientLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-surface-elevated border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out md:hidden",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-5 flex items-center justify-between border-b border-border">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        SocialPulse
                    </h1>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-1.5 rounded-md text-text-secondary hover:text-foreground hover:bg-surface transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-text-secondary hover:bg-surface hover:text-text-primary"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "w-5 h-5",
                                        isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary"
                                    )}
                                />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 relative overflow-y-auto w-full p-4 md:p-6">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
