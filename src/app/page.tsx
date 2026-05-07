"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

// ── Typewriter hook ──
function useTypewriter(phrases: string[], trigger: boolean) {
  const [text, setText] = useState("");
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!trigger) return;
    let pi = 0,
      ci = 0;
    let current = "";
    function tick() {
      if (pi >= phrases.length) return;
      const phrase = phrases[pi];
      if (ci < phrase.length) {
        current += phrase[ci++];
        setText(current);
        rafRef.current = setTimeout(tick, 18 + Math.random() * 24);
      } else {
        pi++;
        ci = 0;
        rafRef.current = setTimeout(tick, 360);
      }
    }
    tick();
    return () => {
      if (rafRef.current) clearTimeout(rafRef.current);
    };
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return text;
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [typeTrigger, setTypeTrigger] = useState(false);
  const mockRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

  const typedText = useTypewriter(
    [
      "We rebuilt our scheduling engine from scratch. ",
      "Posts now publish in under 200ms across all four platforms — ",
      "even on flaky mobile.",
    ],
    typeTrigger,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mockRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTypeTrigger(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(mockRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-stagger");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{`
        :root { scroll-behavior: smooth; }
        .landing { background: var(--paper); color: var(--ink); font-family: var(--font-ui, sans-serif); overflow-x: hidden; }
        .wrap { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .reveal.in { opacity: 1; transform: translateY(0); }
        .reveal-stagger > * { opacity: 0; transform: translateY(16px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .reveal-stagger.in > * { opacity: 1; transform: translateY(0); }
        .reveal-stagger.in > *:nth-child(1) { transition-delay: 0.05s; }
        .reveal-stagger.in > *:nth-child(2) { transition-delay: 0.15s; }
        .reveal-stagger.in > *:nth-child(3) { transition-delay: 0.25s; }
        .reveal-stagger.in > *:nth-child(4) { transition-delay: 0.35s; }
        @keyframes blink { 50% { opacity: 0; } }
        .caret { display: inline-block; width: 2px; height: 22px; background: var(--sp-accent); vertical-align: -4px; margin-left: 2px; animation: blink 1s steps(1) infinite; }
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .hero-mock-body { grid-template-columns: 1fr !important; }
          .hm-side { display: none !important; }
          .hm-rail { display: none !important; }
          .feature-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding: 60px 0 !important; }
          .feature-grid.reverse .feat-text { order: 1 !important; }
          .feature-grid.reverse .feat-mock { order: 2 !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .tgrid { grid-template-columns: 1fr !important; }
          .pgrid { grid-template-columns: 1fr !important; }
          .plan { border-right: 0 !important; border-bottom: 1px solid var(--rule) !important; }
          .plan:last-child { border-bottom: 0 !important; }
          .foot-top { grid-template-columns: 1fr 1fr !important; }
          .foot-brand { grid-column: 1 / -1 !important; }
          .wrap { padding: 0 20px !important; }
        }
        @media (max-width: 600px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .hero h1 { font-size: 48px !important; }
          .pgrid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="landing">
        {/* ── Nav ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: scrolled
              ? "color-mix(in oklch, var(--paper) 88%, transparent)"
              : "var(--paper)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${scrolled ? "var(--rule)" : "transparent"}`,
            transition: "border-color 0.2s",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 32px",
              height: 64,
              display: "flex",
              alignItems: "center",
              gap: 32,
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-display)",
                fontSize: 22,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "var(--ink)",
                  color: "var(--paper)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 18,
                }}
              >
                S
              </span>
              Social
              <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                plus
              </em>
            </Link>
            <div
              className="nav-links"
              style={{ display: "flex", gap: 24, marginLeft: 24 }}
            >
              {[
                ["Features", "#features"],
                ["Workflow", "#workflow"],
                ["Pricing", "#pricing"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  style={{
                    color: "var(--ink-2)",
                    fontSize: 13.5,
                    fontWeight: 450,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--ink)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--ink-2)")
                  }
                >
                  {label}
                </a>
              ))}
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <button
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: "1px solid var(--rule)",
                  background: "var(--paper)",
                  color: "var(--ink-2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {resolvedTheme === "dark" ? (
                    <>
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </>
                  ) : (
                    <>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </>
                  )}
                </svg>
              </button>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 32,
                  padding: "0 14px",
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 500,
                  border: "1px solid var(--rule)",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 32,
                  padding: "0 14px",
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 500,
                  background: "var(--ink)",
                  color: "var(--paper)",
                  textDecoration: "none",
                }}
              >
                Start free
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <header style={{ padding: "80px 0 100px", position: "relative" }}>
          <div className="wrap">
            <div
              className="reveal"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                border: "1px solid var(--rule)",
                borderRadius: 999,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-2)",
                background: "var(--paper)",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--sp-positive)",
                }}
              />
              v2.0 — AI Composer is live
            </div>
            <h1
              className="reveal"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(56px, 8vw, 104px)",
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
                margin: "0 0 28px",
                maxWidth: "14ch",
              }}
            >
              One studio for{" "}
              <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                four
              </em>
              <br />
              platforms.{" "}
              <span style={{ color: "var(--sp-accent)", fontStyle: "italic" }}>
                Published in seconds.
              </span>
            </h1>
            <p
              className="reveal"
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                color: "var(--ink-2)",
                maxWidth: "56ch",
                margin: "0 0 36px",
              }}
            >
              Socialplus is a quiet, editorial workspace for people who post a
              lot. Write once, preview everywhere, schedule the week — across X,
              LinkedIn, Instagram and YouTube.
            </p>
            <div
              className="reveal"
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Link
                href="/signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 46,
                  padding: "0 22px",
                  borderRadius: 8,
                  fontSize: 14.5,
                  fontWeight: 500,
                  background: "var(--ink)",
                  color: "var(--paper)",
                  textDecoration: "none",
                }}
              >
                Start free — 14 days
              </Link>
              <a
                href="#features"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 46,
                  padding: "0 22px",
                  borderRadius: 8,
                  fontSize: 14.5,
                  fontWeight: 500,
                  border: "1px solid var(--rule)",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
              >
                See how it works →
              </a>
            </div>
            <div
              className="reveal"
              style={{
                marginTop: 40,
                display: "flex",
                gap: 28,
                alignItems: "center",
                fontSize: 12.5,
                color: "var(--ink-3)",
              }}
            >
              <span
                style={{
                  color: "var(--ink)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.05em",
                }}
              >
                ★★★★★
              </span>
              <span>4.9 from 2,400+ creators</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>No credit card required</span>
            </div>

            {/* Product mock */}
            <div
              ref={mockRef}
              className="reveal"
              style={{
                marginTop: 80,
                border: "1px solid var(--rule)",
                borderRadius: 14,
                background: "var(--paper-2)",
                overflow: "hidden",
                boxShadow:
                  "0 1px 0 oklch(20% 0 0 / 0.04), 0 32px 80px -32px oklch(20% 0 0 / 0.18)",
              }}
            >
              <div
                style={{
                  height: 38,
                  borderBottom: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  gap: 8,
                  background: "var(--paper-2)",
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "var(--paper-3)",
                        border: "1px solid var(--rule)",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    marginLeft: 12,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ink-3)",
                  }}
                >
                  app.socialplus.io / composer
                </span>
              </div>
              <div
                className="hero-mock-body"
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr 320px",
                  minHeight: 480,
                }}
              >
                <aside
                  className="hm-side"
                  style={{
                    borderRight: "1px solid var(--rule)",
                    padding: "18px 12px",
                    background: "var(--paper)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--ink-3)",
                      padding: "8px 10px",
                    }}
                  >
                    Workspace
                  </div>
                  {[
                    ["Overview", false],
                    ["Composer", true],
                    ["Calendar", false],
                    ["Analytics", false],
                    ["Accounts", false],
                  ].map(([name, active]) => (
                    <div
                      key={name as string}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 6,
                        fontSize: 13,
                        color: active ? "var(--ink)" : "var(--ink-2)",
                        background: active ? "var(--paper-2)" : "transparent",
                        fontWeight: active ? 500 : 400,
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          border: "1.5px solid currentColor",
                          borderRadius: 3,
                          opacity: 0.7,
                          flexShrink: 0,
                        }}
                      />
                      {name}
                    </div>
                  ))}
                </aside>
                <main
                  style={{ padding: "32px 40px", background: "var(--paper)" }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                      marginBottom: 6,
                    }}
                  >
                    Workspace · New post
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 26,
                      margin: "0 0 24px",
                      fontWeight: 400,
                    }}
                  >
                    Compose
                  </h2>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      lineHeight: 1.5,
                      color: "var(--ink-2)",
                      borderLeft: "2px solid var(--sp-accent)",
                      padding: "4px 0 4px 18px",
                      maxWidth: "56ch",
                    }}
                  >
                    <span style={{ color: "var(--ink)" }}>{typedText}</span>
                    <span className="caret" />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 28,
                      paddingTop: 20,
                      borderTop: "1px solid var(--rule)",
                    }}
                  >
                    {["Confident", "Warm", "Witty"].map((t, i) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10.5,
                          padding: "4px 10px",
                          border: "1px solid var(--rule)",
                          borderRadius: 999,
                          color: i === 0 ? "var(--paper)" : "var(--ink-3)",
                          background: i === 0 ? "var(--ink)" : "transparent",
                          borderColor: i === 0 ? "var(--ink)" : "var(--rule)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        padding: "4px 10px",
                        border: "1px solid var(--rule)",
                        borderRadius: 999,
                        color: "var(--ink-3)",
                      }}
                    >
                      ⌘↵ to publish
                    </span>
                  </div>
                </main>
                <aside
                  className="hm-rail"
                  style={{
                    borderLeft: "1px solid var(--rule)",
                    padding: 18,
                    background: "var(--paper-2)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--ink-3)",
                      marginBottom: 12,
                    }}
                  >
                    Live preview
                  </div>
                  {[
                    {
                      plat: "X",
                      h: "@socialplus",
                      t: "2m · X",
                      body: "We rebuilt our scheduling engine. Posts now publish in under 200ms across all four platforms…",
                    },
                    {
                      plat: "in",
                      h: "Socialplus",
                      t: "2m · LinkedIn",
                      body: "We rebuilt our scheduling engine from scratch. Here's what changed under the hood, and why it matters for creators who post 50+ times a week.",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      style={{
                        border: "1px solid var(--rule)",
                        borderRadius: 8,
                        background: "var(--paper)",
                        padding: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "var(--paper-3)",
                            border: "1px solid var(--rule)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--ink-2)",
                          }}
                        >
                          SP
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 500 }}>
                          {card.h}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9.5,
                            color: "var(--ink-3)",
                            marginLeft: "auto",
                          }}
                        >
                          {card.t}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          lineHeight: 1.45,
                          color: "var(--ink-2)",
                        }}
                      >
                        {card.body}
                      </div>
                    </div>
                  ))}
                </aside>
              </div>
            </div>
          </div>
        </header>

        {/* ── Logo strip ── */}
        <section
          style={{
            padding: "60px 0",
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <div
            className="wrap reveal"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 32,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "var(--ink-3)",
              }}
            >
              Trusted by writers, makers and small teams at
            </span>
            {[
              "Lattice",
              "Brevity",
              "Folio",
              "Northstar",
              "Quill & Co.",
              "Studio West",
            ].map((name) => (
              <span
                key={name}
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 22,
                  color: "var(--ink-3)",
                  letterSpacing: "-0.01em",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section
          style={{ padding: "120px 0", borderBottom: "1px solid var(--rule)" }}
          id="features"
        >
          <div className="wrap">
            <div className="section-head reveal" style={{ marginBottom: 80 }}>
              <span
                style={{
                  display: "block",
                  marginBottom: 16,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--ink-3)",
                }}
              >
                Features · 01 — 05
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(40px, 5vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  margin: 0,
                  maxWidth: "18ch",
                }}
              >
                Five quiet tools.
                <br />
                <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                  One that writes for you.
                </em>
              </h2>
              <p
                style={{
                  marginTop: 18,
                  fontSize: 17,
                  color: "var(--ink-2)",
                  maxWidth: "56ch",
                  lineHeight: 1.55,
                }}
              >
                Every screen is built on a single editorial system — slow type,
                generous whitespace, no neon.
              </p>
            </div>

            {/* 01 Composer */}
            <FeatureRow
              num="01 — Composer"
              reverse={false}
              title={
                <>
                  Write once.
                  <br />
                  <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                    Publish everywhere.
                  </em>
                </>
              }
              lede="A single, slow editor at the center. Your text fans out into native previews for X, LinkedIn, Instagram and YouTube — updating as you type, with per-platform tone you can dial in chip-by-chip."
              items={[
                [
                  "Write",
                  "One pane, four platforms. No tab-switching. No copy-paste fatigue.",
                ],
                [
                  "Preview",
                  "Live cards mirror the real feed: character counts, image crops, link cards.",
                ],
                [
                  "Tone",
                  "Tap a chip — Confident, Warm, Witty, Reportorial — to shift voice per channel.",
                ],
              ]}
              linkText="Open the composer →"
              linkHref="/composer"
              mock={
                <MockShell title="Composer">
                  <div
                    style={{
                      padding: "22px 26px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      {[
                        ["𝕏", true],
                        ["in", true],
                        ["Ig", false],
                        ["▶", true],
                      ].map(([g, a]) => (
                        <span
                          key={g as string}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: a ? "var(--ink)" : "var(--paper-2)",
                            color: a ? "var(--paper)" : "var(--ink-2)",
                            border: `1px solid ${a ? "var(--ink)" : "var(--rule)"}`,
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 22,
                        lineHeight: 1.45,
                        color: "var(--ink)",
                      }}
                    >
                      Most schedulers wait. Ours doesn&apos;t.{" "}
                      <span style={{ color: "var(--ink-3)" }}>
                        We rebuilt the publishing pipeline from scratch.
                      </span>
                    </div>
                    <div
                      style={{
                        background: "var(--paper-2)",
                        border: "1px solid var(--rule)",
                        borderRadius: 8,
                        padding: 8,
                      }}
                    >
                      <div
                        style={{
                          padding: "6px 8px",
                          borderRadius: 4,
                          fontSize: 12.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          background: "var(--ink)",
                          color: "var(--paper)",
                        }}
                      >
                        ✦ Generate hook{" "}
                        <span
                          style={{
                            marginLeft: "auto",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            opacity: 0.7,
                          }}
                        >
                          ↵
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "6px 8px",
                          borderRadius: 4,
                          fontSize: 12.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: "var(--ink-2)",
                          marginTop: 2,
                        }}
                      >
                        → Continue writing{" "}
                        <span
                          style={{
                            marginLeft: "auto",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            opacity: 0.7,
                          }}
                        >
                          tab
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "6px 8px",
                          borderRadius: 4,
                          fontSize: 12.5,
                          color: "var(--ink-2)",
                          marginTop: 2,
                        }}
                      >
                        # Suggest hashtags
                      </div>
                    </div>
                  </div>
                </MockShell>
              }
            />

            {/* 02 AI */}
            <FeatureRow
              num="02 — AI Studio"
              reverse={true}
              title={
                <>
                  An assistant that
                  <br />
                  <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                    reads the room.
                  </em>
                </>
              }
              lede={
                <>
                  Type{" "}
                  <code
                    style={{
                      background: "var(--paper-2)",
                      padding: "1px 6px",
                      borderRadius: 3,
                      border: "1px solid var(--rule)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    /
                  </code>{" "}
                  in the editor — get hooks, hashtags, captions, and full
                  repurposes. Trained on your tone, scoped to your audience.
                </>
              }
              items={[
                [
                  "Hooks",
                  "Sharp first lines, ranked by predicted scroll-stopping power.",
                ],
                [
                  "Repurpose",
                  "Turn a long LinkedIn post into a five-tweet thread without rewriting.",
                ],
                [
                  "Brand",
                  "Upload a style guide once — every output respects it.",
                ],
              ]}
              linkText="See AI in action →"
              linkHref="/ai-studio"
              mock={
                <MockShell title="AI Studio">
                  <div
                    style={{
                      padding: "22px 26px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--ink-3)",
                        padding: "10px 12px",
                        background: "var(--paper-2)",
                        border: "1px solid var(--rule)",
                        borderRadius: 8,
                      }}
                    >
                      / generate hook → &ldquo;shipping calendar&rdquo;
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 19,
                        lineHeight: 1.5,
                        color: "var(--ink)",
                        padding: "14px 16px",
                        borderLeft: "2px solid var(--sp-accent)",
                      }}
                    >
                      &ldquo;Most teams ship on Friday afternoons. We ship at
                      9:14 every morning. Here&apos;s the system that made it
                      boring.&rdquo;
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["✦ Try another", "⤓ Insert", "⌘C Copy"].map((p) => (
                        <span
                          key={p}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            border: "1px solid var(--rule)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--ink-2)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {p}
                        </span>
                      ))}
                      <span
                        style={{
                          marginLeft: "auto",
                          padding: "6px 12px",
                          borderRadius: 999,
                          border: "1px solid var(--rule)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--ink-3)",
                        }}
                      >
                        12 / 50 today
                      </span>
                    </div>
                  </div>
                </MockShell>
              }
            />

            {/* 03 Calendar */}
            <FeatureRow
              num="03 — Calendar"
              reverse={false}
              title={
                <>
                  Your week,
                  <br />
                  <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                    as a river.
                  </em>
                </>
              }
              lede="Forget the cramped grid. Posts flow horizontally along the day — by hour, by platform, by status. Drag to reschedule. Collisions surface themselves."
              items={[
                [
                  "Hours",
                  "See the whole week's rhythm at a glance — peak slots, dead zones.",
                ],
                [
                  "Status",
                  "Queued, draft, published — distinguished by ink weight, not color noise.",
                ],
                [
                  "Drag",
                  "Move a post to a better slot. Times update across every platform.",
                ],
              ]}
              linkText="Plan your week →"
              linkHref="/calendar"
              mock={
                <MockShell title="Calendar · Week 19">
                  <div style={{ padding: "18px 22px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingBottom: 8,
                        borderBottom: "1px solid var(--rule)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--ink-3)",
                        paddingLeft: 60,
                      }}
                    >
                      {["6am", "9am", "12pm", "3pm", "6pm", "9pm"].map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    {[
                      {
                        day: "MON",
                        n: "5",
                        published: true,
                        left: "18%",
                        w: 130,
                        plat: "𝕏",
                        text: "Monday note…",
                      },
                      {
                        day: "TUE",
                        n: "6",
                        published: false,
                        left: "24%",
                        w: 170,
                        plat: "in",
                        text: "Rebuilt our engine…",
                      },
                      {
                        day: "WED",
                        n: "7",
                        today: true,
                        published: false,
                        left: "32%",
                        w: 140,
                        plat: "𝕏",
                        text: "Live Q&A now",
                      },
                    ].map((row) => (
                      <div
                        key={row.day}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "50px 1fr",
                          gap: 10,
                          padding: "14px 0",
                          borderBottom: "1px solid var(--rule)",
                          alignItems: "center",
                          minHeight: 50,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 22,
                            lineHeight: 1,
                            color: row.today
                              ? "var(--sp-accent)"
                              : "var(--ink)",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 9,
                              color: "var(--ink-3)",
                              display: "block",
                              marginBottom: 2,
                              letterSpacing: "0.1em",
                            }}
                          >
                            {row.day}
                          </span>
                          {row.n}
                        </div>
                        <div style={{ position: "relative", height: 32 }}>
                          <div
                            style={{
                              position: "absolute",
                              left: row.left,
                              width: row.w,
                              height: 30,
                              padding: "0 10px",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              border: "1px solid var(--rule-2)",
                              borderLeft: "2px solid var(--ink)",
                              borderRadius: 4,
                              background: "var(--paper)",
                              fontSize: 11,
                              color: "var(--ink-2)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              opacity: row.published ? 0.6 : 1,
                              background: row.published
                                ? "var(--paper-2)"
                                : "var(--paper)",
                            }}
                          >
                            <span
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: 3,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "var(--ink)",
                                color: "var(--paper)",
                                border: "1px solid var(--ink)",
                                fontFamily: "var(--font-mono)",
                                fontSize: 8,
                                fontWeight: 600,
                              }}
                            >
                              {row.plat}
                            </span>
                            {row.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </MockShell>
              }
            />

            {/* 04 Analytics */}
            <FeatureRow
              num="04 — Analytics"
              reverse={true}
              title={
                <>
                  Numbers, but
                  <br />
                  <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                    read like a story.
                  </em>
                </>
              }
              lede='"You reached 2.41M people this month. Up 18%." We open with the headline, not the dashboard. Drill in only if you want to.'
              items={[
                [
                  "Headline",
                  "Plain-English summaries surface what changed and why.",
                ],
                [
                  "Compare",
                  "Stack platforms on one chart. See which channel pulls its weight.",
                ],
                [
                  "Best time",
                  "We learn your audience and recommend the next slot to post.",
                ],
              ]}
              linkText="Read your numbers →"
              linkHref="/analytics"
              mock={
                <MockShell title="Analytics · 30d">
                  <div
                    style={{
                      padding: "22px 26px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                    }}
                  >
                    <div style={{ display: "flex", gap: 32 }}>
                      {[
                        ["Reach", "2.41M", "+18%"],
                        ["Engagement", "124.5K", "+12%"],
                        ["Best slot", "Thu · 10am", "predicted"],
                      ].map(([l, v, d]) => (
                        <div key={l as string}>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10,
                              color: "var(--ink-3)",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                            }}
                          >
                            {l}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: l === "Best slot" ? 18 : 28,
                              lineHeight: 1,
                              marginTop: 6,
                            }}
                          >
                            {v}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10.5,
                              color:
                                d === "predicted"
                                  ? "var(--ink-3)"
                                  : "var(--sp-positive)",
                              marginTop: 4,
                            }}
                          >
                            {d}
                          </div>
                        </div>
                      ))}
                    </div>
                    <svg
                      viewBox="0 0 600 100"
                      preserveAspectRatio="none"
                      style={{ width: "100%", height: "auto" }}
                    >
                      <polyline
                        points="0,80 50,72 100,68 150,55 200,58 250,42 300,38 350,30 400,32 450,22 500,18 550,12 600,10"
                        fill="none"
                        stroke="var(--ink)"
                        strokeWidth="1.5"
                      />
                      <polyline
                        points="0,90 50,86 100,82 150,78 200,72 250,68 300,62 350,58 400,54 450,48 500,44 550,40 600,36"
                        fill="none"
                        stroke="var(--ink-3)"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {[
                        ["X / Twitter", "84%", "845K"],
                        ["LinkedIn", "62%", "612K"],
                        ["YouTube", "42%", "421K"],
                      ].map(([name, pct, val]) => (
                        <div
                          key={name}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "80px 1fr 60px",
                            alignItems: "center",
                            gap: 12,
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                            }}
                          >
                            {name}
                          </span>
                          <div
                            style={{
                              height: 4,
                              background: "var(--paper-3)",
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                height: "100%",
                                width: pct,
                                background: "var(--ink)",
                                borderRadius: 2,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              textAlign: "right",
                            }}
                          >
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </MockShell>
              }
            />

            {/* 05 Accounts */}
            <FeatureRow
              num="05 — Accounts"
              reverse={false}
              title={
                <>
                  Connect once.
                  <br />
                  <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                    We handle the rest.
                  </em>
                </>
              }
              lede="OAuth into all four platforms in 90 seconds. Tokens refresh themselves. We warn you a week before anything expires — no surprise outages on launch day."
              items={[
                [
                  "Auto",
                  "Tokens refresh in the background. You never manage credentials.",
                ],
                [
                  "Warn",
                  "Email + in-app alert seven days before expiry, with one-click reconnect.",
                ],
                [
                  "Audit",
                  "Full log of every publish — who, what, when, which API.",
                ],
              ]}
              linkText="Connect your accounts →"
              linkHref="/accounts"
              mock={
                <MockShell title="Connected accounts">
                  <div
                    style={{
                      padding: "18px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0,
                    }}
                  >
                    {[
                      {
                        g: "𝕏",
                        name: "X / Twitter",
                        h: "@socialplus · 42.1K followers",
                        status: "Active",
                        active: true,
                      },
                      {
                        g: "in",
                        name: "LinkedIn",
                        h: "Socialplus · 68.3K followers",
                        status: "Active",
                        active: true,
                      },
                      {
                        g: "▶",
                        name: "YouTube",
                        h: "Socialplus · 21.7K followers",
                        status: "Active",
                        active: true,
                      },
                      {
                        g: "Ig",
                        name: "Instagram",
                        h: "@socialplus · token expired",
                        status: "Expired",
                        active: false,
                      },
                    ].map((row, i) => (
                      <div
                        key={row.name}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "32px 1fr auto",
                          alignItems: "center",
                          padding: "12px 0",
                          borderBottom:
                            i < 3 ? "1px solid var(--rule)" : "none",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 4,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: row.active
                              ? "var(--ink)"
                              : "var(--paper-2)",
                            color: row.active ? "var(--paper)" : "var(--ink-2)",
                            border: `1px solid ${row.active ? "var(--ink)" : "var(--rule)"}`,
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {row.g}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {row.name}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              color: "var(--ink-3)",
                            }}
                          >
                            {row.h}
                          </div>
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color:
                              row.status === "Active"
                                ? "var(--sp-positive)"
                                : "var(--sp-warn)",
                          }}
                        >
                          ● {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </MockShell>
              }
            />
          </div>
        </section>

        {/* ── Workflow ── */}
        <section
          style={{ padding: "120px 0", borderBottom: "1px solid var(--rule)" }}
          id="workflow"
        >
          <div className="wrap">
            <div className="reveal" style={{ marginBottom: 80 }}>
              <span
                style={{
                  display: "block",
                  marginBottom: 16,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--ink-3)",
                }}
              >
                Workflow
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(40px, 5vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  margin: 0,
                  maxWidth: "18ch",
                }}
              >
                From blank page
                <br />
                <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                  to four platforms.
                </em>
              </h2>
              <p
                style={{
                  marginTop: 18,
                  fontSize: 17,
                  color: "var(--ink-2)",
                  maxWidth: "56ch",
                  lineHeight: 1.55,
                }}
              >
                A typical post takes ninety seconds, start to finish.
              </p>
            </div>
            <div
              className="reveal-stagger steps-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 0,
                borderTop: "1px solid var(--rule)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              {[
                [
                  "01 / Connect",
                  "Plug in your accounts.",
                  "OAuth into X, LinkedIn, Instagram, and YouTube. Ninety seconds, four clicks.",
                ],
                [
                  "02 / Compose",
                  "Write one post.",
                  "Open the editor. Type — or hit / to let AI draft. Set the tone per channel.",
                ],
                [
                  "03 / Schedule",
                  "Pick a slot.",
                  "The calendar suggests your best time. Drag to anywhere else. Done.",
                ],
                [
                  "04 / Measure",
                  "Read the numbers.",
                  "Headlines, not heatmaps. We tell you what's working.",
                ],
              ].map(([num, h, p], i) => (
                <div
                  key={num}
                  style={{
                    padding: 32,
                    borderRight: i < 3 ? "1px solid var(--rule)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--ink-3)",
                      letterSpacing: "0.06em",
                      marginBottom: 16,
                    }}
                  >
                    {num}
                  </div>
                  <h4
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      margin: "0 0 10px",
                      lineHeight: 1.15,
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      color: "var(--ink-2)",
                      lineHeight: 1.55,
                    }}
                  >
                    {p}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section
          style={{ padding: "120px 0", borderBottom: "1px solid var(--rule)" }}
        >
          <div className="wrap">
            <div className="reveal" style={{ marginBottom: 80 }}>
              <span
                style={{
                  display: "block",
                  marginBottom: 16,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--ink-3)",
                }}
              >
                Voices
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(40px, 5vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                What people say
                <br />
                <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                  about Socialplus.
                </em>
              </h2>
            </div>
            <div
              className="tgrid reveal-stagger"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 24,
              }}
            >
              {[
                {
                  q: "I used to keep four browser tabs open and a Google Doc to track everything. Now I just open one window. The composer alone is worth the price.",
                  name: "Maria Rodríguez",
                  role: "Founder · Brevity",
                  initials: "MR",
                },
                {
                  q: "The week-river calendar is the first scheduler I haven't fought with. It looks like how I actually think about my week.",
                  name: "Jin Kim",
                  role: "Editor · Folio",
                  initials: "JK",
                },
                {
                  q: "I post sixty times a week across four platforms. Socialplus turned a daily three-hour ritual into a forty-minute Monday morning.",
                  name: "Aki Tanaka",
                  role: "Creator · 142k followers",
                  initials: "AT",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  style={{
                    padding: 32,
                    border: "1px solid var(--rule)",
                    borderRadius: 12,
                    background: "var(--paper)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    minHeight: 280,
                  }}
                >
                  <q
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      lineHeight: 1.35,
                      letterSpacing: "-0.01em",
                      quotes: '"\\201C""\\201D"',
                    }}
                  >
                    {t.q}
                  </q>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: "auto",
                    }}
                  >
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
                        fontSize: 12,
                        color: "var(--ink-2)",
                      }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--ink-3)",
                        }}
                      >
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section
          style={{ padding: "120px 0", borderBottom: "1px solid var(--rule)" }}
          id="pricing"
        >
          <div className="wrap">
            <div className="reveal" style={{ marginBottom: 80 }}>
              <span
                style={{
                  display: "block",
                  marginBottom: 16,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--ink-3)",
                }}
              >
                Pricing
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(40px, 5vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  margin: 0,
                }}
              >
                Three plans.
                <br />
                <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                  No surprises.
                </em>
              </h2>
              <p
                style={{
                  marginTop: 18,
                  fontSize: 17,
                  color: "var(--ink-2)",
                  maxWidth: "56ch",
                  lineHeight: 1.55,
                }}
              >
                Start free. Upgrade when you outgrow it. Cancel any time, no
                email tug-of-war.
              </p>
            </div>
            <div
              className="pgrid reveal-stagger"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 0,
                borderTop: "1px solid var(--rule)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              {[
                {
                  name: "Solo",
                  price: "$0",
                  per: "/mo",
                  desc: "For one creator finding their voice.",
                  items: [
                    "2 connected accounts",
                    "10 scheduled posts",
                    "20 AI generations / month",
                    "Basic analytics",
                  ],
                  cta: "Start free",
                  primary: false,
                },
                {
                  name: "Pro",
                  badge: "most popular",
                  price: "$19",
                  per: "/mo",
                  desc: "For makers shipping content weekly.",
                  items: [
                    "All 4 platforms",
                    "Unlimited scheduled posts",
                    "500 AI generations / month",
                    "Full analytics + best-time AI",
                    "Brand voice training",
                  ],
                  cta: "Try Pro free",
                  primary: true,
                },
                {
                  name: "Team",
                  price: "$49",
                  per: "/seat",
                  desc: "For small teams with shared inboxes.",
                  items: [
                    "Everything in Pro",
                    "Approval workflows",
                    "Shared content library",
                    "Audit log + role permissions",
                    "Priority support",
                  ],
                  cta: "Talk to us",
                  primary: false,
                },
              ].map((plan, i) => (
                <div
                  key={plan.name}
                  style={{
                    padding: "40px 32px",
                    borderRight: i < 2 ? "1px solid var(--rule)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    background: i === 1 ? "var(--paper-2)" : "var(--paper)",
                  }}
                  className="plan"
                >
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 26,
                      lineHeight: 1,
                    }}
                  >
                    {plan.name}
                    {plan.badge && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--sp-accent)",
                          marginLeft: 8,
                        }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 56,
                      lineHeight: 1,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {plan.price}
                    <small
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "var(--ink-3)",
                        marginLeft: 4,
                      }}
                    >
                      {plan.per}
                    </small>
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
                    {plan.desc}
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: "8px 0 0",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {plan.items.map((item) => (
                      <li
                        key={item}
                        style={{
                          fontSize: 13.5,
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                          color: "var(--ink-2)",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--ink)",
                            marginRight: 4,
                          }}
                        >
                          ·
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 40,
                      padding: "0 20px",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      border: "1px solid var(--rule)",
                      background: plan.primary ? "var(--ink)" : "var(--paper)",
                      color: plan.primary ? "var(--paper)" : "var(--ink)",
                      textDecoration: "none",
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section
          style={{
            textAlign: "center",
            padding: "140px 0",
            borderBottom: "1px solid var(--rule)",
          }}
          id="cta"
        >
          <div className="wrap reveal">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(48px, 7vw, 92px)",
                lineHeight: 1.0,
                margin: "0 0 28px",
                letterSpacing: "-0.03em",
                fontWeight: 400,
              }}
            >
              Spend less time
              <br />
              <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                posting.
              </em>{" "}
              More time
              <br />
              making.
            </h2>
            <p
              style={{
                fontSize: 17,
                color: "var(--ink-2)",
                maxWidth: "52ch",
                margin: "0 auto 36px",
              }}
            >
              Free for fourteen days. No credit card. No onboarding call. Just a
              quieter way to publish.
            </p>
            <div style={{ display: "inline-flex", gap: 12 }}>
              <Link
                href="/signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 48,
                  padding: "0 24px",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  background: "var(--ink)",
                  color: "var(--paper)",
                  textDecoration: "none",
                }}
              >
                Start free trial
              </Link>
              <Link
                href="/signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 48,
                  padding: "0 24px",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  border: "1px solid var(--rule)",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
              >
                Book a demo
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ padding: "80px 0 40px" }}>
          <div className="wrap">
            <div
              className="foot-top"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: 48,
                paddingBottom: 56,
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div className="foot-brand">
                <Link
                  href="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: "var(--ink)",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "var(--ink)",
                      color: "var(--paper)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 18,
                    }}
                  >
                    S
                  </span>
                  Social
                  <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                    plus
                  </em>
                </Link>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--ink-2)",
                    margin: "18px 0 24px",
                    maxWidth: "32ch",
                  }}
                >
                  A quiet, editorial workspace for people who post a lot.
                </p>
              </div>
              {[
                {
                  title: "Product",
                  links: [
                    ["Composer", "/composer"],
                    ["AI Studio", "/ai-studio"],
                    ["Calendar", "/calendar"],
                    ["Analytics", "/analytics"],
                  ],
                },
                {
                  title: "Company",
                  links: [
                    ["About", "#"],
                    ["Manifesto", "#"],
                    ["Press", "#"],
                    ["Careers", "#"],
                  ],
                },
                {
                  title: "Resources",
                  links: [
                    ["Documentation", "#"],
                    ["API reference", "#"],
                    ["Templates", "#"],
                    ["Status", "#"],
                  ],
                },
                {
                  title: "Legal",
                  links: [
                    ["Terms", "#"],
                    ["Privacy", "#"],
                    ["Cookies", "#"],
                    ["Security", "#"],
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <h5
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--ink-3)",
                      margin: "0 0 18px",
                      fontWeight: 500,
                    }}
                  >
                    {col.title}
                  </h5>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {col.links.map(([label, href]) => (
                      <li key={label}>
                        <Link
                          href={href}
                          style={{
                            fontSize: 13.5,
                            color: "var(--ink-2)",
                            textDecoration: "none",
                          }}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 28,
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                }}
              >
                © 2026 Socialplus, Inc. · All rights reserved.
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  ["𝕏", "X"],
                  ["in", "LinkedIn"],
                  ["▶", "YouTube"],
                ].map(([icon, label]) => (
                  <a
                    key={label}
                    href="#"
                    title={label}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: "1px solid var(--rule)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--ink-2)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// ── Shared sub-components ──
function MockShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--rule)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--paper)",
        boxShadow:
          "0 1px 0 oklch(20% 0 0 / 0.03), 0 20px 48px -20px oklch(20% 0 0 / 0.10)",
      }}
    >
      <div
        style={{
          height: 36,
          padding: "0 14px",
          borderBottom: "1px solid var(--rule)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--paper-2)",
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--paper-3)",
                border: "1px solid var(--rule)",
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            color: "var(--ink-3)",
            marginLeft: 8,
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function FeatureRow({
  num,
  title,
  lede,
  items,
  linkText,
  linkHref,
  mock,
  reverse,
}: {
  num: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  items: [string, string][];
  linkText: string;
  linkHref: string;
  mock: React.ReactNode;
  reverse: boolean;
}) {
  return (
    <div
      className={`feature-grid reveal ${reverse ? "reverse" : ""}`}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
        padding: "80px 0",
        borderTop: "1px solid var(--rule)",
      }}
    >
      <div className="feat-text" style={reverse ? { order: 2 } : {}}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--ink-3)",
            marginBottom: 16,
            letterSpacing: "0.04em",
          }}
        >
          {num}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(32px, 3.6vw, 48px)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            margin: "0 0 20px",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 16.5,
            color: "var(--ink-2)",
            margin: "0 0 24px",
            maxWidth: "48ch",
            lineHeight: 1.6,
          }}
        >
          {lede}
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
          {items.map(([k, v]) => (
            <li
              key={k}
              style={{
                padding: "10px 0",
                borderTop: "1px solid var(--rule)",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                fontSize: 14,
                color: "var(--ink-2)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  minWidth: 60,
                  flexShrink: 0,
                  paddingTop: 2,
                }}
              >
                {k}
              </span>
              <span>{v}</span>
            </li>
          ))}
          <li
            style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 0 }}
          />
        </ul>
        <Link
          href={linkHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13.5,
            fontWeight: 500,
            borderBottom: "1px solid var(--rule-2)",
            paddingBottom: 2,
            color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          {linkText}
        </Link>
      </div>
      <div className="feat-mock" style={reverse ? { order: 1 } : {}}>
        {mock}
      </div>
    </div>
  );
}
