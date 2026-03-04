"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Activity, Users, Eye, MessageSquare } from "lucide-react";

import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { UpcomingPostsWidget } from "@/components/dashboard/UpcomingPostsWidget";
import { AccountStatusWidget } from "@/components/dashboard/AccountStatusWidget";

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                <div className="flex gap-2">
                    {/* Action buttons could go here */}
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total Followers", value: "145.2K", change: "+12.5%", isUp: true, icon: Users },
                    { title: "Impressions", value: "2.4M", change: "+5.1%", isUp: true, icon: Eye },
                    { title: "Engagement Rate", value: "4.8%", change: "-0.5%", isUp: false, icon: Activity },
                    { title: "Total Comments", value: "12,450", change: "+24.2%", isUp: true, icon: MessageSquare },
                ].map((stat) => (
                    <div key={stat.title} className="p-6 bg-surface-elevated rounded-xl border border-border">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <h3 className="text-sm font-medium text-text-secondary">{stat.title}</h3>
                            <stat.icon className="w-4 h-4 text-text-secondary" />
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <div className="bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent">
                                <span className="text-2xl font-bold text-foreground dark:text-transparent">{stat.value}</span>
                            </div>
                            <div className={`flex items-center text-xs px-2 py-1 rounded-full font-medium ${stat.isUp ? "text-success bg-success/10" : "text-error bg-error/10"
                                }`}>
                                {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                <div className="col-span-1 lg:col-span-4 p-6 bg-surface-elevated rounded-xl border border-border min-h-[400px] flex flex-col">
                    <h3 className="font-semibold text-lg mb-4">Platform Performance</h3>
                    <div className="flex-1 w-full min-h-[300px]">
                        <PlatformChart />
                    </div>
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
        </div>
    );
}
