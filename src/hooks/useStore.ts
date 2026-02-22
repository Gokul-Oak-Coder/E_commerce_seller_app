import { useState } from 'react';
import { storeService } from '../services/storeService';
import { useStoreStore } from '../store/storeStore';
import { ApiError } from '../types';

export const useStore = () => {
    const { store, setStore } = useStoreStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStore = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await storeService.getStore();
            setStore(data);
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Failed to fetch store');
            setStore(null);
        } finally {
            setLoading(false);
        }
    };

    const createStore = async (formData: FormData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await storeService.createStore(formData);
            setStore(data);
            return true;
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Failed to create store');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateStore = async (storeId: number, formData: FormData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await storeService.updateStore(storeId, formData);
            setStore(data);
            return true;
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Failed to update store');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { store, loading, error, fetchStore, createStore, updateStore };
};