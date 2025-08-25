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
  FunnelIcon,
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
      case 'conference': return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'webinar': return <VideoCameraIcon className="w-5 h-5" />;
      case 'workshop': return <AcademicCapIcon className="w-5 h-5" />;
      case 'seminar': return <UserGroupIcon className="w-5 h-5" />;
      case 'networking': return <SparklesIcon className="w-5 h-5" />;
      case 'training': return <FireIcon className="w-5 h-5" />;
      default: return <CalendarIcon className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'webinar': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'workshop': return 'bg-green-100 text-green-700 border-green-200';
      case 'seminar': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'networking': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'training': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
      <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-azure-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="w-10 h-10 text-azure-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the Community</h2>
          <p className="text-gray-600 mb-6">Sign in to discover and join amazing healthcare events</p>
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
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-azure-600 to-blue-600 rounded-3xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-start">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-3">Healthcare Events</h1>
            <p className="text-azure-100 text-lg mb-6">
              Discover, learn, and connect with healthcare professionals through our curated events
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="/events/create"
                className="inline-flex items-center px-6 py-3 bg-white text-azure-600 rounded-xl hover:bg-azure-50 transition-colors font-medium shadow-lg"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Event
              </Link>
              <div className="text-azure-100">
                <span className="font-semibold">{events.length}</span> events available
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events, organizers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-azure-500 focus:border-transparent transition-colors"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-azure-500 focus:border-transparent transition-colors"
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
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-azure-500 focus:border-transparent transition-colors"
            >
              <option value="all">All Formats</option>
              <option value="virtual">Virtual</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
        <div className="flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-6 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-azure-500 text-white shadow-md transform scale-105'
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
            className={`flex-1 px-6 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === 'registered'
                ? 'bg-azure-500 text-white shadow-md transform scale-105'
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
            className={`flex-1 px-6 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === 'my-events'
                ? 'bg-azure-500 text-white shadow-md transform scale-105'
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
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-azure-200 border-t-azure-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-azure-400 rounded-full animate-ping opacity-20"></div>
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">Loading amazing events...</p>
            <div className="flex justify-center mt-4 space-x-2">
              <div className="w-3 h-3 bg-azure-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-azure-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-azure-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-azure-200 transition-all duration-300 overflow-hidden">
                {/* Event Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full border ${getEventTypeColor(event.event_type)}`}>
                      {getEventTypeIcon(event.event_type)}
                      <span className="ml-1.5">{event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}</span>
                    </div>
                    {event.is_virtual && (
                      <div className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                        <VideoCameraIcon className="w-3 h-3 mr-1" />
                        Virtual
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-azure-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
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
                        <span className="truncate">{event.location}</span>
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
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-azure-50 rounded-xl border border-gray-100">
                    <Avatar
                      src={event.organizer?.avatar_url}
                      alt={event.organizer?.full_name || 'Organizer'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
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
                          className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
                          className="px-4 py-2 text-sm font-medium bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors shadow-sm"
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
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-azure-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="w-12 h-12 text-azure-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
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
              className="inline-flex items-center px-6 py-3 bg-azure-600 text-white rounded-xl hover:bg-azure-700 transition-colors font-medium"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Your First Event
            </Link>
          )}
        </div>
      )}
    </div>
  );
} 