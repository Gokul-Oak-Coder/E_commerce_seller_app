import { useState } from 'react';
import { productService } from '../services/productService';
import { Product, ApiError } from '../types';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchProduct = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await productService.getProduct(id);
            setProduct(data);
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Failed to fetch product');
        } finally {
            setLoading(false);
        }
    };

    const createProduct = async (formData: FormData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await productService.createProduct(formData);
            setProducts((prev) => [data, ...prev]);
            return true;
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Failed to create product');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async (id: number, formData: FormData) => {
        try {
            setLoading(true);
            setError(null);
            const data = await productService.updateProduct(id, formData);
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? data : p))
            );
            setProduct(data);
            return true;
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Failed to update product');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            await productService.deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
            return true;
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Failed to delete product');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteImage = async (imageId: number) => {
        try {
            await productService.deleteImage(imageId);
            if (product) {
                setProduct({
                    ...product,
                    images: product.images.filter((img) => img.id !== imageId),
                });
            }
            return true;
        } catch (err: any) {
            const apiError: ApiError = err.response?.data;
            setError(apiError?.message || 'Failed to delete image');
            return false;
        }
    };

    return {
        products,
        product,
        loading,
        error,
        fetchProducts,
        fetchProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        deleteImage,
    };
};