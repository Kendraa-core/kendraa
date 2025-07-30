'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  UserPlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { Notification } from '@/types/database.types';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (notificationId: string) => void;
}

export default function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  const getNotificationConfig = (notification: Notification) => {
    switch (notification.type) {
      case 'connection_request':
        return {
          icon: UserPlusIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          text: notification.message,
          link: notification.data?.profileId ? `/profile/${notification.data.profileId}` : '#',
        };
      case 'connection_accepted':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: notification.message,
          link: notification.data?.profileId ? `/profile/${notification.data.profileId}` : '#',
        };
      case 'like':
        return {
          icon: HeartIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          text: notification.message,
          link: notification.data?.postId ? `/post/${notification.data.postId}` : '#',
        };
      case 'comment':
        return {
          icon: ChatBubbleLeftIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          text: notification.message,
          link: notification.data?.postId ? `/post/${notification.data.postId}` : '#',
        };
      case 'post_mention':
        return {
          icon: ChatBubbleLeftIcon,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100',
          text: notification.message,
          link: notification.data?.postId ? `/post/${notification.data.postId}` : '#',
        };
      default:
        return {
          icon: UserPlusIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: notification.message,
          link: '#',
        };
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlusIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
        <p className="text-gray-500">When you get notifications, they&apos;ll show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification, index) => {
        const config = getNotificationConfig(notification);
        
        return (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-all duration-200 ${
              notification.read 
                ? 'bg-white border-gray-200' 
                : 'bg-blue-50 border-blue-200 shadow-sm'
            }`}
            onClick={() => {
              if (!notification.read && onMarkAsRead) {
                onMarkAsRead(notification.id);
              }
            }}
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                <config.icon className={`w-5 h-5 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {config.text}
                    </p>
                  </div>
                  
                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
} 