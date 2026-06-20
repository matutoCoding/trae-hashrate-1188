import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, NotificationType } from '@/types';
import { generateId } from '@/utils';

interface NotificationState {
  notifications: Notification[];
  addNotification: (
    data: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ) => Notification;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
  getUnreadNotifications: () => Notification[];
  getPickupNotifications: () => Notification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (data) => {
        const notification: Notification = {
          ...data,
          id: generateId(),
          read: false,
          createdAt: new Date(),
        };
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
        return notification;
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: () =>
        get().notifications.filter((n) => !n.read).length,

      getUnreadNotifications: () =>
        get().notifications.filter((n) => !n.read),

      getPickupNotifications: () =>
        get().notifications.filter((n) => n.type === 'pickup' && !n.read),
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
