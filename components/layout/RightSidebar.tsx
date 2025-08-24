'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import { Card, CardContent } from '@/components/ui/Card';
import {
  UserGroupIcon,
  BookmarkIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TagIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { getConnectionCount, getEventsByOrganizer } from '@/lib/queries';
import { formatNumber } from '@/lib/utils';

interface RightSidebarProps {
  className?: string;
}

export default function RightSidebar({ className }: RightSidebarProps) {
  const { user, profile } = useAuth();
  const [connectionCount, setConnectionCount] = useState(0);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        const [connections, events] = await Promise.all([
          getConnectionCount(user.id),
          getEventsByOrganizer(user.id)
        ]);
        
        setConnectionCount(connections);
        setUserEvents(events);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className={`w-80 bg-white p-4 space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-2xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-white p-4 space-y-4 ${className}`}>
      {/* Profile Card */}
      <Card className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-br from-azure-500 via-azure-600 to-azure-700 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="text-white text-center">
                <p className="text-sm font-medium italic">&quot;Do what you love. Love what you do&quot;</p>
              </div>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="px-4 pb-4">
            <div className="flex justify-center -mt-8 mb-4">
              <Avatar
                src={profile?.avatar_url}
                alt={profile?.full_name || 'User'}
                size="xl"
                className="ring-4 ring-white shadow-lg"
              />
            </div>
            
            <div className="text-center mb-4">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {profile?.full_name || 'User Name'}
                </h3>
                {profile?.user_type === 'institution' && (
                  <ShieldCheckIcon className="w-5 h-5 text-azure-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {profile?.headline || 'Professional Headline'}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                {profile?.location || 'Location'}
              </p>
              <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
                <DocumentTextIcon className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-xs text-gray-600">Stealth Mode Startup</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Analytics Card */}
      <Card className="bg-white shadow-sm border border-gray-200 rounded-2xl">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profile viewers</span>
              <span className="text-sm font-semibold text-azure-500">{formatNumber(connectionCount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Post impressions</span>
              <span className="text-sm font-semibold text-azure-500">{formatNumber(userEvents.length * 2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Events Card */}
      <Card className="bg-white shadow-sm border border-gray-200 rounded-2xl">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">My Events ({userEvents.length})</h3>
          <div className="space-y-3">
            {userEvents.slice(0, 2).map((event, index) => (
              <div key={event.id || index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-azure-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title || 'Event Title'}</p>
                  <p className="text-xs text-gray-500">Activity</p>
                  <p className="text-xs text-azure-500">{formatNumber(event.attendees_count || 0)}</p>
                </div>
              </div>
            ))}
            {userEvents.length === 0 && (
              <div className="text-center py-4">
                <CalendarDaysIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No events yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grow Your Business Card */}
      <Card className="bg-white shadow-sm border border-gray-200 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-azure-500 rounded-full flex items-center justify-center">
              <TagIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Grow your business</h3>
              <p className="text-xs text-gray-500">Try Campaign Manager</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links Card */}
      <Card className="bg-white shadow-sm border border-gray-200 rounded-2xl">
        <CardContent className="p-4">
          <div className="space-y-3">
            <Link href="/saved-items" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <BookmarkIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Saved items</span>
            </Link>
            <Link href="/groups" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <UserGroupIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Groups</span>
            </Link>
            <Link href="/newsletters" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <DocumentTextIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Newsletters</span>
            </Link>
            <Link href="/events" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Events</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 