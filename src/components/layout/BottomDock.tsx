"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  Sparkles,
  MoreHorizontal,
  BarChart2,
  Link2,
  Settings,
  Image,
  FileText,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const dockItems = [
  {
    id: "dashboard",
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  { id: "composer", label: "Compose", href: "/composer", icon: PenTool },
  { id: "calendar", label: "Calendar", href: "/calendar", icon: Calendar },
  { id: "ai-studio", label: "AI Studio", href: "/ai-studio", icon: Sparkles },
];

const moreItems = [
  { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart2 },
  { id: "accounts", label: "Accounts", href: "/accounts", icon: Link2 },
  { id: "drafts", label: "Drafts", href: "/drafts", icon: FileText },
  { id: "media", label: "Media", href: "/media", icon: Image },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export function BottomDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const isActive = (href: string) => pathname.startsWith(href);
  const moreActive = moreItems.some((i) => isActive(i.href));

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <nav
        className="flex lg:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 64,
          background: "var(--paper)",
          borderTop: "1px solid var(--rule)",
          alignItems: "stretch",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {dockItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setShowMore(false)}
              className="sp-tab-press"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                textDecoration: "none",
                color: active ? "var(--ink)" : "var(--ink-3)",
                position: "relative",
              }}
            >
              <item.icon
                style={{
                  width: 20,
                  height: 20,
                  strokeWidth: active ? 2 : 1.5,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </span>
              {active && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: 20,
                    height: 2,
                    borderRadius: "2px 2px 0 0",
                    background: "var(--sp-accent)",
                  }}
                />
              )}
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setShowMore((s) => !s)}
          className="sp-tab-press"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            background: "none",
            border: "none",
            color: showMore || moreActive ? "var(--ink)" : "var(--ink-3)",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <MoreHorizontal
            style={{ width: 20, height: 20, strokeWidth: showMore ? 2 : 1.5 }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              lineHeight: 1,
              fontWeight: showMore || moreActive ? 600 : 400,
            }}
          >
            More
          </span>
          {moreActive && !showMore && (
            <span
              style={{
                position: "absolute",
                bottom: 0,
                width: 20,
                height: 2,
                borderRadius: "2px 2px 0 0",
                background: "var(--sp-accent)",
              }}
            />
          )}
        </button>
      </nav>

      {/* More sheet — floating rounded card, springs up from the bottom */}
      <div
        className={`lg:hidden v2-sheet-veil ${showMore ? "open" : ""}`}
        onClick={() => setShowMore(false)}
      />
      <div className={`lg:hidden v2-sheet ${showMore ? "open" : ""}`}>
        <div className="grab" />
        {moreItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setShowMore(false)}
              className={`row ${active ? "active" : ""}`}
            >
              <item.icon
                style={{
                  width: 17,
                  height: 17,
                  strokeWidth: active ? 2 : 1.5,
                  flexShrink: 0,
                }}
              />
              {item.label}
              {active && <span className="dot" />}
            </Link>
          );
        })}
        <div className="rule" />
        <button
          className="row"
          onClick={handleSignOut}
          style={{ color: "var(--sp-danger)" }}
        >
          <LogOut style={{ width: 17, height: 17, flexShrink: 0 }} />
          Sign out
        </button>
      </div>
    </>
  );
}
