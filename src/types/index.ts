export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface Store {
    id: number;
    name: string;
    seller_id: number;
    description: string | null;
    phone: string | null;
    address: string | null
    logo: string | null;
    banner: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductImage {
    id: number;
    product_id: number;
    image_path: string;
    is_primary: boolean;
}

export interface Product {
    id: number;
    store_id: number;
    name: string;
    description: string | null;
    sku: string;
    price: number;
    discount_price: number | null;
    stock: number;
    is_active: boolean;
    images: ProductImage[];
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}
// add these to your existing types file

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    image: string | null;
}

export interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    status: OrderStatus;
    total: number;
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}