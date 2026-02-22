import { useState } from 'react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { ApiError } from '../types';

export const useAuth = () => {
    const { setAuth, clearAuth, isAuthenticated, user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.login(email, password);
            await setAuth(data.user, data.token);
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await authService.logout();
        } catch {
            // even if API fails, clear local auth
        } finally {
            await clearAuth();
            setLoading(false);
        }
    };

    return { login, logout, loading, error, isAuthenticated, user };
};