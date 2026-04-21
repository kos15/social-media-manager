"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  PenTool,
  Sparkles,
  BarChart,
  Users,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Composer", href: "/composer", icon: PenTool },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "AI Studio", href: "/ai-studio", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Accounts", href: "/accounts", icon: Users },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-border bg-surface-elevated/95 h-screen",
          "transition-transform duration-300 ease-in-out",
          "md:sticky md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between p-6 shrink-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SocialPulse
          </h1>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-surface transition-colors text-text-secondary"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text-secondary hover:bg-surface hover:text-text-primary",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isActive
                      ? "text-primary"
                      : "text-text-secondary group-hover:text-text-primary",
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border shrink-0">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group",
              pathname.startsWith("/settings")
                ? "bg-primary/10 text-primary font-medium"
                : "text-text-secondary hover:bg-surface hover:text-text-primary",
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
