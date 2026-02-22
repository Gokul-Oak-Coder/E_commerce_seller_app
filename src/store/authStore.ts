import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => Promise<void>;
    clearAuth: () => Promise<void>;
    loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: async (user, token) => {
        await SecureStore.setItemAsync('auth_token', token);
        set({ user, token, isAuthenticated: true });
    },

    clearAuth: async () => {
        await SecureStore.deleteItemAsync('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    // Call this on app launch to restore session
    loadAuth: async () => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
            set({ token, isAuthenticated: true });
        }
    },
}));