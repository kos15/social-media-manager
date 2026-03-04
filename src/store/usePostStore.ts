import { create } from 'zustand';

interface PostState {
    currentPost: string;
    mediaUrls: string[];
    scheduledDate: Date | null;
    selectedPlatforms: string[];
    setPostContent: (content: string) => void;
    addMedia: (url: string) => void;
    removeMedia: (url: string) => void;
    setScheduledDate: (date: Date | null) => void;
    togglePlatform: (platformId: string) => void;
    resetPost: () => void;
}

export const usePostStore = create<PostState>((set) => ({
    currentPost: '',
    mediaUrls: [],
    scheduledDate: null,
    selectedPlatforms: [],

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
    resetPost: () => set({
        currentPost: '',
        mediaUrls: [],
        scheduledDate: null,
        selectedPlatforms: []
    })
}));
