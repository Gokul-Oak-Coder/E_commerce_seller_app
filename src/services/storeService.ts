import api from './api';
import { Store } from '../types';

export const storeService = {
    getStore: async (): Promise<Store> => {
        const response = await api.get('/store');
        return response.data.store;
    },

    createStore: async (data: FormData): Promise<Store> => {
        const response = await api.post('/store', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.store;
    },

    updateStore: async (storeId: number, data: FormData): Promise<Store> => {
        const response = await api.post(`/store/${storeId}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.store;
    },
};