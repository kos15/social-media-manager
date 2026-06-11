"use client";

import { Image, Upload, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function MediaPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <PageHeader crumb="Library · Media" title="Media Library" />

      {/* Toolbar */}
      <div
        style={{
          padding: "0 var(--pad-4) var(--pad-3)",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 180,
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search
            style={{
              position: "absolute",
              left: 10,
              width: 14,
              height: 14,
              color: "var(--ink-3)",
              pointerEvents: "none",
            }}
          />
          <input
            type="search"
            placeholder="Search media…"
            disabled
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
              borderRadius: 6,
              border: "1px solid var(--rule)",
              background: "var(--paper-2)",
              color: "var(--ink)",
              fontSize: 13,
              fontFamily: "inherit",
              outline: "none",
              opacity: 0.6,
            }}
          />
        </div>
        <button
          className="sp-btn sp-btn-ghost"
          disabled
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: 0.5,
          }}
        >
          <Filter style={{ width: 13, height: 13 }} />
          Filter
        </button>
        <button
          className="sp-btn sp-btn-primary"
          disabled
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: 0.5,
          }}
        >
          <Upload style={{ width: 13, height: 13 }} />
          Upload
        </button>
      </div>

      {/* Empty state */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "var(--paper-2)",
            border: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image style={{ width: 28, height: 28, color: "var(--ink-3)" }} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(20px, 5vw, 26px)",
              letterSpacing: "-0.02em",
              marginBottom: 8,
              color: "var(--ink)",
            }}
          >
            Media library
            <em style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
              {" "}
              coming soon.
            </em>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--ink-3)",
              lineHeight: 1.6,
              maxWidth: 340,
              margin: "0 auto",
            }}
          >
            Upload images and videos once, reuse them across all your posts.
            We&apos;re building this now.
          </p>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: "var(--paper-2)",
            border: "1px solid var(--rule)",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          In development
        </div>
      </div>
    </div>
  );
}
