import apiClient from './api-client';

export interface IOrderItem {
    menuItemId: string;
    title: string;
    quantity: number;
    price: number;
    image: string;
}

export interface IOrder {
    _id: string;
    shopId: {
        _id: string;
        name: string;
        image: string;
    };
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
    paymentMethod: 'momo' | 'cod';
    paymentStatus: 'pending' | 'success' | 'failed';
    createdAt: string;
}

export const getMyOrders = async () => {
    return await apiClient.get<{ success: boolean, orders: IOrder[] }>('/orders/my');
};

export const createOrder = async (orderData: {
    shopId: string;
    items: any[];
    totalAmount: number;
    paymentMethod: string;
}) => {
    return await apiClient.post('/orders', orderData);
};
