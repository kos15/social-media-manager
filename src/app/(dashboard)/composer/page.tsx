"use client";

import { useState } from "react";
import { PlatformSelector } from "@/components/composer/PlatformSelector";
import { RichTextEditor } from "@/components/composer/RichTextEditor";
import { MediaUpload } from "@/components/composer/MediaUpload";
import { LivePreview } from "@/components/composer/LivePreview";
import { SchedulingPicker } from "@/components/composer/SchedulingPicker";
import { Hash, PenTool, Eye } from "lucide-react";

export default function ComposerPage() {
  const [activePanel, setActivePanel] = useState<"compose" | "preview">(
    "compose",
  );

  return (
    <div className="space-y-4 md:space-y-6 flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Post Composer
        </h1>
      </div>

      {/* Mobile tab switcher */}
      <div className="flex md:hidden bg-surface border border-border rounded-lg p-1 shrink-0">
        <button
          onClick={() => setActivePanel("compose")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${activePanel === "compose" ? "bg-surface-elevated text-foreground shadow-sm border border-border" : "text-text-secondary"}`}
        >
          <PenTool className="w-4 h-4" /> Compose
        </button>
        <button
          onClick={() => setActivePanel("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${activePanel === "preview" ? "bg-surface-elevated text-foreground shadow-sm border border-border" : "text-text-secondary"}`}
        >
          <Eye className="w-4 h-4" /> Preview
        </button>
      </div>

      <div className="flex-1 border border-border rounded-xl overflow-hidden bg-surface-elevated shadow-sm min-h-0">
        {/* Desktop: side by side. Mobile: single panel based on tab */}
        <div className="flex h-full">
          {/* Left Panel - Controls */}
          <div
            className={`
                        w-full md:w-1/2 md:border-r border-border p-4 md:p-6 flex flex-col space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar
                        ${activePanel === "preview" ? "hidden md:flex" : "flex"}
                    `}
          >
            <PlatformSelector />

            <div className="border-t border-border pt-4 md:pt-6 flex-1 flex flex-col min-h-[200px]">
              <RichTextEditor />

              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {["#technology", "#innovation", "#future", "#coding"].map(
                  (tag) => (
                    <button
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-surface border border-border rounded-full text-xs hover:bg-surface-elevated text-text-secondary transition-colors whitespace-nowrap"
                    >
                      <Hash className="w-3 h-3" /> {tag.replace("#", "")}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4 md:pt-6">
              <MediaUpload />
            </div>

            <div className="border-t border-border pt-4 md:pt-6">
              <SchedulingPicker />
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div
            className={`
                        w-full md:w-1/2 p-4 md:p-6 flex flex-col bg-surface overflow-hidden
                        ${activePanel === "compose" ? "hidden md:flex" : "flex"}
                    `}
          >
            <h3 className="text-sm font-medium text-text-secondary mb-4 shrink-0">
              Live Preview
            </h3>
            <LivePreview />
          </div>
        </div>
      </div>
    </div>
  );
}
