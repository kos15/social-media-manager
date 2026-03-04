import { create } from 'zustand';

interface SocialAccount {
    id: string;
    platform: 'TWITTER' | 'LINKEDIN' | 'INSTAGRAM' | 'YOUTUBE';
    username: string;
    profileImage?: string;
    status: 'ACTIVE' | 'EXPIRED' | 'DISCONNECTED';
}

interface AccountState {
    accounts: SocialAccount[];
    isLoading: boolean;
    setAccounts: (accounts: SocialAccount[]) => void;
    addAccount: (account: SocialAccount) => void;
    removeAccount: (id: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
    accounts: [],
    isLoading: false,
    setAccounts: (accounts) => set({ accounts }),
    addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
    removeAccount: (id) => set((state) => ({
        accounts: state.accounts.filter(a => a.id !== id)
    })),
    setLoading: (loading) => set({ isLoading: loading })
}));
