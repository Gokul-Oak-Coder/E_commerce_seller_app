import api from './api';
import { AuthResponse } from '../types';

export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/login', { email, password });
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/logout');
    },
};