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
import { 
  getConnectionCount, 
  getEventsByOrganizer,
  getEventOrganizer,
  getInstitutionByUserId
} from '@/lib/queries';
import { formatNumber } from '@/lib/utils';

interface LeftSidebarProps {
  connectionCount?: number;
  groupsCount?: number;
  eventsCount?: number;
  pagesCount?: number;
  newslettersCount?: number;
  isInstitution?: boolean;
}

export default function LeftSidebar({ 
  connectionCount: propConnectionCount = 0,
  groupsCount = 0,
  eventsCount = 0,
  pagesCount = 0,
  newslettersCount = 0,
  isInstitution = false 
}: LeftSidebarProps) {
  const { user, profile } = useAuth();
  const [connectionCount, setConnectionCount] = useState(propConnectionCount);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load data in parallel
        const events = await getEventsByOrganizer(user.id);
        
        if (!isInstitution) {
          const connectionsCount = await getConnectionCount(user.id);
          setConnectionCount(connectionsCount);
        } else {
          const institutionData = await getInstitutionByUserId(user.id);
          setInstitution(institutionData);
        }
        
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
              // Silent error handling for event organizer
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
        
        setUserEvents(eventsWithOrganizers);
          } catch (error) {
      // Silent error handling for left sidebar data
    } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, isInstitution]);

  const formatInstitutionTypeAsHeadline = (type: string | null | undefined): string => {
    if (!type) return 'Healthcare Organization';
    const typeMap: Record<string, string> = {
      'hospital': 'Hospital',
      'clinic': 'Medical Clinic',
      'research_center': 'Research Center',
      'university': 'University',
      'pharmaceutical': 'Pharmaceutical Company',
      'medical_device': 'Medical Device Company',
      'other': 'Healthcare Organization'
    };
    return typeMap[type] || 'Healthcare Organization';
  };

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
    <div className="space-y-8 h-full">
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
            {isInstitution 
              ? formatInstitutionTypeAsHeadline(institution?.type)
              : (profile?.headline || 'Professional Headline')
            }
          </p>
          {profile?.location && (
            <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {profile.location}
            </div>
          )}
          {!isInstitution && (
            <div className="flex items-center justify-center text-xs text-gray-500 mb-5">
              <UserGroupIcon className="w-3 h-3 mr-1" />
              {formatNumber(connectionCount)} connections
            </div>
          )}
          <Link 
            href={profile?.user_type === 'institution' || profile?.profile_type === 'institution' ? '/institution/profile' : `/profile/${user?.id}`}
            className="inline-block bg-azure-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-azure-600 transition-colors"
          >
            View Profile
          </Link>
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
            <span className="text-sm text-gray-700">Network</span>
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