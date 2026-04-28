"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { PostPreviewModal } from "@/components/calendar/PostPreviewModal";
import { usePostStore, ScheduledPost } from "@/store/usePostStore";
import { Loader2 } from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  TWITTER: "#1DA1F2",
  LINKEDIN: "#0A66C2",
  INSTAGRAM: "#E1306C",
  YOUTUBE: "#FF0000",
};

const PLATFORM_LABELS: Record<string, string> = {
  TWITTER: "Twitter",
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  YOUTUBE: "YouTube",
};

function isPublished(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export default function CalendarPage() {
  const { scheduledPosts, setScheduledPosts } = usePostStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Fetch posts from DB on mount and hydrate the store ───────────
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error('Failed to load posts');
        const dbPosts: ScheduledPost[] = await res.json();
        // Bulk-replace the store with the authoritative DB state
        setScheduledPosts(dbPosts);
      } catch (err) {
        console.error('Calendar fetch error:', err);
        setFetchError('Could not load posts from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const events = scheduledPosts.map((post) => {
    const primaryPlatform = post.platforms[0] || "TWITTER";
    const platformLabel = post.platforms
      .map((p) => PLATFORM_LABELS[p] ?? p)
      .join(", ");
    const title = `${platformLabel}: ${post.content.slice(0, 40)}${post.content.length > 40 ? "…" : ""}`;
    const published = isPublished(post.scheduledDate);
    const baseColor = PLATFORM_COLORS[primaryPlatform] ?? "#8b5cf6";

    // Use local timezone date to avoid UTC day-mismatch
    const localDate = new Date(post.scheduledDate);
    const localDateStr = [
      localDate.getFullYear(),
      String(localDate.getMonth() + 1).padStart(2, "0"),
      String(localDate.getDate()).padStart(2, "0"),
    ].join("-");

    return {
      id: post.id,
      title,
      date: localDateStr,
      color: published ? `${baseColor}55` : baseColor,
      extendedProps: { post, published },
    };
  });

  return (
    <div className="space-y-4 flex flex-col min-h-[600px] md:h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Syncing posts…
          </div>
        )}
      </div>

      {fetchError && (
        <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {fetchError}
        </div>
      )}

      <div className="flex-1 bg-surface-elevated border border-border rounded-xl p-3 md:p-6 relative z-0 min-h-[500px]">
        <style jsx global>{`
          /* ── FullCalendar base ── */
          .fc {
            --fc-border-color: hsl(var(--border)) !important;
            --fc-page-bg-color: transparent;
            font-family: inherit;
          }

          /* ── All toolbar buttons ── */
          .fc .fc-button,
          .fc .fc-button-primary {
            background: hsl(var(--surface)) !important;
            border: 1px solid hsl(var(--border)) !important;
            color: hsl(var(--foreground)) !important;
            border-radius: 0.5rem !important;
            font-size: 0.8rem !important;
            font-weight: 500 !important;
            padding: 0.35rem 0.75rem !important;
            transition: all 0.15s !important;
            box-shadow: none !important;
            text-transform: capitalize !important;
          }
          .fc .fc-button:hover:not(:disabled),
          .fc .fc-button-primary:hover:not(:disabled) {
            background: hsl(var(--surface-elevated)) !important;
            border-color: hsl(var(--primary)) !important;
            color: hsl(var(--foreground)) !important;
          }
          .fc .fc-button:focus,
          .fc .fc-button-primary:focus {
            outline: none !important;
            box-shadow: 0 0 0 2px hsl(var(--primary) / 0.35) !important;
          }
          .fc .fc-button-active,
          .fc .fc-button-primary:not(:disabled).fc-button-active {
            background: hsl(var(--primary)) !important;
            border-color: hsl(var(--primary)) !important;
            color: #fff !important;
          }
          .fc .fc-button:disabled {
            opacity: 0.35 !important;
            cursor: not-allowed !important;
          }

          /* ── Button group (Month/Week/Day switcher) ── */
          .fc .fc-button-group .fc-button,
          .fc .fc-button-group .fc-button-primary {
            background: hsl(var(--surface)) !important;
            border-color: hsl(var(--border)) !important;
            color: hsl(var(--foreground)) !important;
            border-radius: 0 !important;
          }
          .fc .fc-button-group .fc-button:first-child { border-radius: 0.5rem 0 0 0.5rem !important; }
          .fc .fc-button-group .fc-button:last-child  { border-radius: 0 0.5rem 0.5rem 0 !important; }
          .fc .fc-button-group .fc-button:only-child  { border-radius: 0.5rem !important; }
          .fc .fc-button-group .fc-button:hover:not(:disabled) {
            background: hsl(var(--surface-elevated)) !important;
            border-color: hsl(var(--primary)) !important;
            color: hsl(var(--foreground)) !important;
          }
          .fc .fc-button-group .fc-button.fc-button-active,
          .fc .fc-button-group .fc-button-primary:not(:disabled).fc-button-active {
            background: hsl(var(--primary)) !important;
            border-color: hsl(var(--primary)) !important;
            color: #fff !important;
          }

          /* ── Chevron icons inside buttons ── */
          .fc .fc-icon { color: inherit !important; }

          /* ── Grid ── */
          .fc-theme-standard td, .fc-theme-standard th {
            border-color: hsl(var(--border)) !important;
          }
          .fc-daygrid-day.fc-day-today {
            background-color: hsl(var(--primary) / 0.08) !important;
          }
          .fc .fc-daygrid-day-number {
            color: hsl(var(--foreground)) !important;
          }
          .fc .fc-col-header-cell-cushion {
            color: hsl(var(--foreground) / 0.6) !important;
            font-size: 0.75rem !important;
            font-weight: 600 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
          }
          .fc .fc-toolbar-title {
            font-size: 1.15rem !important;
            font-weight: 600 !important;
            color: hsl(var(--foreground)) !important;
          }

          /* ── Event chips ── */
          .fc-h-event {
            border: none !important;
            background-color: transparent !important;
          }
          .fc-event-main { padding: 0 !important; }
        `}</style>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="100%"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          eventContent={(arg) => {
            const published = arg.event.extendedProps.published as boolean;
            return (
              <div
                className={`px-2 py-1 text-xs truncate font-medium rounded-md w-full text-white shadow-sm cursor-pointer transition-opacity ${published ? "opacity-50 line-through decoration-white/60" : ""}`}
                style={{ backgroundColor: arg.event.backgroundColor || "var(--primary)" }}
                title={arg.event.title}
              >
                {arg.event.title}
              </div>
            );
          }}
          eventClick={(info) => {
            const post = info.event.extendedProps.post as ScheduledPost;
            setSelectedPost(post);
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
