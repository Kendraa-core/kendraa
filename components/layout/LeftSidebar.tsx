'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserCircleIcon, 
  BookmarkIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  NewspaperIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getConnectionCount, 
  getEventsByOrganizer,
  getEventOrganizer
} from '@/lib/queries';
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
        
        // Fetch organizer information for events
        const eventsWithOrganizers = await Promise.all(
          events.map(async (event) => {
            try {
              const organizer = await getEventOrganizer(event.organizer_id);
              return {
                ...event,
                organizer: organizer || {
                  id: event.organizer_id,
                  full_name: 'Unknown Organizer',
                  avatar_url: null,
                  user_type: 'individual',
                  headline: 'Healthcare Professional'
                }
              };
            } catch (error) {
              console.error('Error fetching organizer for event:', event.id, error);
              return {
                ...event,
                organizer: {
                  id: event.organizer_id,
                  full_name: 'Unknown Organizer',
                  avatar_url: null,
                  user_type: 'individual',
                  headline: 'Healthcare Professional'
                }
              };
            }
          })
        );
        
        setConnectionCount(connectionsCount);
        setUserEvents(eventsWithOrganizers);
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
        {[1, 2, 3, 4].map((i) => (
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
    <div className="space-y-8">
      {/* Profile Widget */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="relative mb-5">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {profile?.full_name || 'Your Name'}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {profile?.headline || 'Professional Headline'}
          </p>
          {profile?.location && (
            <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {profile.location}
            </div>
          )}
          <div className="flex items-center justify-center text-xs text-gray-500 mb-5">
            <UserGroupIcon className="w-3 h-3 mr-1" />
            {formatNumber(connectionCount)} connections
          </div>
          <Link 
            href={`/profile/${user?.id}`}
            className="inline-block bg-azure-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-azure-600 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Manage my network Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage my network</h2>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <UserGroupIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Connections</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{formatNumber(connectionCount)}</span>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Following & followers</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Groups</span>
            </div>
            <span className="text-sm font-medium text-gray-900">5</span>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Events</span>
            </div>
            <span className="text-sm font-medium text-gray-900">2</span>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Pages</span>
            </div>
            <span className="text-sm font-medium text-gray-900">267</span>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <NewspaperIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Newsletters</span>
            </div>
            <span className="text-sm font-medium text-gray-900">34</span>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-700">About</a>
            <a href="#" className="hover:text-gray-700">Accessibility</a>
            <a href="#" className="hover:text-gray-700">Help Center</a>
            <a href="#" className="hover:text-gray-700">Privacy & Terms</a>
            <a href="#" className="hover:text-gray-700">Ad Choices</a>
            <a href="#" className="hover:text-gray-700">Advertising</a>
            <a href="#" className="hover:text-gray-700">Business Services</a>
            <a href="#" className="hover:text-gray-700">Get the App</a>
            <a href="#" className="hover:text-gray-700">More</a>
          </div>
          <p className="text-xs text-gray-400 mt-4">Kendraa Corporation © 2025</p>
        </div>
      </div>

      {/* My Events Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900">My Events ({userEvents.length})</h3>
          <Link href="/events" className="text-xs text-azure-500 hover:text-azure-600 font-medium">
            See all
          </Link>
        </div>
        
        {userEvents.length > 0 ? (
          <div className="space-y-3">
            {userEvents.slice(0, 2).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mb-2">No events created yet</p>
            <Link href="/events/create" className="text-xs text-azure-500 hover:text-azure-600 font-medium inline-block">
              Create your first event
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-2">
          <Link href="/saved-items" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <BookmarkIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Saved items</span>
          </Link>
          <Link href="/network" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <UserGroupIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Groups</span>
          </Link>
          <Link href="/newsletters" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <UserCircleIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Newsletters</span>
          </Link>
          <Link href="/events" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 