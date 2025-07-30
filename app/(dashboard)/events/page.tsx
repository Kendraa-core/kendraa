'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Avatar from '@/components/common/Avatar';
import { cn, formatDateTime } from '@/lib/utils';
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  GlobeAltIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  TicketIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getEvents, registerForEvent, type EventWithOrganizer } from '@/lib/queries';

const EVENT_TYPES = [
  { value: 'all', label: 'All Events' },
  { value: 'conference', label: 'Conferences' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'seminar', label: 'Seminars' },
  { value: 'webinar', label: 'Webinars' },
  { value: 'networking', label: 'Networking' },
  { value: 'training', label: 'Training' },
];

const MEDICAL_SPECIALIZATIONS = [
  'All Specializations', 'Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Radiology',
  'Emergency Medicine', 'Surgery', 'Internal Medicine', 'Psychiatry',
  'Dermatology', 'Anesthesiology', 'Pathology', 'Nursing', 'Pharmacy',
  'Physical Therapy', 'Medical Research', 'Healthcare Administration'
];

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventWithOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [showOnlyVirtual, setShowOnlyVirtual] = useState(false);
  const [showOnlyFree, setShowOnlyFree] = useState(false);

  // Debug logging
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[EventsPage] ${message}`, data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedType, selectedSpecialization, showOnlyVirtual, showOnlyFree]);

  const fetchEvents = async () => {
    setLoading(true);
    debugLog('Fetching events');
    
    try {
      const data = await getEvents(50);
      setEvents(data);
      debugLog('Events fetched successfully', { count: data.length });
    } catch (error) {
      debugLog('Error fetching events', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by event type
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.event_type === selectedType);
    }

    // Filter by specialization
    if (selectedSpecialization !== 'All Specializations') {
      filtered = filtered.filter(event =>
        event.specializations?.includes(selectedSpecialization)
      );
    }

    // Filter by virtual events
    if (showOnlyVirtual) {
      filtered = filtered.filter(event => event.is_virtual);
    }

    // Filter by free events
    if (showOnlyFree) {
      filtered = filtered.filter(event => !event.registration_fee || event.registration_fee === 0);
    }

    setFilteredEvents(filtered);
    debugLog('Events filtered', { total: events.length, filtered: filtered.length });
  };

  const handleRegister = async (event: EventWithOrganizer) => {
    if (!user?.id) {
      toast.error('Please log in to register for events');
      return;
    }

    debugLog('Registering for event', { eventId: event.id, userId: user.id });

    try {
      const success = await registerForEvent(event.id, user.id);
      
      if (success) {
        toast.success(`Successfully registered for ${event.title}!`);
        // Update the event's attendees count locally
        setEvents(prev => prev.map(e => 
          e.id === event.id 
            ? { ...e, attendees_count: e.attendees_count + 1 }
            : e
        ));
        debugLog('Event registration successful', { eventId: event.id });
      } else {
        toast.error('Failed to register for event');
        debugLog('Failed to register for event', { eventId: event.id });
      }
    } catch (error) {
      debugLog('Error registering for event', error);
      toast.error('Failed to register for event');
    }
  };

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'conference':
        return AcademicCapIcon;
      case 'workshop':
        return UserGroupIcon;
      case 'seminar':
        return AcademicCapIcon;
      case 'webinar':
        return VideoCameraIcon;
      case 'networking':
        return UserGroupIcon;
      case 'training':
        return AcademicCapIcon;
      default:
        return CalendarIcon;
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen modern-gradient-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-gradient-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Events & Conferences</h1>
              <p className="text-slate-600">Discover medical conferences, workshops, and networking events</p>
            </div>
            
            {user && (
              <Button className="modern-button-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="modern-card">
            <CardContent className="p-6">
              {/* Search and Type Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="modern-input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="modern-input"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="modern-input"
                  >
                    {MEDICAL_SPECIALIZATIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showOnlyVirtual}
                      onChange={(e) => setShowOnlyVirtual(e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>Virtual only</span>
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showOnlyFree}
                      onChange={(e) => setShowOnlyFree(e.target.checked)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>Free events</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-slate-600">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </motion.div>

        {/* Events List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredEvents.length > 0 ? (
            <div className="space-y-6">
              {filteredEvents.map((event) => {
                const EventIcon = getEventTypeIcon(event.event_type);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="modern-card hover:shadow-modern-lg transition-shadow duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Organizer Avatar */}
                          <Avatar
                            src={(event.organizer as any).avatar_url || (event.organizer as any).logo_url}
                            alt={(event.organizer as any).full_name || (event.organizer as any).name}
                            size="lg"
                          />

                          {/* Event Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <EventIcon className="w-5 h-5 text-primary-600" />
                                  <h3 className="text-xl font-semibold text-slate-900">
                                    {event.title}
                                  </h3>
                                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', getEventStatusColor(event.status))}>
                                    {event.status}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-slate-600 mb-2">
                                  Organized by{' '}
                                  <Link
                                    href={`/${event.organizer_type === 'institution' ? 'institutions' : 'profile'}/${event.organizer.id}`}
                                    className="font-medium hover:text-primary-600 transition-colors"
                                  >
                                    {(event.organizer as any).full_name || (event.organizer as any).name}
                                  </Link>
                                </p>
                              </div>
                            </div>

                            {/* Event Meta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm text-slate-600">
                              <div className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                                {formatEventDate(event.start_date, event.end_date)}
                              </div>
                              
                              {event.is_virtual ? (
                                <div className="flex items-center">
                                  <VideoCameraIcon className="w-4 h-4 mr-2 text-slate-400" />
                                  Virtual Event
                                </div>
                              ) : event.location && (
                                <div className="flex items-center">
                                  <MapPinIcon className="w-4 h-4 mr-2 text-slate-400" />
                                  {event.location}
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <UserGroupIcon className="w-4 h-4 mr-2 text-slate-400" />
                                {event.attendees_count} attendees
                                {event.max_attendees && ` / ${event.max_attendees}`}
                              </div>

                              {event.registration_fee ? (
                                <div className="flex items-center">
                                  <CurrencyDollarIcon className="w-4 h-4 mr-2 text-slate-400" />
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: event.currency || 'USD',
                                  }).format(event.registration_fee)}
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <TicketIcon className="w-4 h-4 mr-2 text-slate-400" />
                                  Free
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-slate-700 text-sm mb-4 line-clamp-2">
                              {event.description}
                            </p>

                            {/* Specializations */}
                            {event.specializations && event.specializations.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {event.specializations.slice(0, 4).map((spec, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                                  >
                                    {spec}
                                  </span>
                                ))}
                                {event.specializations.length > 4 && (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                                    +{event.specializations.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          {event.status === 'upcoming' && (
                            <Button
                              onClick={() => handleRegister(event)}
                              className="modern-button-primary min-w-[120px]"
                              size="sm"
                            >
                              Register
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-w-[120px]"
                            asChild
                          >
                            <Link href={`/events/${event.id}`}>
                              View Details
                            </Link>
                          </Button>

                          {event.meeting_link && event.status === 'ongoing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-w-[120px] text-green-600 border-green-200 hover:bg-green-50"
                              asChild
                            >
                              <Link href={event.meeting_link} target="_blank">
                                Join Now
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="modern-card">
              <CardContent className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No events found</h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery || selectedType !== 'all' || selectedSpecialization !== 'All Specializations'
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Be the first to create an event.'}
                </p>
                {user && (
                  <Button className="modern-button-primary">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
} 