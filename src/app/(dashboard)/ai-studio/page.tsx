"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Wand2,
  Copy,
  CheckCircle2,
  MessageSquare,
  Hash,
  RefreshCcw,
  Loader2,
  CalendarPlus,
  Pencil,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Settings,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { usePostStore } from "@/store/usePostStore";
import { LoaderThinking } from "@/components/ui/sp-loaders";

/* ── Constants ────────────────────────────────────────────────────── */

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

const PLATFORMS = [
  { id: "TWITTER", label: "X / Twitter", Icon: Twitter, color: "#1DA1F2" },
  { id: "LINKEDIN", label: "LinkedIn", Icon: Linkedin, color: "#0A66C2" },
  { id: "INSTAGRAM", label: "Instagram", Icon: Instagram, color: "#E1306C" },
  { id: "YOUTUBE", label: "YouTube", Icon: Youtube, color: "#FF0000" },
];

const EXAMPLES: Record<TabId, string> = {
  caption:
    "Write a LinkedIn post about our new scheduling engine — it publishes posts in under 200ms. Focus on the engineering achievement.",
  hashtag:
    "SaaS scheduling tool for social media creators — covers X, LinkedIn, Instagram and YouTube.",
  repurpose:
    "Paste your existing tweet or LinkedIn post here and pick the target platform below.",
};

const AI_PROVIDERS = [
  {
    id: "openai",
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    models: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
    ],
  },
  {
    id: "gemini",
    label: "Google Gemini",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"],
  },
];

/* ── Platform content parser ─────────────────────────────────────── */

function parseByPlatform(
  content: string,
  platforms: string[],
): Record<string, string> {
  if (platforms.length <= 1) {
    return { [platforms[0] || "ALL"]: content };
  }
  const result: Record<string, string> = {};
  for (const platform of platforms) {
    const regex = new RegExp(
      `---${platform}---\\n([\\s\\S]*?)(?=---[A-Z_]+---|$)`,
    );
    const match = content.match(regex);
    result[platform] = match ? match[1].trim() : content;
  }
  // Fallback: if no separators found, show full content for all
  if (Object.values(result).every((v) => v === content)) {
    return platforms.length === 1
      ? { [platforms[0]]: content }
      : Object.fromEntries(platforms.map((p) => [p, content]));
  }
  return result;
}

/* ── Platform preview mini-cards ─────────────────────────────────── */

function TwitterPreview({ content }: { content: string }) {
  return (
    <div
      style={{
        background: "#000",
        borderRadius: 12,
        padding: "14px 16px",
        border: "1px solid #2f3336",
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>
              Your Name
            </span>
            <span style={{ color: "#71767b", fontSize: 12 }}>@yourhandle</span>
          </div>
          <p
            style={{
              color: "#e7e9ea",
              fontSize: 14,
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ content }: { content: string }) {
  return (
    <div
      style={{
        background: "#1b1f23",
        borderRadius: 10,
        border: "1px solid #374151",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          }}
        />
        <div>
          <div style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>
            Your Name
          </div>
          <div style={{ color: "#9ca3af", fontSize: 11 }}>
            Your Title · Company
          </div>
        </div>
      </div>
      <p
        style={{
          color: "#d1d5db",
          fontSize: 13,
          lineHeight: 1.6,
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </p>
    </div>
  );
}

function InstagramPreview({ content }: { content: string }) {
  return (
    <div
      style={{
        background: "#000",
        borderRadius: 10,
        border: "1px solid #374151",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Instagram style={{ width: 28, height: 28, color: "#4b5563" }} />
      </div>
      <div style={{ padding: "10px 12px" }}>
        <p
          style={{
            color: "#d1d5db",
            fontSize: 12,
            lineHeight: 1.5,
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <span style={{ fontWeight: 700, color: "#fff" }}>yourhandle </span>
          {content}
        </p>
      </div>
    </div>
  );
}

function YouTubePreview({ content }: { content: string }) {
  const lines = content.split("\n").filter(Boolean);
  const title = lines[0] || "Your video title";
  const description = lines.slice(1).join("\n");
  return (
    <div
      style={{
        background: "#0f0f0f",
        borderRadius: 10,
        border: "1px solid #374151",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          height: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Youtube style={{ width: 28, height: 28, color: "#ef4444" }} />
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div
          style={{
            fontWeight: 600,
            color: "#fff",
            fontSize: 13,
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        {description && (
          <p
            style={{
              color: "#9ca3af",
              fontSize: 11,
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: "pre-wrap",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical" as const,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Logo loader ──────────────────────────────────────────────────── */

function GeneratingSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 0",
      }}
    >
      <LoaderThinking />
    </div>
  );
}

/* ── Admin panel ─────────────────────────────────────────────────── */

interface AdminConfig {
  provider: string;
  model: string;
  hasOpenAIKey: boolean;
  hasAnthropicKey: boolean;
  hasGoogleKey: boolean;
  source: string;
}

function AdminPanel() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [showKeys, setShowKeys] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setProvider(data.provider || "openai");
        setModel(data.model || "gpt-4o-mini");
      })
      .catch(() => setError("Failed to load config"));
  }, []);

  const currentProviderData = AI_PROVIDERS.find((p) => p.id === provider);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = { provider, model };
      if (openaiKey) body.openaiKey = openaiKey;
      if (anthropicKey) body.anthropicKey = anthropicKey;
      if (googleKey) body.googleKey = googleKey;

      const res = await fetch("/api/admin/ai-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Refresh config
      const fresh = await fetch("/api/admin/ai-config").then((r) => r.json());
      setConfig(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        margin: "0 var(--pad-4) var(--pad-4)",
        border: "1px solid var(--rule)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--rule)",
          background: "var(--paper-2)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Settings style={{ width: 14, height: 14, color: "var(--ink-3)" }} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--ink-2)",
          }}
        >
          Admin · AI Configuration
        </span>
        {config && (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--ink-4)",
            }}
          >
            Source: {config.source}
          </span>
        )}
      </div>

      <div
        style={{
          padding: "18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Provider */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              const p = AI_PROVIDERS.find((x) => x.id === e.target.value);
              if (p) setModel(p.models[0]);
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid var(--rule)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: 13,
              fontFamily: "inherit",
              outline: "none",
            }}
          >
            {AI_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid var(--rule)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: 13,
              fontFamily: "inherit",
              outline: "none",
            }}
          >
            {(currentProviderData?.models || []).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* API Keys */}
        <div style={{ gridColumn: "1 / -1" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <label
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              API Keys
            </label>
            <button
              className="sp-btn sp-btn-ghost"
              style={{ height: 24, fontSize: 11, padding: "0 8px" }}
              onClick={() => setShowKeys((s) => !s)}
            >
              {showKeys ? (
                <EyeOff style={{ width: 11, height: 11 }} />
              ) : (
                <Eye style={{ width: 11, height: 11 }} />
              )}
              {showKeys ? "Hide" : "Show"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                id: "openai",
                label: "OpenAI",
                value: openaiKey,
                set: setOpenaiKey,
                hasKey: config?.hasOpenAIKey,
              },
              {
                id: "anthropic",
                label: "Anthropic",
                value: anthropicKey,
                set: setAnthropicKey,
                hasKey: config?.hasAnthropicKey,
              },
              {
                id: "google",
                label: "Google AI",
                value: googleKey,
                set: setGoogleKey,
                hasKey: config?.hasGoogleKey,
              },
            ].map(({ id, label, value, set, hasKey }) => (
              <div
                key={id}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    width: 70,
                    fontSize: 11,
                    color: "var(--ink-3)",
                    fontFamily: "var(--font-mono)",
                    flexShrink: 0,
                  }}
                >
                  {label}
                </div>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type={showKeys ? "text" : "password"}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={
                      hasKey ? "••••••••••••••••• (set)" : "Enter API key…"
                    }
                    style={{
                      width: "100%",
                      padding: "7px 12px",
                      paddingRight: hasKey ? 36 : 12,
                      borderRadius: 6,
                      border: "1px solid var(--rule)",
                      background: "var(--paper)",
                      color: "var(--ink)",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {hasKey && !value && (
                    <CheckCircle2
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 13,
                        height: 13,
                        color: "var(--sp-positive)",
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            margin: "0 18px 12px",
            padding: "8px 12px",
            borderRadius: 6,
            background: "var(--sp-warn-soft)",
            border: "1px solid var(--sp-warn)",
            color: "var(--sp-warn)",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
          {error}
        </div>
      )}

      <div
        style={{
          padding: "12px 18px",
          borderTop: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          className="sp-btn sp-btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <Loader2
              style={{
                width: 13,
                height: 13,
                animation: "spin 1s linear infinite",
              }}
            />
          ) : saved ? (
            <CheckCircle2 style={{ width: 13, height: 13 }} />
          ) : (
            <Save style={{ width: 13, height: 13 }} />
          )}
          {saved ? "Saved!" : saving ? "Saving…" : "Save configuration"}
        </button>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */

const HISTORY_KEY = "ai_studio_history";
const MAX_HISTORY = 3;

interface GenerationEntry {
  id: string;
  prompt: string;
  type: TabId;
  tone: string;
  platforms: string[];
  result: string;
  timestamp: number;
}

function loadHistory(): GenerationEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveToHistory(
  entry: Omit<GenerationEntry, "id" | "timestamp">,
  result: string,
) {
  const history = loadHistory();
  const newEntry: GenerationEntry = {
    id: Date.now().toString(),
    ...entry,
    result,
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AIStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPost, setPostContent, togglePlatform } = usePostStore();

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const initialTab = (searchParams.get("tab") as TabId) || "caption";
  const [activeTab, setActiveTab] = useState<TabId>(
    ["caption", "hashtag", "repurpose"].includes(initialTab)
      ? initialTab
      : "caption",
  );
  const [tone, setTone] = useState("Confident");
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "TWITTER",
  ]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [history, setHistory] = useState<GenerationEntry[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  // Check admin status silently + load history
  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then((r) => {
        if (r.ok) setIsAdmin(true);
      })
      .catch(() => {});
    setHistory(loadHistory());
  }, []);

  const togglePlatformSelection = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleGenerate = async () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setResult("");
    setGenError(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          type: activeTab,
          tone,
          platforms: selectedPlatforms,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResult(accumulated);
      }

      // Save to localStorage history
      const updated = saveToHistory(
        { prompt, type: activeTab, tone, platforms: selectedPlatforms },
        accumulated,
      );
      setHistory(updated);

      setMobileTab("output");
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      setGenError(
        err instanceof Error ? err.message : "Error generating content",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platformContent = result
    ? parseByPlatform(result, selectedPlatforms)
    : {};

  const handleSchedule = () => {
    resetPost();
    setPostContent(result);
    selectedPlatforms.forEach((p) => togglePlatform(p));
    router.push("/composer");
  };

  const handleEditInComposer = () => {
    const firstPlatform = selectedPlatforms[0];
    const content =
      selectedPlatforms.length > 1 && platformContent[firstPlatform]
        ? platformContent[firstPlatform]
        : result;
    resetPost();
    setPostContent(content);
    selectedPlatforms.forEach((p) => togglePlatform(p));
    router.push("/composer");
  };

  const restoreFromHistory = (entry: GenerationEntry) => {
    setPrompt(entry.prompt);
    setActiveTab(entry.type);
    setTone(entry.tone);
    setSelectedPlatforms(entry.platforms);
    setResult(entry.result);
    setGenError(null);
    setMobileTab("output");
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

      {/* Text-only banner */}
      <div
        style={{
          margin: "0 var(--pad-4)",
          padding: "8px 14px",
          borderRadius: 7,
          background: "var(--sp-accent-soft)",
          border: "1px solid var(--sp-accent)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "var(--sp-accent)",
          marginTop: "var(--pad-2)",
          flexShrink: 0,
        }}
      >
        <Info style={{ width: 13, height: 13, flexShrink: 0 }} />
        <span>
          <strong>Text generation only</strong> — image and video generation
          planned for future releases.
        </span>
      </div>

      {/* Mobile tab switcher */}
      <div
        className="md:hidden"
        style={{
          display: "flex",
          borderBottom: "1px solid var(--rule)",
          background: "var(--paper-2)",
          marginTop: "var(--pad-2)",
          flexShrink: 0,
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

      {/* Main split */}
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
        {/* ── LEFT: Input panel ─────────────────────────────────── */}
        <div
          className={mobileTab === "input" ? "flex" : "hidden md:flex"}
          style={{
            padding: "var(--pad-3) var(--pad-4)",
            overflow: "auto",
            flexDirection: "column",
            gap: "var(--gap-3)",
            borderRight: "1px solid var(--rule)",
          }}
        >
          {/* Mode */}
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

          {/* Platform selection */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Platforms
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PLATFORMS.map(({ id, label, Icon, color }) => {
                const active = selectedPlatforms.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => togglePlatformSelection(id)}
                    title={label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      borderRadius: 999,
                      border: `1px solid ${active ? color : "var(--rule)"}`,
                      background: active ? `${color}18` : "transparent",
                      color: active ? color : "var(--ink-3)",
                      fontSize: 11.5,
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.02em",
                      transition: "all 0.1s",
                    }}
                  >
                    <Icon style={{ width: 12, height: 12 }} />
                    {id === "TWITTER"
                      ? "X"
                      : id === "INSTAGRAM"
                        ? "IG"
                        : id === "YOUTUBE"
                          ? "YT"
                          : "LI"}
                  </button>
                );
              })}
            </div>
            {selectedPlatforms.length === 0 && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: "var(--sp-warn)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Select at least one platform
              </div>
            )}
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
                minHeight: 140,
                lineHeight: 1.55,
                padding: "12px 14px",
                fontFamily: "var(--font-display)",
                fontSize: 15,
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--ink-3)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--rule)")
              }
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                  handleGenerate();
              }}
            />
            <div
              style={{
                marginTop: 4,
                fontSize: 10.5,
                color: "var(--ink-4)",
                fontFamily: "var(--font-mono)",
              }}
            >
              ⌘ + Enter to generate
            </div>
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
            disabled={isGenerating || !prompt || selectedPlatforms.length === 0}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 6,
              background: "var(--ink)",
              color: "var(--paper)",
              border: "none",
              fontSize: 14,
              fontWeight: 500,
              cursor:
                isGenerating || !prompt || selectedPlatforms.length === 0
                  ? "not-allowed"
                  : "pointer",
              opacity:
                isGenerating || !prompt || selectedPlatforms.length === 0
                  ? 0.5
                  : 1,
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

          {/* ── History ──────────────────────────────────────────── */}
          {history.length > 0 && (
            <div>
              <div
                className="eyebrow"
                style={{
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Recent generations</span>
                <button
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink-4)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  onClick={() => {
                    localStorage.removeItem(HISTORY_KEY);
                    setHistory([]);
                  }}
                >
                  clear
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {history.map((entry) => {
                  const platformMeta = entry.platforms
                    .map((p) => PLATFORMS.find((x) => x.id === p))
                    .filter(Boolean);
                  return (
                    <button
                      key={entry.id}
                      onClick={() => restoreFromHistory(entry)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        padding: "10px 12px",
                        borderRadius: 7,
                        border: "1px solid var(--rule)",
                        background: "var(--paper-2)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "var(--ink-3)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "var(--rule)")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {platformMeta.map(
                            (m) =>
                              m && (
                                <m.Icon
                                  key={m.id}
                                  style={{
                                    width: 11,
                                    height: 11,
                                    color: m.color,
                                  }}
                                />
                              ),
                          )}
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "var(--font-mono)",
                              color: "var(--ink-3)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {entry.type}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "var(--font-mono)",
                              color: "var(--ink-4)",
                            }}
                          >
                            ·
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: "var(--font-mono)",
                              color: "var(--ink-4)",
                            }}
                          >
                            {entry.tone}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: "var(--font-mono)",
                            color: "var(--ink-4)",
                            flexShrink: 0,
                          }}
                        >
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--ink-2)",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                        }}
                      >
                        {entry.prompt}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Output panel ───────────────────────────────── */}
        <div
          ref={resultRef}
          className={mobileTab === "output" ? "flex" : "hidden md:flex"}
          style={{
            background: "var(--paper-2)",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Output header */}
          <div
            style={{
              padding: "var(--pad-2) var(--pad-3)",
              borderBottom: "1px solid var(--rule)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles
                style={{ width: 13, height: 13, color: "var(--ink-3)" }}
              />
              <span className="eyebrow">Result</span>
              {isGenerating && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--sp-accent)",
                    letterSpacing: "0.05em",
                  }}
                >
                  STREAMING
                </span>
              )}
            </div>
            {result && !isGenerating && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="sp-btn sp-btn-ghost"
                  onClick={() => {
                    setResult("");
                    setGenError(null);
                  }}
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

          {/* Output body */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "var(--pad-3) var(--pad-4)",
            }}
          >
            {genError ? (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: "var(--sp-warn-soft)",
                  border: "1px solid var(--sp-warn)",
                  color: "var(--sp-warn)",
                  fontSize: 13,
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <AlertCircle
                  style={{ width: 14, height: 14, marginTop: 1, flexShrink: 0 }}
                />
                {genError}
              </div>
            ) : isGenerating && !result ? (
              <GeneratingSkeleton />
            ) : result ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Per-platform previews */}
                {selectedPlatforms.map((platform) => {
                  const content = platformContent[platform] || result;
                  const meta = PLATFORMS.find((p) => p.id === platform);
                  return (
                    <div key={platform}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        {meta && (
                          <meta.Icon
                            style={{ width: 13, height: 13, color: meta.color }}
                          />
                        )}
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--ink-3)",
                          }}
                        >
                          {meta?.label || platform}
                        </span>
                      </div>
                      {platform === "TWITTER" && (
                        <TwitterPreview content={content} />
                      )}
                      {platform === "LINKEDIN" && (
                        <LinkedInPreview content={content} />
                      )}
                      {platform === "INSTAGRAM" && (
                        <InstagramPreview content={content} />
                      )}
                      {platform === "YOUTUBE" && (
                        <YouTubePreview content={content} />
                      )}
                    </div>
                  );
                })}
                {/* Raw text (collapsed by default if platform previews shown) */}
                {selectedPlatforms.length > 0 && (
                  <details style={{ marginTop: 4 }}>
                    <summary
                      style={{
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--ink-4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        userSelect: "none",
                        marginBottom: 8,
                      }}
                    >
                      Raw output
                    </summary>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        lineHeight: 1.7,
                        color: "var(--ink-3)",
                        whiteSpace: "pre-wrap",
                        background: "var(--paper-3)",
                        padding: "12px 14px",
                        borderRadius: 6,
                        border: "1px solid var(--rule)",
                      }}
                    >
                      {result}
                    </div>
                  </details>
                )}
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

          {/* Output footer — shown after successful generation */}
          {result && !isGenerating && (
            <div
              style={{
                padding: "var(--pad-2) var(--pad-3)",
                borderTop: "1px solid var(--rule)",
                display: "flex",
                gap: 8,
                flexShrink: 0,
                flexWrap: "wrap",
              }}
            >
              <button
                className="sp-btn sp-btn-primary"
                onClick={handleSchedule}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <CalendarPlus style={{ width: 13, height: 13 }} />
                Schedule post
              </button>
              <button
                className="sp-btn sp-btn-ghost"
                onClick={handleEditInComposer}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Pencil style={{ width: 13, height: 13 }} />
                Edit in Composer
              </button>
              <button
                className="sp-btn sp-btn-ghost"
                onClick={handleCopy}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {copied ? (
                  <CheckCircle2
                    style={{
                      width: 13,
                      height: 13,
                      color: "var(--sp-positive)",
                    }}
                  />
                ) : (
                  <Copy style={{ width: 13, height: 13 }} />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin panel — only shown to admins */}
      {isAdmin && (
        <div style={{ flexShrink: 0, borderTop: "1px solid var(--rule)" }}>
          <button
            onClick={() => setShowAdmin((s) => !s)}
            style={{
              width: "100%",
              padding: "10px var(--pad-4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-3)",
              fontSize: 11.5,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <Settings style={{ width: 12, height: 12 }} />
            Admin: AI Configuration
            {showAdmin ? (
              <ChevronUp
                style={{ width: 12, height: 12, marginLeft: "auto" }}
              />
            ) : (
              <ChevronDown
                style={{ width: 12, height: 12, marginLeft: "auto" }}
              />
            )}
          </button>
          {showAdmin && <AdminPanel />}
        </div>
      )}

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

export default function AIStudioPage() {
  return (
    <Suspense>
      <AIStudioContent />
    </Suspense>
  );
}
