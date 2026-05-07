"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function PageHeader({
  crumb,
  title,
  actions,
}: {
  crumb: string;
  title: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div
      style={{
        height: 56,
        borderBottom: "1px solid var(--rule)",
        display: "flex",
        alignItems: "center",
        padding: "0 var(--pad-3, 32px)",
        gap: "var(--gap-2, 18px)",
        flexShrink: 0,
        background: "var(--paper)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--ink-3)",
            lineHeight: 1,
          }}
        >
          {crumb}
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: "var(--ink)",
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
      >
        {actions}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="sp-btn sp-btn-ghost"
          style={{
            width: 32,
            height: 32,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={
            resolvedTheme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {resolvedTheme === "dark" ? (
            <Sun style={{ width: 14, height: 14 }} />
          ) : (
            <Moon style={{ width: 14, height: 14 }} />
          )}
        </button>
      </div>
    </div>
  );
}
