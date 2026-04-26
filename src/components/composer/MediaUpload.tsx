"use client";

import { usePostStore } from "@/store/usePostStore";
import { ImagePlus, X, FileVideo, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

const ACCEPTED =
  "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime";

export function MediaUpload() {
  const { mediaUrls, addMedia, removeMedia } = usePostStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const remaining = 4 - mediaUrls.length;
      const toUpload = Array.from(files).slice(0, remaining);

      setUploading(true);
      setError(null);

      try {
        await Promise.all(
          toUpload.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error ?? "Upload failed");
            }
            const { url } = await res.json();
            addMedia(url);
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }

      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [mediaUrls, addMedia],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-secondary">
        Media Attachments
      </h3>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {mediaUrls.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {mediaUrls.map((url, index) => (
            <div
              key={index}
              className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-border group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Upload ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeMedia(url)}
                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {mediaUrls.length < 4 && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 shrink-0 rounded-lg border-2 border-dashed border-border bg-surface hover:bg-surface-elevated transition-colors flex flex-col items-center justify-center text-text-secondary disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImagePlus className="w-5 h-5 mb-1" />
              )}
              <span className="text-[10px] font-medium">
                {uploading ? "Uploading…" : "Add More"}
              </span>
            </button>
          )}
        </div>
      )}

      {mediaUrls.length === 0 && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-text-secondary hover:bg-surface-elevated transition-colors bg-surface group disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
              <p className="text-sm font-medium">Uploading…</p>
            </>
          ) : (
            <>
              <div className="flex gap-4 mb-2">
                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <div className="p-3 rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  <FileVideo className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs mt-1">Images or Videos up to 10MB</p>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
