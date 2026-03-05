"use client";

import { usePostStore, ScheduledPost } from "@/store/usePostStore";
import { format } from "date-fns";
import { Calendar, Clock, Send, Zap, CheckCircle2, Pencil, AlertCircle } from "lucide-react";
import { useState } from "react";

export function SchedulingPicker() {
    const {
        scheduledDate, setScheduledDate,
        currentPost, mediaUrls, selectedPlatforms,
        addScheduledPost, resetPost, editingPostId
    } = usePostStore();

    const [scheduled, setScheduled] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setScheduledDate(new Date(e.target.value));
        } else {
            setScheduledDate(null);
        }
    };

    const handleSchedule = async () => {
        if (!currentPost.trim() && selectedPlatforms.length === 0) return;
        setError(null);
        setLoading(true);

        const dateStr = scheduledDate
            ? scheduledDate.toISOString()
            : new Date().toISOString();

        const payload = {
            id: editingPostId ?? undefined,
            content: currentPost,
            mediaUrls: [...mediaUrls],
            scheduledDate: dateStr,
            platforms: [...selectedPlatforms],
        };

        try {
            const res = await fetch(
                editingPostId ? '/api/posts' : '/api/posts',
                {
                    method: editingPostId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? 'Failed to save post');
            }

            const savedPost: ScheduledPost = await res.json();

            // Sync the store with the DB-assigned ID
            addScheduledPost(savedPost);
            setScheduled(true);
            resetPost();

            setTimeout(() => setScheduled(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {editingPostId ? "Edit Scheduled Post" : "Schedule Post"}
            </h3>

            {/* Editing banner */}
            {editingPostId && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <Pencil className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-400 font-medium">Editing an existing scheduled post</p>
                </div>
            )}

            <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="datetime-local"
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg
                            bg-slate-800 border border-slate-700 text-slate-100
                            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                            [color-scheme:dark] transition"
                        onChange={handleDateChange}
                        value={scheduledDate ? format(scheduledDate, "yyyy-MM-dd'T'HH:mm") : ""}
                    />
                </div>
                <button
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm
                        bg-gradient-to-r from-violet-600 to-indigo-600
                        hover:from-violet-500 hover:to-indigo-500
                        text-white shadow-lg shadow-violet-900/30
                        transition-all duration-200 active:scale-95 shrink-0
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSchedule}
                >
                    {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : editingPostId ? (
                        <><Pencil className="w-4 h-4" />Update Post</>
                    ) : scheduledDate ? (
                        <><Calendar className="w-4 h-4" />Schedule</>
                    ) : (
                        <><Zap className="w-4 h-4" />Publish Now</>
                    )}
                </button>
            </div>

            {scheduledDate && !scheduled && !loading && (
                <p className="text-xs text-violet-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Scheduled for {format(scheduledDate, "PPp")}
                </p>
            )}

            {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                </div>
            )}

            {scheduled && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-400 font-medium">
                        {editingPostId ? "Post updated in your calendar!" : "Post added to your calendar!"}
                    </p>
                    <Send className="w-3 h-3 text-emerald-400 ml-auto" />
                </div>
            )}
        </div>
    );
}
