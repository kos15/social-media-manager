"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoaderRule } from "@/components/ui/sp-loaders";
import { usePostStore, ScheduledPost } from "@/store/usePostStore";
import { PostPreviewModal } from "@/components/calendar/PostPreviewModal";

const GLYPH_MAP: Record<string, string> = {
  TWITTER: "𝕏",
  LINKEDIN: "in",
  INSTAGRAM: "Ig",
  YOUTUBE: "▶",
};

const HOURS = [6, 9, 12, 15, 18, 21];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hourPct = (h: number) => ((h - 6) / 16) * 100;

function formatHour(h: number) {
  if (h === 12) return "12pm";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
}

function getWeekDays(baseDate: Date) {
  const monday = new Date(baseDate);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getMonthGrid(offset: number) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);

  const start = new Date(first);
  const startDow = start.getDay();
  start.setDate(start.getDate() - (startDow === 0 ? 6 : startDow - 1));

  const end = new Date(last);
  const endDow = end.getDay();
  if (endDow !== 0) end.setDate(end.getDate() + (7 - endDow));

  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return { days, year: first.getFullYear(), month: first.getMonth() };
}

export default function CalendarPage() {
  const { scheduledPosts, setScheduledPosts } = usePostStore();
  const [view, setView] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) throw new Error("Failed to load posts");
        const dbPosts: ScheduledPost[] = await res.json();
        setScheduledPosts(dbPosts);
      } catch (err) {
        console.error("Calendar fetch error:", err);
        setFetchError("Could not load posts from the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Week view data
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);
  const todayStr = new Date().toDateString();

  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const postsByWeekDay = weekDays.map((day) => {
    const dayStr = day.toDateString();
    return scheduledPosts.filter(
      (p) => new Date(p.scheduledDate).toDateString() === dayStr,
    );
  });

  // Month view data
  const {
    days: monthDays,
    year: monthYear,
    month: monthMonth,
  } = getMonthGrid(monthOffset);
  const monthLabel = new Date(monthYear, monthMonth, 1).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );

  const navLabel = view === "week" ? weekLabel : monthLabel;
  const goBack = () =>
    view === "week"
      ? setWeekOffset((w) => w - 1)
      : setMonthOffset((m) => m - 1);
  const goForward = () =>
    view === "week"
      ? setWeekOffset((w) => w + 1)
      : setMonthOffset((m) => m + 1);
  const goToday = () => {
    setWeekOffset(0);
    setMonthOffset(0);
  };

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
        crumb="Workspace · Schedule"
        title="Calendar"
        actions={
          <>
            <button className="sp-btn">
              <Filter style={{ width: 13, height: 13 }} /> All platforms
            </button>
            <div
              style={{
                display: "flex",
                border: "1px solid var(--rule)",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <button
                className={`sp-btn ${view === "week" ? "sp-btn-primary" : "sp-btn-ghost"}`}
                style={{ height: 32, borderRadius: 0, border: "none" }}
                onClick={() => setView("week")}
              >
                Week
              </button>
              <button
                className={`sp-btn ${view === "month" ? "sp-btn-primary" : "sp-btn-ghost"}`}
                style={{ height: 32, borderRadius: 0, border: "none" }}
                onClick={() => setView("month")}
              >
                Month
              </button>
            </div>
            <Link
              href="/composer"
              className="sp-btn sp-btn-primary"
              style={{ textDecoration: "none" }}
            >
              <Plus style={{ width: 13, height: 13 }} /> Schedule post
            </Link>
          </>
        }
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "var(--pad-3) var(--pad-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--gap-3)",
        }}
      >
        {fetchError && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "var(--sp-warn-soft)",
              border: "1px solid var(--sp-warn)",
              color: "var(--sp-warn)",
              fontSize: 12.5,
            }}
          >
            {fetchError}
          </div>
        )}

        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              padding: "60px 0",
            }}
          >
            <LoaderRule width={280} />
          </div>
        )}

        {/* Nav header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            paddingBottom: "var(--gap-2)",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <div>
            <div className="eyebrow" style={{ paddingBottom: 6 }}>
              {view === "week" ? "Weekly view" : "Monthly view"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(24px, 3vw, 36px)",
              }}
            >
              {navLabel}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="sp-btn sp-btn-ghost" onClick={goBack}>
              <ChevronLeft style={{ width: 14, height: 14 }} /> Previous
            </button>
            <button className="sp-btn" onClick={goToday}>
              Today
            </button>
            <button className="sp-btn sp-btn-ghost" onClick={goForward}>
              Next <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {view === "week" ? (
          <>
            {/* Hour ruler */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: 0,
              }}
            >
              <div />
              <div
                style={{
                  position: "relative",
                  height: 24,
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{
                      position: "absolute",
                      left: `${hourPct(h)}%`,
                      top: 0,
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: "var(--ink-3)",
                    }}
                  >
                    {formatHour(h)}
                  </div>
                ))}
              </div>
            </div>

            {/* Day rows */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {weekDays.map((day, di) => {
                const dayPosts = postsByWeekDay[di];
                const isToday = day.toDateString() === todayStr;
                return (
                  <div
                    key={di}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr",
                      borderTop: "1px solid var(--rule)",
                      minHeight: 74,
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 12px 12px 0",
                        borderRight: "1px solid var(--rule)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10.5,
                          color: "var(--ink-3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {DAY_LABELS[di]}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 24,
                          color: isToday ? "var(--sp-accent)" : "var(--ink)",
                        }}
                      >
                        {day.getDate()}
                      </div>
                      {isToday && (
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            color: "var(--sp-accent)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          TODAY
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        position: "relative",
                        padding: "10px 16px",
                        minHeight: 74,
                      }}
                    >
                      {HOURS.map((h) => (
                        <div
                          key={h}
                          style={{
                            position: "absolute",
                            left: `calc(16px + ${hourPct(h)}% * (100% - 32px) / 100)`,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: "var(--rule)",
                            opacity: 0.5,
                          }}
                        />
                      ))}
                      {!loading &&
                        dayPosts.map((post, pi) => {
                          const hour = new Date(post.scheduledDate).getHours();
                          const isPublishedPost =
                            new Date(post.scheduledDate) < new Date();
                          const isDraft = post.status === "DRAFT";
                          const glyphs = post.platforms.map(
                            (pl) => GLYPH_MAP[pl] || pl,
                          );
                          return (
                            <div
                              key={post.id}
                              onClick={() => setSelectedPost(post)}
                              style={{
                                position: "absolute",
                                left: `calc(16px + ${hourPct(Math.max(6, Math.min(hour, 21)))}% * (100% - 32px) / 100)`,
                                top: 8 + (pi % 2) * 36,
                                width: 220,
                                padding: "6px 10px",
                                background: isPublishedPost
                                  ? "var(--paper-2)"
                                  : "var(--paper)",
                                border: `1px solid ${isDraft ? "var(--rule)" : "var(--rule-2)"}`,
                                borderLeft: `2px solid ${isPublishedPost ? "var(--ink-4)" : isDraft ? "var(--ink-3)" : "var(--ink)"}`,
                                borderRadius: 4,
                                cursor: "pointer",
                                opacity: isPublishedPost ? 0.65 : 1,
                                fontSize: 11.5,
                                lineHeight: 1.35,
                                zIndex: pi + 1,
                                boxShadow: "var(--shadow-sm)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  marginBottom: 3,
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 9.5,
                                    color: "var(--ink-3)",
                                  }}
                                >
                                  {hour}:00
                                </span>
                                <div style={{ display: "flex", gap: 2 }}>
                                  {glyphs.map((g, gi) => (
                                    <span
                                      key={gi}
                                      style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 3,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "var(--ink)",
                                        color: "var(--paper)",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 8,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {g}
                                    </span>
                                  ))}
                                </div>
                                {isDraft && (
                                  <span
                                    style={{
                                      fontFamily: "var(--font-mono)",
                                      fontSize: 9,
                                      color: "var(--sp-warn)",
                                      marginLeft: "auto",
                                    }}
                                  >
                                    DRAFT
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  color: "var(--ink-2)",
                                }}
                              >
                                {post.content.slice(0, 60)}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Monthly grid */
          <div>
            {/* Column headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  style={{
                    padding: "6px 10px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--ink-3)",
                    textAlign: "center",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}
            >
              {monthDays.map((day, i) => {
                const isCurrentMonth = day.getMonth() === monthMonth;
                const isToday = day.toDateString() === todayStr;
                const dayPosts = scheduledPosts.filter(
                  (p) =>
                    new Date(p.scheduledDate).toDateString() ===
                    day.toDateString(),
                );
                return (
                  <div
                    key={i}
                    style={{
                      minHeight: 100,
                      padding: "8px",
                      border: "1px solid var(--rule)",
                      borderTop: "none",
                      borderLeft:
                        i % 7 === 0 ? "1px solid var(--rule)" : "none",
                      opacity: isCurrentMonth ? 1 : 0.35,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: isToday ? "50%" : 4,
                        background: isToday
                          ? "var(--sp-accent)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-display)",
                        fontSize: 13,
                        color: isToday ? "var(--paper)" : "var(--ink)",
                        marginBottom: 4,
                      }}
                    >
                      {day.getDate()}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      {dayPosts.slice(0, 3).map((post) => {
                        const isPublishedPost =
                          new Date(post.scheduledDate) < new Date();
                        const glyphs = post.platforms
                          .slice(0, 2)
                          .map((pl) => GLYPH_MAP[pl] || pl);
                        return (
                          <div
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            style={{
                              padding: "2px 6px",
                              borderRadius: 3,
                              background: isPublishedPost
                                ? "var(--paper-3)"
                                : "var(--paper-2)",
                              borderLeft: `2px solid ${isPublishedPost ? "var(--ink-4)" : "var(--ink)"}`,
                              fontSize: 10.5,
                              color: "var(--ink-2)",
                              cursor: "pointer",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {glyphs.length > 0 && (
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 9,
                                  color: "var(--ink-3)",
                                  flexShrink: 0,
                                }}
                              >
                                {glyphs.join(" ")}
                              </span>
                            )}
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {post.content.slice(0, 22)}
                            </span>
                          </div>
                        );
                      })}
                      {dayPosts.length > 3 && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--ink-3)",
                            paddingLeft: 6,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          +{dayPosts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 24,
            paddingTop: "var(--gap-1)",
            fontSize: 11,
            color: "var(--ink-3)",
          }}
        >
          {[
            { label: "Queued", borderColor: "var(--ink)", bg: "var(--paper)" },
            {
              label: "Published",
              borderColor: "var(--ink-4)",
              bg: "var(--paper-2)",
              opacity: 0.65,
            },
            {
              label: "Draft",
              borderColor: "var(--ink-3)",
              bg: "var(--paper)",
              dashed: true,
            },
          ].map((l) => (
            <span
              key={l.label}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderLeft: `2px solid ${l.borderColor}`,
                  background: l.bg,
                  border: `1px ${l.dashed ? "dashed" : "solid"} var(--rule)`,
                  opacity: l.opacity || 1,
                }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <PostPreviewModal
        isOpen={selectedPost !== null}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        onDeleted={() => setSelectedPost(null)}
      />
    </div>
  );
}
