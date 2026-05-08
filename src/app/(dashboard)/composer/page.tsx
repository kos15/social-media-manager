"use client";

import { useState, useRef, useEffect } from "react";
import {
  RefreshCw,
  Clock,
  Send,
  ImageIcon,
  Hash,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Repeat2,
  Bookmark,
  Play,
  ThumbsDown,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

const PLATFORMS = [
  {
    id: "x",
    glyph: "𝕏",
    name: "X / Twitter",
    limit: 280,
    handle: "@socialplus",
    tone: "Concise",
  },
  {
    id: "in",
    glyph: "in",
    name: "LinkedIn",
    limit: 3000,
    handle: "Socialplus",
    tone: "Professional",
  },
  {
    id: "ig",
    glyph: "Ig",
    name: "Instagram",
    limit: 2200,
    handle: "@socialplus",
    tone: "Visual",
  },
  {
    id: "yt",
    glyph: "▶",
    name: "YouTube",
    limit: 1000,
    handle: "Socialplus",
    tone: "Engaging",
  },
];

const TONES = ["Confident", "Warm", "Witty", "Reportorial"];

const AI_ACTIONS = [
  {
    key: "hook",
    label: "Generate hook",
    hint: "Open with a sharp first line",
    insert: "Most schedulers wait. Ours doesn't.\n\n",
  },
  {
    key: "caption",
    label: "Continue writing",
    hint: "Extend the current paragraph",
    insert:
      "\n\nThe quiet shift in publishing isn't AI — it's how invisible the tools have become.",
  },
  {
    key: "hashtags",
    label: "Suggest hashtags",
    hint: "4-6 relevant tags",
    insert: "\n\n#scheduling #saas #devtools #buildinpublic",
  },
  {
    key: "cta",
    label: "Add call-to-action",
    hint: "Drive a click",
    insert: "\n\nTry it free — link in bio.",
  },
];

const SAMPLE = `We rebuilt our scheduling engine from scratch. Posts now publish in under 200ms across all four platforms — even on flaky mobile.

Here's what changed under the hood, and why it matters for creators who post 50+ times a week.`;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type MediaItem = { url: string; type: "image" | "video"; name: string };

function Glyph({
  g,
  active,
  size = 22,
  onClick,
}: {
  g: string;
  active: boolean;
  size?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "var(--ink)" : "var(--paper-2)",
        color: active ? "var(--paper)" : "var(--ink-2)",
        border: `1px solid ${active ? "var(--ink)" : "var(--rule)"}`,
        fontFamily: "var(--font-mono)",
        fontSize: size * 0.5,
        fontWeight: 600,
        cursor: onClick ? "pointer" : "default",
        padding: 0,
        transition: "all 0.1s",
      }}
    >
      {g}
    </button>
  );
}

// ─── Platform-specific preview cards ─────────────────────────────────────────

function XPreview({
  text,
  mediaItems,
}: {
  text: string;
  mediaItems: MediaItem[];
}) {
  const preview = text.length > 280 ? text.slice(0, 280) + "…" : text;
  return (
    <div
      className="sp-card"
      style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}
    >
      <div style={{ padding: "12px 14px", display: "flex", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--paper-3)",
            border: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-2)",
            flexShrink: 0,
          }}
        >
          SP
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "baseline",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}
            >
              Socialplus
            </span>
            <span
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              @socialplus · 2m
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.55,
              marginTop: 4,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: "var(--ink)",
            }}
          >
            {preview}
          </div>
          {mediaItems.length > 0 && (
            <div
              style={{
                marginTop: 10,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--rule)",
              }}
            >
              {mediaItems[0].type === "image" ? (
                <img
                  src={mediaItems[0].url}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <video
                  src={mediaItems[0].url}
                  style={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          padding: "6px 14px 10px 60px",
          display: "flex",
          gap: 20,
          color: "var(--ink-3)",
        }}
      >
        {[
          { Icon: MessageCircle, label: "0" },
          { Icon: Repeat2, label: "0" },
          { Icon: Heart, label: "0" },
          { Icon: Bookmark, label: "" },
          { Icon: Share2, label: "" },
        ].map(({ Icon, label }, i) => (
          <span
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
            }}
          >
            <Icon style={{ width: 14, height: 14 }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function LinkedInPreview({
  text,
  mediaItems,
}: {
  text: string;
  mediaItems: MediaItem[];
}) {
  const preview = text.length > 600 ? text.slice(0, 600) + "… see more" : text;
  return (
    <div
      className="sp-card"
      style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}
    >
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 4,
            background: "var(--paper-3)",
            border: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--ink-2)",
            flexShrink: 0,
          }}
        >
          SP
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
            Socialplus
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
            Social Media Tool
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            2m · 🌐
          </div>
        </div>
        <MoreHorizontal
          style={{
            width: 16,
            height: 16,
            color: "var(--ink-3)",
            flexShrink: 0,
          }}
        />
      </div>
      <div
        style={{
          padding: "0 14px 12px",
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: "var(--ink)",
        }}
      >
        {preview}
      </div>
      {mediaItems.length > 0 && (
        <div style={{ overflow: "hidden" }}>
          {mediaItems[0].type === "image" ? (
            <img
              src={mediaItems[0].url}
              alt=""
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <video
              src={mediaItems[0].url}
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
        </div>
      )}
      <div
        style={{
          padding: "6px 14px 4px",
          borderTop: "1px solid var(--rule)",
          display: "flex",
          gap: 2,
        }}
      >
        {[
          { Icon: ThumbsUp, label: "Like" },
          { Icon: MessageCircle, label: "Comment" },
          { Icon: Repeat2, label: "Repost" },
          { Icon: Share2, label: "Send" },
        ].map(({ Icon, label }, i) => (
          <button
            key={i}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              fontSize: 11,
              padding: "6px 0",
              borderRadius: 4,
              border: "none",
              background: "transparent",
              color: "var(--ink-3)",
              cursor: "pointer",
            }}
          >
            <Icon style={{ width: 13, height: 13 }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InstagramPreview({
  text,
  mediaItems,
}: {
  text: string;
  mediaItems: MediaItem[];
}) {
  const caption = text.length > 150 ? text.slice(0, 150) + "… more" : text;
  return (
    <div
      className="sp-card"
      style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}
    >
      <div
        style={{
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background:
              "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "white",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          SP
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            flex: 1,
            color: "var(--ink)",
          }}
        >
          @socialplus
        </span>
        <MoreHorizontal
          style={{ width: 16, height: 16, color: "var(--ink-3)" }}
        />
      </div>
      {mediaItems.length > 0 ? (
        mediaItems[0].type === "image" ? (
          <img
            src={mediaItems[0].url}
            alt=""
            style={{
              width: "100%",
              aspectRatio: "1",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <video
            src={mediaItems[0].url}
            style={{
              width: "100%",
              aspectRatio: "1",
              objectFit: "cover",
              display: "block",
            }}
          />
        )
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "1",
            background:
              "repeating-linear-gradient(45deg, var(--paper-2), var(--paper-2) 8px, var(--paper-3) 8px, var(--paper-3) 16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              color: "var(--ink-3)",
            }}
          >
            image / video
          </span>
        </div>
      )}
      <div style={{ padding: "10px 14px" }}>
        <div
          style={{
            display: "flex",
            gap: 14,
            marginBottom: 8,
            color: "var(--ink)",
          }}
        >
          <Heart style={{ width: 20, height: 20 }} />
          <MessageCircle style={{ width: 20, height: 20 }} />
          <Share2 style={{ width: 20, height: 20 }} />
          <Bookmark style={{ width: 20, height: 20, marginLeft: "auto" }} />
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
            color: "var(--ink)",
          }}
        >
          0 likes
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink)" }}>
          <span style={{ fontWeight: 600 }}>@socialplus </span>
          {caption}
        </div>
      </div>
    </div>
  );
}

function YouTubePreview({
  text,
  mediaItems,
}: {
  text: string;
  mediaItems: MediaItem[];
}) {
  const description =
    text.length > 400 ? text.slice(0, 400) + "… Show more" : text;
  const title = text.split("\n")[0] || "Video title";
  return (
    <div
      className="sp-card"
      style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}
    >
      {mediaItems.length > 0 ? (
        <div style={{ position: "relative" }}>
          {mediaItems[0].type === "image" ? (
            <img
              src={mediaItems[0].url}
              alt=""
              style={{
                width: "100%",
                aspectRatio: "16/9",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <video
              src={mediaItems[0].url}
              style={{
                width: "100%",
                aspectRatio: "16/9",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              background: "rgba(0,0,0,0.8)",
              color: "white",
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: "var(--font-mono)",
            }}
          >
            0:00
          </div>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            background:
              "repeating-linear-gradient(45deg, var(--paper-2), var(--paper-2) 8px, var(--paper-3) 8px, var(--paper-3) 16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Play style={{ width: 32, height: 32, color: "var(--ink-3)" }} />
        </div>
      )}
      <div style={{ padding: "10px 14px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: 6,
            color: "var(--ink)",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--paper-3)",
              border: "1px solid var(--rule)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-2)",
              flexShrink: 0,
            }}
          >
            SP
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>
              Socialplus
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              1K subscribers
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.55,
            color: "var(--ink-2)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {description}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 10,
            color: "var(--ink-3)",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
            }}
          >
            <ThumbsUp style={{ width: 13, height: 13 }} /> 0
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
            }}
          >
            <ThumbsDown style={{ width: 13, height: 13 }} /> 0
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
            }}
          >
            <MessageCircle style={{ width: 13, height: 13 }} /> 0 comments
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Scheduler modal ──────────────────────────────────────────────────────────

function SchedulerModal({
  date,
  onDateChange,
  onClose,
}: {
  date: Date;
  onDateChange: (d: Date) => void;
  onClose: () => void;
}) {
  const [viewDate, setViewDate] = useState(new Date(date));
  const [selectedDate, setSelectedDate] = useState(new Date(date));
  const [hours, setHours] = useState(
    date.getHours().toString().padStart(2, "0"),
  );
  const [minutes, setMinutes] = useState(
    date.getMinutes().toString().padStart(2, "0"),
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (day: number) =>
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month &&
    selectedDate.getDate() === day;

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getFullYear() === year &&
      now.getMonth() === month &&
      now.getDate() === day
    );
  };

  const selectDay = (day: number) => {
    const d = new Date(year, month, day);
    setSelectedDate(d);
  };

  const confirm = () => {
    const d = new Date(selectedDate);
    d.setHours(parseInt(hours) || 0);
    d.setMinutes(parseInt(minutes) || 0);
    d.setSeconds(0);
    onDateChange(d);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "oklch(0% 0 0 / 0.4)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--paper)",
          border: "1px solid var(--rule)",
          borderRadius: 14,
          padding: 24,
          width: 320,
          boxShadow: "0 20px 60px oklch(0% 0 0 / 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Month navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            style={{
              padding: 6,
              border: "1px solid var(--rule)",
              borderRadius: 6,
              background: "var(--paper-2)",
              cursor: "pointer",
              color: "var(--ink-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </button>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              letterSpacing: "-0.01em",
              color: "var(--ink)",
            }}
          >
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            style={{
              padding: 6,
              border: "1px solid var(--rule)",
              borderRadius: 6,
              background: "var(--paper-2)",
              cursor: "pointer",
              color: "var(--ink-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Day headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            marginBottom: 6,
          }}
        >
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 10.5,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-3)",
                padding: "4px 0",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
          }}
        >
          {cells.map((day, i) => (
            <button
              key={i}
              onClick={() => day && selectDay(day)}
              disabled={!day}
              style={{
                padding: "7px 0",
                borderRadius: 6,
                border: "none",
                background:
                  day && isSelected(day) ? "var(--ink)" : "transparent",
                color:
                  day && isSelected(day)
                    ? "var(--paper)"
                    : day && isToday(day)
                      ? "var(--ink)"
                      : day
                        ? "var(--ink-2)"
                        : "transparent",
                fontSize: 13,
                cursor: day ? "pointer" : "default",
                fontWeight: day && isToday(day) ? 700 : 400,
                outline:
                  day && isToday(day) && !isSelected(day)
                    ? "1.5px solid var(--rule)"
                    : "none",
                fontFamily: "var(--font-mono)",
              }}
            >
              {day || ""}
            </button>
          ))}
        </div>

        {/* Time picker */}
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid var(--rule)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--ink-3)",
              marginBottom: 10,
            }}
          >
            Time
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(e.target.value.padStart(2, "0"))}
              style={{
                width: 60,
                padding: "8px 0",
                borderRadius: 6,
                border: "1px solid var(--rule)",
                background: "var(--paper-2)",
                color: "var(--ink)",
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                textAlign: "center",
                outline: "none",
              }}
            />
            <span
              style={{
                fontSize: 20,
                color: "var(--ink-2)",
                fontWeight: 300,
                lineHeight: 1,
              }}
            >
              :
            </span>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.padStart(2, "0"))}
              style={{
                width: 60,
                padding: "8px 0",
                borderRadius: 6,
                border: "1px solid var(--rule)",
                background: "var(--paper-2)",
                color: "var(--ink)",
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                textAlign: "center",
                outline: "none",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                marginLeft: 4,
                fontFamily: "var(--font-mono)",
              }}
            >
              24h
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button
            onClick={onClose}
            className="sp-btn sp-btn-ghost"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="sp-btn sp-btn-primary"
            style={{ flex: 1 }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ComposerPage() {
  const [text, setText] = useState(SAMPLE);
  const [selected, setSelected] = useState<Record<string, boolean>>({
    x: true,
    in: true,
    ig: false,
    yt: true,
  });
  const [tone, setTone] = useState("Confident");
  const [slashOpen, setSlashOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textContent = SAMPLE;
    }
  }, []);

  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = () => {
    const content = editorRef.current?.textContent || "";
    setText(content);
    setSlashOpen(content.endsWith("/"));
  };

  const applyFormat = (cmd: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, undefined);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems = files.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video")
        ? ("video" as const)
        : ("image" as const),
      name: f.name,
    }));
    setMediaItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaItems((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const insertAI = (insert: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        // Delete the trailing "/"
        if (range.startOffset > 0) {
          range.setStart(range.startContainer, range.startOffset - 1);
          range.deleteContents();
        }
      }
      document.execCommand("insertText", false, insert);
    }
    setSlashOpen(false);
    setText(editorRef.current?.textContent || "");
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const activePlatforms = PLATFORMS.filter((p) => selected[p.id]);

  const FORMAT_TOOLS = [
    { cmd: "bold", Icon: Bold, title: "Bold (⌘B)" },
    { cmd: "italic", Icon: Italic, title: "Italic (⌘I)" },
    { cmd: "underline", Icon: Underline, title: "Underline (⌘U)" },
    { cmd: "strikeThrough", Icon: Strikethrough, title: "Strikethrough" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <PageHeader
        crumb="Workspace · New post"
        title="Compose"
        actions={
          <>
            <button className="sp-btn sp-btn-ghost">
              <RefreshCw style={{ width: 13, height: 13 }} /> Save draft
            </button>
            <button className="sp-btn" onClick={() => setShowScheduler(true)}>
              <Clock style={{ width: 13, height: 13 }} /> Schedule
            </button>
            <button className="sp-btn sp-btn-primary">
              <Send style={{ width: 13, height: 13 }} /> Publish now
            </button>
          </>
        }
      />

      {/* Mobile tab switcher */}
      <div
        className="md:hidden"
        style={{
          display: "flex",
          borderBottom: "1px solid var(--rule)",
          background: "var(--paper-2)",
        }}
      >
        {(["editor", "preview"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            style={{
              flex: 1,
              padding: "12px 0",
              fontSize: 12.5,
              fontWeight: 500,
              border: "none",
              background: mobileTab === tab ? "var(--paper)" : "transparent",
              color: mobileTab === tab ? "var(--ink)" : "var(--ink-3)",
              borderBottom:
                mobileTab === tab
                  ? "2px solid var(--ink)"
                  : "2px solid transparent",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          minHeight: 0,
          overflow: "hidden",
        }}
        className="composer-layout"
      >
        {/* ── Editor pane ── */}
        <div
          className={mobileTab === "editor" ? "block" : "hidden md:flex"}
          style={{
            padding: "var(--pad-3) var(--pad-4)",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "var(--gap-3)",
          }}
        >
          {/* Platform + Tone row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="eyebrow">Publishing to</span>
              <div style={{ display: "flex", gap: 6 }}>
                {PLATFORMS.map((p) => (
                  <Glyph
                    key={p.id}
                    g={p.glyph}
                    active={selected[p.id]}
                    size={26}
                    onClick={() =>
                      setSelected((s) => ({ ...s, [p.id]: !s[p.id] }))
                    }
                  />
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span className="eyebrow">Tone</span>
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  style={{
                    fontSize: 11.5,
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: "1px solid var(--rule)",
                    background: tone === t ? "var(--ink)" : "transparent",
                    color: tone === t ? "var(--paper)" : "var(--ink-2)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: "var(--rule)" }} />

          {/* Formatting toolbar */}
          <div style={{ display: "flex", gap: 2 }}>
            {FORMAT_TOOLS.map(({ cmd, Icon, title }) => (
              <button
                key={cmd}
                title={title}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applyFormat(cmd);
                }}
                style={{
                  width: 30,
                  height: 30,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 5,
                  border: "1px solid var(--rule)",
                  background: "var(--paper-2)",
                  color: "var(--ink-2)",
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--paper-3)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--ink)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--paper-2)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--ink-2)";
                }}
              >
                <Icon style={{ width: 13, height: 13 }} />
              </button>
            ))}
            <div
              style={{
                width: 1,
                height: 24,
                background: "var(--rule)",
                margin: "3px 4px",
                alignSelf: "center",
              }}
            />
            <span
              style={{
                alignSelf: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--ink-3)",
                letterSpacing: "0.04em",
              }}
            >
              type / for AI
            </span>
          </div>

          {/* ContentEditable editor */}
          <div
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 220,
            }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              style={{
                flex: 1,
                minHeight: 220,
                fontFamily: "var(--font-display)",
                fontSize: 24,
                lineHeight: 1.45,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
                outline: "none",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              data-placeholder="Write your post… type / for AI suggestions"
            />

            {/* Slash AI menu */}
            {slashOpen && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  transform: "translateY(calc(100% + 6px))",
                  background: "var(--paper)",
                  border: "1px solid var(--rule)",
                  borderRadius: 10,
                  boxShadow: "0 8px 30px oklch(0% 0 0 / 0.12)",
                  padding: 6,
                  width: 280,
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    padding: "8px 10px 6px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Sparkles
                    style={{
                      width: 13,
                      height: 13,
                      color: "var(--ink-3)",
                    }}
                  />
                  <span className="eyebrow">AI actions</span>
                </div>
                {AI_ACTIONS.map((it) => (
                  <div
                    key={it.key}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertAI(it.insert);
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background =
                        "var(--paper-2)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background =
                        "transparent")
                    }
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                      {it.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {it.hint}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media thumbnails */}
          {mediaItems.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {mediaItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid var(--rule)",
                    flexShrink: 0,
                  }}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <video
                      src={item.url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <button
                    onClick={() => removeMedia(i)}
                    style={{
                      position: "absolute",
                      top: 3,
                      right: 3,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.65)",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    <XIcon style={{ width: 10, height: 10 }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer toolbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--rule)",
              paddingTop: "var(--gap-2)",
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              <button
                className="sp-btn sp-btn-ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon style={{ width: 13, height: 13 }} /> Media
              </button>
              <button className="sp-btn sp-btn-ghost">
                <Hash style={{ width: 13, height: 13 }} /> Hashtag
              </button>
              <button className="sp-btn sp-btn-ghost">
                <Sparkles style={{ width: 13, height: 13 }} /> AI
              </button>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-3)",
              }}
            >
              {text.length} chars · ⌘↵ to publish
            </div>
          </div>

          {/* Schedule strip */}
          <div
            className="sp-card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--gap-2)",
              padding: "var(--pad-1) var(--pad-2)",
              cursor: "pointer",
            }}
            onClick={() => setShowScheduler(true)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Clock style={{ width: 16, height: 16, color: "var(--ink-3)" }} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                  Schedule for {formatDate(scheduledDate)}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  Click to change · your audience peaks here
                </div>
              </div>
            </div>
            <button
              className="sp-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowScheduler(true);
              }}
            >
              Change time
            </button>
          </div>
        </div>

        {/* ── Preview rail — all platforms ── */}
        <div
          className={mobileTab === "preview" ? "block" : "hidden md:flex"}
          style={{
            borderLeft: "1px solid var(--rule)",
            background: "var(--paper-2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "var(--pad-2) var(--pad-2) var(--pad-1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--rule)",
              flexShrink: 0,
            }}
          >
            <span className="eyebrow">Live preview</span>
            <div style={{ display: "flex", gap: 4 }}>
              {activePlatforms.map((p) => (
                <Glyph key={p.id} g={p.glyph} active size={20} />
              ))}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "var(--pad-2)",
            }}
          >
            {activePlatforms.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--ink-3)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                Select a platform above
              </div>
            ) : (
              activePlatforms.map((p) => {
                if (p.id === "x")
                  return (
                    <div key="x">
                      <div
                        className="eyebrow"
                        style={{ marginBottom: 6, paddingLeft: 2 }}
                      >
                        X / Twitter
                      </div>
                      <XPreview text={text} mediaItems={mediaItems} />
                    </div>
                  );
                if (p.id === "in")
                  return (
                    <div key="in">
                      <div
                        className="eyebrow"
                        style={{ marginBottom: 6, paddingLeft: 2 }}
                      >
                        LinkedIn
                      </div>
                      <LinkedInPreview text={text} mediaItems={mediaItems} />
                    </div>
                  );
                if (p.id === "ig")
                  return (
                    <div key="ig">
                      <div
                        className="eyebrow"
                        style={{ marginBottom: 6, paddingLeft: 2 }}
                      >
                        Instagram
                      </div>
                      <InstagramPreview text={text} mediaItems={mediaItems} />
                    </div>
                  );
                if (p.id === "yt")
                  return (
                    <div key="yt">
                      <div
                        className="eyebrow"
                        style={{ marginBottom: 6, paddingLeft: 2 }}
                      >
                        YouTube
                      </div>
                      <YouTubePreview text={text} mediaItems={mediaItems} />
                    </div>
                  );
                return null;
              })
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleMediaUpload}
        style={{ display: "none" }}
      />

      {/* Scheduler modal */}
      {showScheduler && (
        <SchedulerModal
          date={scheduledDate}
          onDateChange={setScheduledDate}
          onClose={() => setShowScheduler(false)}
        />
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .composer-layout {
            grid-template-columns: 1fr !important;
          }
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--ink-3);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
