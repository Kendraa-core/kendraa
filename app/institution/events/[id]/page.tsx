'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getEventById, getEventRegistrations, deleteEvent, getInstitutionByUserId } from '@/lib/queries';
import type { Event, Institution } from '@/types/database.types';
import { 
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Avatar from '@/components/common/Avatar';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const eventId = params.id as string;

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      const eventData = await getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchInstitution = useCallback(async () => {
    if (!user?.id) return;
    
    try {
        const institutionData = await getInstitutionByUserId(user.id);
      setInstitution(institutionData);
    } catch (error) {
      console.error('Error fetching institution:', error);
    }
  }, [user?.id]);

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) return;

    try {
      const registrationsData = await getEventRegistrations(eventId);
      setRegistrations(registrationsData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
    fetchInstitution();
    fetchRegistrations();
  }, [fetchEvent, fetchInstitution, fetchRegistrations]);

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

  const handleDeleteEvent = async () => {
    if (!user?.id || !event) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"? This action cannot be undone and will remove all event registrations.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteEvent(event.id, user.id);
      toast.success('Event deleted successfully');
      router.push('/institution/events');
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(error.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;

    const eventUrl = `${window.location.origin}/events/${event.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || '',
          url: eventUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(eventUrl);
        toast.success('Event link copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007fff] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
          <p className="text-gray-600 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Link href="/institution/events">
            <Button className="bg-[#007fff] hover:bg-[#007fff]/90 text-white">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/institution/events">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
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
                
                {event.max_attendees && (
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{event.max_attendees} max attendees</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isEventUpcoming(event.start_date)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isEventUpcoming(event.start_date) ? 'Upcoming' : 'Past Event'}
                </span>
                
                {event.is_virtual && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Virtual Event
                  </span>
                )}
                
                {event.event_type && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {event.event_type}
                  </span>
                )}
                
                {event.registration_fee && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    ${event.registration_fee}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleShareEvent}>
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button variant="outline">
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Button>
              
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700"
                onClick={handleDeleteEvent}
                disabled={deleting}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Description */}
            <Card>
              <CardHeader>
                <CardTitle>Event Description</CardTitle>
              </CardHeader>
              <CardContent>
                {event.description ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{formatEventDate(event.start_date)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="font-medium">{formatEventTime(event.start_date)}</span>
                  </div>
                  
                  {event.end_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{formatEventDate(event.end_date)}</span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{event.location}</span>
                    </div>
                  )}
                  
                  {event.venue && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue:</span>
                      <span className="font-medium">{event.venue}</span>
                    </div>
                  )}
                  
                  {event.max_attendees && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Attendees:</span>
                      <span className="font-medium">{event.max_attendees}</span>
                    </div>
                  )}
                  
                  {event.registration_fee && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Fee:</span>
                      <span className="font-medium text-green-600">${event.registration_fee}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatRelativeTime(event.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            {event.specializations && event.specializations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.specializations.map((specialization, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {specialization}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registrations:</span>
                    <span className="font-medium">{registrations.length}</span>
                  </div>
                  
                  {event.max_attendees && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">
                        {registrations.length}/{event.max_attendees}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      isEventUpcoming(event.start_date) ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {isEventUpcoming(event.start_date) ? 'Upcoming' : 'Past Event'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Registrations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                {registrations.length > 0 ? (
                  <div className="space-y-3">
                    {registrations.slice(0, 5).map((registration) => (
                      <div key={registration.id} className="flex items-center gap-3">
                        <Avatar
                          src={registration.profiles?.avatar_url}
                          name={registration.profiles?.full_name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {registration.profiles?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(registration.registration_date)}
                          </p>
                        </div>
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                    
                    {registrations.length > 5 && (
                      <p className="text-sm text-gray-500 text-center pt-2">
                        +{registrations.length - 5} more registrations
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No registrations yet</p>
                )}
              </CardContent>
            </Card>

            {/* Institution Info */}
            {institution && (
              <Card>
                <CardHeader>
                  <CardTitle>Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{institution.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {institution.type?.replace('_', ' ')} Organization
                      </p>
                    </div>
                    
                    {institution.location && (
                      <div className="text-sm text-gray-600">
                        📍 {institution.location}
                      </div>
                    )}
                    
                    <Link href="/institution/profile">
                      <Button variant="outline" size="sm" className="w-full">
                        View Institution Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
