"use client";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Bell, Menu } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="h-14 md:h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg bg-surface hover:bg-surface-elevated transition-colors border border-border"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5 text-text-secondary" />
        </button>
        <span className="md:hidden text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          SocialPulse
        </span>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <button className="p-2 rounded-lg bg-surface hover:bg-surface-elevated transition-colors border border-border relative">
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-error" />
        </button>

        <ThemeToggle />

        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-primary to-accent border border-border overflow-hidden" />
      </div>
    </header>
  );
}
