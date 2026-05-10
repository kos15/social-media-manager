"use client";

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
  Settings,
  ShieldCheck,
} from "lucide-react";

const workspaceItems = [
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
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

const libraryItems = [
  {
    id: "ai-studio",
    label: "AI Studio",
    href: "/ai-studio",
    icon: Sparkles,
    badge: null,
  },
  { id: "media", label: "Media", href: "#", icon: Image, badge: null },
];

const systemItems = [
  { id: "admin", label: "Admin", href: "/admin", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => href !== "#" && pathname.startsWith(href);

  return (
    <aside
      className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0"
      style={{
        width: 232,
        borderRight: "1px solid var(--rule)",
        background: "var(--paper)",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "0 22px 22px",
          borderBottom: "1px solid var(--rule)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingTop: 22,
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
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 18,
              flexShrink: 0,
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
            <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>plus</em>
          </span>
        </Link>
      </div>

      {/* Workspace nav */}
      <div style={{ padding: "22px 14px" }}>
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
        {workspaceItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`sp-sidebar-link ${isActive(item.href) ? "active" : ""}`}
          >
            <item.icon
              style={{ width: 15, height: 15, strokeWidth: 1.5, flexShrink: 0 }}
            />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Library nav */}
      <div style={{ padding: "0 14px 14px" }}>
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
          Library
        </div>
        {libraryItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`sp-sidebar-link ${isActive(item.href) ? "active" : ""}`}
          >
            <item.icon
              style={{ width: 15, height: 15, strokeWidth: 1.5, flexShrink: 0 }}
            />
            {item.label}
          </Link>
        ))}
      </div>

      {/* System nav */}
      <div style={{ padding: "0 14px 14px" }}>
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
          System
        </div>
        {systemItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`sp-sidebar-link ${isActive(item.href) ? "active" : ""}`}
          >
            <item.icon
              style={{ width: 15, height: 15, strokeWidth: 1.5, flexShrink: 0 }}
            />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Footer / user */}
      <Link
        href="/settings"
        style={{
          marginTop: "auto",
          padding: "22px",
          borderTop: "1px solid var(--rule)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          transition: "background 0.1s",
        }}
        className="sp-sidebar-footer"
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--paper-3)",
            border: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-2)",
            flexShrink: 0,
          }}
        >
          K
        </div>
        <div style={{ lineHeight: 1.2, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>
            Account
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Pro plan
          </div>
        </div>
        <Settings style={{ width: 14, height: 14, color: "var(--ink-3)" }} />
      </Link>
    </aside>
  );
}
