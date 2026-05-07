"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { usePostStore } from "@/store/usePostStore";

const PLATFORMS = [
  { id: "x", glyph: "𝕏", name: "X / Twitter", handle: "@socialplus" },
  { id: "in", glyph: "in", name: "LinkedIn", handle: "Socialplus" },
  { id: "ig", glyph: "Ig", name: "Instagram", handle: "@socialplus" },
  { id: "yt", glyph: "▶", name: "YouTube", handle: "Socialplus" },
];

function Glyph({
  g,
  active,
  size = 22,
}: {
  g: string;
  active: boolean;
  size?: number;
}) {
  return (
    <span
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
        flexShrink: 0,
      }}
    >
      {g}
    </span>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { scheduledPosts } = usePostStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stats = [
    { label: "Followers", value: "145.2K", delta: "+12.5%", up: true },
    { label: "Impressions", value: "2.41M", delta: "+5.1%", up: true },
    { label: "Engagement", value: "4.8%", delta: "−0.5%", up: false },
    { label: "Comments", value: "12,450", delta: "+24.2%", up: true },
  ];

  const upcoming = scheduledPosts.slice(0, 4).map((p) => ({
    time: new Date(p.scheduledDate).toLocaleDateString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    title: p.content.slice(0, 80),
    platforms: p.platforms.map((pl) => {
      const map: Record<string, string> = {
        TWITTER: "𝕏",
        LINKEDIN: "in",
        INSTAGRAM: "Ig",
        YOUTUBE: "▶",
      };
      return map[pl] || pl;
    }),
  }));

  const accountStatuses = [
    { ...PLATFORMS[0], status: "Active" },
    { ...PLATFORMS[1], status: "Active" },
    { ...PLATFORMS[2], status: "Expired" },
    { ...PLATFORMS[3], status: "Active" },
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
        crumb="Workspace · This week"
        title="Overview"
        actions={
          <>
            <button className="sp-btn">
              <RefreshCw style={{ width: 13, height: 13 }} /> Sync
            </button>
            <Link
              href="/composer"
              className="sp-btn sp-btn-primary"
              style={{ textDecoration: "none" }}
            >
              <Plus style={{ width: 13, height: 13 }} /> New post
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
        {/* Editorial intro */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "var(--gap-3)",
            alignItems: "end",
            paddingBottom: "var(--gap-2)",
            borderBottom: "1px solid var(--rule)",
          }}
          className="responsive-stack"
        >
          <div>
            <div className="eyebrow" style={{ paddingBottom: 8 }}>
              The week, May 5 — May 11
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 3vw, 44px)",
                lineHeight: 1.05,
              }}
            >
              Engagement up{" "}
              <em style={{ fontStyle: "italic", color: "var(--sp-accent)" }}>
                12.5%
              </em>
              .<br />
              Four posts queued. One needs your eye.
            </div>
          </div>
          <div
            style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}
          >
            Your audience is most active <strong>Thursday at 10 AM</strong>. The
            last LinkedIn long-form pulled <strong>3,240 reactions</strong> —
            your highest in 60 days.
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 0,
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
          }}
          className="stats-grid"
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "var(--pad-2)",
                borderRight: i < 3 ? "1px solid var(--rule)" : "none",
              }}
            >
              <div className="eyebrow">{s.label}</div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(24px, 2.5vw, 36px)",
                  marginTop: 8,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  marginTop: 6,
                  color: s.up ? "var(--sp-positive)" : "var(--ink-3)",
                }}
              >
                {s.delta}{" "}
                <span style={{ color: "var(--ink-3)" }}>vs last week</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Upcoming */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: "var(--gap-3)",
          }}
          className="responsive-stack"
        >
          <div className="sp-card" style={{ padding: "var(--pad-2)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--gap-2)",
              }}
            >
              <div>
                <div className="eyebrow">Performance</div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    marginTop: 4,
                  }}
                >
                  Reach by platform
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["7d", "30d", "90d"].map((r, i) => (
                  <button
                    key={r}
                    className={`sp-btn ${i === 0 ? "sp-btn-primary" : ""}`}
                    style={{ height: 28, padding: "0 10px", fontSize: 11.5 }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <PlatformChart />
          </div>

          <div className="sp-card" style={{ padding: "var(--pad-2)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "var(--gap-2)",
              }}
            >
              <div className="eyebrow">Up next</div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                }}
              >
                {upcoming.length} scheduled
              </span>
            </div>
            {upcoming.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: "var(--ink-3)",
                  fontSize: 13,
                }}
              >
                No posts scheduled yet.{" "}
                <Link
                  href="/composer"
                  style={{ color: "var(--sp-accent)", textDecoration: "none" }}
                >
                  Compose one →
                </Link>
              </div>
            ) : (
              upcoming.map((u, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 0",
                    borderTop: i ? "1px solid var(--rule)" : "none",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      color: "var(--ink-3)",
                      width: 72,
                      flexShrink: 0,
                      paddingTop: 2,
                    }}
                  >
                    {u.time}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.4,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {u.title}
                    </div>
                    <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                      {u.platforms.map((p, pi) => (
                        <Glyph key={pi} g={p} active size={16} />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div
              style={{
                paddingTop: "var(--gap-1)",
                borderTop: "1px solid var(--rule)",
                marginTop: "var(--gap-1)",
              }}
            >
              <Link
                href="/calendar"
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-2)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                View calendar <ArrowUpRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
          </div>
        </div>

        {/* Accounts strip */}
        <div className="sp-card" style={{ padding: "var(--pad-2)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "var(--gap-2)",
            }}
          >
            <div className="eyebrow">Connected accounts</div>
            <Link
              href="/accounts"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--ink-2)",
                textDecoration: "none",
              }}
            >
              Manage <ArrowUpRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "var(--gap-2)",
            }}
            className="accounts-grid"
          >
            {accountStatuses.map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  border: "1px solid var(--rule)",
                  borderRadius: 8,
                }}
              >
                <Glyph g={a.glyph} active={a.status === "Active"} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                    {a.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      color: "var(--ink-3)",
                    }}
                  >
                    {a.handle}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color:
                      a.status === "Active"
                        ? "var(--sp-positive)"
                        : "var(--sp-warn)",
                    flexShrink: 0,
                  }}
                >
                  ● {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .responsive-stack {
            grid-template-columns: 1fr !important;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .accounts-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .accounts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
