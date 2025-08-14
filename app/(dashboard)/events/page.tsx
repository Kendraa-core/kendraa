'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarIcon, MapPinIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'conference' | 'webinar' | 'workshop' | 'networking';
  attendees: number;
  maxAttendees: number;
  isRegistered: boolean;
  organizer: string;
  category: string;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'registered'>('upcoming');

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        // TODO: Implement getEvents query
        // Mock data for now
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Healthcare Innovation Summit 2024',
            description: 'Join industry leaders for a comprehensive discussion on the future of healthcare technology and patient care innovation.',
            date: '2024-03-15',
            time: '9:00 AM - 5:00 PM',
            location: 'San Francisco, CA',
            type: 'conference',
            attendees: 245,
            maxAttendees: 500,
            isRegistered: true,
            organizer: 'Healthcare Innovation Institute',
            category: 'Innovation',
          },
          {
            id: '2',
            title: 'Digital Health Transformation Webinar',
            description: 'Learn about the latest digital health solutions and how they\'re transforming patient care delivery.',
            date: '2024-03-20',
            time: '2:00 PM - 3:30 PM',
            location: 'Virtual',
            type: 'webinar',
            attendees: 89,
            maxAttendees: 200,
            isRegistered: true,
            organizer: 'Digital Health Network',
            category: 'Technology',
          },
          {
            id: '3',
            title: 'Medical Leadership Workshop',
            description: 'Develop essential leadership skills for healthcare professionals in management roles.',
            date: '2024-04-05',
            time: '10:00 AM - 4:00 PM',
            location: 'New York, NY',
            type: 'workshop',
            attendees: 32,
            maxAttendees: 50,
            isRegistered: false,
            organizer: 'Medical Leadership Academy',
            category: 'Leadership',
          },
          {
            id: '4',
            title: 'Healthcare Networking Mixer',
            description: 'Connect with healthcare professionals in your area for networking and collaboration opportunities.',
            date: '2024-03-25',
            time: '6:00 PM - 8:00 PM',
            location: 'Chicago, IL',
            type: 'networking',
            attendees: 67,
            maxAttendees: 100,
            isRegistered: false,
            organizer: 'Healthcare Professionals Network',
            category: 'Networking',
          },
          {
            id: '5',
            title: 'Patient Care Excellence Conference',
            description: 'Explore best practices in patient care, quality improvement, and healthcare delivery optimization.',
            date: '2024-04-12',
            time: '8:00 AM - 6:00 PM',
            location: 'Boston, MA',
            type: 'conference',
            attendees: 156,
            maxAttendees: 300,
            isRegistered: false,
            organizer: 'Patient Care Institute',
            category: 'Patient Care',
          },
          {
            id: '6',
            title: 'Medical Research Symposium',
            description: 'Present and discuss the latest medical research findings and clinical trial results.',
            date: '2024-04-18',
            time: '9:00 AM - 5:00 PM',
            location: 'Virtual',
            type: 'conference',
            attendees: 234,
            maxAttendees: 400,
            isRegistered: false,
            organizer: 'Medical Research Society',
            category: 'Research',
          },
        ];
        setEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user?.id]);

  const handleRegister = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isRegistered: true, attendees: event.attendees + 1 }
        : event
    ));
  };

  const handleUnregister = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isRegistered: false, attendees: event.attendees - 1 }
        : event
    ));
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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference': return 'bg-primary-100 text-primary-800';
      case 'webinar': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'networking': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingEvents = events.filter(event => !event.isRegistered);
  const registeredEvents = events.filter(event => event.isRegistered);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-primary-600" />
                </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600">Discover and join professional events and conferences</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Events ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'registered'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Events ({registeredEvents.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'upcoming' ? upcomingEvents : registeredEvents).map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <UsersIcon className="w-4 h-4" />
                    <span>{event.attendees}/{event.maxAttendees} attendees</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">by {event.organizer}</span>
                  {event.isRegistered ? (
                    <button
                      onClick={() => handleUnregister(event.id)}
                      className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Unregister
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="px-3 py-1 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && (activeTab === 'upcoming' ? upcomingEvents : registeredEvents).length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'upcoming' ? 'No upcoming events' : 'No registered events'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' 
                ? 'Check back later for new events and conferences.'
                : 'Register for events to see them here.'
              }
            </p>
            {activeTab === 'registered' && (
              <button
                onClick={() => setActiveTab('upcoming')}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Events
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 