"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    X, Calendar, Clock, Twitter, Linkedin, Instagram, Youtube,
    Heart, MessageCircle, Repeat2, Share, ThumbsUp, Send, Bookmark, BarChart2, MoreHorizontal,
    CheckCircle2, Pencil
} from "lucide-react";
import { ScheduledPost, usePostStore } from "@/store/usePostStore";
import { format } from "date-fns";

interface PostPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: ScheduledPost | null;
}

const PLATFORM_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
    TWITTER: { label: "X / Twitter", color: "#1DA1F2", Icon: Twitter },
    LINKEDIN: { label: "LinkedIn", color: "#0A66C2", Icon: Linkedin },
    INSTAGRAM: { label: "Instagram", color: "#E1306C", Icon: Instagram },
    YOUTUBE: { label: "YouTube", color: "#FF0000", Icon: Youtube },
};

function isPublished(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
}

/* ── Platform preview cards ─────────────────────────────────────── */

function TwitterCard({ content, mediaUrls }: { content: string; mediaUrls: string[] }) {
    return (
        <div className="bg-black rounded-2xl p-4 border border-slate-800">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-bold text-white text-sm">Your Name</span>
                            <span className="text-slate-500 text-sm ml-1">@yourhandle · now</span>
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </div>
                    <p className="text-white text-[15px] leading-relaxed mt-1 whitespace-pre-wrap break-words">
                        {content || <span className="text-slate-600">What&apos;s happening?</span>}
                    </p>
                    {mediaUrls.length > 0 && (
                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={mediaUrls[0]} alt="Post media" className="w-full object-cover max-h-[220px]" />
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-3 text-slate-500 max-w-[280px]">
                        <button className="flex items-center gap-1.5 hover:text-sky-400 transition"><MessageCircle className="w-4 h-4" /><span className="text-xs">24</span></button>
                        <button className="flex items-center gap-1.5 hover:text-green-400 transition"><Repeat2 className="w-4 h-4" /><span className="text-xs">8</span></button>
                        <button className="flex items-center gap-1.5 hover:text-pink-400 transition"><Heart className="w-4 h-4" /><span className="text-xs">142</span></button>
                        <button className="flex items-center gap-1.5 hover:text-sky-400 transition"><BarChart2 className="w-4 h-4" /><span className="text-xs">3.2K</span></button>
                        <button className="flex items-center gap-1.5 hover:text-sky-400 transition"><Bookmark className="w-4 h-4" /></button>
                        <button className="flex items-center gap-1.5 hover:text-sky-400 transition"><Share className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LinkedInCard({ content, mediaUrls }: { content: string; mediaUrls: string[] }) {
    return (
        <div className="bg-[#1B1F23] rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 shrink-0" />
                    <div>
                        <p className="font-semibold text-white text-sm">Your Name</p>
                        <p className="text-slate-400 text-xs">Your Job Title · Your Company</p>
                        <p className="text-slate-500 text-[11px]">Just now · 🌍</p>
                    </div>
                    <button className="ml-auto text-[#0A66C2] border border-[#0A66C2] text-xs font-semibold px-3 py-1 rounded-full">+ Follow</button>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed mt-3 whitespace-pre-wrap break-words">
                    {content || <span className="text-slate-600">What do you want to talk about?</span>}
                </p>
            </div>
            {mediaUrls.length > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrls[0]} alt="Post media" className="w-full object-cover max-h-[280px]" />
            )}
            <div className="px-4 py-3 border-t border-slate-700">
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                    <span>👍❤️🔥</span><span>128 reactions</span>
                    <span className="ml-auto">14 comments</span>
                </div>
                <div className="flex justify-around">
                    {[{ Icon: ThumbsUp, label: "Like" }, { Icon: MessageCircle, label: "Comment" }, { Icon: Repeat2, label: "Repost" }, { Icon: Send, label: "Send" }].map(({ Icon, label }) => (
                        <button key={label} className="flex items-center gap-1.5 text-slate-400 text-xs font-medium px-2 py-1 rounded hover:bg-slate-700 transition">
                            <Icon className="w-4 h-4" />{label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function InstagramCard({ content, mediaUrls }: { content: string; mediaUrls: string[] }) {
    return (
        <div className="bg-black rounded-xl border border-slate-800 overflow-hidden">
            <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 via-pink-600 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-500 to-cyan-500" />
                </div>
                <span className="font-semibold text-white text-sm">yourhandle</span>
                <MoreHorizontal className="w-4 h-4 text-slate-400 ml-auto" />
            </div>
            <div className={`w-full aspect-video flex items-center justify-center ${mediaUrls.length > 0 ? '' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
                {mediaUrls.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrls[0]} alt="Post" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center text-slate-600">
                        <Instagram className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-xs">No media attached</p>
                    </div>
                )}
            </div>
            <div className="p-3 space-y-2">
                <div className="flex items-center gap-4">
                    <Heart className="w-5 h-5 text-white cursor-pointer" />
                    <MessageCircle className="w-5 h-5 text-white cursor-pointer" />
                    <Send className="w-5 h-5 text-white cursor-pointer" />
                    <Bookmark className="w-5 h-5 text-white ml-auto cursor-pointer" />
                </div>
                <p className="text-white text-xs font-semibold">1,024 likes</p>
                <p className="text-white text-xs">
                    <span className="font-semibold">yourhandle </span>
                    <span className="text-slate-300">{content || <span className="text-slate-600">Caption goes here...</span>}</span>
                </p>
            </div>
        </div>
    );
}

function YouTubeCard({ content }: { content: string }) {
    return (
        <div className="bg-[#0F0F0F] rounded-xl border border-slate-800 overflow-hidden">
            <div className="w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                <Youtube className="w-12 h-12 text-red-600" />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">4:32</div>
            </div>
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

/* ── Modal ───────────────────────────────────────────────────────── */

export function PostPreviewModal({ isOpen, onClose, post }: PostPreviewModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { editPost } = usePostStore();

    const published = post ? isPublished(post.scheduledDate) : false;

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen || !post) return null;

    const scheduledAt = new Date(post.scheduledDate);

    const handleEdit = () => {
        editPost(post);
        onClose();
        router.push("/composer");
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (!panelRef.current?.contains(e.target as Node)) onClose(); }}
            style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                backgroundColor: "rgba(0,0,0,0.6)"
            }}
        >
            <div
                ref={panelRef}
                className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
                style={{ background: "linear-gradient(135deg, rgba(30,32,44,0.98) 0%, rgba(20,22,35,0.98) 100%)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${published ? "bg-slate-500/20 border border-slate-500/30" : "bg-violet-500/20 border border-violet-500/30"}`}>
                            {published
                                ? <CheckCircle2 className="w-4 h-4 text-slate-400" />
                                : <Calendar className="w-4 h-4 text-violet-400" />
                            }
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold text-white">
                                    {published ? "Published Post" : "Scheduled Post"}
                                </h2>
                                {published && (
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
                                        Published
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {format(scheduledAt, "PPp")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Platform badges */}
                {post.platforms.length > 0 && (
                    <div className="px-5 py-3 border-b border-white/10 flex flex-wrap gap-2 shrink-0">
                        {post.platforms.map((p) => {
                            const meta = PLATFORM_META[p];
                            if (!meta) return null;
                            return (
                                <span
                                    key={p}
                                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                                    style={{
                                        backgroundColor: `${meta.color}25`,
                                        border: `1px solid ${meta.color}50`,
                                        color: meta.color,
                                        opacity: published ? 0.65 : 1
                                    }}
                                >
                                    <meta.Icon className="w-3 h-3" />
                                    {meta.label}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Scrollable preview body */}
                <div className={`overflow-y-auto flex-1 px-5 py-4 space-y-4 custom-scrollbar ${published ? "opacity-75" : ""}`}>
                    {post.platforms.includes("TWITTER") && <TwitterCard content={post.content} mediaUrls={post.mediaUrls} />}
                    {post.platforms.includes("LINKEDIN") && <LinkedInCard content={post.content} mediaUrls={post.mediaUrls} />}
                    {post.platforms.includes("INSTAGRAM") && <InstagramCard content={post.content} mediaUrls={post.mediaUrls} />}
                    {post.platforms.includes("YOUTUBE") && <YouTubeCard content={post.content} />}
                    {post.platforms.length === 0 && (
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {post.content || <span className="text-slate-600">No content</span>}
                            </p>
                            {post.mediaUrls.length > 0 && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={post.mediaUrls[0]} alt="Media" className="mt-3 rounded-lg w-full object-cover max-h-[200px]" />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Close
                    </button>
                    {/* Only show Edit button for future (not yet published) posts */}
                    {!published && (
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit Post
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
