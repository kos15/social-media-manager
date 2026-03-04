import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    theme: 'dark' | 'light' | 'system';
    toggleSidebar: () => void;
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    theme: 'system',
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setTheme: (theme) => set({ theme }),
}));
