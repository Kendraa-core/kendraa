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
  VideoCameraIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  SparklesIcon,
  FireIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ChevronDownIcon,
  TrophyIcon,
  EyeIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import type { Event } from '@/types/database.types';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS,
  ANIMATIONS,
  EVENT_TYPE_COLORS,
  getEventTypeColor
} from '@/lib/design-system';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [selectedEvent, setSelectedEvent] = useState<EventWithRegistration | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'registered' | 'my-events'>('upcoming');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let allEvents: Event[] = [];
        
        if (activeTab === 'registered') {
          allEvents = await getUserRegisteredEvents(user.id);
        } else if (activeTab === 'my-events') {
          allEvents = await getEventsByOrganizer(user.id);
        } else {
          allEvents = await getEvents();
        }
        
        const eventsWithOrganizers = await fetchOrganizerInfo(allEvents);
        
        // Filter out ended events (completed/cancelled) from the default "upcoming" tab
        let filteredEvents = eventsWithOrganizers;
        if (activeTab === 'upcoming') {
          filteredEvents = eventsWithOrganizers.filter(event => 
            event.status === 'upcoming' || event.status === 'ongoing'
          );
        }
        
        if (activeTab !== 'my-events') {
          const eventsWithRegistration = await Promise.all(
            filteredEvents.map(async (event) => {
              const isRegistered = await isRegisteredForEvent(event.id, user.id);
              return { ...event, isRegistered };
            })
          );
          setEvents(eventsWithRegistration);
        } else {
          setEvents(filteredEvents);
        }

        // Set first event as selected by default
        if (filteredEvents.length > 0 && !selectedEvent) {
          setSelectedEvent(filteredEvents[0]);
        }
        
        // Extract unique event types dynamically from filtered events
        const types = [...new Set(filteredEvents.map(event => event.event_type).filter(Boolean))];
        setEventTypes(types);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user?.id, activeTab]);

  const fetchOrganizerInfo = async (events: Event[]) => {
    const eventsWithOrganizers = await Promise.all(
      events.map(async (event) => {
        try {
          const organizer = await getEventOrganizer(event.organizer_id);
          return { ...event, organizer };
        } catch (error) {
          console.error('Error fetching organizer:', error);
          return event;
        }
      })
    );
    return eventsWithOrganizers;
  };

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
        
        // Update selected event if it's the one being registered
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(prev => prev ? { ...prev, isRegistered: true, attendees_count: (prev.attendees_count || 0) + 1 } : null);
        }
        
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
        
        // Update selected event if it's the one being unregistered
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(prev => prev ? { ...prev, isRegistered: false, attendees_count: Math.max(0, (prev.attendees_count || 0) - 1) } : null);
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
      const newLikedEvents = new Set(prev);
      if (newLikedEvents.has(eventId)) {
        newLikedEvents.delete(eventId);
        toast.success('Removed from favorites');
      } else {
        newLikedEvents.add(eventId);
        toast.success('Added to favorites');
      }
      return newLikedEvents;
    });
  };

  const handleShare = async (event: EventWithRegistration) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.origin + `/events/${event.id}`,
        });
        toast.success('Event shared successfully');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Failed to share event');
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
        toast.success('Event link copied to clipboard');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy event link');
      }
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

  // Event type color function is now imported from design system

  const getDaysLeft = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  const getDisplayEvents = () => {
    let displayEvents: EventWithRegistration[] = [];
    
    // Get base events based on active tab
    if (activeTab === 'registered') {
      displayEvents = events.filter(event => event.isRegistered);
    } else if (activeTab === 'my-events') {
      displayEvents = events.filter(e => e.organizer_id === user?.id);
    } else {
      displayEvents = events;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      displayEvents = displayEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      displayEvents = displayEvents.filter(event => event.status === statusFilter);
    }

    // Apply user type filter (based on organizer)
    if (userTypeFilter !== 'all') {
      displayEvents = displayEvents.filter(event => 
        event.organizer?.user_type === userTypeFilter
      );
    }

    // Apply domain filter (based on event description or title)
    if (domainFilter !== 'all') {
      displayEvents = displayEvents.filter(event => {
        const searchText = `${event.title} ${event.description || ''}`.toLowerCase();
        return searchText.includes(domainFilter.toLowerCase());
      });
    }

    // Apply category filter (event type)
    if (categoryFilter !== 'all') {
      displayEvents = displayEvents.filter(event => event.event_type === categoryFilter);
    }

    // Apply sorting
    displayEvents.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case 'popularity':
          return (b.attendees_count || 0) - (a.attendees_count || 0);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return displayEvents;
  };

  // Get filtered and sorted events using the display function
  const displayEvents = getDisplayEvents();
  const upcomingEvents = displayEvents.filter(event => !event.isRegistered);
  const registeredEvents = displayEvents.filter(event => event.isRegistered);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Join the Community</h2>
          <p className="text-gray-600 mb-6">Sign in to discover and join healthcare events</p>
          <Link
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BACKGROUNDS.page.tertiary}`}>
      {/* Header */}
      <Header />
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Navigation */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Events
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Sort By Date</option>
                    <option value="popularity">Sort By Popularity</option>
                    <option value="name">Sort By Name</option>
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FunnelIcon className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-700">Filters</span>
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">6</span>
                </button>
              </div>
            </div>

            {/* Right Side - Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="ended">Ended</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
              </div>

              <div className="relative">
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">User Type</option>
                  <option value="individual">Individual</option>
                  <option value="institution">Institution</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
              </div>

              <div className="relative">
            <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Domain</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
            </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
              </div>
            
              <div className="relative">
            <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Category</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </option>
                  ))}
            </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

            <Link
              href="/events/create"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Event List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
        </div>
      </div>

              {/* Event List */}
              <div className="overflow-y-auto h-[calc(100%-5rem)]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="md" text="Loading events..." />
                  </div>
                ) : (
                  <div className="p-2">
                    {getDisplayEvents().map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedEvent(event)}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                          selectedEvent?.id === event.id
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Event Logo */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              {event.organizer?.full_name?.charAt(0) || 'E'}
                            </span>
                          </div>

                          {/* Event Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                              {event.title}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                              {event.organizer?.full_name || 'Unknown Organizer'}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                              <div className="flex items-center">
                                <UsersIcon className="w-3 h-3 mr-1" />
                                <span>{event.attendees_count || 0} Registered</span>
                              </div>
                              <div className="flex items-center">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                <span>{getDaysLeft(event.start_date)}</span>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.event_type)}`}>
                                {event.event_type}
                              </span>
                              {event.is_virtual && (
                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                  Virtual
              </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {getDisplayEvents().length === 0 && (
                      <div className="text-center py-12">
                        <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No events found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Event Details */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <motion.div
                key={selectedEvent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] overflow-y-auto"
              >
                {/* Event Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {selectedEvent.organizer?.full_name?.charAt(0) || 'E'}
                        </span>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                          {selectedEvent.title}
                        </h1>
                        <p className="text-gray-600">
                          {selectedEvent.organizer?.full_name || 'Unknown Organizer'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
          <button
                        onClick={() => handleLike(selectedEvent.id)}
                        className={`p-2 transition-colors ${
                          likedEvents.has(selectedEvent.id) 
                            ? 'text-red-500' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        {likedEvents.has(selectedEvent.id) ? (
                          <HeartSolidIcon className="w-5 h-5" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
          </button>
          <button
                        onClick={() => handleShare(selectedEvent)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

                  {/* Event Info */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>{selectedEvent.is_virtual ? 'Online' : selectedEvent.location || 'TBA'}</span>
          </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>Updated On: {formatDate(selectedEvent.created_at)}</span>
        </div>
                    <div className="flex items-center">
                      <GlobeAltIcon className="w-4 h-4 mr-1" />
                      <span>Official website</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEventTypeColor(selectedEvent.event_type)}`}>
                      {selectedEvent.event_type}
                    </span>
                    {selectedEvent.is_virtual && (
                      <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
                        Virtual
                      </span>
                    )}
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                      Healthcare
                    </span>
                  </div>
                </div>

                {/* Action Section */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedEvent.registration_fee ? `$${selectedEvent.registration_fee}` : 'Free'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleLike(selectedEvent.id)}
                          className={`p-2 transition-colors ${
                            likedEvents.has(selectedEvent.id) 
                              ? 'text-red-500' 
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          {likedEvents.has(selectedEvent.id) ? (
                            <HeartSolidIcon className="w-5 h-5" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <CalendarIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleShare(selectedEvent)}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <ShareIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {user?.id !== selectedEvent.organizer_id && (
                      <button
                        onClick={() => selectedEvent.isRegistered ? handleUnregister(selectedEvent.id) : handleRegister(selectedEvent.id)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                          selectedEvent.isRegistered
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {selectedEvent.isRegistered ? 'Unregister' : 'Register'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="p-6 border-b border-gray-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <ClockIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Registration Deadline</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{getDaysLeft(selectedEvent.start_date)}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <EyeIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Impressions</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">3,529</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <UsersIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Team Size</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">1-4 Members</p>
                    </div>
                  </div>
                  </div>

                {/* Event Description */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Event Details */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CalendarIcon className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Date & Time</h3>
                        <p className="text-gray-600">
                          {formatDate(selectedEvent.start_date)} at {formatTime(selectedEvent.start_date)}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Ends at {formatTime(selectedEvent.end_date)}
                        </p>
                      </div>
                    </div>

                    {selectedEvent.location && (
                      <div className="flex items-start space-x-3">
                        <MapPinIcon className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">Location</h3>
                          <p className="text-gray-600">{selectedEvent.location}</p>
                    </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <UsersIcon className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Capacity</h3>
                        <p className="text-gray-600">
                          {selectedEvent.attendees_count || 0} of {selectedEvent.max_attendees || '∞'} registered
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizer */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Organizer</h2>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar
                      src={selectedEvent.organizer?.avatar_url}
                      alt={selectedEvent.organizer?.full_name || 'Organizer'}
                      size="lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedEvent.organizer?.full_name || 'Unknown Organizer'}
                      </h3>
                      <p className="text-gray-600">
                        {selectedEvent.organizer?.headline || 'Healthcare Professional'}
                      </p>
                      <Link
                        href={`/profile/${selectedEvent.organizer?.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center">
                  <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Event</h3>
                  <p className="text-gray-600">Choose an event from the list to view details</p>
                </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}