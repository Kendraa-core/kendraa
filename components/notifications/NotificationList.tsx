'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  XMarkIcon,
  UserPlusIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification } from '@/types/database.types';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const getNotificationContent = () => {
    switch (notification.type) {
      case 'connection_request':
        return {
          icon: UserPlusIcon,
          text: 'sent you a connection request',
          link: `/profile/${notification.actor?.id}`,
        };
      case 'connection_accepted':
        return {
          icon: UserPlusIcon,
          text: 'accepted your connection request',
          link: `/profile/${notification.actor?.id}`,
        };
      case 'post_like':
        return {
          icon: HandThumbUpIcon,
          text: 'liked your post',
          link: `/post/${notification.post?.id}`,
        };
      case 'post_comment':
        return {
          icon: ChatBubbleLeftIcon,
          text: 'commented on your post',
          link: `/post/${notification.post?.id}`,
        };
      default:
        return {
          icon: ChatBubbleLeftIcon,
          text: 'interacted with your profile',
          link: '#',
        };
    }
  };

  const content = getNotificationContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <Link href={`/profile/${notification.actor?.id}`} className="flex-shrink-0">
          {notification.actor?.avatar_url ? (
            <Image
              src={notification.actor.avatar_url}
              alt={notification.actor.full_name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <UserPlusIcon className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={content.link} className="block">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{notification.actor?.full_name}</span>{' '}
              {content.text}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {!notification.read && (
            <button
              onClick={() => onRead(notification.id)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <span className="sr-only">Mark as read</span>
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <span className="sr-only">Delete</span>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function NotificationList() {
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-lg w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-gray-200 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No notifications to show
          </div>
        )}
      </div>
    </div>
  );
} 