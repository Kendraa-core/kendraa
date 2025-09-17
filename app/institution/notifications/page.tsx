'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, getInstitutionByUserId } from '@/lib/queries';
import type { Notification, Institution } from '@/types/database.types';
import { 
  BellIcon,
  UserPlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  UserIcon,
  CalendarIcon,
  AtSymbolIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/common/Avatar';

export default function InstitutionNotificationsPage() {
  const { user, profile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchInstitution = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const institutionData = await getInstitutionByUserId(user.id);
      setInstitution(institutionData);
    } catch (error) {
      console.error('Error fetching institution:', error);
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const notificationsData = await getNotifications(user.id);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchInstitution();
  }, [fetchInstitution]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection_request':
        return UserPlusIcon;
      case 'post_like':
        return HeartIcon;
      case 'comment':
        return ChatBubbleLeftIcon;
      case 'job_application':
        return BriefcaseIcon;
      case 'connection_accepted':
        return CheckCircleIcon;
      case 'post_comment':
        return ChatBubbleLeftIcon;
      case 'event_reminder':
        return CalendarIcon;
      case 'mention':
        return AtSymbolIcon;
      default:
        return BellIcon;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'connection_request':
        return 'text-blue-600';
      case 'post_like':
        return 'text-red-600';
      case 'comment':
        return 'text-green-600';
      case 'job_application':
        return 'text-purple-600';
      case 'connection_accepted':
        return 'text-green-600';
      case 'post_comment':
        return 'text-green-600';
      case 'event_reminder':
        return 'text-orange-600';
      case 'mention':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notification => !notification.read);
      case 'read':
        return notifications.filter(notification => notification.read);
      default:
        return notifications;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: Implement mark as read functionality
      toast.success('Notification marked as read');
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Implement mark all as read functionality
      toast.success('All notifications marked as read');
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: Implement delete notification functionality
      toast.success('Notification deleted');
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007fff] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Stay updated with your institution&apos;s activity
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Mark All as Read
                </Button>
              )}
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-[#007fff]">{unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'read', label: 'Read', count: notifications.length - unreadCount },
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-white text-[#007fff] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterOption.label}
                {filterOption.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    filter === filterOption.id
                      ? 'bg-[#007fff]/10 text-[#007fff]'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {filterOption.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {getFilteredNotifications().length > 0 ? (
            getFilteredNotifications().map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              
              return (
                <Card key={notification.id} className={`hover:shadow-md transition-shadow ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-5 h-5 ${iconColor}`} />
                        </div>
                      </div>
                      
                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-800' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatRelativeTime(notification.created_at)}
                            </p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.read && (
                              <Button
                                onClick={() => markAsRead(notification.id)}
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </Button>
                            )}
                            
                            <Button
                              onClick={() => deleteNotification(notification.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' && 'No notifications yet'}
                {filter === 'unread' && 'No unread notifications'}
                {filter === 'read' && 'No read notifications'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' && 'You\'ll receive notifications about connections, job applications, and other activities here.'}
                {filter === 'unread' && 'All caught up! No unread notifications.'}
                {filter === 'read' && 'No read notifications to show.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
