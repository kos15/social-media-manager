"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Users,
  Shield,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

/* ── Types ─────────────────────────────────────────────────────────── */

interface AIConfig {
  provider: string;
  model: string;
  hasOpenAIKey: boolean;
  hasAnthropicKey: boolean;
  hasGoogleKey: boolean;
  source: string;
}

interface AppUser {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { posts: number; socialAccounts: number };
}

/* ── Constants ─────────────────────────────────────────────────────── */

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

/* ── Sub-components ─────────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  label,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  badge?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        paddingBottom: 14,
        borderBottom: "1px solid var(--rule)",
        marginBottom: 20,
      }}
    >
      <Icon style={{ width: 14, height: 14, color: "var(--ink-3)" }} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          color: "var(--ink)",
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </span>
      {badge && (
        <span
          style={{
            marginLeft: 4,
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            padding: "2px 8px",
            borderRadius: 999,
            background: "var(--paper-3)",
            color: "var(--ink-3)",
            border: "1px solid var(--rule)",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function AIConfigSection() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [showKeys, setShowKeys] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    const data = await fetch("/api/admin/ai-config").then((r) => r.json());
    setConfig(data);
    setProvider(data.provider || "openai");
    setModel(data.model || "gpt-4o-mini");
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

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
      await loadConfig();
      // Clear key inputs after save
      setOpenaiKey("");
      setAnthropicKey("");
      setGoogleKey("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 6,
    border: "1px solid var(--rule)",
    background: "var(--paper)",
    color: "var(--ink)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div className="sp-card" style={{ padding: "24px" }}>
      <SectionHeader
        icon={Settings}
        label="AI Configuration"
        badge={config ? `source: ${config.source}` : undefined}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 24,
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
          <div style={{ position: "relative" }}>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                const p = AI_PROVIDERS.find((x) => x.id === e.target.value);
                if (p) setModel(p.models[0]);
              }}
              style={{ ...fieldStyle, appearance: "none", paddingRight: 32 }}
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 13,
                height: 13,
                color: "var(--ink-3)",
                pointerEvents: "none",
              }}
            />
          </div>
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
          <div style={{ position: "relative" }}>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ ...fieldStyle, appearance: "none", paddingRight: 32 }}
            >
              {(currentProviderData?.models || []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 13,
                height: 13,
                color: "var(--ink-3)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--ink-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            API Keys
          </span>
          <button
            className="sp-btn sp-btn-ghost"
            style={{ height: 26, fontSize: 11, padding: "0 10px" }}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <div
                style={{
                  width: 80,
                  fontSize: 12,
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-mono)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {hasKey && (
                  <CheckCircle2
                    style={{
                      width: 11,
                      height: 11,
                      color: "var(--sp-positive)",
                    }}
                  />
                )}
                {label}
              </div>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type={showKeys ? "text" : "password"}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={
                    hasKey ? "●●●●●●●●●●●●●● (configured)" : "Paste API key…"
                  }
                  style={{
                    ...fieldStyle,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    paddingRight: hasKey && !value ? 36 : 12,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "var(--ink-4)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Keys stored in database. Leave blank to keep existing key.
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 14,
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
  );
}

function UsersSection() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/admin/users").then((r) => r.json());
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleRole = async (user: AppUser) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setUpdating(user.id);
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
      );
    } catch {
      setError("Role update failed");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="sp-card" style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 14,
          borderBottom: "1px solid var(--rule)",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Users style={{ width: 14, height: 14, color: "var(--ink-3)" }} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Users
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--paper-3)",
              color: "var(--ink-3)",
              border: "1px solid var(--rule)",
            }}
          >
            {users.length}
          </span>
        </div>
        <button
          className="sp-btn sp-btn-ghost"
          onClick={loadUsers}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          <RefreshCw
            style={{
              width: 12,
              height: 12,
              animation: loading ? "spin 1s linear infinite" : "none",
            }}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 14,
            padding: "8px 12px",
            borderRadius: 6,
            background: "var(--sp-warn-soft)",
            border: "1px solid var(--sp-warn)",
            color: "var(--sp-warn)",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0",
            color: "var(--ink-4)",
            gap: 8,
          }}
        >
          <Loader2
            style={{
              width: 14,
              height: 14,
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ fontSize: 13 }}>Loading users…</span>
        </div>
      ) : users.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--ink-4)",
            fontSize: 13,
          }}
        >
          No users found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 80px 80px 100px",
              padding: "6px 12px",
              borderRadius: "6px 6px 0 0",
              background: "var(--paper-2)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {["User", "Joined", "Posts", "Accounts", "Role"].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--ink-3)",
                }}
              >
                {h}
              </span>
            ))}
          </div>
          {users.map((user, i) => (
            <div
              key={user.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 80px 80px 100px",
                padding: "10px 12px",
                alignItems: "center",
                borderBottom:
                  i < users.length - 1 ? "1px solid var(--rule)" : "none",
                background: i % 2 === 0 ? "var(--paper)" : "var(--paper-2)",
              }}
            >
              {/* User info */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name || "—"}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ink-3)",
                    fontFamily: "var(--font-mono)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.email || "—"}
                </div>
              </div>

              {/* Joined */}
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                })}
              </div>

              {/* Posts */}
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {user._count.posts}
              </div>

              {/* Accounts */}
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {user._count.socialAccounts}
              </div>

              {/* Role toggle */}
              <div>
                <button
                  onClick={() => toggleRole(user)}
                  disabled={updating === user.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 8px",
                    borderRadius: 999,
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.05em",
                    fontWeight: 500,
                    border: `1px solid ${user.role === "ADMIN" ? "var(--sp-accent)" : "var(--rule)"}`,
                    background:
                      user.role === "ADMIN"
                        ? "var(--sp-accent-soft)"
                        : "transparent",
                    color:
                      user.role === "ADMIN"
                        ? "var(--sp-accent)"
                        : "var(--ink-3)",
                    cursor: "pointer",
                    opacity: updating === user.id ? 0.5 : 1,
                  }}
                >
                  {updating === user.id ? (
                    <Loader2
                      style={{
                        width: 9,
                        height: 9,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <Shield style={{ width: 9, height: 9 }} />
                  )}
                  {user.role}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main admin page ────────────────────────────────────────────────── */

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then((r) => {
        if (r.ok) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        setAuthorized(false);
        router.replace("/dashboard");
      });
  }, [router]);

  if (authorized === null) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 10,
          color: "var(--ink-4)",
        }}
      >
        <Loader2
          style={{
            width: 16,
            height: 16,
            animation: "spin 1s linear infinite",
          }}
        />
        <span style={{ fontSize: 13 }}>Checking access…</span>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <PageHeader crumb="System · Admin" title="Admin Panel" />

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
        {/* Admin notice */}
        <div
          style={{
            padding: "8px 14px",
            borderRadius: 7,
            background: "var(--sp-accent-soft)",
            border: "1px solid var(--sp-accent)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--sp-accent)",
          }}
        >
          <Shield style={{ width: 13, height: 13, flexShrink: 0 }} />
          Admin access — changes affect all users.
        </div>

        <AIConfigSection />
        <UsersSection />
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
