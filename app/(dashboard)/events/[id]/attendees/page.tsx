'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getEventAttendees, getEvent } from '@/lib/queries';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import type { Event } from '@/types/database.types';

interface EventAttendeeWithProfile {
  id: string;
  event_id: string;
  attendee_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  registered_at: string;
  attendee: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    email: string;
    location: string | null;
    specializations: string[] | null;
    bio: string | null;
  };
}

export default function EventAttendeesPage() {
  const { id: eventId } = useParams();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [attendees, setAttendees] = useState<EventAttendeeWithProfile[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttendee, setSelectedAttendee] = useState<EventAttendeeWithProfile | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchEventData();
  }, [user, eventId]);

  const fetchEventData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      
      // Fetch event details
      const eventData = await getEvent(eventId as string);
      setEvent(eventData);
      
      // Fetch attendees
      const attendeesData = await getEventAttendees(eventId as string);
      setAttendees(attendeesData as EventAttendeeWithProfile[]);
    } catch (error) {
      console.error('Error fetching event data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'text-blue-600 bg-blue-50';
      case 'attended': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered': return <ClockIcon className="w-4 h-4" />;
      case 'attended': return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Attendees</h1>
              {event && (
                <p className="text-gray-600 mt-1">{event.title}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Summary */}
        {event && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(event.start_date).toLocaleDateString()}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>{attendees.length} attendees</span>
                  </div>
                </div>
                <p className="text-gray-700 line-clamp-2">{event.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Attendees Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Attendees</p>
                <p className="text-2xl font-semibold text-gray-900">{attendees.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Attended</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {attendees.filter(a => a.status === 'attended').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Registered</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {attendees.filter(a => a.status === 'registered').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {attendees.filter(a => a.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attendees</h3>
          </div>
          
          {attendees.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees yet</h3>
              <p className="text-gray-500">When people register for this event, they&apos;ll appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {attendees.map((attendee) => (
                <div key={attendee.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        {attendee.attendee.avatar_url ? (
                          <Image
                            src={attendee.attendee.avatar_url}
                            alt={attendee.attendee.full_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attendee Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {attendee.attendee.full_name}
                        </h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendee.status)}`}>
                          {getStatusIcon(attendee.status)}
                          {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{attendee.attendee.email}</span>
                        {attendee.attendee.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              <span>{attendee.attendee.location}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {attendee.attendee.specializations && attendee.attendee.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {attendee.attendee.specializations.slice(0, 3).map((spec, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                          {attendee.attendee.specializations.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{attendee.attendee.specializations.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {attendee.attendee.bio && (
                        <p className="text-gray-700 text-sm line-clamp-2 mb-2">{attendee.attendee.bio}</p>
                      )}

                      <p className="text-xs text-gray-500">
                        Registered {formatRelativeTime(attendee.registered_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAttendee(attendee)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendee Detail Modal */}
      {selectedAttendee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Attendee Details</h3>
                <button
                  onClick={() => setSelectedAttendee(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {selectedAttendee.attendee.avatar_url ? (
                    <Image
                      src={selectedAttendee.attendee.avatar_url}
                      alt={selectedAttendee.attendee.full_name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedAttendee.attendee.full_name}
                  </h4>
                  <p className="text-gray-600 mb-2">{selectedAttendee.attendee.email}</p>
                  {selectedAttendee.attendee.location && (
                    <div className="flex items-center gap-1 text-gray-600 mb-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{selectedAttendee.attendee.location}</span>
                    </div>
                  )}
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAttendee.status)}`}>
                    {getStatusIcon(selectedAttendee.status)}
                    {selectedAttendee.status.charAt(0).toUpperCase() + selectedAttendee.status.slice(1)}
                  </span>
                </div>
              </div>

              {selectedAttendee.attendee.specializations && selectedAttendee.attendee.specializations.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Specializations</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedAttendee.attendee.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAttendee.attendee.bio && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Bio</h5>
                  <p className="text-gray-700">{selectedAttendee.attendee.bio}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Registration Date:</span>
                    <p className="text-gray-600">{new Date(selectedAttendee.registered_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Status:</span>
                    <p className="text-gray-600 capitalize">{selectedAttendee.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
