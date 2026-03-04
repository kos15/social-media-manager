"use client";

import { useAccountStore } from "@/store/useAccountStore";
import { Twitter, Linkedin, Instagram, Youtube, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const platformConfig = {
    TWITTER: { name: "Twitter", icon: Twitter },
    LINKEDIN: { name: "LinkedIn", icon: Linkedin },
    INSTAGRAM: { name: "Instagram", icon: Instagram },
    YOUTUBE: { name: "YouTube", icon: Youtube },
};

export function AccountStatusWidget() {
    const { accounts } = useAccountStore();
    const platforms = Object.keys(platformConfig) as Array<keyof typeof platformConfig>;

    return (
        <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => {
                    const isConnected = accounts.some(a => a.platform === platform);
                    const config = platformConfig[platform];
                    return (
                        <div key={platform} className={cn(
                            "flex items-center p-3 rounded-lg border text-sm transition-colors",
                            isConnected
                                ? "border-success/20 bg-success/5"
                                : "border-border bg-surface text-text-secondary"
                        )}>
                            <config.icon className={cn("w-4 h-4 mr-2", isConnected ? "text-foreground" : "")} />
                            <span className="flex-1 font-medium">{config.name}</span>
                            {isConnected ? (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-text-secondary opacity-50" />
                            )}
                        </div>
                    );
                })}
            </div>
            <Link href="/accounts" className="text-sm text-primary hover:text-primary-hover font-medium flex items-center justify-center py-2 bg-surface rounded-lg border border-border mt-2 transition-colors">
                Manage Connections
            </Link>
        </div>
    );
}
