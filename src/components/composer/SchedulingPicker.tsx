"use client";

import { usePostStore } from "@/store/usePostStore";
import { format } from "date-fns";

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
            <h3 className="text-sm font-medium text-text-secondary">Schedule Post</h3>
            <div className="flex gap-4 items-center">
                <input
                    type="datetime-local"
                    className="bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:border-primary flex-1"
                    onChange={handleDateChange}
                    value={scheduledDate ? format(scheduledDate, "yyyy-MM-dd'T'HH:mm") : ""}
                />
                <button
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    onClick={() => {
                        // Mock scheduling action
                        if (scheduledDate) {
                            alert(`Post scheduled for ${format(scheduledDate, "PPp")}`);
                        } else {
                            alert("Post will be published immediately.");
                        }
                    }}
                >
                    {scheduledDate ? "Schedule" : "Publish Now"}
                </button>
            </div>
        </div>
    );
}
