"use client";

import { usePostStore } from "@/store/usePostStore";
import { Twitter, Linkedin } from "lucide-react";

export function LivePreview() {
    const { currentPost, mediaUrls, selectedPlatforms } = usePostStore();

    if (selectedPlatforms.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary border-2 border-dashed border-border rounded-xl">
                <p>Select a platform to preview your post</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {selectedPlatforms.includes("TWITTER") && (
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-3 text-sm">
                        <div className="w-10 h-10 rounded-full bg-surface-elevated" />
                        <div>
                            <p className="font-bold flex items-center gap-1">User Name <Twitter className="w-3 h-3 text-[#1DA1F2]" /></p>
                            <p className="text-text-secondary text-xs">@username</p>
                        </div>
                    </div>
                    <p className="text-[15px] whitespace-pre-wrap break-words">{currentPost || "What's happening?"}</p>
                    {mediaUrls.length > 0 && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={mediaUrls[0]} alt="Post media" className="w-full object-cover max-h-[300px]" />
                        </div>
                    )}
                </div>
            )}

            {selectedPlatforms.includes("LINKEDIN") && (
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-surface-elevated" />
                        <div>
                            <p className="font-bold flex items-center gap-2">User Name <Linkedin className="w-3 h-3 text-[#0A66C2]" /></p>
                            <p className="text-text-secondary text-xs">Job Title at Company</p>
                            <p className="text-text-secondary text-[10px]">Just now • 🌍</p>
                        </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{currentPost || "What do you want to talk about?"}</p>
                    {mediaUrls.length > 0 && (
                        <div className="mt-3 -mx-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={mediaUrls[0]} alt="Post media" className="w-full object-cover max-h-[400px]" />
                        </div>
                    )}
                </div>
            )}

            {/* Add Instagram/YouTube placeholder previews similarly */}
            {(selectedPlatforms.includes("INSTAGRAM") || selectedPlatforms.includes("YOUTUBE")) && (
                <div className="p-4 border-2 border-dashed border-border rounded-xl text-center text-text-secondary text-sm">
                    Preview for this platform coming soon
                </div>
            )}
        </div>
    );
}
