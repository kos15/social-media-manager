"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
  Unplug,
  Plus,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

interface SocialAccount {
  id: string;
  platform: "TWITTER" | "LINKEDIN" | "INSTAGRAM" | "YOUTUBE";
  username: string;
  profileImage?: string;
  status: "ACTIVE" | "EXPIRED" | "DISCONNECTED";
  expiresAt?: string;
  createdAt: string;
}

const platformConfig = {
  TWITTER: {
    name: "Twitter / X",
    icon: Twitter,
    color: "text-[#1DA1F2]",
    bgColor: "bg-[#1DA1F2]/10",
    connectUrl: "/api/connect/twitter",
    envKey: "TWITTER_CLIENT_ID",
  },
  LINKEDIN: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]/10",
    connectUrl: "/api/connect/linkedin",
    envKey: "LINKEDIN_CLIENT_ID",
  },
  INSTAGRAM: {
    name: "Instagram",
    icon: Instagram,
    color: "text-[#E1306C]",
    bgColor: "bg-[#E1306C]/10",
    connectUrl: "/api/connect/instagram",
    envKey: "INSTAGRAM_CLIENT_ID",
  },
  YOUTUBE: {
    name: "YouTube",
    icon: Youtube,
    color: "text-[#FF0000]",
    bgColor: "bg-[#FF0000]/10",
    connectUrl: "/api/connect/youtube",
    envKey: "GOOGLE_CLIENT_ID",
  },
} as const;

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-error/10 text-error border border-error/20"}`}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {message}
    </div>
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
        // Silently fail if DB isn't configured — show empty state
        setAccounts([]);
        return;
      }
      const data = await res.json();
      setAccounts(data);
    } catch {
      // Silently show empty state if DB isn't connected
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();

    // Handle OAuth callback status messages
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success) {
      const platform =
        platformConfig[success.toUpperCase() as keyof typeof platformConfig];
      showToast(
        `Successfully connected ${platform?.name ?? success}!`,
        "success",
      );
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
        twitter_invalid_state:
          "Twitter OAuth state mismatch. Please try again.",
        linkedin_invalid_state:
          "LinkedIn OAuth state mismatch. Please try again.",
        instagram_invalid_state:
          "Instagram OAuth state mismatch. Please try again.",
        youtube_invalid_state:
          "YouTube OAuth state mismatch. Please try again.",
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
      showToast("Account disconnected successfully.", "success");
    } catch {
      showToast("Failed to disconnect account.", "error");
    } finally {
      setDisconnecting(null);
    }
  };

  const connectedPlatforms = new Set(accounts.map((a) => a.platform));
  const unconnectedPlatforms = (
    Object.keys(platformConfig) as Array<keyof typeof platformConfig>
  ).filter((p) => !connectedPlatforms.has(p));

  const isExpired = (account: SocialAccount) =>
    account.expiresAt && new Date(account.expiresAt) < new Date();

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Connected Accounts
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Connect your social media accounts to start publishing and
            scheduling posts.
          </p>
        </div>
        <button
          onClick={fetchAccounts}
          className="shrink-0 p-2 text-text-secondary hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors"
          title="Refresh accounts"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Connected Accounts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-elevated border border-border rounded-xl p-6 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-surface rounded" />
                  <div className="h-3 w-16 bg-surface rounded" />
                </div>
              </div>
              <div className="h-8 bg-surface rounded mt-6" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {accounts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => {
                const config = platformConfig[account.platform];
                const expired = isExpired(account);
                return (
                  <div
                    key={account.id}
                    className="bg-surface-elevated border border-border rounded-xl p-6 flex flex-col relative group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {account.profileImage ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={account.profileImage}
                              alt={account.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center ${config.color}`}
                          >
                            <config.icon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{config.name}</h3>
                          <p className="text-sm text-text-secondary">
                            {account.username}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full ${
                          expired
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {expired ? "Expired" : account.status}
                      </span>
                    </div>

                    {expired && (
                      <div className="flex items-center gap-2 text-xs text-warning bg-warning/5 border border-warning/20 rounded-lg px-3 py-2 mb-4">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        Token expired. Reconnect to continue posting.
                      </div>
                    )}

                    <div className="mt-auto pt-4 flex justify-between items-center border-t border-border">
                      {expired ? (
                        <a
                          href={config.connectUrl}
                          className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
                        >
                          Reconnect <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <a
                          href={`https://${account.platform.toLowerCase()}.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors"
                        >
                          View Profile <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDisconnect(account.id)}
                        disabled={disconnecting === account.id}
                        className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:cursor-not-allowed"
                        aria-label="Disconnect account"
                      >
                        {disconnecting === account.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Unplug className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Connect New Platforms */}
          {unconnectedPlatforms.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                {accounts.length === 0
                  ? "Get Started — Connect a Platform"
                  : "Add More Platforms"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {unconnectedPlatforms.map((platform) => {
                  const config = platformConfig[platform];
                  return (
                    <a
                      key={platform}
                      href={config.connectUrl}
                      className="group bg-surface-elevated border-2 border-dashed border-border hover:border-primary/40 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all hover:bg-surface hover:shadow-sm"
                    >
                      <div
                        className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center ${config.color} transition-transform group-hover:scale-110`}
                      >
                        <config.icon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">{config.name}</p>
                        <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1 justify-center">
                          <Plus className="w-3 h-3" /> Connect
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {accounts.length === 0 && unconnectedPlatforms.length === 0 && (
            <div className="text-center py-16 text-text-secondary">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
              <p className="font-medium">All platforms connected!</p>
            </div>
          )}
        </>
      )}

      {/* Setup Instructions */}
      <div className="bg-surface-elevated border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          API Keys Setup Required
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          To enable real OAuth connections, add these keys to your{" "}
          <code className="bg-surface px-1 py-0.5 rounded text-xs">.env</code>{" "}
          file and register your app&apos;s callback URLs in each
          platform&apos;s developer portal.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {Object.entries(platformConfig).map(([key, config]) => (
            <div
              key={key}
              className="bg-surface rounded-lg p-3 border border-border"
            >
              <p className={`font-semibold mb-1 ${config.color}`}>
                {config.name}
              </p>
              <p className="text-text-secondary">{config.envKey}=your_key</p>
              <p className="text-text-secondary mt-1 text-[10px] break-all">
                Callback:{" "}
                {typeof window !== "undefined" ? window.location.origin : ""}
                {config.connectUrl.replace("/api/connect/", "/api/connect/")}
                /callback
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-text-secondary">
          Loading accounts...
        </div>
      }
    >
      <AccountsContent />
    </Suspense>
  );
}
