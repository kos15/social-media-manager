"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--font-ui, sans-serif)",
      }}
    >
      {/* Left panel — brand */}
      <div
        style={{
          width: 480,
          flexShrink: 0,
          borderRight: "1px solid var(--rule)",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          background: "var(--paper-2)",
        }}
        className="hidden md:flex"
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            marginBottom: "auto",
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "var(--ink)",
              color: "var(--paper)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 20,
            }}
          >
            S
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
            }}
          >
            Social
            <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>plus</em>
          </span>
        </Link>
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 3vw, 48px)",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            One studio for
            <br />
            <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
              four platforms.
            </em>
          </div>
          <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6 }}>
            Write once, preview everywhere, schedule the week — across X,
            LinkedIn, Instagram and YouTube.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            "No credit card required",
            "14-day free trial",
            "Cancel any time",
          ].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13.5,
                color: "var(--ink-2)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--sp-positive)",
                  flexShrink: 0,
                }}
              />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile brand */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              marginBottom: 40,
            }}
            className="md:hidden"
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--ink)",
                color: "var(--paper)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontStyle: "italic",
                fontSize: 18,
              }}
            >
              S
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              Social
              <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                plus
              </em>
            </span>
          </Link>

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--ink-3)",
              marginBottom: 12,
            }}
          >
            Account
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 36,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              margin: "0 0 8px",
              lineHeight: 1.1,
            }}
          >
            Welcome back.
          </h1>
          <p
            style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 36px" }}
          >
            Sign in to your Socialplus account.
          </p>

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
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
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid var(--rule)",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
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
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 14px",
                    borderRadius: 6,
                    border: "1px solid var(--rule)",
                    background: "var(--paper)",
                    color: "var(--ink)",
                    fontSize: 14,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--ink-3)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--rule)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--ink-3)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: 15, height: 15 }} />
                  ) : (
                    <Eye style={{ width: 15, height: 15 }} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  background: "var(--sp-warn-soft)",
                  border: "1px solid var(--sp-warn)",
                  color: "var(--sp-danger)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 6,
                background: "var(--ink)",
                color: "var(--paper)",
                border: "none",
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "inherit",
              }}
            >
              {loading ? (
                <Loader2
                  style={{
                    width: 15,
                    height: 15,
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div
            style={{ height: 1, background: "var(--rule)", margin: "28px 0" }}
          />

          <p
            style={{
              textAlign: "center",
              fontSize: 13.5,
              color: "var(--ink-2)",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: "var(--sp-accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Start free →
            </Link>
          </p>
        </div>
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
