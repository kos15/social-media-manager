"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, PenTool, Sparkles, BarChart, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Composer", href: "/composer", icon: PenTool },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "AI Studio", href: "/ai-studio", icon: Sparkles },
    { name: "Analytics", href: "/analytics", icon: BarChart },
    { name: "Accounts", href: "/accounts", icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex flex-col w-64 border-r border-border bg-surface-elevated/50 h-screen sticky top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    SocialPulse
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-text-secondary hover:bg-surface hover:text-text-primary"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary")} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group",
                        pathname.startsWith("/settings")
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-text-secondary hover:bg-surface hover:text-text-primary"
                    )}
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </Link>
            </div>
        </div>
    );
}
