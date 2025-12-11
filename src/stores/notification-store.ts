import { create } from 'zustand';
import api from '@/lib/axios';
import { Notification } from '@/types/notification.types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (ids: string[]) => void;
  removeNotification: (id: string) => void; // <-- Nueva función
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/notifications/my-notifications');
      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount
      });
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      set({ isLoading: false });
    }
  },
  markAsRead: (ids) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        ids.includes(n.id) ? { ...n, isRead: true } : n
      ),
      unreadCount: 0
    }));
    api.patch('/notifications/mark-as-read', { notificationIds: ids });
  },
  // --- LÓGICA AÑADIDA ---
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
}));