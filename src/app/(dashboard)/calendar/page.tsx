"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { PostPreviewModal } from "@/components/calendar/PostPreviewModal";

export default function CalendarPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<{ title: string, date: string, color: string } | null>(null);

    const [events] = useState([
        { title: "LinkedIn: Tech update", date: new Date().toISOString().split("T")[0], color: "#0A66C2" },
        { title: "Twitter: New feature drop", date: new Date(Date.now() + 86400000).toISOString().split("T")[0], color: "#1DA1F2" },
        { title: "Instagram: BTS Office", date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], color: "#E1306C" },
    ]);

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
                <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                    + New Post
                </button>
            </div>
            <div className="flex-1 bg-surface-elevated border border-border rounded-xl p-6 relative z-0">
                <style jsx global>{`
          .fc {
            --fc-border-color: hsl(var(--border)) !important;
            --fc-button-bg-color: hsl(var(--surface)) !important;
            --fc-button-border-color: hsl(var(--border)) !important;
            --fc-button-text-color: hsl(var(--foreground)) !important;
            --fc-button-hover-bg-color: hsl(var(--surface-elevated)) !important;
            --fc-button-hover-border-color: hsl(var(--primary)) !important;
            --fc-button-active-bg-color: hsl(var(--primary)) !important;
            --fc-button-active-border-color: hsl(var(--primary)) !important;
            --fc-button-active-text-color: white !important;
            --fc-event-bg-color: hsl(var(--primary));
            --fc-event-border-color: hsl(var(--primary));
            --fc-today-bg-color: hsl(var(--primary) / 0.1) !important;
            --fc-page-bg-color: transparent;
            font-family: inherit;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border-color: hsl(var(--border)) !important;
          }
          .fc .fc-toolbar-title {
            font-size: 1.25rem !important;
            font-weight: 600 !important;
          }
          .fc-h-event {
            border: none !important;
            background-color: transparent !important;
          }
          .fc-event-main {
            padding: 0 !important;
          }
        `}</style>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    height="100%"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth"
                    }}
                    eventContent={(arg) => {
                        return (
                            <div
                                className="px-2 py-1 text-xs truncate font-medium rounded-md w-full text-white shadow-sm cursor-pointer"
                                style={{ backgroundColor: arg.event.backgroundColor || 'var(--primary)' }}
                                title={arg.event.title}
                            >
                                {arg.event.title}
                            </div>
                        );
                    }}
                    eventClick={(info) => {
                        setSelectedPost({
                            title: info.event.title,
                            date: info.event.startStr,
                            color: info.event.backgroundColor || 'var(--primary)'
                        });
                        setIsModalOpen(true);
                    }}
                />
            </div>

            <PostPreviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                post={selectedPost}
            />
        </div>
    );
}
