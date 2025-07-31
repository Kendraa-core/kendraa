'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { Profile } from '@/types/database.types';

interface NotificationActor {
  id: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
}

interface NotificationPost {
  id: string;
  content: string;
  image_url?: string;
}

interface NotificationConnection {
  id: string;
  status: string;
  requester_id: string;
  recipient_id: string;
}

interface Notification {
  id: string;
  created_at: string;
  type: 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment';
  read: boolean;
  recipient_id: string;
  actor_id: string;
  post_id?: string;
  connection_id?: string;
  actor?: NotificationActor | null;
  post?: NotificationPost | null;
  connection?: NotificationConnection | null;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  viewCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          created_at,
          type,
          read,
          recipient_id,
          actor_id,
          post_id,
          connection_id,
          title,
          message
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedData = data.map(notification => ({
        ...notification,
        actor: null, // Will be fetched separately if needed
        post: null,  // Will be fetched separately if needed  
        connection: null, // Will be fetched separately if needed
      }));

      setNotifications(formattedData);
      setUnreadCount(formattedData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('recipient_id', user?.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user?.id]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('recipient_id', user?.id);

      if (error) throw error;

      setNotifications(prev => {
        const filtered = prev.filter(n => n.id !== notificationId);
        setUnreadCount(filtered.filter(n => !n.read).length);
        return filtered;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [user?.id]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            await fetchNotifications();
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => {
              const filtered = prev.filter(n => n.id !== payload.old.id);
              setUnreadCount(filtered.filter(n => !n.read).length);
              return filtered;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      viewCount,
      markAsRead,
      deleteNotification
    }}>
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