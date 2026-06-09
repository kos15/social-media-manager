"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarClock,
  X,
  Undo2,
  Redo2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { usePostStore } from "@/store/usePostStore";
import { DateTimePicker } from "@/components/ui/DateTimePicker";

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
    type: "caption",
    suffix:
      "Write ONLY a compelling opening hook (1-2 lines max). No intro, no explanation.",
  },
  {
    key: "continue",
    label: "Continue writing",
    hint: "Extend the current paragraph",
    type: "caption",
    suffix:
      "Continue writing from where this ends. Match the existing style and voice. Output only the continuation.",
  },
  {
    key: "hashtags",
    label: "Suggest hashtags",
    hint: "Platform-relevant tags with rationale",
    type: "hashtag",
    suffix: "",
  },
  {
    key: "cta",
    label: "Add call-to-action",
    hint: "Drive a click",
    type: "caption",
    suffix:
      "Write ONLY a short call-to-action line (max 1 line). No intro, no explanation.",
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

const STORE_TO_COMPOSER: Record<string, string> = {
  TWITTER: "x",
  LINKEDIN: "in",
  INSTAGRAM: "ig",
  YOUTUBE: "yt",
};

function defaultScheduleDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d;
}

function formatScheduleLabel(d: Date): string {
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ComposerPage() {
  const router = useRouter();
  const {
    currentPost,
    selectedPlatforms: storePlatforms,
    editingPostId,
    resetPost,
  } = usePostStore();

  const [text, setText] = useState(() => currentPost || SAMPLE);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    if (storePlatforms.length > 0) {
      const mapped: Record<string, boolean> = {
        x: false,
        in: false,
        ig: false,
        yt: false,
      };
      storePlatforms.forEach((p) => {
        const key = STORE_TO_COMPOSER[p];
        if (key) mapped[key] = true;
      });
      return mapped;
    }
    return { x: true, in: true, ig: false, yt: true };
  });
  const [tone, setTone] = useState("Confident");
  const [slashOpen, setSlashOpen] = useState(false);
  const [activePreview, setActivePreview] = useState("x");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  // Scheduling state
  const [scheduledDate, setScheduledDate] = useState<Date>(defaultScheduleDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Media state
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI suggestions state
  const [suggestions, setSuggestions] = useState<
    { platform: string; content: string }[]
  >([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [suggestionsType, setSuggestionsType] = useState<
    "caption" | "hashtag" | null
  >(null);
  const [suggestionsActionKey, setSuggestionsActionKey] = useState<
    string | null
  >(null);

  // Undo/Redo history
  const historyRef = useRef<string[]>([currentPost || SAMPLE]);
  const historyIndexRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const taRef = useRef<HTMLTextAreaElement>(null);

  // Clear store after reading so next fresh visit starts blank
  useEffect(() => {
    if (currentPost) resetPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive platform IDs for API (reverse map composer IDs → store IDs)
  const COMPOSER_TO_STORE: Record<string, string> = {
    x: "TWITTER",
    in: "LINKEDIN",
    ig: "INSTAGRAM",
    yt: "YOUTUBE",
  };

  const activePlatformIds = Object.entries(selected)
    .filter(([, on]) => on)
    .map(([id]) => COMPOSER_TO_STORE[id])
    .filter(Boolean);

  const handleSchedule = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const method = editingPostId ? "PUT" : "POST";
      const body = {
        ...(editingPostId ? { id: editingPostId } : {}),
        content: text,
        mediaUrls,
        scheduledDate: scheduledDate.toISOString(),
        platforms: activePlatformIds,
      };
      const res = await fetch("/api/posts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to schedule");
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        router.push("/calendar");
      }, 1200);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to schedule post",
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublishNow = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          mediaUrls,
          scheduledDate: new Date().toISOString(),
          platforms: activePlatformIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to publish");
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        router.push("/calendar");
      }, 1200);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to publish post",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMediaClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (mediaUrls.length + files.length > 4) {
      setUploadError("Max 4 media attachments");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setMediaUrls((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const PLATFORM_LABELS: Record<string, string> = {
    TWITTER: "X / Twitter",
    LINKEDIN: "LinkedIn",
    INSTAGRAM: "Instagram",
    YOUTUBE: "YouTube",
  };

  function cleanContent(content: string, type: "caption" | "hashtag"): string {
    if (type === "hashtag") {
      // Extract only #hashtag tokens — strip " — explanation" from each line
      return content
        .split("\n")
        .map((line) => line.split(/\s*[—–-]{1,2}\s/)[0].trim())
        .filter((line) => line.startsWith("#"))
        .join(" ");
    }
    // Captions: strip common AI meta-commentary preamble/postamble
    return content
      .replace(/^(here'?s?( is)?|this (is|would be)|below is)[^\n]*\n+/i, "")
      .replace(/\n+(let me know[^\n]*)$/i, "")
      .trim();
  }

  function parsePlatformContent(
    raw: string,
    platforms: string[],
  ): { platform: string; content: string }[] {
    if (platforms.length <= 1) {
      return [{ platform: platforms[0] || "", content: raw.trim() }];
    }
    const results: { platform: string; content: string }[] = [];
    for (let i = 0; i < platforms.length; i++) {
      const sep = `---${platforms[i]}---`;
      const idx = raw.indexOf(sep);
      if (idx === -1) continue;
      const start = idx + sep.length;
      const nextIdx =
        platforms
          .slice(i + 1)
          .map((p) => raw.indexOf(`---${p}---`, start))
          .filter((n) => n !== -1)
          .sort((a, b) => a - b)[0] ?? raw.length;
      results.push({
        platform: platforms[i],
        content: raw.slice(start, nextIdx).trim(),
      });
    }
    return results.length > 0
      ? results
      : [{ platform: "", content: raw.trim() }];
  }

  const generateSuggestions = async (
    type: "caption" | "hashtag",
    promptSuffix?: string,
    actionKey?: string,
  ) => {
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    setSuggestions([]);
    setSuggestionsType(type);
    setSuggestionsActionKey(actionKey || null);
    setSlashOpen(false);

    const baseText = text.replace(/\/$/, "");
    const prompt = promptSuffix
      ? `${baseText}\n\n---\nInstruction: ${promptSuffix}`
      : baseText;
    const platforms =
      activePlatformIds.length > 0 ? activePlatformIds : ["TWITTER"];

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type, tone, platforms }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error || "AI generation failed",
        );
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      setSuggestions(
        parsePlatformContent(fullText, platforms).map((s) => ({
          ...s,
          content: cleanContent(s.content, type),
        })),
      );
    } catch (err) {
      setSuggestionsError(
        err instanceof Error ? err.message : "Generation failed",
      );
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const applySuggestion = (content: string) => {
    const base = text.replace(/\/$/, "").trimEnd();
    // hook → prepend; everything else (hashtags, cta, continue) → append
    const newText =
      suggestionsActionKey === "hook"
        ? content + "\n\n" + base
        : base + "\n\n" + content;
    pushToHistory(newText);
    setText(newText);
    setSuggestions([]);
    setSuggestionsType(null);
    setSuggestionsActionKey(null);
    taRef.current?.focus();
  };

  const handleHashtagClick = () =>
    generateSuggestions("hashtag", undefined, "hashtags");

  const syncHistoryState = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const pushToHistory = (value: string) => {
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
    trimmed.push(value);
    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
    syncHistoryState();
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setText(historyRef.current[historyIndexRef.current]);
      syncHistoryState();
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      setText(historyRef.current[historyIndexRef.current]);
      syncHistoryState();
    }
  };

  const handleAIClick = () => {
    setText((t) => (t.endsWith("/") ? t : t + "/"));
    setSlashOpen(true);
    setTimeout(() => taRef.current?.focus(), 50);
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setText(v);
    setSlashOpen(v.endsWith("/"));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushToHistory(v), 600);
  };

  const insertAI = (key: string) => {
    const action = AI_ACTIONS.find((a) => a.key === key);
    if (!action) return;
    generateSuggestions(
      action.type as "caption" | "hashtag",
      action.suffix || undefined,
      key,
    );
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
            {saveError && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: "var(--sp-warn)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <AlertCircle style={{ width: 12, height: 12 }} />
                {saveError}
              </span>
            )}
            {saveSuccess && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: "var(--sp-positive)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <CheckCircle2 style={{ width: 12, height: 12 }} />
                Saved!
              </span>
            )}
            <button className="sp-btn sp-btn-ghost" disabled={saving}>
              <RefreshCw style={{ width: 13, height: 13 }} /> Save draft
            </button>
            <button
              className="sp-btn"
              onClick={handleSchedule}
              disabled={saving || !text.trim()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: saving || !text.trim() ? 0.5 : 1,
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
              ) : (
                <Clock style={{ width: 13, height: 13 }} />
              )}
              Schedule
            </button>
            <button
              className="sp-btn sp-btn-primary"
              onClick={handlePublishNow}
              disabled={saving || !text.trim()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: saving || !text.trim() ? 0.5 : 1,
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
              ) : (
                <Send style={{ width: 13, height: 13 }} />
              )}
              Publish now
            </button>
          </>
        }
      />

      {/* Mobile tab switcher */}
      <div
        className="lg:hidden"
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
          className={mobileTab === "editor" ? "flex lg:flex" : "hidden lg:flex"}
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
                    onClick={() => !suggestionsLoading && insertAI(it.key)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      cursor: suggestionsLoading ? "not-allowed" : "pointer",
                      opacity: suggestionsLoading ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!suggestionsLoading)
                        e.currentTarget.style.background = "var(--paper-2)";
                    }}
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

          {/* AI Suggestions panel */}
          {(suggestionsLoading ||
            suggestions.length > 0 ||
            suggestionsError) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles
                    style={{ width: 12, height: 12, color: "var(--ink-3)" }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--ink-3)",
                    }}
                  >
                    {suggestionsLoading
                      ? "Generating…"
                      : suggestionsType === "hashtag"
                        ? "Hashtag suggestions"
                        : "AI suggestions"}
                  </span>
                </div>
                {!suggestionsLoading && (
                  <button
                    onClick={() => {
                      setSuggestions([]);
                      setSuggestionsError(null);
                      setSuggestionsType(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--ink-3)",
                      display: "flex",
                      alignItems: "center",
                      padding: 2,
                    }}
                  >
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>

              {suggestionsLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--rule)",
                    background: "var(--paper-2)",
                  }}
                >
                  <Loader2
                    style={{
                      width: 14,
                      height: 14,
                      color: "var(--ink-3)",
                      animation: "spin 1s linear infinite",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--ink-3)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Thinking…
                  </span>
                </div>
              )}

              {suggestionsError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--rule)",
                    background: "var(--paper-2)",
                    fontSize: 12,
                    color: "var(--sp-warn)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <AlertCircle
                    style={{ width: 12, height: 12, flexShrink: 0 }}
                  />{" "}
                  {suggestionsError}
                </div>
              )}

              {/* Suggestion cards */}
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="sp-card"
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {s.platform && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          fontSize: 10.5,
                          fontFamily: "var(--font-mono)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--ink-3)",
                          fontWeight: 600,
                        }}
                      >
                        {PLATFORM_LABELS[s.platform] || s.platform}
                      </span>
                    </div>
                  )}
                  <pre
                    style={{
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                      fontFamily: "var(--font-display)",
                      margin: 0,
                      color: "var(--ink)",
                    }}
                  >
                    {s.content}
                  </pre>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="sp-btn sp-btn-primary"
                      onClick={() => applySuggestion(s.content)}
                      style={{ fontSize: 11.5 }}
                    >
                      Apply
                    </button>
                    <button
                      className="sp-btn sp-btn-ghost"
                      onClick={() =>
                        setSuggestions((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      style={{ fontSize: 11.5 }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Media thumbnails */}
          {(mediaUrls.length > 0 || uploading || uploadError) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {uploadError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "var(--sp-warn)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <AlertCircle style={{ width: 11, height: 11 }} />{" "}
                  {uploadError}
                </div>
              )}
              {mediaUrls.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {mediaUrls.map((url, i) => (
                    <div
                      key={url}
                      style={{
                        position: "relative",
                        width: 72,
                        height: 72,
                        borderRadius: 6,
                        overflow: "hidden",
                        border: "1px solid var(--rule)",
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`media ${i}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        onClick={() =>
                          setMediaUrls((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        style={{
                          position: "absolute",
                          top: 3,
                          right: 3,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.6)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          padding: 0,
                        }}
                      >
                        <X style={{ width: 10, height: 10 }} />
                      </button>
                    </div>
                  ))}
                  {uploading && (
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 6,
                        border: "1px dashed var(--rule)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Loader2
                        style={{
                          width: 18,
                          height: 18,
                          color: "var(--ink-3)",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
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
              {/* Undo / Redo */}
              <button
                className="sp-btn sp-btn-ghost"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo"
                style={{
                  opacity: canUndo ? 1 : 0.35,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Undo2 style={{ width: 13, height: 13 }} />
              </button>
              <button
                className="sp-btn sp-btn-ghost"
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo"
                style={{
                  opacity: canRedo ? 1 : 0.35,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Redo2 style={{ width: 13, height: 13 }} />
              </button>

              <div
                style={{ width: 1, background: "var(--rule)", margin: "0 2px" }}
              />

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <button
                className="sp-btn sp-btn-ghost"
                onClick={handleMediaClick}
                disabled={uploading || mediaUrls.length >= 4}
                style={{
                  opacity: mediaUrls.length >= 4 ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {uploading ? (
                  <Loader2
                    style={{
                      width: 13,
                      height: 13,
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <ImageIcon style={{ width: 13, height: 13 }} />
                )}
                Media {mediaUrls.length > 0 ? `(${mediaUrls.length}/4)` : ""}
              </button>
              <button
                className="sp-btn sp-btn-ghost"
                onClick={handleHashtagClick}
                disabled={suggestionsLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: suggestionsLoading ? 0.5 : 1,
                }}
              >
                <Hash style={{ width: 13, height: 13 }} /> Hashtag
              </button>
              <button
                className="sp-btn sp-btn-ghost"
                onClick={handleAIClick}
                disabled={suggestionsLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: suggestionsLoading ? 0.5 : 1,
                }}
              >
                {suggestionsLoading ? (
                  <Loader2
                    style={{
                      width: 13,
                      height: 13,
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <Sparkles style={{ width: 13, height: 13 }} />
                )}
                AI
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
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--pad-1) var(--pad-2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CalendarClock
                style={{
                  width: 16,
                  height: 16,
                  color: "var(--ink-3)",
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                  {formatScheduleLabel(scheduledDate)}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  Scheduled publish time
                </div>
              </div>
            </div>
            <button
              className="sp-btn"
              onClick={() => setShowDatePicker((v) => !v)}
            >
              {showDatePicker ? "Done" : "Change time"}
            </button>
            {showDatePicker && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 6px)",
                  right: 0,
                  zIndex: 50,
                }}
              >
                <DateTimePicker
                  value={scheduledDate}
                  min={new Date()}
                  onChange={(d) => setScheduledDate(d)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Preview rail */}
        <div
          className={
            mobileTab === "preview" ? "flex lg:flex" : "hidden lg:flex"
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
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 1023px) {
          .composer-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
