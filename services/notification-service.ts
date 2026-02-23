import apiClient from './api-client';

export interface INotification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: 'order' | 'promotion' | 'info';
    isRead: boolean;
    createdAt: string;
}

export const getNotifications = async () => {
    return await apiClient.get<{ success: boolean, notifications: INotification[] }>('/notifications');
};

export const markAsRead = async (id: string) => {
    return await apiClient.put<{ success: boolean, notification: INotification }>(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
    return await apiClient.put<{ success: boolean, message: string }>('/notifications/read-all');
};
