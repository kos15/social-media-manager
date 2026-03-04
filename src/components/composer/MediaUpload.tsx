"use client";

import { usePostStore } from "@/store/usePostStore";
import { ImagePlus, X, FileVideo } from "lucide-react";
import { useCallback } from "react";

export function MediaUpload() {
    const { mediaUrls, addMedia, removeMedia } = usePostStore();

    const handleUploadClick = useCallback(() => {
        // Mock upload behavior
        const testImage = "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=400&auto=format&fit=crop";
        if (mediaUrls.length < 4) {
            addMedia(testImage);
        }
    }, [mediaUrls, addMedia]);

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-secondary">Media Attachments</h3>

            {mediaUrls.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {mediaUrls.map((url, index) => (
                        <div key={index} className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-border group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
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
                            onClick={handleUploadClick}
                            className="w-24 h-24 shrink-0 rounded-lg border-2 border-dashed border-border bg-surface hover:bg-surface-elevated transition-colors flex flex-col items-center justify-center text-text-secondary"
                        >
                            <ImagePlus className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-medium">Add More</span>
                        </button>
                    )}
                </div>
            )}

            {mediaUrls.length === 0 && (
                <button
                    onClick={handleUploadClick}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-text-secondary hover:bg-surface-elevated transition-colors bg-surface group"
                >
                    <div className="flex gap-4 mb-2">
                        <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <ImagePlus className="w-6 h-6" />
                        </div>
                        <div className="p-3 rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                            <FileVideo className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs mt-1">Images or Videos up to 10MB</p>
                </button>
            )}
        </div>
    );
}
