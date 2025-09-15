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
  GlobeAltIcon,
  ShareIcon,
  HeartIcon,
  StarIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  SparklesIcon,
  FireIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { Event, Profile } from '@/types/database.types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const eventData = await getEventById(params.id as string);
        
        if (!eventData) {
          toast.error('Event not found');
          router.push('/events');
          return;
        }

        // Fetch organizer information
        const organizer = await getEventOrganizer(eventData.organizer_id);
        const eventWithOrganizer = { ...eventData, organizer };

        setEvent(eventWithOrganizer);

        // Check if user is registered
        if (user?.id) {
          const registered = await isRegisteredForEvent(eventData.id, user.id);
          setIsRegistered(registered);
        }

        // Fetch registrations
        const eventRegistrations = await getEventRegistrations(params.id as string);
        setRegistrations(eventRegistrations);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
        router.push('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [params.id, user?.id, router]);

  const handleRegister = async () => {
    if (!user?.id || !event) {
      toast.error('Please log in to register for events');
      return;
    }

    setIsRegistering(true);
    try {
      const success = await registerForEvent(event.id, user.id);
      if (success) {
        setIsRegistered(true);
        setEvent(prev => prev ? { ...prev, attendees_count: (prev.attendees_count || 0) + 1 } : null);
        toast.success('Successfully registered for event!');
      } else {
        toast.error('Failed to register for event. You may already be registered.');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user?.id || !event) {
      toast.error('Please log in to unregister from events');
      return;
    }

    setIsRegistering(true);
    try {
      const success = await unregisterFromEvent(event.id, user.id);
      if (success) {
        setIsRegistered(false);
        setEvent(prev => prev ? { ...prev, attendees_count: Math.max(0, (prev.attendees_count || 0) - 1) } : null);
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

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'conference': return <BuildingOfficeIcon className="w-6 h-6" />;
      case 'webinar': return <VideoCameraIcon className="w-6 h-6" />;
      case 'workshop': return <AcademicCapIcon className="w-6 h-6" />;
      case 'seminar': return <UserGroupIcon className="w-6 h-6" />;
      case 'networking': return <SparklesIcon className="w-6 h-6" />;
      case 'training': return <FireIcon className="w-6 h-6" />;
      default: return <CalendarIcon className="w-6 h-6" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return 'bg-blue-100 text-blue-700';
      case 'webinar': return 'bg-purple-100 text-purple-700';
      case 'workshop': return 'bg-green-100 text-green-700';
      case 'seminar': return 'bg-orange-100 text-orange-700';
      case 'networking': return 'bg-pink-100 text-pink-700';
      case 'training': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingSpinner variant="fullscreen" text="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <XCircleIcon className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link
            href="/events"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isOwnEvent = user?.id === event.organizer_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Events
            </Link>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              >
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full ${getEventTypeColor(event.event_type)}`}>
                  {getEventTypeIcon(event.event_type)}
                  <span className="ml-2">{event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}</span>
                </div>
                {event.is_virtual && (
                  <div className="inline-flex items-center px-4 py-2 text-sm font-semibold bg-purple-100 text-purple-700 rounded-full">
                    <VideoCameraIcon className="w-4 h-4 mr-2" />
                    Virtual Event
                  </div>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {event.title}
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {event.description}
              </p>

              {/* Event Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <UsersIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{event.attendees_count || 0}</div>
                  <div className="text-sm text-blue-600">Registered</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <CalendarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{formatDate(event.start_date)}</div>
                  <div className="text-sm text-green-600">Date</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <ClockIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{formatTime(event.start_date)}</div>
                  <div className="text-sm text-purple-600">Start Time</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <StarIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900">{event.max_attendees || '∞'}</div>
                  <div className="text-sm text-orange-600">Max Capacity</div>
                </div>
              </div>
            </motion.div>

            {/* Event Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CalendarIcon className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Date & Time</h3>
                    <p className="text-gray-600">
                      {formatDate(event.start_date)} at {formatTime(event.start_date)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Ends at {formatTime(event.end_date)}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start space-x-4">
                    <MapPinIcon className="w-6 h-6 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.venue && (
                  <div className="flex items-start space-x-4">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Venue</h3>
                      <p className="text-gray-600">{event.venue}</p>
                    </div>
                  </div>
                )}

                {event.specializations && event.specializations.length > 0 && (
                  <div className="flex items-start space-x-4">
                    <AcademicCapIcon className="w-6 h-6 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Specializations</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.specializations.map((spec, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {event.registration_fee && event.registration_fee > 0 && (
                  <div className="flex items-start space-x-4">
                    <StarIcon className="w-6 h-6 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Registration Fee</h3>
                      <p className="text-gray-600">${event.registration_fee}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Organizer */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizer</h2>
              
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                <Avatar
                  src={event.organizer?.avatar_url}
                  alt={event.organizer?.full_name || 'Organizer'}
                  size="lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {event.organizer?.full_name || 'Unknown Organizer'}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {event.organizer?.headline || 'Healthcare Professional'}
                  </p>
                  <Link
                    href={`/profile/${event.organizer?.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Profile
                    <ArrowLeftIcon className="w-4 h-4 ml-1 rotate-180" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join This Event</h3>
                <p className="text-gray-600 text-sm">
                  {isRegistered ? 'You are registered for this event' : 'Register to secure your spot'}
                </p>
              </div>

              {isOwnEvent ? (
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <CheckCircleIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-blue-700 font-semibold">You created this event</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {isRegistered ? (
                    <button
                      onClick={handleUnregister}
                      disabled={isRegistering}
                      className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
                    >
                      {isRegistering ? 'Unregistering...' : 'Unregister'}
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {isRegistering ? 'Registering...' : 'Register Now'}
                    </button>
                  )}
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      {event.attendees_count || 0} of {event.max_attendees || '∞'} spots taken
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent Registrations */}
            {registrations.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Registrations</h3>
                <div className="space-y-3">
                  {registrations.slice(0, 5).map((registration) => (
                    <div key={registration.id} className="flex items-center space-x-3">
                      <Avatar
                        src={registration.attendee.avatar_url}
                        alt={registration.attendee.full_name || 'User'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {registration.attendee.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {registration.attendee.headline || 'Healthcare Professional'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {registrations.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{registrations.length - 5} more registered
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}