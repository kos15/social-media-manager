"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  Link2,
  Settings,
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
  { id: "accounts", label: "Accounts", href: "/accounts", icon: Link2 },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export function BottomDock() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav
      className="lg:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 64,
        background: "var(--paper)",
        borderTop: "1px solid var(--rule)",
        display: "flex",
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
    </nav>
  );
}
