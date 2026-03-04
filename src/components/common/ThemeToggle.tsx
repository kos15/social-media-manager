"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-surface hover:bg-surface-elevated transition-colors border border-border"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                <Sun className="h-5 w-5 absolute transition-all dark:-rotate-90 dark:opacity-0" />
                <Moon className="h-5 w-5 absolute transition-all rotate-90 opacity-0 dark:rotate-0 dark:opacity-100" />
            </div>
        </button>
    );
}
