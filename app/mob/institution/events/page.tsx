'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import {
  getInstitutionByAdminId,
  getEventsByInstitution,
  deleteEvent,
  type EventWithOrganizer
} from '@/lib/queries';
import {
  CalendarDaysIcon,
  PlusIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatDate, formatNumber } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function MobileInstitutionEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<EventWithOrganizer | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const institution = await getInstitutionByAdminId(user.id);
      if (!institution) {
        toast.error('Institution not found');
        return;
      }

      const eventsData = await getEventsByInstitution(institution.id);
      setEvents(eventsData);

    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDeleteEvent = async (eventId: string) => {
    if (!user?.id || !confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleting(eventId);
    
    try {
      const success = await deleteEvent(eventId, user.id);
      if (success) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        setSelectedEvent(null);
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  const getEventStatus = (event: EventWithOrganizer) => {
    const now = new Date();
    const eventDate = new Date(event.start_date);
    
    if (event.status === 'completed' || event.status === 'cancelled' || eventDate < now) {
      return 'past';
    }
    
    return 'upcoming';
  };

  const filteredEvents = events.filter(event => {
    const status = getEventStatus(event);
    return activeTab === status;
  });

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days`;
    return formatDate(dateString);
  };

  const EventCard = ({ event }: { event: EventWithOrganizer }) => {
    const status = getEventStatus(event);
    
    return (
      <div 
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        onClick={() => setSelectedEvent(event)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                <span>{formatEventDate(event.start_date)}</span>
              </div>
              <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1" />
                <span>{event.attendees_count || 0} attendees</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'upcoming' ? 'bg-green-100 text-green-700' :
              status === 'past' ? 'bg-gray-100 text-gray-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-3">
          {event.is_virtual && (
            <span className="flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
              <VideoCameraIcon className="w-3 h-3 mr-1" />
              Virtual
            </span>
          )}
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {event.event_type || 'Event'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>Created {formatDate(event.created_at)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              href={`/mob/institution/events/${event.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </Link>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteEvent(event.id);
              }}
              disabled={deleting === event.id}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MobileLayout title="Events" isInstitution={true}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">Events</h1>
            <Link
              href="/mob/institution/events/create"
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" text="Loading events..." />
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <CalendarDaysIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center mb-4">
                {activeTab === 'upcoming' && 'No upcoming events'}
                {activeTab === 'past' && 'No past events'}
              </p>
              <Link
                href="/mob/institution/events/create"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Event
              </Link>
            </div>
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedEvent.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      <span>{formatDate(selectedEvent.start_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      <span>{selectedEvent.attendees_count || 0} attendees</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {selectedEvent.is_virtual && (
                      <span className="flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                        <VideoCameraIcon className="w-3 h-3 mr-1" />
                        Virtual
                      </span>
                    )}
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {selectedEvent.event_type || 'Event'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedEvent.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        <span>{selectedEvent.is_virtual ? 'Online Event' : (selectedEvent.location || 'Location TBA')}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>{formatDate(selectedEvent.start_date)}</span>
                      </div>
                      {selectedEvent.registration_fee && (
                        <div className="flex items-center">
                          <span className="mr-2">💰</span>
                          <span>${selectedEvent.registration_fee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <Link
                      href={`/mob/institution/events/${selectedEvent.id}/edit`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Edit Event
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      disabled={deleting === selectedEvent.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleting === selectedEvent.id ? 'Deleting...' : 'Delete Event'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
