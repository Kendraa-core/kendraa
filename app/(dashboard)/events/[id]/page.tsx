'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getEventById, 
  getEventRegistrations, 
  registerForEvent, 
  unregisterFromEvent,
  isRegisteredForEvent,
  getEventOrganizer
} from '@/lib/queries';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
import type { Event, Profile } from '@/types/database.types';
import toast from 'react-hot-toast';

interface EventRegistration {
  id: string;
  event_id: string;
  attendee_id: string;
  attendee_type: string;
  status: string;
  registration_date: string;
  attendee: Profile;
}

interface EventWithOrganizer extends Event {
  organizer?: Profile;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventWithOrganizer | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId || !user?.id) return;

      try {
        setLoading(true);
        
        // Load event data and organizer info
        const eventData = await getEventById(eventId);
        if (!eventData) {
          toast.error('Event not found');
          router.push('/events');
          return;
        }

        const organizer = await getEventOrganizer(eventData.organizer_id);
        const eventWithOrganizer = {
          ...eventData,
          organizer: organizer || {
            id: eventData.organizer_id,
            full_name: 'Unknown Organizer',
            avatar_url: null,
            user_type: 'individual',
            headline: 'Healthcare Professional'
          }
        };

        setEvent(eventWithOrganizer);

        // Check if user is registered
        const registered = await isRegisteredForEvent(eventId, user.id);
        setIsRegistered(registered);

        // Load registrations if user is the organizer
        if (eventData.organizer_id === user.id) {
          const eventRegistrations = await getEventRegistrations(eventId);
          setRegistrations(eventRegistrations);
        }
      } catch (error) {
        console.error('Error loading event data:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId, user?.id, router]);

  const handleRegister = async () => {
    if (!user?.id || !event) return;

    setIsRegistering(true);
    try {
      const success = await registerForEvent(event.id, user.id);
      if (success) {
        setIsRegistered(true);
        toast.success('Successfully registered for event!');
      } else {
        toast.error('Failed to register for event');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user?.id || !event) return;

    setIsRegistering(true);
    try {
      const success = await unregisterFromEvent(event.id, user.id);
      if (success) {
        setIsRegistered(false);
        toast.success('Successfully unregistered from event');
      } else {
        toast.error('Failed to unregister from event');
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast.error('Failed to unregister from event');
    } finally {
      setIsRegistering(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-azure-200 border-t-azure-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <p className="text-gray-600 mb-6">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.push('/events')}
            className="bg-azure-500 text-white px-6 py-3 rounded-xl hover:bg-azure-600 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const isOrganizer = event.organizer_id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.push('/events')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-gray-600">Event Details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEventTypeColor(event.event_type)}`}>
                  {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                </span>
                {event.is_virtual && (
                  <span className="px-3 py-1 text-sm font-medium bg-azure-100 text-azure-800 rounded-full">
                    Virtual
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{event.description}</p>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{formatTime(event.start_date)} - {formatTime(event.end_date)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <UsersIcon className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{event.attendees_count || 0} / {event.max_attendees || '∞'} attendees</span>
                </div>
                {event.registration_fee !== null && event.registration_fee > 0 && (
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Registration Fee: ${event.registration_fee} {event.currency}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Organizer Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
              <div className="flex items-center space-x-4">
                <Avatar
                  src={event.organizer?.avatar_url}
                  alt={event.organizer?.full_name || 'Organizer'}
                  size="lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{event.organizer?.full_name || 'Unknown Organizer'}</h4>
                  <p className="text-gray-600">{event.organizer?.headline || 'Healthcare Professional'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Registration Actions */}
            {!isOrganizer && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration</h3>
                {isRegistered ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UserGroupIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-green-600 font-medium">You&apos;re registered!</p>
                      <p className="text-sm text-gray-500 mt-1">You&apos;ll receive updates about this event</p>
                    </div>
                    <button
                      onClick={handleUnregister}
                      disabled={isRegistering}
                      className="w-full bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isRegistering ? 'Unregistering...' : 'Unregister'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">Join this event to connect with healthcare professionals</p>
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className="w-full bg-azure-500 text-white px-4 py-3 rounded-xl hover:bg-azure-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isRegistering ? 'Registering...' : 'Register for Event'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Registrations (Organizer View) */}
            {isOrganizer && registrations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrations ({registrations.length})</h3>
                <div className="space-y-3">
                  {registrations.map((registration) => (
                    <div key={registration.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar
                        src={registration.attendee.avatar_url}
                        alt={registration.attendee.full_name || 'Attendee'}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {registration.attendee.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {registration.attendee.headline || 'Healthcare Professional'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Registered {new Date(registration.registration_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Registrations</span>
                  <span className="font-medium">{event.attendees_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Capacity</span>
                  <span className="font-medium">{event.max_attendees || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Type</span>
                  <span className="font-medium capitalize">{event.event_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium capitalize">{event.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
