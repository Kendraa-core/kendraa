'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createSampleEvents, getEvents, getEventsByOrganizer } from '@/lib/queries';
import toast from 'react-hot-toast';

export default function TestEventsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  const handleCreateSampleEvents = async () => {
    if (!user?.id) {
      toast.error('Please log in first');
      return;
    }

    setLoading(true);
    try {
      await createSampleEvents(user.id);
      toast.success('Sample events created successfully!');
    } catch (error) {
      console.error('Error creating sample events:', error);
      toast.error('Failed to create sample events');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadEvents = async () => {
    setLoading(true);
    try {
      const allEvents = await getEvents();
      setEvents(allEvents);
      toast.success(`Loaded ${allEvents.length} events`);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMyEvents = async () => {
    if (!user?.id) {
      toast.error('Please log in first');
      return;
    }

    setLoading(true);
    try {
      const myEvents = await getEventsByOrganizer(user.id);
      setEvents(myEvents);
      toast.success(`Loaded ${myEvents.length} of your events`);
    } catch (error) {
      console.error('Error loading my events:', error);
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Events Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Actions</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleCreateSampleEvents}
              disabled={loading || !user?.id}
              className="px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Sample Events'}
            </button>
            
            <button
              onClick={handleLoadEvents}
              disabled={loading}
              className="px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-4"
            >
              {loading ? 'Loading...' : 'Load All Events'}
            </button>
            
            <button
              onClick={handleLoadMyEvents}
              disabled={loading || !user?.id}
              className="px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-4"
            >
              {loading ? 'Loading...' : 'Load My Events'}
            </button>
          </div>
          
          {!user?.id && (
            <p className="text-red-600 mt-4">Please log in to test events functionality</p>
          )}
        </div>

        {events.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Events ({events.length})</h2>
            
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Organizer ID: {event.organizer_id}</p>
                    <p>Start Date: {event.start_date}</p>
                    <p>Event Type: {event.event_type}</p>
                    <p>Status: {event.status}</p>
                    {event.organizer && (
                      <p>Organizer: {event.organizer.full_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
