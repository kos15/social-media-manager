"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  CheckCircle,
  AlertCircle,
  Trash2,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Bell,
  User,
  RefreshCw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoaderRule } from "@/components/ui/sp-loaders";

type Platform = "TWITTER" | "LINKEDIN" | "INSTAGRAM" | "YOUTUBE";

interface SavedCredential {
  platform: Platform;
  clientId: string;
  clientSecretMasked: string;
  webhookVerifyToken: string | null;
  updatedAt: string;
}

interface FormState {
  clientId: string;
  clientSecret: string;
  webhookVerifyToken: string;
  showSecret: boolean;
  saving: boolean;
  removing: boolean;
  error: string | null;
}

const GLYPH_MAP: Record<Platform, string> = {
  TWITTER: "𝕏",
  LINKEDIN: "in",
  INSTAGRAM: "Ig",
  YOUTUBE: "▶",
};

const PLATFORM_CONFIG: Record<
  Platform,
  {
    name: string;
    devUrl: string;
    callbackPath: string;
    fields: {
      key: string;
      label: string;
      placeholder: string;
      required: true;
    }[];
    notes: string;
  }
> = {
  TWITTER: {
    name: "X / Twitter",
    devUrl: "https://developer.x.com/en/portal/dashboard",
    callbackPath: "/api/connect/twitter/callback",
    fields: [
      {
        key: "clientId",
        label: "Client ID (OAuth 2.0)",
        placeholder: "e.g. M1M5R3BMVy13QmpScXkzTUt5OE4...",
        required: true,
      },
      {
        key: "clientSecret",
        label: "Client Secret",
        placeholder: "Enter your X app Client Secret",
        required: true,
      },
    ],
    notes:
      "OAuth 2.0 with PKCE. In the Developer Portal → Your App → Settings → User authentication settings, enable Read + Write permissions, set App Type to 'Web App', and add the Callback URL above. Required scopes: tweet.read, tweet.write, users.read, offline.access.",
  },
  LINKEDIN: {
    name: "LinkedIn",
    devUrl: "https://www.linkedin.com/developers/apps",
    callbackPath: "/api/connect/linkedin/callback",
    fields: [
      {
        key: "clientId",
        label: "Client ID",
        placeholder: "Enter your LinkedIn Client ID",
        required: true,
      },
      {
        key: "clientSecret",
        label: "Client Secret",
        placeholder: "Enter your LinkedIn Client Secret",
        required: true,
      },
    ],
    notes:
      "Requires 'openid', 'profile', 'email', and 'w_member_social' scopes on your LinkedIn app.",
  },
  INSTAGRAM: {
    name: "Instagram",
    devUrl: "https://developers.facebook.com/apps",
    callbackPath: "/api/connect/instagram/callback",
    fields: [
      {
        key: "clientId",
        label: "App ID (Client ID)",
        placeholder: "Enter your Meta App ID",
        required: true,
      },
      {
        key: "clientSecret",
        label: "App Secret",
        placeholder: "Enter your Meta App Secret",
        required: true,
      },
    ],
    notes:
      "Uses Instagram Basic Display API (Meta Developer App). Enable 'user_profile' and 'user_media' scopes.",
  },
  YOUTUBE: {
    name: "YouTube",
    devUrl: "https://console.cloud.google.com/apis/credentials",
    callbackPath: "/api/connect/youtube/callback",
    fields: [
      {
        key: "clientId",
        label: "Google Client ID",
        placeholder: "Enter your Google OAuth Client ID",
        required: true,
      },
      {
        key: "clientSecret",
        label: "Google Client Secret",
        placeholder: "Enter your Google Client Secret",
        required: true,
      },
    ],
    notes:
      "Google OAuth 2.0 with YouTube Data API v3. Enable YouTube Data API v3 in your Google Cloud project.",
  },
};

const PLATFORMS: Platform[] = ["TWITTER", "LINKEDIN", "INSTAGRAM", "YOUTUBE"];

const defaultFormState = (): FormState => ({
  clientId: "",
  clientSecret: "",
  webhookVerifyToken: "",
  showSecret: false,
  saving: false,
  removing: false,
  error: null,
});

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 6,
  border: "1px solid var(--rule)",
  background: "var(--paper)",
  color: "var(--ink)",
  fontSize: 13,
  outline: "none",
  fontFamily: "var(--font-mono)",
  boxSizing: "border-box" as const,
};

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 16px",
        borderRadius: 8,
        background:
          type === "success"
            ? "var(--sp-positive-soft)"
            : "var(--sp-warn-soft)",
        border: `1px solid ${type === "success" ? "var(--sp-positive)" : "var(--sp-warn)"}`,
        color: type === "success" ? "var(--sp-positive)" : "var(--sp-danger)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {type === "success" ? (
        <CheckCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
      ) : (
        <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
      )}
      {message}
    </div>
  );
}

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<"profile" | "integrations">(
    "profile",
  );
  const [saved, setSaved] = useState<Record<Platform, SavedCredential | null>>({
    TWITTER: null,
    LINKEDIN: null,
    INSTAGRAM: null,
    YOUTUBE: null,
  });
  const [forms, setForms] = useState<Record<Platform, FormState>>({
    TWITTER: defaultFormState(),
    LINKEDIN: defaultFormState(),
    INSTAGRAM: defaultFormState(),
    YOUTUBE: defaultFormState(),
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCredentials = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/credentials");
      if (!res.ok) throw new Error();
      const data: SavedCredential[] = await res.json();
      const map: Record<Platform, SavedCredential | null> = {
        TWITTER: null,
        LINKEDIN: null,
        INSTAGRAM: null,
        YOUTUBE: null,
      };
      data.forEach((c) => {
        map[c.platform] = c;
      });
      setSaved(map);
    } catch {
      /* silently ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
    const tab = searchParams.get("tab");
    const error = searchParams.get("error");
    if (tab === "integrations") setActiveTab("integrations");
    if (error?.endsWith("_not_configured")) {
      setActiveTab("integrations");
      showToast("Please configure your API credentials first.", "error");
    }
  }, [fetchCredentials, searchParams]);

  // Profile state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProfileName(data.name ?? "");
        setProfileEmail(data.email ?? "");
      } catch {
        /* keep defaults */
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async () => {
    setProfileError(null);
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setProfileName(data.name);
      setProfileEmail(data.email);
      setProfileSuccess(true);
      showToast("Profile updated successfully!", "success");
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to save profile",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const updateForm = (platform: Platform, updates: Partial<FormState>) => {
    setForms((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], ...updates },
    }));
  };

  const handleSave = async (platform: Platform) => {
    const form = forms[platform];
    updateForm(platform, { saving: true, error: null });
    try {
      const body: Record<string, string> = {
        platform,
        clientId: form.clientId,
        clientSecret: form.clientSecret,
      };
      if (platform === "INSTAGRAM" && form.webhookVerifyToken.trim()) {
        body.webhookVerifyToken = form.webhookVerifyToken.trim();
      }
      const res = await fetch("/api/settings/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      showToast(
        `${PLATFORM_CONFIG[platform].name} credentials saved!`,
        "success",
      );
      await fetchCredentials();
      updateForm(platform, {
        clientId: "",
        clientSecret: "",
        webhookVerifyToken: "",
        saving: false,
      });
    } catch (err: unknown) {
      updateForm(platform, {
        saving: false,
        error:
          err instanceof Error ? err.message : "Failed to save credentials",
      });
    }
  };

  const generateVerifyToken = () => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    updateForm("INSTAGRAM", { webhookVerifyToken: token });
  };

  const handleRemove = async (platform: Platform) => {
    updateForm(platform, { removing: true, error: null });
    try {
      const res = await fetch(
        `/api/settings/credentials?platform=${platform}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to remove");
      showToast(
        `${PLATFORM_CONFIG[platform].name} credentials removed.`,
        "success",
      );
      setSaved((prev) => ({ ...prev, [platform]: null }));
      updateForm(platform, { removing: false });
    } catch {
      updateForm(platform, {
        removing: false,
        error: "Failed to remove credentials",
      });
    }
  };

  const isFormValid = (platform: Platform): boolean => {
    const f = forms[platform];
    return f.clientId.trim().length > 0 && f.clientSecret.trim().length > 0;
  };

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const TABS = [
    { id: "profile" as const, label: "Profile", icon: User },
    {
      id: "integrations" as const,
      label: "API Integrations",
      icon: ExternalLink,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <PageHeader crumb="Workspace · Configuration" title="Settings" />

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--rule)",
          background: "var(--paper-2)",
          paddingLeft: "var(--pad-3)",
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 500,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: activeTab === tab.id ? "var(--ink)" : "var(--ink-3)",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid var(--ink)"
                  : "2px solid transparent",
              marginBottom: -1,
              transition: "color 0.15s",
            }}
          >
            <tab.icon style={{ width: 13, height: 13 }} />
            {tab.label}
          </button>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "var(--pad-3) var(--pad-4)",
        }}
      >
        <div style={{ maxWidth: 760 }}>
          {/* Profile tab */}
          {activeTab === "profile" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--gap-3)",
              }}
            >
              <div className="sp-card" style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding: "var(--pad-2)",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <div className="eyebrow">Account</div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 18,
                      marginTop: 4,
                    }}
                  >
                    Profile settings
                  </div>
                </div>
                <div
                  style={{
                    padding: "var(--pad-2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--gap-2)",
                  }}
                >
                  {profileLoading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--ink-3)",
                        fontSize: 13,
                      }}
                    >
                      <Loader2
                        style={{
                          width: 14,
                          height: 14,
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Loading profile…
                    </div>
                  ) : (
                    <>
                      <div>
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
                          Display name
                        </label>
                        <input
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Your display name"
                          style={inputStyle}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "var(--ink-3)")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "var(--rule)")
                          }
                        />
                      </div>
                      <div>
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
                          Email address
                        </label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          placeholder="you@example.com"
                          style={inputStyle}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = "var(--ink-3)")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = "var(--rule)")
                          }
                        />
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "var(--ink-3)",
                            marginTop: 6,
                          }}
                        >
                          Used for OAuth connections and notifications.
                        </div>
                      </div>

                      {profileError && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 6,
                            background: "var(--sp-warn-soft)",
                            border: "1px solid var(--sp-warn)",
                            color: "var(--sp-danger)",
                            fontSize: 12.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <AlertCircle
                            style={{ width: 13, height: 13, flexShrink: 0 }}
                          />
                          {profileError}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className="sp-card" style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding: "var(--pad-2)",
                    borderBottom: "1px solid var(--rule)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Bell
                    style={{ width: 14, height: 14, color: "var(--ink-3)" }}
                  />
                  <div
                    style={{ fontFamily: "var(--font-display)", fontSize: 18 }}
                  >
                    Notifications
                  </div>
                </div>
                <div
                  style={{
                    padding: "var(--pad-2)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {[
                    {
                      label: "Publishing success",
                      desc: "Get notified when a post publishes successfully",
                    },
                    {
                      label: "Publishing failures",
                      desc: "Get notified immediately if a post fails",
                    },
                    {
                      label: "Weekly report",
                      desc: "Receive a weekly analytics summary",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 0",
                        borderBottom: i < 2 ? "1px solid var(--rule)" : "none",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 2,
                          }}
                        >
                          {item.label}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                          {item.desc}
                        </div>
                      </div>
                      <label
                        style={{
                          position: "relative",
                          display: "inline-flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          defaultChecked
                          style={{
                            position: "absolute",
                            opacity: 0,
                            width: 0,
                            height: 0,
                          }}
                        />
                        <div
                          style={{
                            width: 40,
                            height: 22,
                            borderRadius: 11,
                            background: "var(--ink)",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 3,
                              left: 20,
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              background: "var(--paper)",
                            }}
                          />
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                {profileSuccess && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--sp-positive)",
                    }}
                  >
                    <CheckCircle style={{ width: 13, height: 13 }} /> Saved
                  </span>
                )}
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving || profileLoading}
                  className="sp-btn sp-btn-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: profileSaving || profileLoading ? 0.6 : 1,
                  }}
                >
                  {profileSaving ? (
                    <Loader2
                      style={{
                        width: 13,
                        height: 13,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <Save style={{ width: 13, height: 13 }} />
                  )}
                  {profileSaving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          )}

          {/* Integrations tab */}
          {activeTab === "integrations" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--gap-3)",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "var(--sp-warn-soft)",
                  border: "1px solid var(--sp-warn)",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <AlertCircle
                  style={{
                    width: 14,
                    height: 14,
                    color: "var(--sp-warn)",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--sp-warn)",
                      marginBottom: 4,
                    }}
                  >
                    API credentials required
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-2)",
                      lineHeight: 1.55,
                    }}
                  >
                    Enter your OAuth app credentials for each platform. Both
                    fields are required before you can connect an account.
                    Credentials are stored securely in your database.
                  </div>
                </div>
              </div>

              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 160,
                  }}
                >
                  <LoaderRule width={220} />
                </div>
              ) : (
                PLATFORMS.map((platform) => {
                  const config = PLATFORM_CONFIG[platform];
                  const savedCred = saved[platform];
                  const form = forms[platform];
                  const valid = isFormValid(platform);

                  return (
                    <div
                      key={platform}
                      className="sp-card"
                      style={{ overflow: "hidden" }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "var(--pad-2)",
                          borderBottom: "1px solid var(--rule)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <span
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 6,
                              background: "var(--ink)",
                              color: "var(--paper)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "var(--font-mono)",
                              fontSize: 15,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {GLYPH_MAP[platform]}
                          </span>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>
                              {config.name}
                            </div>
                            <a
                              href={config.devUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: 11.5,
                                color: "var(--sp-accent)",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              Developer console{" "}
                              <ExternalLink style={{ width: 10, height: 10 }} />
                            </a>
                          </div>
                        </div>
                        {savedCred ? (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: "var(--sp-positive-soft)",
                              color: "var(--sp-positive)",
                              fontSize: 11,
                              fontFamily: "var(--font-mono)",
                              fontWeight: 600,
                            }}
                          >
                            <CheckCircle style={{ width: 11, height: 11 }} />{" "}
                            Configured
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 10px",
                              borderRadius: 999,
                              background: "var(--paper-3)",
                              color: "var(--ink-3)",
                              fontSize: 11,
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            <AlertCircle style={{ width: 11, height: 11 }} />{" "}
                            Not configured
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          padding: "var(--pad-2)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        {/* Saved credentials */}
                        {savedCred && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              padding: "12px 14px",
                              borderRadius: 6,
                              background: "var(--sp-positive-soft)",
                              border: "1px solid var(--sp-positive)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                lineHeight: 1.7,
                                fontFamily: "var(--font-mono)",
                                color: "var(--ink-2)",
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    color: "var(--ink)",
                                    fontWeight: 500,
                                  }}
                                >
                                  Client ID:{" "}
                                </span>
                                {savedCred.clientId}
                              </div>
                              <div>
                                <span
                                  style={{
                                    color: "var(--ink)",
                                    fontWeight: 500,
                                  }}
                                >
                                  Client Secret:{" "}
                                </span>
                                {savedCred.clientSecretMasked}
                              </div>
                              {platform === "INSTAGRAM" && (
                                <div>
                                  <span
                                    style={{
                                      color: "var(--ink)",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Webhook Token:{" "}
                                  </span>
                                  {savedCred.webhookVerifyToken ?? (
                                    <em>not set</em>
                                  )}
                                </div>
                              )}
                              <div
                                style={{ color: "var(--ink-3)", marginTop: 4 }}
                              >
                                Updated{" "}
                                {new Date(
                                  savedCred.updatedAt,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemove(platform)}
                              disabled={form.removing}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--sp-danger)",
                                cursor: "pointer",
                                padding: 4,
                                flexShrink: 0,
                                opacity: form.removing ? 0.5 : 1,
                              }}
                            >
                              {form.removing ? (
                                <Loader2
                                  style={{
                                    width: 14,
                                    height: 14,
                                    animation: "spin 1s linear infinite",
                                  }}
                                />
                              ) : (
                                <Trash2 style={{ width: 14, height: 14 }} />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Credentials form */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                          }}
                          className="settings-form-grid"
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: 11.5,
                                fontFamily: "var(--font-mono)",
                                color: "var(--ink-3)",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginBottom: 6,
                              }}
                            >
                              Client ID{" "}
                              <span style={{ color: "var(--sp-danger)" }}>
                                *
                              </span>
                            </label>
                            <input
                              type="text"
                              value={form.clientId}
                              onChange={(e) =>
                                updateForm(platform, {
                                  clientId: e.target.value,
                                  error: null,
                                })
                              }
                              placeholder={config.fields[0].placeholder}
                              style={inputStyle}
                              onFocus={(e) =>
                                (e.currentTarget.style.borderColor =
                                  "var(--ink-3)")
                              }
                              onBlur={(e) =>
                                (e.currentTarget.style.borderColor =
                                  "var(--rule)")
                              }
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: 11.5,
                                fontFamily: "var(--font-mono)",
                                color: "var(--ink-3)",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginBottom: 6,
                              }}
                            >
                              Client Secret{" "}
                              <span style={{ color: "var(--sp-danger)" }}>
                                *
                              </span>
                            </label>
                            <div style={{ position: "relative" }}>
                              <input
                                type={form.showSecret ? "text" : "password"}
                                value={form.clientSecret}
                                onChange={(e) =>
                                  updateForm(platform, {
                                    clientSecret: e.target.value,
                                    error: null,
                                  })
                                }
                                placeholder={config.fields[1].placeholder}
                                style={{ ...inputStyle, paddingRight: 38 }}
                                onFocus={(e) =>
                                  (e.currentTarget.style.borderColor =
                                    "var(--ink-3)")
                                }
                                onBlur={(e) =>
                                  (e.currentTarget.style.borderColor =
                                    "var(--rule)")
                                }
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateForm(platform, {
                                    showSecret: !form.showSecret,
                                  })
                                }
                                style={{
                                  position: "absolute",
                                  right: 10,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "none",
                                  border: "none",
                                  color: "var(--ink-3)",
                                  cursor: "pointer",
                                  padding: 0,
                                }}
                              >
                                {form.showSecret ? (
                                  <EyeOff style={{ width: 14, height: 14 }} />
                                ) : (
                                  <Eye style={{ width: 14, height: 14 }} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Instagram webhook token */}
                        {platform === "INSTAGRAM" && (
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: 11.5,
                                fontFamily: "var(--font-mono)",
                                color: "var(--ink-3)",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginBottom: 6,
                              }}
                            >
                              Webhook Verify Token{" "}
                              <span
                                style={{
                                  textTransform: "none",
                                  letterSpacing: 0,
                                }}
                              >
                                (optional)
                              </span>
                            </label>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                type="text"
                                value={form.webhookVerifyToken}
                                onChange={(e) =>
                                  updateForm("INSTAGRAM", {
                                    webhookVerifyToken: e.target.value,
                                    error: null,
                                  })
                                }
                                placeholder="Enter or generate a verify token"
                                style={{ ...inputStyle, flex: 1 }}
                                onFocus={(e) =>
                                  (e.currentTarget.style.borderColor =
                                    "var(--ink-3)")
                                }
                                onBlur={(e) =>
                                  (e.currentTarget.style.borderColor =
                                    "var(--rule)")
                                }
                              />
                              <button
                                type="button"
                                onClick={generateVerifyToken}
                                className="sp-btn sp-btn-ghost"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <RefreshCw style={{ width: 12, height: 12 }} />{" "}
                                Generate
                              </button>
                            </div>
                            <div
                              style={{
                                fontSize: 11.5,
                                color: "var(--ink-3)",
                                marginTop: 6,
                              }}
                            >
                              Used to verify webhook requests from Meta. Enter
                              this string in Meta App → Webhooks → Verify Token.
                            </div>
                          </div>
                        )}

                        {form.error && (
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "var(--sp-danger)",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <AlertCircle style={{ width: 12, height: 12 }} />{" "}
                            {form.error}
                          </div>
                        )}

                        {/* Callback URL info */}
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 6,
                            background: "var(--paper-2)",
                            border: "1px solid var(--rule)",
                            fontSize: 12,
                            fontFamily: "var(--font-mono)",
                            lineHeight: 1.7,
                          }}
                        >
                          <div>
                            <span style={{ color: "var(--ink-3)" }}>
                              Callback URL:{" "}
                            </span>
                            <span style={{ color: "var(--sp-accent)" }}>
                              {origin}
                              {config.callbackPath}
                            </span>
                          </div>
                          {platform === "INSTAGRAM" && (
                            <div>
                              <span style={{ color: "var(--ink-3)" }}>
                                Webhook URL:{" "}
                              </span>
                              <span style={{ color: "var(--sp-accent)" }}>
                                {origin}/api/webhooks/instagram
                              </span>
                            </div>
                          )}
                          <div
                            style={{
                              fontFamily: "var(--font-ui)",
                              color: "var(--ink-3)",
                              marginTop: 6,
                              fontSize: 11.5,
                              lineHeight: 1.55,
                            }}
                          >
                            {config.notes}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => handleSave(platform)}
                            disabled={!valid || form.saving}
                            className="sp-btn sp-btn-primary"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              opacity: !valid || form.saving ? 0.5 : 1,
                              cursor:
                                !valid || form.saving
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {form.saving ? (
                              <Loader2
                                style={{
                                  width: 13,
                                  height: 13,
                                  animation: "spin 1s linear infinite",
                                }}
                              />
                            ) : (
                              <Save style={{ width: 13, height: 13 }} />
                            )}
                            {form.saving
                              ? "Saving…"
                              : savedCred
                                ? "Update credentials"
                                : "Save credentials"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
        @media (max-width: 640px) {
          .settings-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function SettingsPage() {
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
          Loading settings…
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
