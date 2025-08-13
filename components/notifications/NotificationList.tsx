'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatRelativeTime } from '@/lib/utils';
import {
  UserPlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  BriefcaseIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import type { Notification } from '@/types/database.types';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => Promise<void>;
}

export default function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  const router = useRouter();
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    try {
      await onMarkAsRead(notificationId);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.action_url) {
      router.push(notification.action_url);
    } else {
      // Default navigation based on notification type
      switch (notification.type) {
        case 'job_application':
          if (notification.data?.jobId) {
            router.push(`/jobs/${notification.data.jobId}`);
          } else {
            router.push('/applications');
          }
          break;
        case 'connection_request':
          router.push('/notifications?tab=requests');
          break;
        case 'connection_accepted':
          router.push('/network');
          break;
        case 'post_like':
        case 'post_comment':
          router.push('/feed');
          break;
        default:
          router.push('/feed');
      }
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'connection_request':
        return <UserPlusIcon className="w-5 h-5 text-blue-500" />;
      case 'connection_accepted':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'post_like':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'post_comment':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />;
      case 'job_application':
        return <BriefcaseIcon className="w-5 h-5 text-purple-500" />;
      case 'event_reminder':
        return <ClockIcon className="w-5 h-5 text-orange-500" />;
      case 'mention':
        return <BellIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'connection_request':
        return 'border-blue-200 bg-blue-50';
      case 'connection_accepted':
        return 'border-green-200 bg-green-50';
      case 'post_like':
        return 'border-red-200 bg-red-50';
      case 'post_comment':
        return 'border-blue-200 bg-blue-50';
      case 'job_application':
        return 'border-purple-200 bg-purple-50';
      case 'event_reminder':
        return 'border-orange-200 bg-orange-50';
      case 'mention':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="text-center">
            <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You&apos;re all caught up! New notifications will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                    {!notification.read && (
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                {notification.data && (
                  <div className="mt-2 text-xs text-gray-500">
                    {notification.type === 'job_application' && 
                     notification.data && 
                     typeof notification.data === 'object' && 
                     'jobTitle' in notification.data && (
                      <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {String(notification.data.jobTitle)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 