"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
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
} from "lucide-react";
import { useSearchParams } from "next/navigation";

type Platform = "TWITTER" | "LINKEDIN" | "INSTAGRAM" | "YOUTUBE";

interface SavedCredential {
  platform: Platform;
  clientId: string;
  clientSecretMasked: string;
  updatedAt: string;
}

interface FormState {
  clientId: string;
  clientSecret: string;
  showSecret: boolean;
  saving: boolean;
  removing: boolean;
  error: string | null;
}

const PLATFORM_CONFIG: Record<
  Platform,
  {
    name: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
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
    name: "Twitter / X",
    icon: Twitter,
    color: "text-[#1DA1F2]",
    bgColor: "bg-[#1DA1F2]/10",
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
    icon: Linkedin,
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]/10",
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
    icon: Instagram,
    color: "text-[#E1306C]",
    bgColor: "bg-[#E1306C]/10",
    devUrl: "https://developers.facebook.com/apps",
    callbackPath: "/api/connect/instagram/callback",
    fields: [
      {
        key: "clientId",
        label: "Facebook App ID",
        placeholder: "Enter your Facebook App ID",
        required: true,
      },
      {
        key: "clientSecret",
        label: "Facebook App Secret",
        placeholder: "Enter your Facebook App Secret",
        required: true,
      },
    ],
    notes:
      "Uses Instagram Graph API via a Facebook App (NOT Instagram Basic Display API). At developers.facebook.com: create a Facebook App → add 'Instagram Graph API' product → request permissions: instagram_basic, instagram_content_publish, instagram_manage_insights, pages_show_list, pages_read_engagement. The connecting user must have an Instagram Professional account (Business or Creator) linked to a Facebook Page they manage.",
  },
  YOUTUBE: {
    name: "YouTube",
    icon: Youtube,
    color: "text-[#FF0000]",
    bgColor: "bg-[#FF0000]/10",
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
      "Google OAuth 2.0. In Google Cloud Console: create an OAuth 2.0 Client ID (Web Application), add the Callback URL above as an Authorized Redirect URI, and enable both 'YouTube Data API v3' (for uploading and managing videos) and 'YouTube Analytics API v2' (for channel metrics). Required scopes: youtube.upload, youtube.readonly, yt-analytics.readonly. During development, add test user Google accounts in OAuth consent screen → Test users. Use prompt=consent to ensure a refresh_token is issued.",
  },
};

const PLATFORMS: Platform[] = ["TWITTER", "LINKEDIN", "INSTAGRAM", "YOUTUBE"];

const defaultFormState = (): FormState => ({
  clientId: "",
  clientSecret: "",
  showSecret: false,
  saving: false,
  removing: false,
  error: null,
});

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
      className={`fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium cursor-pointer transition-all ${type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-error/10 text-error border border-error/20"}`}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
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
      // silently ignore
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

  // ── Profile state ───────────────────────────────────────────────
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
        // keep defaults
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
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      setProfileError(msg);
    } finally {
      setProfileSaving(false);
    }
  };
  // ── End profile state ───────────────────────────────────────────

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
      const res = await fetch("/api/settings/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          clientId: form.clientId,
          clientSecret: form.clientSecret,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      showToast(
        `${PLATFORM_CONFIG[platform].name} credentials saved!`,
        "success",
      );
      await fetchCredentials();
      // Clear form after save
      updateForm(platform, { clientId: "", clientSecret: "", saving: false });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save credentials";
      updateForm(platform, { saving: false, error: msg });
    }
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

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your account preferences and API integrations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(
          [
            { id: "profile", label: "Profile", icon: User },
            {
              id: "integrations",
              label: "API Integrations",
              icon: ExternalLink,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-surface-elevated border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Profile Settings</h2>
            <p className="text-sm text-text-secondary">
              Manage your personal information and preferences.
            </p>
          </div>
          <div className="p-6 space-y-6">
            {profileLoading ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading profile…
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Display Name
                  </label>
                  <input
                    id="name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your display name"
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-text-secondary"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-text-secondary"
                  />
                  <p className="text-xs text-text-secondary">
                    This email is used for OAuth connections and notifications.
                    Changing it updates all platform auth flows.
                  </p>
                </div>

                {profileError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {profileError}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Publishing Success",
                    desc: "Get notified when a post publishes successfully",
                  },
                  {
                    label: "Publishing Failures",
                    desc: "Get notified immediately if a post fails",
                  },
                  {
                    label: "Weekly Report",
                    desc: "Receive a weekly analytics summary",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              {profileSuccess && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Saved successfully
                </span>
              )}
              <button
                onClick={handleProfileSave}
                disabled={profileSaving || profileLoading}
                className="ml-auto flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold
                                    bg-primary hover:bg-primary-hover text-white
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    transition-all active:scale-95"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="space-y-4">
          <div className="bg-surface-elevated border border-amber-400/30 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">
                API Credentials Required
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Enter your OAuth app credentials for each platform. Both fields
                marked <span className="text-error font-bold">*</span> are
                required before you can connect an account. Credentials are
                stored securely in your database.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-text-secondary gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading configuration...
            </div>
          ) : (
            PLATFORMS.map((platform) => {
              const config = PLATFORM_CONFIG[platform];
              const Icon = config.icon;
              const savedCred = saved[platform];
              const form = forms[platform];
              const valid = isFormValid(platform);

              return (
                <div
                  key={platform}
                  className="bg-surface-elevated border border-border rounded-xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center ${config.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{config.name}</h3>
                        <a
                          href={config.devUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Open Developer Console{" "}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    {savedCred ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-success/10 text-success rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Configured
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-surface text-text-secondary border border-border rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Not configured
                      </span>
                    )}
                  </div>

                  <div className="p-4 md:p-5 space-y-4">
                    {/* Currently saved credentials preview */}
                    {savedCred && (
                      <div className="flex items-start justify-between bg-success/5 border border-success/20 rounded-lg px-4 py-3">
                        <div className="text-xs space-y-1">
                          <p className="font-mono text-text-secondary">
                            <span className="text-text-primary font-medium">
                              Client ID:{" "}
                            </span>
                            {savedCred.clientId}
                          </p>
                          <p className="font-mono text-text-secondary">
                            <span className="text-text-primary font-medium">
                              Client Secret:{" "}
                            </span>
                            {savedCred.clientSecretMasked}
                          </p>
                          <p className="text-text-secondary pt-1">
                            Updated{" "}
                            {new Date(savedCred.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(platform)}
                          disabled={form.removing}
                          className="ml-4 p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                          title={`Remove ${config.name} credentials`}
                        >
                          {form.removing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Form */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Client ID */}
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium flex items-center gap-1">
                          Client ID
                          <span
                            className="text-error font-bold"
                            title="Required"
                          >
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
                          className={`w-full bg-surface border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 transition-colors ${
                            form.clientId.trim() === "" && !form.saving
                              ? "border-border focus:border-primary"
                              : "border-border focus:border-primary"
                          }`}
                        />
                      </div>

                      {/* Client Secret */}
                      <div className="grid gap-1.5">
                        <label className="text-sm font-medium flex items-center gap-1">
                          Client Secret
                          <span
                            className="text-error font-bold"
                            title="Required"
                          >
                            *
                          </span>
                        </label>
                        <div className="relative">
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
                            className="w-full bg-surface border border-border rounded-lg px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-1 focus:border-primary transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateForm(platform, {
                                showSecret: !form.showSecret,
                              })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground transition-colors"
                          >
                            {form.showSecret ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Validation helper text */}
                    {(!form.clientId.trim() || !form.clientSecret.trim()) &&
                      form.clientId.trim() === "" &&
                      form.clientSecret.trim() === "" && (
                        <p className="text-xs text-text-secondary flex items-center gap-1.5">
                          <span className="text-error font-bold">*</span>
                          Both Client ID and Client Secret are required to
                          enable {config.name} integration.
                        </p>
                      )}

                    {form.error && (
                      <p className="text-xs text-error flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {form.error}
                      </p>
                    )}

                    {/* Callback URL info */}
                    <div className="bg-surface rounded-lg border border-border px-3 py-2 text-xs">
                      <span className="text-text-secondary font-medium">
                        Redirect / Callback URL:{" "}
                      </span>
                      <span className="font-mono text-primary">
                        {origin}
                        {config.callbackPath}
                      </span>
                      <p className="text-text-secondary mt-1">{config.notes}</p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSave(platform)}
                        disabled={!valid || form.saving}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                          valid && !form.saving
                            ? "bg-primary hover:bg-primary-hover text-white cursor-pointer"
                            : "bg-surface text-text-secondary border border-border cursor-not-allowed opacity-60"
                        }`}
                        title={
                          !valid
                            ? "Fill in both Client ID and Client Secret to save"
                            : ""
                        }
                      >
                        {form.saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />{" "}
                            {savedCred
                              ? "Update Credentials"
                              : "Save Credentials"}
                          </>
                        )}
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
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-text-secondary">
          Loading settings...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
