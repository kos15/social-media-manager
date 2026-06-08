"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  BarChart2,
  Link2,
  Sparkles,
  Image,
  X,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SidebarContext } from "@/contexts/SidebarContext";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    id: "dashboard",
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  { id: "composer", label: "Composer", href: "/composer", icon: PenTool },
  { id: "calendar", label: "Calendar", href: "/calendar", icon: Calendar },
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart2 },
  { id: "accounts", label: "Accounts", href: "/accounts", icon: Link2 },
  { id: "ai-studio", label: "AI Studio", href: "/ai-studio", icon: Sparkles },
  { id: "media", label: "Media", href: "#", icon: Image },
];

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then((r) => {
        if (r.ok) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) => href !== "#" && pathname.startsWith(href);

  return (
    <SidebarContext.Provider value={{ setMobileOpen }}>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--paper)",
          color: "var(--ink)",
        }}
      >
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "oklch(0% 0 0 / 0.5)" }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <div
          className="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col"
          style={{
            width: 232,
            background: "var(--paper)",
            borderRight: "1px solid var(--rule)",
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            style={{
              padding: "16px 22px",
              borderBottom: "1px solid var(--rule)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
              }}
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
                  lineHeight: 1,
                  color: "var(--ink)",
                }}
              >
                Social
                <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
                  plus
                </em>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                padding: 6,
                borderRadius: 6,
                background: "transparent",
                border: "none",
                color: "var(--ink-3)",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <nav style={{ flex: 1, padding: "14px 14px", overflowY: "auto" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--ink-3)",
                padding: "0 12px 8px",
              }}
            >
              Workspace
            </div>
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sp-sidebar-link ${isActive(item.href) ? "active" : ""}`}
              >
                <item.icon
                  style={{ width: 15, height: 15, strokeWidth: 1.5 }}
                />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--ink-3)",
                    padding: "12px 12px 8px",
                  }}
                >
                  System
                </div>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`sp-sidebar-link ${isActive("/admin") ? "active" : ""}`}
                >
                  <ShieldCheck
                    style={{ width: 15, height: 15, strokeWidth: 1.5 }}
                  />
                  Admin
                </Link>
              </>
            )}
          </nav>
          <div style={{ borderTop: "1px solid var(--rule)", padding: "14px" }}>
            <button
              onClick={handleSignOut}
              className="sp-sidebar-link"
              style={{
                width: "100%",
                color: "var(--sp-danger)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <LogOut style={{ width: 15, height: 15, strokeWidth: 1.5 }} />
              Sign out
            </button>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
