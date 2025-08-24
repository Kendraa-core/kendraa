'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCircleIcon, 
  BookmarkIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getConnectionCount, getEventsByOrganizer } from '@/lib/queries';
import { formatNumber } from '@/lib/utils';

export default function LeftSidebar() {
  const { user, profile } = useAuth();
  const [connectionCount, setConnectionCount] = useState(0);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load data in parallel
        const [connectionsCount, events] = await Promise.all([
          getConnectionCount(user.id),
          getEventsByOrganizer(user.id)
        ]);
        
        setConnectionCount(connectionsCount);
        setUserEvents(events);
      } catch (error) {
        console.error('Error loading left sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Widget */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="relative mb-4">
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.full_name || 'User'}
              size="lg"
              className="mx-auto"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
              <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {profile?.full_name || 'Your Name'}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {profile?.headline || 'Professional Headline'}
          </p>
          {profile?.location && (
            <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {profile.location}
            </div>
          )}
          <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
            <UserGroupIcon className="w-3 h-3 mr-1" />
            {formatNumber(connectionCount)} connections
          </div>
          <Link 
            href={`/profile/${user?.id}`}
            className="inline-block bg-azure-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-azure-600 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* My Events Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">My Events ({userEvents.length})</h3>
          <Link href="/events" className="text-xs text-azure-500 hover:text-azure-600 font-medium">
            See all
          </Link>
        </div>
        
        {userEvents.length > 0 ? (
          <div className="space-y-3">
            {userEvents.slice(0, 2).map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-azure-100 rounded-lg flex items-center justify-center">
                  <CalendarDaysIcon className="w-4 h-4 text-azure-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">Activity</p>
                </div>
                <span className="text-xs text-azure-500 font-medium">
                  {formatNumber(event.attendees_count || 0)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">No events created yet</p>
            <Link href="/events/create" className="text-xs text-azure-500 hover:text-azure-600 font-medium mt-1 inline-block">
              Create your first event
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-3">
          <Link href="/saved-items" className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <BookmarkIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Saved items</span>
          </Link>
          <Link href="/network" className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <UserGroupIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Groups</span>
          </Link>
          <Link href="/newsletters" className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <UserCircleIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Newsletters</span>
          </Link>
          <Link href="/events" className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 