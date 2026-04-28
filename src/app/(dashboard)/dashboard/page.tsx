"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Activity, Users, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { UpcomingPostsWidget } from "@/components/dashboard/UpcomingPostsWidget";
import { AccountStatusWidget } from "@/components/dashboard/AccountStatusWidget";

interface SocialAccount {
    id: string;
    platform: string;
    username: string;
    status: string;
    expiresAt: string | null;
}

interface Post {
    id: string;
    platforms: string[];
    scheduledDate: string;
}

export default function DashboardPage() {
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/accounts').then(r => r.json()).catch(() => []),
            fetch('/api/posts').then(r => r.json()).catch(() => []),
        ]).then(([accs, ps]) => {
            setAccounts(Array.isArray(accs) ? accs : []);
            setPosts(Array.isArray(ps) ? ps : []);
            setLoading(false);
        });
    }, []);

    const activeAccounts = accounts.filter(a => a.status === 'ACTIVE');
    const now = new Date();
    const scheduledPosts = posts.filter(p => new Date(p.scheduledDate) > now);
    const publishedPosts = posts.filter(p => new Date(p.scheduledDate) <= now);
    const hasAccounts = activeAccounts.length > 0;

    const stats = [
        {
            title: "Connected Accounts",
            value: loading ? "—" : String(activeAccounts.length),
            sub: loading ? "" : `of 4 platforms`,
            icon: Users,
            available: true,
        },
        {
            title: "Scheduled Posts",
            value: loading ? "—" : String(scheduledPosts.length),
            sub: loading ? "" : "queued to publish",
            icon: Calendar,
            available: true,
        },
        {
            title: "Published Posts",
            value: loading ? "—" : String(publishedPosts.length),
            sub: loading ? "" : "total sent",
            icon: CheckCircle2,
            available: true,
        },
        {
            title: "Engagement Rate",
            value: "—",
            sub: "Connect platforms to see",
            icon: Activity,
            available: false,
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            </div>

            {/* No accounts caution banner */}
            {!loading && !hasAccounts && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 text-sm">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <span className="font-medium text-warning">No accounts connected.</span>
                        <span className="text-text-secondary ml-1">Connect at least one social media account to start scheduling posts and viewing analytics.</span>
                    </div>
                    <Link
                        href="/accounts"
                        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-warning hover:text-warning/80 transition-colors"
                    >
                        Connect now <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className={`p-6 bg-surface-elevated rounded-xl border transition-colors ${stat.available ? "border-border" : "border-border opacity-60"}`}
                    >
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-sm font-medium text-text-secondary">{stat.title}</h3>
                            <stat.icon className="w-4 h-4 text-text-secondary" />
                        </div>
                        <div className="pt-3 space-y-1">
                            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                            <p className="text-xs text-text-secondary">{stat.sub}</p>
                        </div>
                        {!stat.available && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-text-secondary">
                                <AlertTriangle className="w-3 h-3 text-warning" />
                                <span>Requires platform API integration</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* No analytics data caution when no accounts */}
            {!loading && !hasAccounts && (
                <div className="p-8 bg-surface-elevated rounded-xl border border-border flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
                    <AlertTriangle className="w-8 h-8 text-warning/60" />
                    <div>
                        <p className="font-medium text-text-secondary">No analytics data available</p>
                        <p className="text-sm text-text-secondary/70 mt-1">Connect a social account to start tracking platform performance.</p>
                    </div>
                    <Link
                        href="/accounts"
                        className="mt-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                    >
                        Connect Accounts
                    </Link>
                </div>
            )}

            {/* Charts & widgets — only when accounts exist */}
            {(loading || hasAccounts) && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                    <div className="col-span-1 lg:col-span-4 p-6 bg-surface-elevated rounded-xl border border-border min-h-[400px] flex flex-col">
                        <h3 className="font-semibold text-lg mb-4">Platform Performance</h3>
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="flex-1 w-full min-h-[300px]">
                                <PlatformChart />
                            </div>
                        )}
                    </div>

                    <div className="col-span-1 lg:col-span-3 space-y-6">
                        <div className="p-6 bg-surface-elevated rounded-xl border border-border flex flex-col max-h-[400px]">
                            <h3 className="font-semibold text-lg mb-4">Upcoming Posts</h3>
                            <UpcomingPostsWidget />
                        </div>
                        <div className="p-6 bg-surface-elevated rounded-xl border border-border flex flex-col">
                            <h3 className="font-semibold text-lg mb-4">Account Status</h3>
                            <AccountStatusWidget />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
