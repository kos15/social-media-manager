"use client";

import { useState, useEffect } from "react";

/* ── Monogram ─── building block ──────────────────────────────────── */
export function SPMonogram({
  size = 36,
  radius,
  animated = false,
}: {
  size?: number;
  radius?: number;
  animated?: boolean;
}) {
  const r = radius != null ? radius : Math.round(size * 0.2);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "var(--ink)",
        color: "var(--paper)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: Math.round(size * 0.66),
        fontWeight: 400,
        letterSpacing: "-0.02em",
        animation: animated ? "sp-breathe 1.6s ease-in-out infinite" : "none",
        flexShrink: 0,
      }}
    >
      S
    </div>
  );
}

/* ── 1. LoaderArc — default app / route loader ────────────────────── */
export function LoaderArc({
  size = 72,
  label = null,
}: {
  size?: number;
  label?: string | null;
}) {
  const stroke = Math.max(2, Math.round(size * 0.05));
  const r = size / 2 - stroke;
  const cx = size / 2;
  const arc = 2 * Math.PI * r * 0.28;
  const circ = 2 * Math.PI * r;
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0 }}
        >
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="var(--rule)"
            strokeWidth={stroke}
          />
        </svg>
        <svg
          width={size}
          height={size}
          style={{
            position: "absolute",
            inset: 0,
            animation: "sp-rotate 1.4s linear infinite",
            transformOrigin: "center",
          }}
        >
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="var(--sp-accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circ}`}
            transform={`rotate(-90 ${cx} ${cx})`}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SPMonogram
            size={Math.round(size * 0.52)}
            radius={Math.round(size * 0.13)}
            animated
          />
        </div>
      </div>
      {label && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/* ── 2. LoaderThinking — AI generation ───────────────────────────── */
export function LoaderThinking({ size = 44 }: { size?: number }) {
  const phases = ["Drafting", "Composing", "Polishing"];
  const [phaseIdx, setPhaseIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setPhaseIdx((i) => (i + 1) % phases.length),
      1400,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 18px",
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        borderRadius: 999,
        boxShadow:
          "0 1px 0 oklch(20% 0.012 70 / 0.04), 0 8px 22px -10px oklch(20% 0.012 70 / 0.18)",
      }}
    >
      <div style={{ position: "relative" }}>
        <SPMonogram size={size} animated />
        <div
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            fontSize: 14,
            color: "var(--sp-accent)",
            animation: "sp-pulse 1.4s ease-in-out infinite",
          }}
        >
          ✦
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: 110,
        }}
      >
        <div
          key={phaseIdx}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            color: "var(--ink)",
            fontStyle: "italic",
            letterSpacing: "-0.01em",
            minHeight: 22,
            animation: "sp-fade-in 0.4s ease both",
          }}
        >
          {phases[phaseIdx]}…
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          AI · Working
        </div>
      </div>
    </div>
  );
}

/* ── 3. LoaderDots — compact inline ───────────────────────────────── */
export function LoaderDots({
  size = 32,
  label = "Loading",
}: {
  size?: number;
  label?: string;
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <SPMonogram size={size} animated />
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "inline-flex",
          gap: 4,
          alignItems: "flex-end",
          height: 12,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "var(--ink)",
              animation: `sp-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── 4. LoaderRule — page / section transition ────────────────────── */
export function LoaderRule({ width = 240 }: { width?: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        width,
      }}
    >
      <SPMonogram size={42} animated />
      <div
        style={{
          width: "100%",
          height: 1,
          background: "var(--rule)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--ink)",
            transformOrigin: "left",
            animation:
              "sp-rule 1.8s cubic-bezier(.65,.05,.36,1) infinite, sp-rule-shift 3.6s steps(1) infinite",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        Loading
      </div>
    </div>
  );
}

/* ── 5. LoaderOrbit — multi-channel sync / account connect ────────── */
export function LoaderOrbit({
  size = 96,
  label = "Syncing channels",
}: {
  size?: number;
  label?: string;
}) {
  const glyphs = ["IG", "X", "LI", "YT"];
  const orbitR = size * 0.42;
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SPMonogram size={Math.round(size * 0.42)} animated />
        </div>
        <svg
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0 }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={orbitR}
            fill="none"
            stroke="var(--rule)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            animation: "sp-orbit 3.2s linear infinite",
            transformOrigin: "center",
          }}
        >
          {glyphs.map((g, i) => {
            const angle = (i / glyphs.length) * Math.PI * 2 - Math.PI / 2;
            const x = size / 2 + Math.cos(angle) * orbitR;
            const y = size / 2 + Math.sin(angle) * orbitR;
            return (
              <div
                key={g}
                style={{
                  position: "absolute",
                  left: x - 11,
                  top: y - 11,
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  background: "var(--paper)",
                  border: "1px solid var(--rule)",
                  color: "var(--ink-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    animation: "sp-rotate-rev 3.2s linear infinite",
                    display: "inline-block",
                  }}
                >
                  {g}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {label && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/* ── 6. LoaderShimmer — content placeholder ───────────────────────── */
export function LoaderShimmer({
  width = 320,
  lines = 3,
}: {
  width?: number | string;
  lines?: number;
}) {
  const widths = [0.95, 0.78, 0.62, 0.84, 0.55];
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <SPMonogram size={28} animated />
        <div
          style={{
            height: 10,
            width: 80,
            borderRadius: 3,
            background:
              "linear-gradient(90deg, var(--rule), var(--paper-2), var(--rule))",
            backgroundSize: "200% 100%",
            animation: "sp-shimmer 1.6s linear infinite",
          }}
        />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 12,
            width: `${widths[i % widths.length] * 100}%`,
            borderRadius: 4,
            background:
              "linear-gradient(90deg, var(--paper-2), var(--rule), var(--paper-2))",
            backgroundSize: "200% 100%",
            animation: `sp-shimmer 1.6s linear ${i * 0.12}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── 7. LoaderProgress — upload / publish ─────────────────────────── */
export function LoaderProgress({
  width = 360,
  label = "Publishing post",
  sublabel = "3 of 4 channels",
}: {
  width?: number | string;
  label?: string;
  sublabel?: string;
}) {
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SPMonogram size={32} animated />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              color: "var(--ink)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
              marginTop: 2,
            }}
          >
            {sublabel}
          </div>
        </div>
      </div>
      <div
        style={{
          height: 3,
          background: "var(--rule)",
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "40%",
            background: "var(--sp-accent)",
            borderRadius: 2,
            animation: "sp-progress 1.6s cubic-bezier(.65,.05,.36,1) infinite",
          }}
        />
      </div>
    </div>
  );
}

/* ── 8. LoaderSplash — full-screen cold start ─────────────────────── */
export function LoaderSplash({
  tagline = "An editorial studio for social",
}: {
  tagline?: string;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        zIndex: 9999,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <SPMonogram size={64} animated />
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 56,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            color: "var(--ink)",
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span>Social</span>
          <span style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
            plus
          </span>
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        {tagline}
      </div>
      <div
        style={{
          width: 180,
          height: 1,
          background: "var(--rule)",
          position: "relative",
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--ink)",
            transformOrigin: "left",
            animation:
              "sp-rule 1.8s cubic-bezier(.65,.05,.36,1) infinite, sp-rule-shift 3.6s steps(1) infinite",
          }}
        />
      </div>
    </div>
  );
}
