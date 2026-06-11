"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  X,
} from "lucide-react";

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
  { id: "media", label: "Media", href: "/media", icon: Image },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export function BottomDock() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const isActive = (href: string) => pathname.startsWith(href);
  const moreActive = moreItems.some((i) => isActive(i.href));

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
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                textDecoration: "none",
                color: active ? "var(--ink)" : "var(--ink-3)",
                transition: "color 0.15s",
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
                    background: "var(--ink)",
                  }}
                />
              )}
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setShowMore((s) => !s)}
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
                background: "var(--ink)",
              }}
            />
          )}
        </button>
      </nav>

      {/* More drawer */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden"
            onClick={() => setShowMore(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 48,
              background: "rgba(0,0,0,0.3)",
            }}
          />
          {/* Sheet */}
          <div
            className="lg:hidden"
            style={{
              position: "fixed",
              bottom: 64,
              left: 0,
              right: 0,
              zIndex: 49,
              background: "var(--paper)",
              borderTop: "1px solid var(--rule)",
              borderRadius: "12px 12px 0 0",
              padding: "8px 0 12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 20px 12px",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--ink-3)",
                }}
              >
                More
              </span>
              <button
                onClick={() => setShowMore(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ink-3)",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            {moreItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 20px",
                    textDecoration: "none",
                    color: active ? "var(--ink)" : "var(--ink-2)",
                    background: active ? "var(--paper-2)" : "transparent",
                    borderLeft: active
                      ? "2px solid var(--ink)"
                      : "2px solid transparent",
                  }}
                >
                  <item.icon
                    style={{
                      width: 18,
                      height: 18,
                      strokeWidth: active ? 2 : 1.5,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
