import React from "react";

export function PageHeader({
  crumb,
  title,
  actions,
}: {
  crumb: string;
  title: React.ReactNode;
  actions?: React.ReactNode;
}) {
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
      {actions && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
