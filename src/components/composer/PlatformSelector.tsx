"use client";

import { usePostStore } from "@/store/usePostStore";
import { Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

const platforms = [
    { id: "TWITTER", name: "Twitter", icon: Twitter, color: "hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10", active: "text-[#1DA1F2] bg-[#1DA1F2]/10 border-[#1DA1F2]" },
    { id: "LINKEDIN", name: "LinkedIn", icon: Linkedin, color: "hover:text-[#0A66C2] hover:bg-[#0A66C2]/10", active: "text-[#0A66C2] bg-[#0A66C2]/10 border-[#0A66C2]" },
    { id: "INSTAGRAM", name: "Instagram", icon: Instagram, color: "hover:text-[#E1306C] hover:bg-[#E1306C]/10", active: "text-[#E1306C] bg-[#E1306C]/10 border-[#E1306C]" },
    { id: "YOUTUBE", name: "YouTube", icon: Youtube, color: "hover:text-[#FF0000] hover:bg-[#FF0000]/10", active: "text-[#FF0000] bg-[#FF0000]/10 border-[#FF0000]" },
];

export function PlatformSelector() {
    const { selectedPlatforms, togglePlatform } = usePostStore();

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">Select Platforms</h3>
            <div className="flex gap-3">
                {platforms.map((platform) => {
                    const isActive = selectedPlatforms.includes(platform.id);
                    return (
                        <button
                            key={platform.id}
                            onClick={() => togglePlatform(platform.id)}
                            className={cn(
                                "p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 flex-1",
                                isActive
                                    ? platform.active
                                    : `border-border bg-surface text-text-secondary ${platform.color}`
                            )}
                        >
                            <platform.icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{platform.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
