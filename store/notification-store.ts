import { getNotifications, INotification, markAllAsRead, markAsRead } from '@/services/notification-service';
import { create } from 'zustand';

interface NotificationState {
    notifications: INotification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const response = await getNotifications();
            if (response.data.success) {
                const notifications = response.data.notifications;
                const unreadCount = notifications.filter(n => !n.isRead).length;
                set({ notifications, unreadCount });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            set({ loading: false });
        }
    },
    markRead: async (id) => {
        try {
            const response = await markAsRead(id);
            if (response.data.success) {
                const { notifications, unreadCount } = get();
                const updatedNotifications = notifications.map(n =>
                    n._id === id ? response.data.notification : n
                );
                set({
                    notifications: updatedNotifications,
                    unreadCount: Math.max(0, unreadCount - 1)
                });
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },
    markAllRead: async () => {
        try {
            const response = await markAllAsRead();
            if (response.data.success) {
                const { notifications } = get();
                const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
                set({ notifications: updatedNotifications, unreadCount: 0 });
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
}));
