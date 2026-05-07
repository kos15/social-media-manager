"use client";

import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

const TOP_POSTS = [
  {
    t: "Rebuilt our scheduling engine — under 200ms…",
    p: "in",
    e: "3,240",
    d: "May 6",
  },
  {
    t: "Three patterns we use to keep flaky CI green",
    p: "x",
    e: "1,892",
    d: "May 4",
  },
  {
    t: "Behind the scenes: how we ship every Friday",
    p: "yt",
    e: "1,455",
    d: "May 3",
  },
  { t: "Studio shot — new microphone setup", p: "ig", e: "982", d: "May 2" },
  { t: "Why we open-sourced our scheduler", p: "in", e: "845", d: "May 1" },
];

const PLATFORM_DATA = [
  { p: "x", name: "X / Twitter", val: "845K", pct: 42, delta: "+8%" },
  { p: "in", name: "LinkedIn", val: "612K", pct: 30, delta: "+22%" },
  { p: "yt", name: "YouTube", val: "421K", pct: 21, delta: "+15%" },
  { p: "ig", name: "Instagram", val: "132K", pct: 7, delta: "−3%" },
];

const GLYPH_MAP: Record<string, string> = {
  x: "𝕏",
  in: "in",
  ig: "Ig",
  yt: "▶",
};

function Glyph({ p, size = 20 }: { p: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ink)",
        color: "var(--paper)",
        border: "1px solid var(--ink)",
        fontFamily: "var(--font-mono)",
        fontSize: size * 0.5,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {GLYPH_MAP[p] || p}
    </span>
  );
}

function Sparkline() {
  const W = 720,
    H = 200,
    P = 30;
  const series = [
    {
      p: "x",
      color: "var(--ink)",
      points: [40, 55, 50, 70, 65, 88, 78, 92, 85, 100, 95, 115],
    },
    {
      p: "in",
      color: "var(--ink-3)",
      points: [20, 30, 28, 35, 40, 50, 48, 60, 58, 70, 68, 80],
    },
    {
      p: "ig",
      color: "var(--ink-4)",
      points: [15, 18, 22, 20, 28, 25, 32, 30, 38, 35, 42, 40],
    },
  ];
  const max = 130;
  const xs = (i: number) => P + (i * (W - P * 2)) / 11;
  const ys = (v: number) => H - P - (v / max) * (H - P * 2);
  const dayLabels = [
    "M",
    "T",
    "W",
    "T",
    "F",
    "S",
    "S",
    "M",
    "T",
    "W",
    "T",
    "F",
  ];

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={200}
        style={{ display: "block" }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={P}
            x2={W - P}
            y1={P + t * (H - P * 2)}
            y2={P + t * (H - P * 2)}
            stroke="var(--rule)"
            strokeWidth="0.5"
          />
        ))}
        {series.map((s) => (
          <polyline
            key={s.p}
            points={s.points.map((v, i) => `${xs(i)},${ys(v)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth="1.5"
          />
        ))}
        {dayLabels.map((d, i) => (
          <text
            key={i}
            x={xs(i)}
            y={H - 8}
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--ink-3)"
            textAnchor="middle"
          >
            {d}
          </text>
        ))}
      </svg>
      <div style={{ display: "flex", gap: 18, paddingTop: 10, fontSize: 11 }}>
        {series.map((s) => (
          <span
            key={s.p}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--ink-2)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 2,
                background: s.color,
                display: "inline-block",
              }}
            />
            <Glyph p={s.p} size={16} />
            <span style={{ fontFamily: "var(--font-mono)" }}>
              {s.p === "x" ? "X" : s.p === "in" ? "LinkedIn" : "Instagram"}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
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
        crumb="Workspace · Insights"
        title="Analytics"
        actions={
          <>
            <button className="sp-btn">Last 30 days</button>
            <button className="sp-btn">Export</button>
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
        {/* Editorial header */}
        <div
          style={{
            paddingBottom: "var(--gap-2)",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <div className="eyebrow" style={{ paddingBottom: 8 }}>
            April 7 — May 6
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3vw, 40px)",
              lineHeight: 1.05,
            }}
          >
            You reached <em style={{ fontStyle: "italic" }}>2.41M</em> people
            this month.
            <br />
            <span style={{ color: "var(--ink-3)" }}>
              Up 18% — your best month since January.
            </span>
          </div>
        </div>

        {/* Headline numbers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
          }}
          className="stats-grid-3"
        >
          {[
            { l: "Total engagement", v: "124.5K", d: "+12% vs last period" },
            { l: "Audience growth", v: "+2,400", d: "+8% vs last period" },
            {
              l: "Best time to post",
              v: "Thu · 10am",
              d: "Based on top-performing posts",
            },
          ].map((x, i) => (
            <div
              key={i}
              style={{
                padding: "var(--pad-2)",
                borderRight: i < 2 ? "1px solid var(--rule)" : "none",
              }}
            >
              <div className="eyebrow">{x.l}</div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(22px, 2.5vw, 36px)",
                  marginTop: 8,
                }}
              >
                {x.v}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  marginTop: 6,
                  color: "var(--ink-3)",
                }}
              >
                {x.d}
              </div>
            </div>
          ))}
        </div>

        {/* Chart + platform breakdown */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "var(--gap-3)",
          }}
          className="responsive-stack"
        >
          <div className="sp-card" style={{ padding: "var(--pad-2)" }}>
            <div className="eyebrow">Reach over time</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                marginTop: 4,
                marginBottom: "var(--gap-2)",
              }}
            >
              Per-platform performance
            </div>
            <Sparkline />
          </div>

          <div className="sp-card" style={{ padding: "var(--pad-2)" }}>
            <div className="eyebrow" style={{ marginBottom: "var(--gap-2)" }}>
              By platform
            </div>
            {PLATFORM_DATA.map((row, i) => (
              <div
                key={row.p}
                style={{
                  padding: "12px 0",
                  borderTop: i ? "1px solid var(--rule)" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <Glyph p={row.p} size={20} />
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>
                    {row.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      marginLeft: "auto",
                      fontSize: 11,
                      color: "var(--ink-3)",
                    }}
                  >
                    {row.val}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10.5,
                      color: row.delta.startsWith("+")
                        ? "var(--sp-positive)"
                        : "var(--ink-3)",
                    }}
                  >
                    {row.delta}
                  </span>
                </div>
                <div
                  style={{
                    height: 3,
                    background: "var(--paper-3)",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      width: `${row.pct}%`,
                      height: "100%",
                      background: "var(--ink)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top posts table */}
        <div className="sp-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "var(--pad-2)",
              borderBottom: "1px solid var(--rule)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className="eyebrow">Top performing</div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  marginTop: 4,
                }}
              >
                Five posts that worked
              </div>
            </div>
            <button
              className="sp-btn sp-btn-ghost"
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              View all <ArrowUpRight style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 100px 120px 80px",
                padding: "10px var(--pad-2)",
                borderBottom: "1px solid var(--rule)",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              <div>#</div>
              <div>Post</div>
              <div>Platform</div>
              <div>Engagements</div>
              <div>Date</div>
            </div>
            {TOP_POSTS.map((post, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 100px 120px 80px",
                  padding: "14px var(--pad-2)",
                  borderBottom:
                    i < TOP_POSTS.length - 1 ? "1px solid var(--rule)" : "none",
                  alignItems: "center",
                  fontSize: 12.5,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink-3)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontWeight: 450,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: 16,
                  }}
                >
                  {post.t}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Glyph p={post.p} size={16} />
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {post.e}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ink-3)",
                  }}
                >
                  {post.d}
                </div>
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
          .stats-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .stats-grid-3 > div {
            border-right: none !important;
            border-bottom: 1px solid var(--rule);
          }
        }
      `}</style>
    </div>
  );
}
