'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationAsRead } from '@/lib/queries';
import { useIsClient } from '@/hooks/useIsClient';
import type { Notification } from '@/types/database.types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isClient = useIsClient();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id || !isClient) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      // Silent error handling for notifications
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id, isClient]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      // Silent error handling for marking notification as read
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user?.id || typeof window === 'undefined') return;
    
    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      // Silent error handling for refreshing notifications
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    if (isClient) {
      fetchNotifications();
    }
  }, [fetchNotifications, isClient]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    refreshNotifications
  }), [notifications, unreadCount, markAsRead, refreshNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 