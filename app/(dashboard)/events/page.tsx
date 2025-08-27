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
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

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
          allEvents = await getEventsByOrganizer(user.id);
        } else if (activeTab === 'registered') {
          allEvents = await getUserRegisteredEvents(user.id);
        } else {
          allEvents = await getEvents();
        }
        
        const eventsWithOrganizers = await fetchOrganizerInfo(allEvents);
        
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'conference': return <BuildingOfficeIcon className="w-4 h-4" />;
      case 'webinar': return <VideoCameraIcon className="w-4 h-4" />;
      case 'workshop': return <AcademicCapIcon className="w-4 h-4" />;
      case 'seminar': return <UserGroupIcon className="w-4 h-4" />;
      case 'networking': return <SparklesIcon className="w-4 h-4" />;
      case 'training': return <FireIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organizer?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || event.event_type === selectedType;
    const matchesFormat = selectedFormat === 'all' || 
                         (selectedFormat === 'virtual' && event.is_virtual) ||
                         (selectedFormat === 'in-person' && !event.is_virtual);
    
    return matchesSearch && matchesType && matchesFormat;
  });

  const upcomingEvents = filteredEvents.filter(event => !event.isRegistered);
  const registeredEvents = filteredEvents.filter(event => event.isRegistered);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-azure-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="w-10 h-10 text-azure-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Join the Community</h2>
          <p className="text-gray-600 mb-6">Sign in to discover and join healthcare events</p>
          <Link
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-azure-600 text-white rounded-xl hover:bg-azure-700 transition-colors font-medium"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent transition-colors"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent transition-colors text-sm"
            >
              <option value="all">All Types</option>
              <option value="conference">Conference</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="networking">Networking</option>
              <option value="training">Training</option>
            </select>
            
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent transition-colors text-sm"
            >
              <option value="all">All Formats</option>
              <option value="virtual">Virtual</option>
              <option value="in-person">In-Person</option>
            </select>

            {/* Create Event Button */}
            <Link
              href="/events/create"
              className="inline-flex items-center px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors text-sm font-medium"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-azure-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CalendarIcon className="w-4 h-4" />
              <span>All Events</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {upcomingEvents.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'registered'
                ? 'bg-azure-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <UsersIcon className="w-4 h-4" />
              <span>My Events</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {registeredEvents.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('my-events')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'my-events'
                ? 'bg-azure-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Created</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {events.filter(e => e.organizer_id === user?.id).length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-azure-200 border-t-azure-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading events...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(() => {
            let displayEvents = filteredEvents;
            if (activeTab === 'registered') {
              displayEvents = registeredEvents;
            } else if (activeTab === 'my-events') {
              displayEvents = filteredEvents.filter(e => e.organizer_id === user?.id);
            }
            return displayEvents;
          })().map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group bg-white rounded-lg border border-gray-200 hover:border-azure-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Event Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="inline-flex items-center px-3 py-1 text-xs font-medium bg-azure-50 text-azure-700 rounded-full">
                      {getEventTypeIcon(event.event_type)}
                      <span className="ml-1.5">{event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}</span>
                    </div>
                    {event.is_virtual && (
                      <div className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
                        <VideoCameraIcon className="w-3 h-3 mr-1" />
                        Virtual
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-azure-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{event.description}</p>
                </div>

                {/* Event Details */}
                <div className="px-6 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-3 text-azure-500" />
                      <span className="font-medium">{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-3 text-azure-500" />
                      <span>{formatTime(event.start_date)} - {formatTime(event.end_date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-3 text-azure-500" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <UsersIcon className="w-4 h-4 mr-3 text-azure-500" />
                      <span className="font-medium">{event.attendees_count || 0}</span>
                      <span className="text-gray-400 ml-1">
                        / {event.max_attendees || '∞'} registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Organizer Section */}
                <div className="px-6 pb-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar
                      src={event.organizer?.avatar_url}
                      alt={event.organizer?.full_name || 'Organizer'}
                      size="md"
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
                </div>

                {/* Action Section */}
                <div className="px-6 pb-6">
                  <div className="flex justify-between items-center">
                    {activeTab === 'my-events' ? (
                      <span className="text-xs text-azure-600 font-medium">
                        ✨ You created this event
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Organized by {event.organizer?.full_name || 'Unknown'}
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
                          className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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
                          className="px-3 py-1.5 text-sm font-medium bg-azure-600 text-white rounded-md hover:bg-azure-700 transition-colors"
                        >
                          Register
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!loading && (() => {
        let displayEvents = filteredEvents;
        if (activeTab === 'registered') {
          displayEvents = registeredEvents;
        } else if (activeTab === 'my-events') {
          displayEvents = filteredEvents.filter(e => e.organizer_id === user?.id);
        }
        return displayEvents.length === 0;
      })() && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-azure-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-azure-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming' 
              ? 'No events found' 
              : activeTab === 'registered'
              ? 'No registered events'
              : 'No created events'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {activeTab === 'upcoming' 
              ? 'Try adjusting your search or filters to find more events.' 
              : activeTab === 'registered'
              ? 'Register for events to see them here and stay updated.'
              : 'Create your first event to start building your community.'}
          </p>
          {activeTab === 'my-events' && (
            <Link
              href="/events/create"
              className="inline-flex items-center px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Your First Event
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
