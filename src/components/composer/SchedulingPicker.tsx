"use client";

import { usePostStore } from "@/store/usePostStore";
import { format } from "date-fns";
import { Calendar, Clock, Send, Zap } from "lucide-react";

export function SchedulingPicker() {
    const { scheduledDate, setScheduledDate } = usePostStore();

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setScheduledDate(new Date(e.target.value));
        } else {
            setScheduledDate(null);
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Post
            </h3>
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm
                        bg-gradient-to-r from-violet-600 to-indigo-600
                        hover:from-violet-500 hover:to-indigo-500
                        text-white shadow-lg shadow-violet-900/30
                        transition-all duration-200 active:scale-95 shrink-0"
                    onClick={() => {
                        if (scheduledDate) {
                            alert(`Post scheduled for ${format(scheduledDate, "PPp")}`);
                        } else {
                            alert("Post will be published immediately.");
                        }
                    }}
                >
                    {scheduledDate ? (
                        <>
                            <Calendar className="w-4 h-4" />
                            Schedule
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" />
                            Publish Now
                        </>
                    )}
                </button>
            </div>
            {scheduledDate && (
                <p className="text-xs text-violet-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Scheduled for {format(scheduledDate, "PPp")}
                </p>
            )}
        </div>
    );
}
