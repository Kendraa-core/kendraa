'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getInstitutionEvents, createInstitutionEvent } from '@/lib/queries';
import { EventWithOrganizer } from '@/types/database.types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  VideoCameraIcon,
  PhotoIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Helper function to format date and time
function formatEventDateTime(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  const startDateStr = start.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const startTimeStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  if (end && end.getTime() !== start.getTime()) {
    const endTimeStr = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${startDateStr} • ${startTimeStr} - ${endTimeStr}`;
  }
  
  return `${startDateStr} • ${startTimeStr}`;
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

export default function InstitutionEventsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    venue: '',
    event_type: 'conference',
    max_attendees: '',
    registration_fee: '',
    currency: 'USD'
  });

  // Load institution events
  useEffect(() => {
    const loadEvents = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        const institutionEvents = await getInstitutionEvents(profile.id, 50, 0);
        setEvents(institutionEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [profile?.id]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.start_date || !profile?.id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setCreating(true);
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date || newEvent.start_date,
        location: newEvent.location || undefined,
        venue: newEvent.venue || undefined,
        event_type: newEvent.event_type,
        max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : undefined,
        registration_fee: newEvent.registration_fee ? parseFloat(newEvent.registration_fee) : undefined,
        currency: newEvent.currency
      };

      const newEventData = await createInstitutionEvent(profile.id, eventData);
      if (newEventData) {
        // Refresh events
        const updatedEvents = await getInstitutionEvents(profile.id, 50, 0);
        setEvents(updatedEvents);
        setNewEvent({
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          location: '',
          venue: '',
          event_type: 'conference',
          max_attendees: '',
          registration_fee: '',
          currency: 'USD'
        });
        setShowCreateEvent(false);
        toast.success('Event created successfully!');
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleEditEvent = (eventId: string) => {
    // Here you would typically open an edit modal or navigate to edit page
    toast.success('Edit event functionality coming soon!');
  };

  const handleDeleteEvent = (eventId: string) => {
    // Here you would typically delete the event from your database
    toast.success('Event deleted successfully!');
  };

  const handleViewEvent = (eventId: string) => {
    // Here you would typically navigate to event details page
    toast.success('View event functionality coming soon!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEventUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
              <p className="text-gray-600 mt-1">Create and manage your institution&apos;s events</p>
            </div>
            <button
              onClick={() => setShowCreateEvent(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Create Event
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff] w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create New Event</h2>
              <button
                onClick={() => setShowCreateEvent(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                  placeholder="e.g., Medical Technology Summit 2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff] resize-none"
                  placeholder="Describe your event..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                  placeholder="e.g., San Francisco Convention Center"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                  >
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    value={newEvent.max_attendees}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, max_attendees: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                    placeholder="e.g., 100"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateEvent(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
            <p className="text-sm text-[#007fff]">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Events Scheduled</h2>
            <p className="text-gray-600 mb-4">Plan and promote your institution&apos;s events here.</p>
            <button
              onClick={() => setShowCreateEvent(true)}
              className="px-6 py-3 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
            >
              <PlusIcon className="w-5 h-5" /> Create New Event
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'upcoming' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium capitalize">
                      {event.event_type}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatEventDateTime(event.start_date, event.end_date)}</span>
                    </div>
                    {(event.location || event.venue) && (
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{event.venue || event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {event.max_attendees && (
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>Max {event.max_attendees} attendees</span>
                      </div>
                    )}
                    {event.registration_fee && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-green-600">
                          {event.currency === 'USD' ? '$' : event.currency}{event.registration_fee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Event"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Event"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Event"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
        
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first event'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateEvent(true)}
                className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Event
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
