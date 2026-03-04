"use client";

import { useEditor, EditorContent } from '@tiptap/react';
// @ts-expect-error missing tiptap core types
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { usePostStore } from '@/store/usePostStore';
import { useEffect } from 'react';

export function RichTextEditor() {
    const { currentPost, setPostContent } = usePostStore();

    const editor = useEditor({
        extensions: [StarterKit],
        content: currentPost,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[150px] p-4',
            },
        },
        onUpdate: ({ editor }: { editor: Editor }) => {
            setPostContent(editor.getText());
        },
    });

    // Sync state if it is reset externally
    useEffect(() => {
        if (editor && currentPost === '') {
            editor.commands.setContent('');
        }
    }, [currentPost, editor]);

    return (
        <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-text-secondary">Post Content</h3>
                <span className="text-xs text-text-secondary">{currentPost.length} / 280</span>
            </div>
            <div className="flex-1 bg-surface border border-border rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary overflow-hidden">
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
}
