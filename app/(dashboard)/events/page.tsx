'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getEvents, 
  getEventsByOrganizer,
  registerForEvent, 
  unregisterFromEvent, 
  isRegisteredForEvent,
  getUserRegisteredEvents,
  getEventOrganizer
} from '@/lib/queries';
import { CalendarIcon, MapPinIcon, ClockIcon, UsersIcon, PlusIcon } from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import type { Event } from '@/types/database.types';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'registered' | 'my-events'>('upcoming');

  // Function to fetch organizer information for events
  const fetchOrganizerInfo = async (events: Event[]): Promise<EventWithRegistration[]> => {
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
    return eventsWithOrganizers;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        let allEvents: Event[] = [];
        
        if (activeTab === 'my-events') {
          // Fetch events created by the current user
          allEvents = await getEventsByOrganizer(user.id);
        } else if (activeTab === 'registered') {
          // Fetch events the user is registered for
          allEvents = await getUserRegisteredEvents(user.id);
        } else {
          // Fetch all events
          allEvents = await getEvents();
        }
        
        // Fetch organizer information for all events
        const eventsWithOrganizers = await fetchOrganizerInfo(allEvents);
        
        // Check registration status for each event (except for my-events tab)
        if (activeTab !== 'my-events') {
          const eventsWithRegistration = await Promise.all(
            eventsWithOrganizers.map(async (event) => {
              const isRegistered = await isRegisteredForEvent(event.id, user.id);
              return { ...event, isRegistered };
            })
          );
          setEvents(eventsWithRegistration);
        } else {
          setEvents(eventsWithOrganizers);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user?.id, activeTab]);

  const handleRegister = async (eventId: string) => {
    if (!user?.id) {
      toast.error('Please log in to register for events');
      return;
    }

    try {
      const success = await registerForEvent(eventId, user.id);
      if (success) {
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, isRegistered: true, attendees_count: (event.attendees_count || 0) + 1 }
            : event
        ));
        toast.success('Successfully registered for event!');
      } else {
        toast.error('Failed to register for event. You may already be registered.');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!user?.id) {
      toast.error('Please log in to unregister from events');
      return;
    }

    try {
      const success = await unregisterFromEvent(eventId, user.id);
      if (success) {
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, isRegistered: false, attendees_count: Math.max(0, (event.attendees_count || 0) - 1) }
            : event
        ));
        toast.success('Successfully unregistered from event');
      } else {
        toast.error('Failed to unregister from event');
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast.error('Failed to unregister from event');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return 'bg-azure-100 text-azure-800';
      case 'webinar': return 'bg-azure-100 text-azure-800';
      case 'workshop': return 'bg-azure-100 text-azure-800';
      case 'seminar': return 'bg-azure-100 text-azure-800';
      case 'networking': return 'bg-azure-100 text-azure-800';
      case 'training': return 'bg-azure-100 text-azure-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingEvents = events.filter(event => !event.isRegistered);
  const registeredEvents = events.filter(event => event.isRegistered);

  // Debug logging
  console.log('[EventsPage] Current state:', {
    loading,
    eventsCount: events.length,
    activeTab,
    userId: user?.id,
    upcomingEventsCount: upcomingEvents.length,
    registeredEventsCount: registeredEvents.length
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view events</h2>
          <p className="text-gray-600">You need to be logged in to access the events page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600 mt-1">Discover and join healthcare events</p>
            </div>
            <Link
              href="/events/create"
              className="inline-flex items-center px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-8 mb-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-azure-500 text-azure-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'registered'
                ? 'border-azure-500 text-azure-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Registered Events ({registeredEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('my-events')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-events'
                ? 'border-azure-500 text-azure-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Created Events ({events.filter(e => e.organizer_id === user?.id).length})
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative">
                {/* Main spinner */}
                <div className="w-12 h-12 border-4 border-azure-200 border-t-azure-600 rounded-full animate-spin"></div>
                
                {/* Pulse effect */}
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-azure-400 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <p className="text-gray-600 mt-4 text-sm font-medium">Loading events...</p>
              
              {/* Progress dots */}
              <div className="flex justify-center mt-2 space-x-1">
                <div className="w-2 h-2 bg-azure-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-azure-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-azure-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              let displayEvents = events;
              if (activeTab === 'registered') {
                displayEvents = registeredEvents;
              } else if (activeTab === 'my-events') {
                displayEvents = events.filter(e => e.organizer_id === user?.id);
              }
              return displayEvents;
            })().map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                    </span>
                    {event.is_virtual && (
                      <span className="px-2 py-1 text-xs font-medium bg-azure-100 text-azure-800 rounded-full">
                        Virtual
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formatDate(event.start_date)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {formatTime(event.start_date)} - {formatTime(event.end_date)}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <UsersIcon className="w-4 h-4 mr-2" />
                      {event.attendees_count || 0} / {event.max_attendees || '∞'} attendees
                    </div>
                  </div>

                  {/* Organizer Information */}
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Avatar
                      src={event.organizer?.avatar_url}
                      alt={event.organizer?.full_name || 'Organizer'}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.organizer?.full_name || 'Unknown Organizer'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {event.organizer?.headline || 'Healthcare Professional'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    {activeTab === 'my-events' ? (
                      <span className="text-xs text-gray-500">
                        You created this event
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        by {event.organizer?.full_name || 'Unknown Organizer'}
                      </span>
                    )}
                    
                    {activeTab !== 'my-events' && (
                      event.isRegistered ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUnregister(event.id);
                          }}
                          className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Unregister
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRegister(event.id);
                          }}
                          className="px-3 py-1 text-sm font-medium bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors"
                        >
                          Register
                        </button>
                      )
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!loading && (activeTab === 'upcoming' ? upcomingEvents : registeredEvents).length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'upcoming' ? 'No upcoming events' : 'No registered events'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'upcoming' 
                ? 'Check back later for new healthcare events.' 
                : 'Register for events to see them here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 