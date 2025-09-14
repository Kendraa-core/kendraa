'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getEventsByOrganizer, getInstitutionByAdminId } from '@/lib/queries';
import type { EventWithOrganizer, Institution } from '@/types/database.types';
import { 
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Avatar from '@/components/common/Avatar';

export default function InstitutionEventsPage() {
  const { user, profile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventWithOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInstitution = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const institutionData = await getInstitutionByAdminId(user.id);
      setInstitution(institutionData);
    } catch (error) {
      console.error('Error fetching institution:', error);
    }
  }, [user?.id]);

  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const eventsData = await getEventsByOrganizer(user.id);
      setEvents(eventsData as EventWithOrganizer[]);
      setFilteredEvents(eventsData as EventWithOrganizer[]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchInstitution();
  }, [fetchInstitution]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filterEvents = useCallback(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredEvents(filtered);
  }, [events, searchQuery]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isEventUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const getTotalAttendees = () => {
    return events.reduce((total, event) => {
      return total + (event.max_attendees || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007fff] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600 mt-2">
                Manage your institution&apos;s events and conferences
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-[#007fff]">{events.length}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter(event => isEventUpcoming(event.start_date)).length}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Past Events</p>
                <p className="text-2xl font-bold text-gray-600">
                  {events.filter(event => !isEventUpcoming(event.start_date)).length}
                </p>
              </div>
              
              {getTotalAttendees() > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {getTotalAttendees()}
                  </p>
                </div>
              )}
              
              <Link href="/institution/events/create">
                <Button className="bg-[#007fff] hover:bg-[#007fff]/90 text-white">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Event Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-8 h-8 text-[#007fff]" />
                      </div>
                    </div>
                    
                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {event.title}
                          </h3>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{formatEventDate(event.start_date)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>{formatEventTime(event.start_date)}</span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            
                            {event.venue && (
                              <div className="flex items-center gap-1">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                <span>{event.venue}</span>
                              </div>
                            )}
                            
                            {event.is_virtual && (
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  Virtual Event
                                </span>
                              </div>
                            )}
                            
                            {event.max_attendees && (
                              <div className="flex items-center gap-1">
                                <UserGroupIcon className="w-4 h-4" />
                                <span>{event.max_attendees} attendees</span>
                              </div>
                            )}
                            
                            {event.event_type && (
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                  {event.event_type}
                                </span>
                              </div>
                            )}
                            
                            {event.registration_fee && (
                              <div className="flex items-center gap-1">
                                <span className="text-green-600 font-medium">
                                  ${event.registration_fee}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {event.description && (
                            <p className="text-gray-700 mb-4 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          
                          {event.specializations && event.specializations.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {event.specializations.map((specialization, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                                  >
                                    {specialization}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm">
                            {institution?.name && (
                              <div className="flex items-center gap-1">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                <span>Organized by {institution.name}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isEventUpcoming(event.start_date)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {isEventUpcoming(event.start_date) ? 'Upcoming' : 'Past Event'}
                              </span>
                            </div>
                            
                            <span className="text-gray-500">
                              Created {formatRelativeTime(event.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <Link href={`/institution/events/${event.id}`}>
                          <Button className="bg-[#007fff] hover:bg-[#007fff]/90 text-white">
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        
                        <Button variant="outline">
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button variant="outline" className="text-red-600 hover:text-red-700">
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                {events.length === 0 
                  ? "You haven't created any events yet. Create your first event to get started."
                  : "No events match your current search. Try adjusting your search criteria."
                }
              </p>
              {events.length === 0 && (
                <Link href="/institution/events/create">
                  <Button className="bg-[#007fff] hover:bg-[#007fff]/90 text-white">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
