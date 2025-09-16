'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  BellIcon,
  UserPlusIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'connection_request' | 'job_application' | 'event_registration' | 'like' | 'comment' | 'follow';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  action_url?: string;
}

export default function MobileNotificationsPage() {
  const { user } = useAuth();
  const { notifications: contextNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    // Mock notifications for demonstration
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'connection_request',
        title: 'New Connection Request',
        message: 'Dr. Sarah Johnson wants to connect with you',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: false,
        user: {
          id: '1',
          full_name: 'Dr. Sarah Johnson',
          avatar_url: ''
        },
        action_url: '/mob/network'
      },
      {
        id: '2',
        type: 'like',
        title: 'Post Liked',
        message: 'Dr. Michael Chen liked your post about healthcare innovation',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        user: {
          id: '2',
          full_name: 'Dr. Michael Chen',
          avatar_url: ''
        }
      },
      {
        id: '3',
        type: 'job_application',
        title: 'Job Application Update',
        message: 'Your application for Senior Nurse position has been reviewed',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        action_url: '/mob/applications'
      },
      {
        id: '4',
        type: 'event_registration',
        title: 'Event Reminder',
        message: 'Healthcare Innovation Summit starts tomorrow',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        read: true,
        action_url: '/mob/events'
      },
      {
        id: '5',
        type: 'comment',
        title: 'New Comment',
        message: 'Dr. Emily Rodriguez commented on your post',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        read: true,
        user: {
          id: '3',
          full_name: 'Dr. Emily Rodriguez',
          avatar_url: ''
        }
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection_request':
        return UserPlusIcon;
      case 'job_application':
        return BriefcaseIcon;
      case 'event_registration':
        return CalendarDaysIcon;
      case 'like':
        return HeartIcon;
      case 'comment':
        return ChatBubbleLeftIcon;
      case 'follow':
        return UserPlusIcon;
      default:
        return BellIcon;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'connection_request':
        return 'text-blue-600 bg-blue-100';
      case 'job_application':
        return 'text-green-600 bg-green-100';
      case 'event_registration':
        return 'text-purple-600 bg-purple-100';
      case 'like':
        return 'text-red-600 bg-red-100';
      case 'comment':
        return 'text-orange-600 bg-orange-100';
      case 'follow':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      // markAsRead(notification.id); // TODO: Implement when available
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // markAllAsRead(); // TODO: Implement when available
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || (filter === 'unread' && !notification.read)
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <MobileLayout title="Notifications">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="md" text="Loading notifications..." />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Notifications">
      <div className="flex flex-col h-full">
        {/* Header Actions */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative ${
                  filter === 'unread'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                
                const content = (
                  <div 
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : 'bg-white'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {notification.user ? (
                        <Avatar
                          src={notification.user.avatar_url}
                          alt={notification.user.full_name}
                          size="md"
                          className="flex-shrink-0"
                        />
                      ) : (
                        <div className={`p-2 rounded-full ${colorClasses}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return notification.action_url ? (
                  <Link key={notification.id} href={notification.action_url}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>
                    {content}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <BellIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-sm text-gray-400 text-center mt-2">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for new updates.'
                  : 'You\'ll see notifications here when you get them.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
