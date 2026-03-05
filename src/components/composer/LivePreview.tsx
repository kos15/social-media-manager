"use client";

import { usePostStore } from "@/store/usePostStore";
import {
    Heart, MessageCircle, Repeat2, Share, Bookmark,
    ThumbsUp, Send, BarChart2, MoreHorizontal,
    Instagram as InstagramIcon, Youtube
} from "lucide-react";

function TwitterPreview({ content, media }: { content: string; media: string[] }) {
    const charCount = content.length;
    return (
        <div className="bg-black rounded-2xl p-4 border border-slate-800">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-bold text-white text-sm">Your Name</span>
                            <span className="text-slate-500 text-sm ml-1">@yourhandle</span>
                            <span className="text-slate-500 text-sm ml-1">·</span>
                            <span className="text-slate-500 text-sm ml-1">now</span>
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </div>
                    {/* Content */}
                    <p className="text-white text-[15px] leading-relaxed mt-1 whitespace-pre-wrap break-words">
                        {content || <span className="text-slate-600">What&apos;s happening?</span>}
                    </p>
                    {/* Media */}
                    {media.length > 0 && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={media[0]} alt="Post media" className="w-full object-cover max-h-[240px]" />
                        </div>
                    )}
                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 text-slate-500 max-w-[280px]">
                        <button className="flex items-center gap-1.5 hover:text-sky-400 transition group">
                            <MessageCircle className="w-4 h-4 group-hover:fill-sky-400/20" />
                            <span className="text-xs">24</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-green-400 transition group">
                            <Repeat2 className="w-4 h-4" />
                            <span className="text-xs">8</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-pink-400 transition group">
                            <Heart className="w-4 h-4 group-hover:fill-pink-400/20" />
                            <span className="text-xs">142</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-sky-400 transition">
                            <BarChart2 className="w-4 h-4" />
                            <span className="text-xs">3.2K</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-sky-400 transition">
                            <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-sky-400 transition">
                            <Share className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Char count */}
                    {charCount > 0 && (
                        <p className="text-xs text-slate-600 mt-2">{charCount}/280 characters</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function LinkedInPreview({ content, media }: { content: string; media: string[] }) {
    return (
        <div className="bg-[#1B1F23] rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 shrink-0" />
                    <div>
                        <p className="font-semibold text-white text-sm">Your Name</p>
                        <p className="text-slate-400 text-xs">Your Job Title • Your Company</p>
                        <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            Just now · <span>🌍</span>
                        </p>
                    </div>
                    <button className="ml-auto text-[#0A66C2] border border-[#0A66C2] hover:bg-[#0A66C2]/10 text-xs font-semibold px-3 py-1 rounded-full transition">
                        + Follow
                    </button>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed mt-3 whitespace-pre-wrap break-words">
                    {content || <span className="text-slate-600">What do you want to talk about?</span>}
                </p>
            </div>
            {media.length > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media[0]} alt="Post media" className="w-full object-cover max-h-[320px]" />
            )}
            {/* Reactions bar */}
            <div className="px-4 py-3 border-t border-slate-700">
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                    <span className="flex gap-0.5">👍❤️🔥</span>
                    <span>128 reactions</span>
                    <span className="ml-auto">14 comments</span>
                </div>
                <div className="flex justify-around">
                    {[
                        { icon: ThumbsUp, label: "Like" },
                        { icon: MessageCircle, label: "Comment" },
                        { icon: Repeat2, label: "Repost" },
                        { icon: Send, label: "Send" },
                    ].map(({ icon: Icon, label }) => (
                        <button key={label} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium px-2 py-1 rounded hover:bg-slate-700 transition">
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function InstagramPreview({ content, media }: { content: string; media: string[] }) {
    return (
        <div className="bg-black rounded-xl border border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 via-pink-600 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-500 to-cyan-500" />
                </div>
                <span className="font-semibold text-white text-sm">yourhandle</span>
                <MoreHorizontal className="w-4 h-4 text-slate-400 ml-auto" />
            </div>
            {/* Image placeholder */}
            <div className={`w-full aspect-square flex items-center justify-center ${media.length > 0 ? '' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
                {media.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media[0]} alt="Post" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center text-slate-600">
                        <InstagramIcon className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-xs">Add media to preview</p>
                    </div>
                )}
            </div>
            {/* Actions */}
            <div className="p-3 space-y-2">
                <div className="flex items-center gap-4">
                    <Heart className="w-5 h-5 text-white hover:text-red-500 transition cursor-pointer" />
                    <MessageCircle className="w-5 h-5 text-white cursor-pointer" />
                    <Send className="w-5 h-5 text-white cursor-pointer" />
                    <Bookmark className="w-5 h-5 text-white ml-auto cursor-pointer" />
                </div>
                <p className="text-white text-xs font-semibold">1,024 likes</p>
                <p className="text-white text-xs">
                    <span className="font-semibold">yourhandle</span>{" "}
                    <span className="text-slate-300">{content || <span className="text-slate-600">Caption goes here...</span>}</span>
                </p>
            </div>
        </div>
    );
}

function YouTubePreview({ content }: { content: string }) {
    return (
        <div className="bg-[#0F0F0F] rounded-xl border border-slate-800 overflow-hidden">
            {/* Thumbnail */}
            <div className="w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                <Youtube className="w-12 h-12 text-red-600" />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">4:32</div>
            </div>
            {/* Info */}
            <div className="p-3 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 shrink-0" />
                <div>
                    <p className="text-white text-sm font-medium line-clamp-2 leading-snug">
                        {content || "Your video title will appear here"}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">Your Channel</p>
                    <p className="text-slate-500 text-xs">1.2K views · Just now</p>
                </div>
            </div>
        </div>
    );
}

export function LivePreview() {
    const { currentPost, mediaUrls, selectedPlatforms } = usePostStore();

    if (selectedPlatforms.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                    <Share className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-slate-400">No platform selected</p>
                    <p className="text-xs text-slate-600 mt-1">Pick a platform to see your post preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {selectedPlatforms.includes("TWITTER") && (
                <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />X / Twitter
                    </p>
                    <TwitterPreview content={currentPost} media={mediaUrls} />
                </div>
            )}

            {selectedPlatforms.includes("LINKEDIN") && (
                <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />LinkedIn
                    </p>
                    <LinkedInPreview content={currentPost} media={mediaUrls} />
                </div>
            )}

            {selectedPlatforms.includes("INSTAGRAM") && (
                <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />Instagram
                    </p>
                    <InstagramPreview content={currentPost} media={mediaUrls} />
                </div>
            )}

            {selectedPlatforms.includes("YOUTUBE") && (
                <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />YouTube
                    </p>
                    <YouTubePreview content={currentPost} />
                </div>
            )}
        </div>
    );
}
