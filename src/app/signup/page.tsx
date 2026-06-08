"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper)",
          color: "var(--ink)",
          fontFamily: "var(--font-ui, sans-serif)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            textAlign: "center",
            padding: "0 32px",
          }}
        >
          <CheckCircle2
            style={{
              width: 44,
              height: 44,
              color: "var(--sp-positive)",
              margin: "0 auto 20px",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              letterSpacing: "-0.02em",
              marginBottom: 10,
            }}
          >
            Check your email.
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--ink-2)",
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            We sent a confirmation link to{" "}
            <strong style={{ color: "var(--ink)" }}>{email}</strong>. Click it
            to activate your account.
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              borderRadius: 6,
              background: "var(--ink)",
              color: "var(--paper)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

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
            Start publishing
            <br />
            <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
              in minutes.
            </em>
          </div>
          <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6 }}>
            Connect your accounts, compose your first post, and reach your
            audience across every platform — all from one place.
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
            New account
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
            Get started free.
          </h1>
          <p
            style={{ fontSize: 14, color: "var(--ink-2)", margin: "0 0 36px" }}
          >
            Create your Socialplus account.
          </p>

          <form
            onSubmit={handleSignup}
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
                  placeholder="Min. 6 characters"
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
                Confirm password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
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
              {loading ? "Creating account…" : "Create account →"}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
            <span
              style={{
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              or
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            style={{
              width: "100%",
              padding: "11px 0",
              borderRadius: 6,
              border: "1px solid var(--rule)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: "inherit",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

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
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--sp-accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign in →
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
