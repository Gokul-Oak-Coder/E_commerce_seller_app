import api from './api';
import { Product } from '../types';

export const productService = {
    getProducts: async (): Promise<Product[]> => {
        const response = await api.get('/products');
        return response.data;
    },

    getProduct: async (id: number): Promise<Product> => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    createProduct: async (data: FormData): Promise<Product> => {
        const response = await api.post('/products', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.product;
    },

    updateProduct: async (id: number, data: FormData): Promise<Product> => {
        const response = await api.post(`/products/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.product;
    },

    deleteProduct: async (id: number): Promise<void> => {
        await api.delete(`/products/${id}`);
    },

    deleteImage: async (imageId: number): Promise<void> => {
        await api.delete(`/products/images/${imageId}`);
    },
};