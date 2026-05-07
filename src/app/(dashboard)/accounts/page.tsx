"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

interface SocialAccount {
  id: string;
  platform: "TWITTER" | "LINKEDIN" | "INSTAGRAM" | "YOUTUBE";
  username: string;
  profileImage?: string;
  status: "ACTIVE" | "EXPIRED" | "DISCONNECTED";
  expiresAt?: string;
  createdAt: string;
}

const PLATFORM_CONFIG = {
  TWITTER: {
    name: "X / Twitter",
    glyph: "𝕏",
    connectUrl: "/api/connect/twitter",
    envKey: "TWITTER_CLIENT_ID",
  },
  LINKEDIN: {
    name: "LinkedIn",
    glyph: "in",
    connectUrl: "/api/connect/linkedin",
    envKey: "LINKEDIN_CLIENT_ID",
  },
  INSTAGRAM: {
    name: "Instagram",
    glyph: "Ig",
    connectUrl: "/api/connect/instagram",
    envKey: "INSTAGRAM_CLIENT_ID",
  },
  YOUTUBE: {
    name: "YouTube",
    glyph: "▶",
    connectUrl: "/api/connect/youtube",
    envKey: "GOOGLE_CLIENT_ID",
  },
} as const;

function Glyph({
  g,
  active,
  size = 32,
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
        fontSize: size * 0.38,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {g}
    </span>
  );
}

function AccountsContent() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const searchParams = useSearchParams();

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/accounts");
      if (!res.ok) {
        setAccounts([]);
        return;
      }
      const data = await res.json();
      setAccounts(data);
    } catch {
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success) {
      const platform =
        PLATFORM_CONFIG[success.toUpperCase() as keyof typeof PLATFORM_CONFIG];
      showToast(`Connected ${platform?.name ?? success}`, "success");
    } else if (error) {
      const messages: Record<string, string> = {
        twitter_denied: "Twitter connection was denied.",
        linkedin_denied: "LinkedIn connection was denied.",
        instagram_denied: "Instagram connection was denied.",
        youtube_denied: "YouTube connection was denied.",
        twitter_failed: "Twitter connection failed. Check your API keys.",
        linkedin_failed: "LinkedIn connection failed. Check your API keys.",
        instagram_failed: "Instagram connection failed. Check your API keys.",
        youtube_failed: "YouTube connection failed. Check your API keys.",
      };
      showToast(messages[error] ?? `Connection error: ${error}`, "error");
    }
  }, [fetchAccounts, searchParams]);

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast("Account disconnected.", "success");
    } catch {
      showToast("Failed to disconnect.", "error");
    } finally {
      setDisconnecting(null);
    }
  };

  const connectedPlatforms = new Set(accounts.map((a) => a.platform));
  const unconnected = (
    Object.keys(PLATFORM_CONFIG) as Array<keyof typeof PLATFORM_CONFIG>
  ).filter((p) => !connectedPlatforms.has(p));
  const isExpired = (a: SocialAccount) =>
    a.expiresAt && new Date(a.expiresAt) < new Date();
  const expiredAccounts = accounts.filter((a) => isExpired(a));
  const activeAccounts = accounts.filter((a) => !isExpired(a));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 8,
            boxShadow: "var(--shadow-md)",
            fontSize: 13,
            fontWeight: 500,
            background:
              toast.type === "success"
                ? "var(--sp-positive-soft)"
                : "var(--sp-warn-soft)",
            color:
              toast.type === "success"
                ? "var(--sp-positive)"
                : "var(--sp-warn)",
            border: `1px solid ${toast.type === "success" ? "var(--sp-positive)" : "var(--sp-warn)"}`,
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle style={{ width: 15, height: 15 }} />
          ) : (
            <AlertTriangle style={{ width: 15, height: 15 }} />
          )}
          {toast.message}
        </div>
      )}

      <PageHeader
        crumb="Workspace · Settings"
        title="Accounts"
        actions={
          <>
            <button onClick={fetchAccounts} className="sp-btn sp-btn-ghost">
              <RefreshCw
                style={{
                  width: 13,
                  height: 13,
                  ...(isLoading
                    ? { animation: "spin 1s linear infinite" }
                    : {}),
                }}
              />
            </button>
            <a
              href={
                unconnected[0]
                  ? PLATFORM_CONFIG[unconnected[0]].connectUrl
                  : "#"
              }
              className="sp-btn sp-btn-primary"
              style={{ textDecoration: "none" }}
            >
              <Plus style={{ width: 13, height: 13 }} /> Connect new
            </a>
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
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "var(--gap-3)",
            alignItems: "end",
          }}
          className="responsive-stack"
        >
          <div>
            <div className="eyebrow" style={{ paddingBottom: 8 }}>
              {accounts.length} platforms · {activeAccounts.length} active
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(24px, 3vw, 36px)",
                lineHeight: 1.1,
              }}
            >
              Where you publish.
            </div>
          </div>
          <div
            style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}
          >
            Connect each platform once. We refresh tokens automatically and warn
            you a week before they expire.
            {expiredAccounts.length > 0 && (
              <>
                {" "}
                <strong style={{ color: "var(--sp-warn)" }}>
                  {expiredAccounts
                    .map((a) => PLATFORM_CONFIG[a.platform].name)
                    .join(", ")}{" "}
                  need{expiredAccounts.length === 1 ? "s" : ""} attention now.
                </strong>
              </>
            )}
          </div>
        </div>

        {/* Expired callouts */}
        {expiredAccounts.map((a) => {
          const cfg = PLATFORM_CONFIG[a.platform];
          return (
            <div
              key={a.id}
              style={{
                padding: "var(--pad-2)",
                border: "1px solid var(--rule)",
                borderLeft: "3px solid var(--sp-warn)",
                borderRadius: 8,
                background: "var(--sp-warn-soft)",
                display: "flex",
                alignItems: "center",
                gap: "var(--gap-2)",
                flexWrap: "wrap",
              }}
            >
              <AlertTriangle
                style={{
                  width: 18,
                  height: 18,
                  color: "var(--sp-warn)",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {cfg.name} token expired
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink-3)",
                    marginTop: 2,
                  }}
                >
                  Posts to{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {a.username}
                  </span>{" "}
                  are paused until you reconnect.
                </div>
              </div>
              <a
                href={cfg.connectUrl}
                className="sp-btn"
                style={{ textDecoration: "none", flexShrink: 0 }}
              >
                Reconnect {cfg.name}
              </a>
            </div>
          );
        })}

        {/* Loading skeleton */}
        {isLoading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              border: "1px solid var(--rule)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  padding: "14px var(--pad-2)",
                  background: "var(--paper)",
                  borderBottom: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    background: "var(--paper-3)",
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 13,
                      background: "var(--paper-3)",
                      borderRadius: 4,
                    }}
                  />
                  <div
                    style={{
                      width: 80,
                      height: 11,
                      background: "var(--paper-3)",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connected accounts list */}
        {!isLoading && accounts.length > 0 && (
          <div>
            <div className="eyebrow" style={{ marginBottom: "var(--gap-1)" }}>
              Connected
            </div>
            <div
              style={{
                border: "1px solid var(--rule)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {activeAccounts.map((a, i) => {
                const cfg = PLATFORM_CONFIG[a.platform];
                const since = new Date(a.createdAt).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" },
                );
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "42px 1fr 120px 80px",
                      alignItems: "center",
                      padding: "14px var(--pad-2)",
                      borderTop: i ? "1px solid var(--rule)" : "none",
                      gap: 14,
                    }}
                    className="account-row"
                  >
                    <Glyph g={cfg.glyph} active size={32} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {cfg.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--ink-3)",
                        }}
                      >
                        {a.username}
                      </div>
                    </div>
                    <div>
                      <div className="eyebrow" style={{ fontSize: 9 }}>
                        Since
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--ink-2)",
                        }}
                      >
                        {since}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--sp-positive)",
                        }}
                      >
                        ● Active
                      </span>
                      <button
                        onClick={() => handleDisconnect(a.id)}
                        disabled={disconnecting === a.id}
                        className="sp-btn sp-btn-ghost"
                        style={{ padding: 4 }}
                        title="Disconnect"
                      >
                        {disconnecting === a.id ? (
                          <RefreshCw
                            style={{
                              width: 13,
                              height: 13,
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        ) : (
                          <MoreVertical style={{ width: 13, height: 13 }} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reconnect expired */}
        {!isLoading && expiredAccounts.length > 0 && (
          <div>
            <div className="eyebrow" style={{ marginBottom: "var(--gap-1)" }}>
              Reconnect
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--gap-1)",
              }}
            >
              {expiredAccounts.map((a) => {
                const cfg = PLATFORM_CONFIG[a.platform];
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "42px 1fr auto auto",
                      alignItems: "center",
                      padding: "14px var(--pad-2)",
                      border: "1px dashed var(--rule-2)",
                      borderRadius: 8,
                      gap: 14,
                      background: "var(--paper-2)",
                    }}
                    className="account-row"
                  >
                    <Glyph g={cfg.glyph} active={false} size={32} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {cfg.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--ink-3)",
                        }}
                      >
                        {a.username}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--sp-warn)",
                      }}
                    >
                      ● Expired
                    </span>
                    <a
                      href={cfg.connectUrl}
                      className="sp-btn sp-btn-primary"
                      style={{
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Reconnect{" "}
                      <ExternalLink style={{ width: 11, height: 11 }} />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Connect new platforms */}
        {!isLoading && unconnected.length > 0 && (
          <div>
            <div className="eyebrow" style={{ marginBottom: "var(--gap-1)" }}>
              {accounts.length === 0
                ? "Get started — connect a platform"
                : "Add more platforms"}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "var(--gap-1)",
              }}
            >
              {unconnected.map((platform) => {
                const cfg = PLATFORM_CONFIG[platform];
                return (
                  <a
                    key={platform}
                    href={cfg.connectUrl}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px var(--pad-2)",
                      border: "1px dashed var(--rule)",
                      borderRadius: 8,
                      textDecoration: "none",
                      transition: "all 0.1s",
                      background: "var(--paper)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--ink-3)";
                      e.currentTarget.style.background = "var(--paper-2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--rule)";
                      e.currentTarget.style.background = "var(--paper)";
                    }}
                  >
                    <Glyph g={cfg.glyph} active={false} size={32} />
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--ink)",
                        }}
                      >
                        {cfg.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--ink-3)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Plus style={{ width: 10, height: 10 }} /> Connect
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* OAuth credentials info */}
        <div className="sp-card" style={{ padding: "var(--pad-2)" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                padding: 8,
                border: "1px solid var(--rule)",
                borderRadius: 6,
                flexShrink: 0,
              }}
            >
              <Info style={{ width: 14, height: 14, color: "var(--ink-3)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  marginBottom: 4,
                }}
              >
                OAuth credentials
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-2)",
                  lineHeight: 1.55,
                  marginBottom: 12,
                }}
              >
                For self-hosted deployments, register your callback URLs in each
                platform&apos;s developer portal and add the keys to your{" "}
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--paper-2)",
                    padding: "1px 5px",
                    borderRadius: 3,
                    border: "1px solid var(--rule)",
                  }}
                >
                  .env
                </code>{" "}
                file.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "var(--gap-1)",
                }}
              >
                {(
                  Object.entries(PLATFORM_CONFIG) as [
                    keyof typeof PLATFORM_CONFIG,
                    (typeof PLATFORM_CONFIG)[keyof typeof PLATFORM_CONFIG],
                  ][]
                ).map(([key, cfg]) => (
                  <div
                    key={key}
                    style={{
                      padding: "10px 12px",
                      border: "1px solid var(--rule)",
                      borderRadius: 6,
                      background: "var(--paper-2)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Glyph g={cfg.glyph} active size={18} />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--ink-2)",
                      }}
                    >
                      {cfg.envKey}=
                      <span style={{ color: "var(--ink-3)" }}>•••••••••</span>
                    </span>
                  </div>
                ))}
              </div>
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
        @media (max-width: 900px) {
          .responsive-stack {
            grid-template-columns: 1fr !important;
          }
          .account-row {
            grid-template-columns: 42px 1fr !important;
          }
          .account-row > *:nth-child(3),
          .account-row > *:nth-child(4) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "var(--ink-3)",
            fontSize: 13,
          }}
        >
          Loading accounts…
        </div>
      }
    >
      <AccountsContent />
    </Suspense>
  );
}
