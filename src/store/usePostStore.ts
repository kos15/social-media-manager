import { create } from 'zustand';

export interface ScheduledPost {
    id: string;
    content: string;
    mediaUrls: string[];
    scheduledDate: string; // ISO string
    platforms: string[];
}

interface PostState {
    currentPost: string;
    mediaUrls: string[];
    scheduledDate: Date | null;
    selectedPlatforms: string[];
    scheduledPosts: ScheduledPost[];
    editingPostId: string | null;
    setPostContent: (content: string) => void;
    addMedia: (url: string) => void;
    removeMedia: (url: string) => void;
    setScheduledDate: (date: Date | null) => void;
    togglePlatform: (platformId: string) => void;
    // Bulk-replace the posts list (used by calendar on DB fetch)
    setScheduledPosts: (posts: ScheduledPost[]) => void;
    // Add a single post or replace the editing one
    addScheduledPost: (post: ScheduledPost) => void;
    removeScheduledPost: (id: string) => void;
    // Pre-fill the composer from an existing post
    editPost: (post: ScheduledPost) => void;
    resetPost: () => void;
}

export const usePostStore = create<PostState>((set) => ({
    currentPost: '',
    mediaUrls: [],
    scheduledDate: null,
    selectedPlatforms: [],
    scheduledPosts: [],
    editingPostId: null,

    setPostContent: (content) => set({ currentPost: content }),
    addMedia: (url) => set((state) => ({ mediaUrls: [...state.mediaUrls, url] })),
    removeMedia: (url) => set((state) => ({
        mediaUrls: state.mediaUrls.filter(u => u !== url)
    })),
    setScheduledDate: (date) => set({ scheduledDate: date }),
    togglePlatform: (platformId) => set((state) => ({
        selectedPlatforms: state.selectedPlatforms.includes(platformId)
            ? state.selectedPlatforms.filter(p => p !== platformId)
            : [...state.selectedPlatforms, platformId]
    })),

    // Replace the entire list — used when hydrating from the DB
    setScheduledPosts: (posts) => set({ scheduledPosts: posts }),

    // Add or replace (when editing) a single post
    addScheduledPost: (post) => set((state) => ({
        scheduledPosts: state.editingPostId
            ? state.scheduledPosts.map(p => p.id === state.editingPostId ? post : p)
            : [...state.scheduledPosts, post],
        editingPostId: null,
    })),

    removeScheduledPost: (id) => set((state) => ({
        scheduledPosts: state.scheduledPosts.filter(p => p.id !== id)
    })),

    editPost: (post) => set({
        currentPost: post.content,
        mediaUrls: [...post.mediaUrls],
        scheduledDate: new Date(post.scheduledDate),
        selectedPlatforms: [...post.platforms],
        editingPostId: post.id,
    }),

    resetPost: () => set({
        currentPost: '',
        mediaUrls: [],
        scheduledDate: null,
        selectedPlatforms: [],
        editingPostId: null,
    })
}));
