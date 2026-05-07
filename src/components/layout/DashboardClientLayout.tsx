"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  BarChart2,
  Link2,
  Sparkles,
  Image,
  X,
} from "lucide-react";
import { Sidebar } from "./Sidebar";

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
  const pathname = usePathname();

  const isActive = (href: string) => href !== "#" && pathname.startsWith(href);

  return (
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
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "oklch(0% 0 0 / 0.5)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className="md:hidden fixed inset-y-0 left-0 z-50 flex flex-col"
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
              <item.icon style={{ width: 15, height: 15, strokeWidth: 1.5 }} />
              {item.label}
            </Link>
          ))}
        </nav>
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
        {/* Mobile topbar */}
        <div
          className="md:hidden"
          style={{
            height: 56,
            borderBottom: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 12,
            background: "var(--paper)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              padding: 6,
              borderRadius: 6,
              border: "1px solid var(--rule)",
              background: "var(--paper-2)",
              color: "var(--ink-2)",
              cursor: "pointer",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                background: "var(--ink)",
                color: "var(--paper)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontStyle: "italic",
                fontSize: 15,
              }}
            >
              S
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
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
        </div>
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
