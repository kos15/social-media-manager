"use client";

import { Twitter, Linkedin, Instagram, Youtube, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const platformConfig = {
    TWITTER: { icon: Twitter, color: "text-[#1DA1F2]" },
    LINKEDIN: { icon: Linkedin, color: "text-[#0A66C2]" },
    INSTAGRAM: { icon: Instagram, color: "text-[#E1306C]" },
    YOUTUBE: { icon: Youtube, color: "text-[#FF0000]" },
};

const mockUpcoming = [
    { id: 1, platform: "LINKEDIN" as const, content: "Excited to share our Q3 metrics! Growth has been...", date: new Date(Date.now() + 1000 * 60 * 60 * 2) },
    { id: 2, platform: "TWITTER" as const, content: "Just published a new guide on Next.js 14 App Router...", date: new Date(Date.now() + 1000 * 60 * 60 * 5) },
    { id: 3, platform: "INSTAGRAM" as const, content: "Behind the scenes at the office today 📸", date: new Date(Date.now() + 1000 * 60 * 60 * 24) },
];

export function UpcomingPostsWidget() {
    return (
        <div className="flex-1 overflow-y-auto space-y-4">
            {mockUpcoming.map((post) => {
                const PlatformIcon = platformConfig[post.platform].icon;
                return (
                    <div key={post.id} className="flex gap-4 items-start p-3 rounded-xl border border-border bg-surface hover:bg-surface-elevated transition-colors group">
                        <div className={cn("p-2 rounded-lg bg-background shadow-sm border border-border", platformConfig[post.platform].color)}>
                            <PlatformIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{post.content}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-text-secondary">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{format(post.date, "h:mm a, MMM d")}</span>
                            </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-text-secondary hover:text-primary rounded-lg">
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
