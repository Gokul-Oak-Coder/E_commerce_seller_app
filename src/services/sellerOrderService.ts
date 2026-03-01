import { SellerOrder, SubOrderStatus } from '../types';
import api from './api'; // your axios instance with auth token

export const sellerOrderService = {
    getOrders: () =>
        api.get<SellerOrder[]>('/orders'),

    getOrder: (id: number) =>
        api.get<SellerOrder>(`/orders/${id}`),

    updateStatus: (id: number, status: SubOrderStatus) =>
        api.patch(`/orders/${id}/status`, { status }),
};