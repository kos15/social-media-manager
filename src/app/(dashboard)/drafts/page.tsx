"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PenLine,
  Clock,
  Trash2,
  Plus,
  Check,
  FileText,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { usePostStore } from "@/store/usePostStore";

interface Draft {
  id: string;
  content: string;
  mediaUrls: string[];
  scheduledDate: string;
  platforms: string[];
  updatedAt?: string;
}

const GLYPH_MAP: Record<string, string> = {
  TWITTER: "𝕏",
  LINKEDIN: "in",
  INSTAGRAM: "Ig",
  YOUTUBE: "▶",
};

const FILTERS: [string, string][] = [
  ["all", "All"],
  ["TWITTER", "X / Twitter"],
  ["LINKEDIN", "LinkedIn"],
  ["INSTAGRAM", "Instagram"],
  ["YOUTUBE", "YouTube"],
];

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function editedLabel(d: Draft) {
  if (!d.updatedAt) return "";
  try {
    return formatDistanceToNow(new Date(d.updatedAt), { addSuffix: true });
  } catch {
    return "";
  }
}

export default function DraftsPage() {
  const router = useRouter();
  const editPost = usePostStore((s) => s.editPost);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts?status=DRAFT");
      if (res.ok) setDrafts(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const shown = drafts.filter(
    (d) => filter === "all" || d.platforms.includes(filter),
  );

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const handleEdit = (d: Draft) => {
    editPost(d);
    router.push("/composer");
  };

  const scheduleIds = async (ids: string[]) => {
    if (!ids.length || busy) return;
    setBusy(true);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch("/api/posts", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: "SCHEDULED" }),
          }),
        ),
      );
      setSelected([]);
      await fetchDrafts();
    } finally {
      setBusy(false);
    }
  };

  const deleteIds = async (ids: string[]) => {
    if (!ids.length || busy) return;
    if (!confirm(`Delete ${ids.length} draft${ids.length > 1 ? "s" : ""}?`))
      return;
    setBusy(true);
    try {
      await Promise.all(
        ids.map((id) => fetch(`/api/posts?id=${id}`, { method: "DELETE" })),
      );
      setSelected([]);
      await fetchDrafts();
    } finally {
      setBusy(false);
    }
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
        crumb={`Library · ${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}
        title="Drafts"
        actions={
          <button
            className="sp-btn sp-btn-primary"
            onClick={() => router.push("/composer")}
          >
            <Plus style={{ width: 13, height: 13 }} /> New draft
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 90px" }}>
        {/* platform filter row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              className="sp-btn"
              onClick={() => setFilter(id)}
              style={
                filter === id
                  ? {
                      background: "var(--ink)",
                      color: "var(--paper)",
                      borderColor: "var(--ink)",
                    }
                  : {}
              }
            >
              {label}
            </button>
          ))}
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-3)",
            }}
          >
            {shown.length} shown
          </span>
        </div>

        {/* drafts list */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 60,
              color: "var(--ink-3)",
              fontSize: 13,
            }}
          >
            <Loader2
              style={{
                width: 16,
                height: 16,
                animation: "spin 1s linear infinite",
              }}
            />
            Loading drafts…
          </div>
        ) : shown.length === 0 ? (
          <div
            className="sp-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <FileText
              style={{ width: 28, height: 28, color: "var(--ink-4)" }}
            />
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                color: "var(--ink)",
              }}
            >
              No drafts yet
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", maxWidth: 360 }}>
              Start writing in the composer and hit “Save draft” — it will land
              here, ready to schedule later.
            </div>
            <button
              className="sp-btn sp-btn-primary"
              style={{ marginTop: 6 }}
              onClick={() => router.push("/composer")}
            >
              <PenLine style={{ width: 13, height: 13 }} /> Open composer
            </button>
          </div>
        ) : (
          <div className="sp-card" style={{ overflow: "hidden" }}>
            {shown.map((d) => (
              <div
                key={d.id}
                className="draft-row"
                data-selected={selected.includes(d.id) ? "1" : "0"}
              >
                <button
                  className={`draft-check${selected.includes(d.id) ? " on" : ""}`}
                  onClick={() => toggle(d.id)}
                  title="Select"
                >
                  {selected.includes(d.id) && (
                    <Check style={{ width: 11, height: 11 }} />
                  )}
                </button>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="draft-title">{d.content}</div>
                  <div className="draft-meta">
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {wordCount(d.content)} words
                    </span>
                    {editedLabel(d) && (
                      <>
                        <span>·</span>
                        <span style={{ fontFamily: "var(--font-mono)" }}>
                          {editedLabel(d)}
                        </span>
                      </>
                    )}
                    {d.mediaUrls.length > 0 && (
                      <>
                        <span>·</span>
                        <span style={{ fontFamily: "var(--font-mono)" }}>
                          {d.mediaUrls.length} media
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {d.platforms.map((p) => (
                    <span
                      key={p}
                      title={p}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--ink)",
                        color: "var(--paper)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        fontWeight: 600,
                      }}
                    >
                      {GLYPH_MAP[p] ?? p[0]}
                    </span>
                  ))}
                </div>
                <div className="draft-actions">
                  <button
                    className="sp-btn sp-btn-ghost"
                    onClick={() => handleEdit(d)}
                  >
                    <PenLine style={{ width: 13, height: 13 }} /> Edit
                  </button>
                  <button
                    className="sp-btn"
                    onClick={() => scheduleIds([d.id])}
                    disabled={busy}
                  >
                    <Clock style={{ width: 13, height: 13 }} /> Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* footnote */}
        {!loading && shown.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-3)",
              }}
            >
              Tap a row’s checkbox to select drafts for bulk actions.
            </span>
          </div>
        )}
      </div>

      {/* bulk action bar */}
      <div className={`draft-bulk${selected.length ? " show" : ""}`}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
          {selected.length} selected
        </span>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button
            className="sp-btn"
            onClick={() => scheduleIds(selected)}
            disabled={busy}
          >
            <Clock style={{ width: 13, height: 13 }} /> Schedule all
          </button>
          <button
            className="sp-btn"
            style={{ color: "var(--sp-danger)" }}
            onClick={() => deleteIds(selected)}
            disabled={busy}
          >
            <Trash2 style={{ width: 13, height: 13 }} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
