'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import {
  getEvents,
  getUserRegisteredEvents,
  registerForEvent,
  unregisterFromEvent,
  isRegisteredForEvent
} from '@/lib/queries';
import { type Event } from '@/types/database.types';
import {
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  VideoCameraIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { formatDate, formatNumber } from '@/lib/utils';

interface EventWithRegistration extends Event {
  isRegistered?: boolean;
  organizer?: {
    id: string;
    full_name: string;
    avatar_url: string;
    user_type: string;
    headline: string;
  };
}

export default function MobileEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'registered' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventWithRegistration | null>(null);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());

  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      let eventsData: Event[] = [];
      
      if (activeTab === 'registered') {
        eventsData = await getUserRegisteredEvents(user.id);
      } else {
        eventsData = await getEvents();
      }

      // Filter events based on tab
      const now = new Date();
      const filteredEvents = eventsData.filter(event => {
        const eventDate = new Date(event.start_date);
        if (activeTab === 'upcoming') {
          return eventDate >= now;
        } else if (activeTab === 'past') {
          return eventDate < now;
        }
        return true; // registered tab shows all registered events
      });

      // Check registration status for each event
      const eventsWithRegistration = await Promise.all(
        filteredEvents.map(async (event) => {
          const isRegistered = await isRegisteredForEvent(user.id, event.id);
          return { 
            ...event, 
            isRegistered,
            organizer: {
              id: event.organizer_id || '',
              full_name: 'Event Organizer',
              avatar_url: '',
              user_type: 'individual',
              headline: 'Healthcare Professional'
            }
          };
        })
      );

      setEvents(eventsWithRegistration);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeTab]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = async (eventId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await registerForEvent(user.id, eventId);
      
      if (success) {
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, isRegistered: true, attendees_count: (event.attendees_count || 0) + 1 }
            : event
        ));
        
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(prev => prev ? { ...prev, isRegistered: true } : null);
        }
        
        toast.success('Successfully registered for event!');
      } else {
        toast.error('Failed to register for event');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await unregisterFromEvent(user.id, eventId);
      
      if (success) {
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, isRegistered: false, attendees_count: Math.max((event.attendees_count || 1) - 1, 0) }
            : event
        ));
        
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(prev => prev ? { ...prev, isRegistered: false } : null);
        }
        
        toast.success('Successfully unregistered from event');
      } else {
        toast.error('Failed to unregister from event');
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast.error('Failed to unregister from event');
    }
  };

  const handleLike = (eventId: string) => {
    setLikedEvents(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(eventId)) {
        newLiked.delete(eventId);
        toast.success('Removed from favorites');
      } else {
        newLiked.add(eventId);
        toast.success('Added to favorites');
      }
      return newLiked;
    });
  };

  const handleShare = async (event: EventWithRegistration) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description || '',
          url: window.location.origin + `/mob/events/${event.id}`
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.origin + `/mob/events/${event.id}`
        );
        toast.success('Event link copied to clipboard');
      }
    } catch (error) {
      toast.error('Failed to share event');
    }
  };

  const filteredEvents = events.filter(event => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days`;
    return formatDate(dateString);
  };

  const EventCard = ({ event }: { event: EventWithRegistration }) => (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      onClick={() => setSelectedEvent(event)}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          src={event.organizer?.avatar_url}
          alt={event.organizer?.full_name || 'Event Organizer'}
          size="md"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {event.organizer?.full_name || 'Event Organizer'}
          </p>
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center">
              <CalendarDaysIcon className="w-3 h-3 mr-1" />
              <span>{formatEventDate(event.start_date)}</span>
            </div>
            <div className="flex items-center">
              <UsersIcon className="w-3 h-3 mr-1" />
              <span>{event.attendees_count || 0} attending</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            {event.is_virtual && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                Virtual
              </span>
            )}
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {event.event_type || 'Event'}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(event.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                {likedEvents.has(event.id) ? (
                  <HeartSolidIcon className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(event);
                }}
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>
            
            {event.isRegistered ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnregister(event.id);
                }}
                className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors"
              >
                <CheckIcon className="w-3 h-3 mr-1" />
                <span>Registered</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegister(event.id);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MobileLayout title="Events">
      <div className="flex flex-col h-full">
        {/* Search and Filters */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'registered'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Registered
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" text="Loading events..." />
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <CalendarDaysIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchQuery ? 'No events found matching your search' : 'No events available'}
              </p>
              {activeTab === 'registered' && (
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className="text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  Browse upcoming events
                </button>
              )}
            </div>
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ×
                  </button>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Avatar
                    src={selectedEvent.organizer?.avatar_url}
                    alt={selectedEvent.organizer?.full_name || 'Event Organizer'}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      by {selectedEvent.organizer?.full_name || 'Event Organizer'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        <span>{formatDate(selectedEvent.start_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1" />
                        <span>{selectedEvent.attendees_count || 0} attending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedEvent.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        <span>{selectedEvent.is_virtual ? 'Online Event' : (selectedEvent.location || 'Location TBA')}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>{formatDate(selectedEvent.start_date)}</span>
                      </div>
                      {selectedEvent.registration_fee && (
                        <div className="flex items-center">
                          <span className="mr-2">💰</span>
                          <span>${selectedEvent.registration_fee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleLike(selectedEvent.id)}
                        className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
                      >
                        {likedEvents.has(selectedEvent.id) ? (
                          <HeartSolidIcon className="w-5 h-5 text-red-500 mr-1" />
                        ) : (
                          <HeartIcon className="w-5 h-5 mr-1" />
                        )}
                        <span className="text-sm">Like</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare(selectedEvent)}
                        className="flex items-center text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <ShareIcon className="w-5 h-5 mr-1" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                    
                    {selectedEvent.isRegistered ? (
                      <button
                        onClick={() => handleUnregister(selectedEvent.id)}
                        className="flex items-center px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                      >
                        <CheckIcon className="w-5 h-5 mr-2" />
                        <span>Registered</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(selectedEvent.id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
