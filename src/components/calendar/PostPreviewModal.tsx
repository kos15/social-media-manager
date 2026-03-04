import { X } from "lucide-react";

interface PostPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: {
        title: string;
        date: string;
        color: string;
    } | null;
}

export function PostPreviewModal({ isOpen, onClose, post }: PostPreviewModalProps) {
    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-surface rounded-xl border border-border w-full max-w-lg shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Post Preview</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: post.color }} />
                        <h3 className="font-medium text-lg">{post.title}</h3>
                    </div>

                    <div className="bg-surface-elevated rounded-lg p-4 border border-border">
                        <p className="text-sm text-text-secondary mb-2">Scheduled for: <span className="text-foreground font-medium">{post.date}</span></p>
                        <div className="prose prose-sm dark:prose-invert">
                            <p>This is a mock representation of the scheduled post. The real application would render the rich text content and any attached media here.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-elevated p-4 border-t border-border flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface transition-colors border border-transparent hover:border-border">
                        Close
                    </button>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors">
                        Edit Post
                    </button>
                </div>
            </div>
        </div>
    );
}
