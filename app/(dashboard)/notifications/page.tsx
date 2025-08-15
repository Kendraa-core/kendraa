'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getNotifications, getConnectionRequests, acceptConnectionRequest, rejectConnectionRequest, getProfile } from '@/lib/queries';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  UserPlusIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import type { Notification, ConnectionWithProfile, Profile } from '@/types/database.types';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionWithProfile[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingNotifications(true);
      const [notificationsData, connectionRequestsData] = await Promise.all([
        getNotifications(user.id),
        getConnectionRequests(user.id)
      ]);
      
      setNotifications(notificationsData);
      setConnectionRequests(connectionRequestsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const success = await acceptConnectionRequest(connectionId);
      if (success) {
        toast.success('Connection request accepted!');
        fetchNotifications(); // Refresh to update the list
      } else {
        toast.error('Failed to accept connection request');
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Failed to accept connection request');
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    try {
      const success = await rejectConnectionRequest(connectionId);
      if (success) {
        toast.success('Connection request rejected');
        fetchNotifications(); // Refresh to update the list
      } else {
        toast.error('Failed to reject connection request');
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast.error('Failed to reject connection request');
    }
  };

  const getNotificationConfig = (notification: Notification) => {
    switch (notification.type) {
      case 'connection_request':
        return {
          icon: UserPlusIcon,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100',
          text: notification.message,
        };
      case 'connection_accepted':
        return {
          icon: CheckCircleIcon,
          color: 'text-secondary-600',
          bgColor: 'bg-secondary-100',
          text: notification.message,
        };
      case 'post_like':
        return {
          icon: HeartIcon,
          color: 'text-accent-600',
          bgColor: 'bg-accent-100',
          text: notification.message,
        };
      case 'post_comment':
        return {
          icon: ChatBubbleLeftIcon,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100',
          text: notification.message,
        };
      default:
        return {
          icon: BellIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          text: notification.message,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingRequestsCount = connectionRequests.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your network activity</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'requests'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Connection Requests
              {pendingRequestsCount > 0 && (
                <span className="ml-2 bg-secondary-600 text-white text-xs rounded-full px-2 py-1">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {loadingNotifications ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : activeTab === 'all' ? (
          /* All Notifications */
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div
                
                
                className="bg-white rounded-xl shadow-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BellIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500">When you get notifications, they&apos;ll show up here.</p>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const config = getNotificationConfig(notification);
                
                return (
                  <div
                    key={notification.id}
                    
                    
                    
                    className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                      notification.read 
                        ? 'border-gray-200' 
                        : 'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <config.icon className={`w-6 h-6 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-base font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {config.text}
                            </p>
                          </div>
                          
                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="w-3 h-3 bg-primary-600 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <p className="text-xs text-gray-500 mt-3">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Connection Requests */
          <div className="space-y-4">
            {connectionRequests.length === 0 ? (
              <div
                
                
                className="bg-white rounded-xl shadow-sm p-8 text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlusIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-500">You don&apos;t have any pending connection requests.</p>
              </div>
            ) : (
              connectionRequests.map((request, index) => (
                <div
                  key={request.id}
                  
                  
                  
                  className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-secondary-500"
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {request.requester.full_name?.charAt(0) || 'U'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900 mb-1">
                            {request.requester.full_name || 'User'} wants to connect
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            {request.requester.headline || 'Healthcare Professional'}
                          </p>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleAcceptConnection(request.id)}
                              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleRejectConnection(request.id)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500 mt-3">
                        {formatRelativeTime(request.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 