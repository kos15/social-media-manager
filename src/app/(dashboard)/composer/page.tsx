import { PlatformSelector } from "@/components/composer/PlatformSelector";
import { RichTextEditor } from "@/components/composer/RichTextEditor";
import { MediaUpload } from "@/components/composer/MediaUpload";
import { LivePreview } from "@/components/composer/LivePreview";
import { SchedulingPicker } from "@/components/composer/SchedulingPicker";
import { Hash } from "lucide-react";

export default function ComposerPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Post Composer</h1>
            </div>
            <div className="flex h-[calc(100%-3rem)] border border-border rounded-xl overflow-hidden bg-surface-elevated shadow-sm">
                {/* Left Panel - Controls */}
                <div className="w-1/2 border-r border-border p-6 flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
                    <PlatformSelector />

                    <div className="border-t border-border pt-6 flex-1 flex flex-col min-h-[250px]">
                        <RichTextEditor />

                        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                            {['#technology', '#innovation', '#future', '#coding'].map(tag => (
                                <button key={tag} className="flex items-center gap-1 px-3 py-1 bg-surface border border-border rounded-full text-xs hover:bg-surface-elevated text-text-secondary transition-colors whitespace-nowrap">
                                    <Hash className="w-3 h-3" /> {tag.replace('#', '')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-border pt-6">
                        <MediaUpload />
                    </div>

                    <div className="border-t border-border pt-6">
                        <SchedulingPicker />
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="w-1/2 p-6 flex flex-col bg-surface overflow-hidden">
                    <h3 className="text-sm font-medium text-text-secondary mb-4 shrink-0">Live Preview</h3>
                    <LivePreview />
                </div>
            </div>
        </div>
    );
}
