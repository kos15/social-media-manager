"use client";

import { useState, useRef } from "react";
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
  const [activePreview, setActivePreview] = useState("x");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setText(v);
    setSlashOpen(v.endsWith("/"));
  };

  const insertAI = (insert: string) => {
    setText((t) => t.replace(/\/$/, "") + insert);
    setSlashOpen(false);
    taRef.current?.focus();
  };

  const activePlatforms = PLATFORMS.filter((p) => selected[p.id]);
  const truncate = (t: string, limit: number) =>
    t.length > limit ? t.slice(0, limit) + "…" : t;

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
            <button className="sp-btn">
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
        {/* Editor pane */}
        <div
          className={mobileTab === "editor" ? "flex md:flex" : "hidden md:flex"}
          style={{
            padding: "var(--pad-3) var(--pad-4)",
            overflow: "auto",
            flexDirection: "column",
            gap: "var(--gap-3)",
          }}
        >
          {/* Platform + Tone row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--gap-2)",
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

          {/* Editor */}
          <div
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 280,
            }}
          >
            <textarea
              ref={taRef}
              value={text}
              onChange={onChange}
              placeholder="Write your post… type / for AI suggestions"
              style={{
                width: "100%",
                flex: 1,
                resize: "none",
                fontFamily: "var(--font-display)",
                fontSize: 24,
                lineHeight: 1.45,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
                background: "transparent",
                border: "none",
                outline: "none",
                minHeight: 280,
              }}
            />
            {/* Slash menu */}
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
                  boxShadow: "var(--shadow-md)",
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
                    style={{ width: 13, height: 13, color: "var(--ink-3)" }}
                  />
                  <span className="eyebrow">AI actions</span>
                </div>
                {AI_ACTIONS.map((it) => (
                  <div
                    key={it.key}
                    onClick={() => insertAI(it.insert)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--paper-2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
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
              <button className="sp-btn sp-btn-ghost">
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
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Clock style={{ width: 16, height: 16, color: "var(--ink-3)" }} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                  Schedule for Thursday, May 9 · 10:00 AM
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  Suggested — your audience peaks here
                </div>
              </div>
            </div>
            <button className="sp-btn">Change time</button>
          </div>
        </div>

        {/* Preview rail */}
        <div
          className={
            mobileTab === "preview" ? "flex md:flex" : "hidden md:flex"
          }
          style={{
            borderLeft: "1px solid var(--rule)",
            background: "var(--paper-2)",
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
            }}
          >
            <span className="eyebrow">Live preview</span>
            <div style={{ display: "flex", gap: 4 }}>
              {activePlatforms.map((p) => (
                <Glyph
                  key={p.id}
                  g={p.glyph}
                  active={activePreview === p.id}
                  size={20}
                  onClick={() => setActivePreview(p.id)}
                />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "var(--pad-2)" }}>
            {/* Preview card */}
            {(() => {
              const plat =
                PLATFORMS.find((p) => p.id === activePreview) || PLATFORMS[0];
              const preview = truncate(
                text,
                { x: 280, in: 600, ig: 400, yt: 600 }[plat.id] || 280,
              );
              const labels: Record<string, string> = {
                x: "X",
                in: "LinkedIn",
                ig: "Instagram",
                yt: "YouTube",
              };
              return (
                <div
                  className="sp-card"
                  style={{ padding: 0, overflow: "hidden" }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderBottom: "1px solid var(--rule)",
                    }}
                  >
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
                      }}
                    >
                      SP
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                        {plat.handle}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "var(--ink-3)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        2m · {labels[plat.id]}
                      </div>
                    </div>
                    <MoreHorizontal
                      style={{ width: 15, height: 15, color: "var(--ink-3)" }}
                    />
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {preview}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        height: 160,
                        borderRadius: 8,
                        background:
                          "repeating-linear-gradient(45deg, var(--paper-2), var(--paper-2) 8px, var(--paper-3) 8px, var(--paper-3) 16px)",
                        border: "1px solid var(--rule)",
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
                        hero image
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "10px 14px",
                      display: "flex",
                      gap: 18,
                      color: "var(--ink-3)",
                      borderTop: "1px solid var(--rule)",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                      }}
                    >
                      <Heart style={{ width: 13, height: 13 }} /> 0
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                      }}
                    >
                      <MessageCircle style={{ width: 13, height: 13 }} /> 0
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11,
                      }}
                    >
                      <Share2 style={{ width: 13, height: 13 }} /> 0
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {text.length}c
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Per-platform tone */}
            <div style={{ marginTop: "var(--gap-2)" }}>
              <div className="eyebrow" style={{ padding: "0 0 8px" }}>
                Per-platform tone
              </div>
              {activePlatforms.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Glyph g={p.glyph} active size={18} />
                    <span style={{ fontSize: 12 }}>{p.name}</span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--ink-3)",
                    }}
                  >
                    {p.tone} · {p.limit}c
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .composer-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
