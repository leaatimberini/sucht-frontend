import { create } from 'zustand';
import api from '@/lib/axios';
import { Notification } from '@/types/notification.types'; // Necesitarás crear este tipo

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/notifications/my-notifications');
      set({ 
        notifications: data.notifications, 
        unreadCount: data.unreadCount,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      set({ isLoading: false });
    }
  },
  markAsRead: async (notificationIds) => {
    if (notificationIds.length === 0) return;
    
    // Optimistic UI update: marcamos como leídas en el frontend al instante
    const currentNotifications = get().notifications;
    const updatedNotifications = currentNotifications.map(n => 
      notificationIds.includes(n.id) ? { ...n, isRead: true } : n
    );
    set({ notifications: updatedNotifications, unreadCount: get().unreadCount - notificationIds.length });

    // Y luego enviamos la petición al backend
    try {
      await api.patch('/notifications/mark-as-read', { notificationIds });
    } catch (error) {
      // Si falla, revertimos el cambio para mantener la consistencia
      console.error("Failed to mark notifications as read", error);
      set({ notifications: currentNotifications, unreadCount: get().unreadCount }); // Revertimos
    }
  },
}));