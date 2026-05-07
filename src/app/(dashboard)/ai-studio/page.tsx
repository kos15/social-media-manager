"use client";

import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Copy,
  CheckCircle2,
  MessageSquare,
  Hash,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

const TABS = [
  {
    id: "caption",
    label: "Caption",
    icon: MessageSquare,
    hint: "Write a post from a topic or brief",
  },
  {
    id: "hashtag",
    label: "Hashtags",
    icon: Hash,
    hint: "Generate relevant hashtags for your content",
  },
  {
    id: "repurpose",
    label: "Repurpose",
    icon: RefreshCcw,
    hint: "Adapt existing content for a new platform",
  },
] as const;

type TabId = "caption" | "hashtag" | "repurpose";

const TONES = ["Confident", "Warm", "Witty", "Reportorial", "Inspiring"];

const EXAMPLES: Record<TabId, string> = {
  caption:
    "Write a LinkedIn post about our new scheduling engine — it publishes posts in under 200ms. Focus on the engineering achievement.",
  hashtag:
    "SaaS scheduling tool for social media creators — covers X, LinkedIn, Instagram and YouTube.",
  repurpose:
    "Paste your existing tweet or LinkedIn post here and pick the target platform below.",
};

export default function AIStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("caption");
  const [tone, setTone] = useState("Confident");
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input");

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: activeTab, tone }),
      });
      const data = await res.json();
      setResult(data.content);
      setMobileTab("output");
    } catch {
      setResult("Error generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid var(--rule)",
    background: "var(--paper)",
    color: "var(--ink)",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
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
        crumb="Workspace · AI"
        title="AI Studio"
        actions={
          result ? (
            <button
              className="sp-btn sp-btn-ghost"
              onClick={handleCopy}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              {copied ? (
                <CheckCircle2
                  style={{ width: 13, height: 13, color: "var(--sp-positive)" }}
                />
              ) : (
                <Copy style={{ width: 13, height: 13 }} />
              )}
              {copied ? "Copied" : "Copy result"}
            </button>
          ) : undefined
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
        {(["input", "output"] as const).map((tab) => (
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
            {tab === "input" ? "Prompt" : "Result"}
          </button>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 0,
          overflow: "hidden",
        }}
        className="ai-layout"
      >
        {/* Input panel */}
        <div
          className={mobileTab === "input" ? "block" : "hidden md:flex"}
          style={{
            padding: "var(--pad-3) var(--pad-4)",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "var(--gap-3)",
            borderRight: "1px solid var(--rule)",
          }}
        >
          {/* Mode tabs */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              Mode
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPrompt("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: `1px solid ${activeTab === tab.id ? "var(--ink-3)" : "var(--rule)"}`,
                    background:
                      activeTab === tab.id ? "var(--paper-2)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <tab.icon
                    style={{
                      width: 15,
                      height: 15,
                      color:
                        activeTab === tab.id ? "var(--ink)" : "var(--ink-3)",
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--ink)",
                        marginBottom: 2,
                      }}
                    >
                      {tab.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--ink-3)",
                        lineHeight: 1.4,
                      }}
                    >
                      {tab.hint}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={EXAMPLES[activeTab]}
              style={{
                ...inputStyle,
                flex: 1,
                resize: "none",
                minHeight: 160,
                lineHeight: 1.55,
                padding: "12px 14px",
                fontFamily: "var(--font-display)",
                fontSize: 16,
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--ink-3)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--rule)")
              }
            />
          </div>

          {/* Tone */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Tone
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 6,
              background: "var(--ink)",
              color: "var(--paper)",
              border: "none",
              fontSize: 14,
              fontWeight: 500,
              cursor: isGenerating || !prompt ? "not-allowed" : "pointer",
              opacity: isGenerating || !prompt ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
            }}
          >
            {isGenerating ? (
              <Loader2
                style={{
                  width: 15,
                  height: 15,
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : (
              <Wand2 style={{ width: 15, height: 15 }} />
            )}
            {isGenerating ? "Generating…" : "Generate"}
          </button>
        </div>

        {/* Output panel */}
        <div
          className={mobileTab === "output" ? "block" : "hidden md:flex"}
          style={{
            background: "var(--paper-2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "var(--pad-2) var(--pad-3)",
              borderBottom: "1px solid var(--rule)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles
                style={{ width: 13, height: 13, color: "var(--ink-3)" }}
              />
              <span className="eyebrow">Result</span>
            </div>
            {result && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="sp-btn sp-btn-ghost"
                  onClick={() => setResult("")}
                >
                  Clear
                </button>
                <button
                  className="sp-btn sp-btn-ghost"
                  onClick={handleGenerate}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <RefreshCcw style={{ width: 12, height: 12 }} /> Retry
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "var(--pad-3) var(--pad-4)",
            }}
          >
            {result ? (
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: "var(--ink)",
                  whiteSpace: "pre-wrap",
                  letterSpacing: "-0.01em",
                }}
              >
                {result}
              </div>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  color: "var(--ink-4)",
                }}
              >
                <Wand2 style={{ width: 36, height: 36 }} />
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 18,
                      marginBottom: 6,
                      color: "var(--ink-3)",
                    }}
                  >
                    Nothing yet.
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-4)" }}>
                    Write a prompt and hit Generate.
                  </div>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div
              style={{
                padding: "var(--pad-2) var(--pad-3)",
                borderTop: "1px solid var(--rule)",
                display: "flex",
                gap: 8,
              }}
            >
              <button
                className="sp-btn sp-btn-primary"
                onClick={handleCopy}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {copied ? (
                  <CheckCircle2 style={{ width: 13, height: 13 }} />
                ) : (
                  <Copy style={{ width: 13, height: 13 }} />
                )}
                {copied ? "Copied!" : "Copy to clipboard"}
              </button>
              <a
                href="/composer"
                className="sp-btn sp-btn-ghost"
                style={{ textDecoration: "none" }}
              >
                Open in Composer
              </a>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 768px) {
          .ai-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
