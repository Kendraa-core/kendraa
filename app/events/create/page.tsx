'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createEvent } from '@/lib/queries';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  CalendarDaysIcon, 
  MapPinIcon, 
  GlobeAltIcon,
  VideoCameraIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Event } from '@/types/database.types';
import Header from '@/components/layout/Header';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  LAYOUT 
} from '@/lib/design-system';

const EVENT_TYPES = [
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'networking', label: 'Networking' },
  { value: 'training', label: 'Training' },
];

const EVENT_STATUSES = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    venue: '',
    event_type: 'conference' as Event['event_type'],
    specializations: [] as string[],
    max_attendees: '',
    registration_fee: '',
    currency: 'USD',
    status: 'upcoming' as Event['status'],
    is_virtual: false,
    meeting_link: '',
    banner_url: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpecializationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const specializations = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, specializations }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Please log in to create events');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location.trim() || null,
        venue: formData.venue.trim() || null,
        event_type: formData.event_type,
        specializations: formData.specializations.length > 0 ? formData.specializations : null,
        organizer_id: user.id,
        organizer_type: 'individual' as const,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        registration_fee: formData.registration_fee ? parseFloat(formData.registration_fee) : null,
        currency: formData.currency,
        status: formData.status,
        is_virtual: formData.is_virtual,
        meeting_link: formData.meeting_link.trim() || null,
        banner_url: formData.banner_url.trim() || null,
      };

      const event = await createEvent(eventData);

      if (event) {
        toast.success('Event created successfully!');
        router.push('/events');
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${BACKGROUNDS.page.primary} flex items-center justify-center p-4`}>
        <div className={`${COMPONENTS.card.base} p-8 text-center max-w-md mx-auto`}>
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CalendarDaysIcon className="w-8 h-8 text-[#007fff]" />
          </div>
          <h2 className={`${TYPOGRAPHY.heading.h2} mb-3`}>Join the Community</h2>
          <p className={`${TEXT_COLORS.secondary} mb-6`}>Sign in to create and organize healthcare events</p>
          <Link
            href="/signin"
            className={`${COMPONENTS.button.primary}`}
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BACKGROUNDS.page.primary}`}>
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#007fff]/5 to-purple-500/5"></div>
        <div className={`${LAYOUT.container.lg} py-12 relative`}>
          <div className="flex items-center mb-8">
            <Link
              href="/events"
              className="flex items-center text-gray-600 hover:text-[#007fff] transition-colors mr-6 group"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Events</span>
            </Link>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#007fff]/10 rounded-2xl mb-6">
              <CalendarDaysIcon className="w-8 h-8 text-[#007fff]" />
            </div>
            <h1 className={`${TYPOGRAPHY.heading.h1} text-4xl mb-4`}>Create Your Event</h1>
            <p className={`${TEXT_COLORS.secondary} text-lg max-w-2xl mx-auto`}>
              Organize a meaningful healthcare event and connect with professionals in your field. 
              Share knowledge, build networks, and advance medical excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={`${LAYOUT.container.lg} pb-12`}>
        <div className={`${COMPONENTS.card.base} overflow-hidden`}>
          <div className="p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Information */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircleIcon className="w-5 h-5 text-[#007fff]" />
                </div>
                <div>
                  <h3 className={`${TYPOGRAPHY.heading.h3} text-xl`}>Basic Information</h3>
                  <p className={`${TEXT_COLORS.secondary} text-sm`}>Essential details about your event</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className={`${COMPONENTS.input.base} text-lg`}
                    placeholder="Enter your event title..."
                  />
                </div>

                <div>
                  <label htmlFor="description" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className={`${COMPONENTS.input.textarea}`}
                    placeholder="Describe your event in detail. What will attendees learn? What makes this event special?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="event_type" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                      Event Type *
                    </label>
                    <select
                      id="event_type"
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleInputChange}
                      required
                      className={`${COMPONENTS.input.base}`}
                    >
                      {EVENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className={`${COMPONENTS.input.base}`}
                    >
                      {EVENT_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center mr-3">
                  <ClockIcon className="w-5 h-5 text-[#007fff]" />
                </div>
                <div>
                  <h3 className={`${TYPOGRAPHY.heading.h3} text-xl`}>Date and Time</h3>
                  <p className={`${TEXT_COLORS.secondary} text-sm`}>When will your event take place?</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                    Start Date and Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className={`${COMPONENTS.input.base}`}
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                    End Date and Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className={`${COMPONENTS.input.base}`}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center mr-3">
                  <MapPinIcon className="w-5 h-5 text-[#007fff]" />
                </div>
                <div>
                  <h3 className={`${TYPOGRAPHY.heading.h3} text-xl`}>Location & Venue</h3>
                  <p className={`${TEXT_COLORS.secondary} text-sm`}>Where will attendees join your event?</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="location" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`${COMPONENTS.input.base}`}
                      placeholder="City, State, Country"
                    />
                  </div>

                  <div>
                    <label htmlFor="venue" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                      Venue
                    </label>
                    <input
                      type="text"
                      id="venue"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      className={`${COMPONENTS.input.base}`}
                      placeholder="Hospital, Conference Center, etc."
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                  <label className="flex items-start cursor-pointer group">
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        name="is_virtual"
                        checked={formData.is_virtual}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-[#007fff] border-2 border-gray-300 rounded-lg focus:ring-[#007fff] focus:ring-2 transition-colors"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <VideoCameraIcon className="w-5 h-5 text-[#007fff] mr-2" />
                        <span className={`${TYPOGRAPHY.body.medium} font-semibold text-gray-900 group-hover:text-[#007fff] transition-colors`}>
                          This is a virtual event
                        </span>
                      </div>
                      <p className={`${TEXT_COLORS.secondary} text-sm mt-1`}>
                        Attendees will join online via video conferencing
                      </p>
                    </div>
                  </label>
                </div>

                {formData.is_virtual && (
                  <div className="bg-white border-2 border-[#007fff]/20 rounded-xl p-6">
                    <label htmlFor="meeting_link" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                      <GlobeAltIcon className="w-5 h-5 text-[#007fff] inline mr-2" />
                      Meeting Link *
                    </label>
                    <input
                      type="url"
                      id="meeting_link"
                      name="meeting_link"
                      value={formData.meeting_link}
                      onChange={handleInputChange}
                      className={`${COMPONENTS.input.base}`}
                      placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    />
                    <p className={`${TEXT_COLORS.secondary} text-sm mt-2`}>
                      Provide the link where attendees will join the virtual event
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center mr-3">
                  <UserGroupIcon className="w-5 h-5 text-[#007fff]" />
                </div>
                <div>
                  <h3 className={`${TYPOGRAPHY.heading.h3} text-xl`}>Additional Details</h3>
                  <p className={`${TEXT_COLORS.secondary} text-sm`}>Fine-tune your event settings</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="specializations" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                      Medical Specializations
                    </label>
                    <input
                      type="text"
                      id="specializations"
                      name="specializations"
                      value={formData.specializations.join(', ')}
                      onChange={handleSpecializationsChange}
                      className={`${COMPONENTS.input.base}`}
                      placeholder="Cardiology, Neurology, Pediatrics..."
                    />
                    <p className={`${TEXT_COLORS.secondary} text-sm mt-2`}>
                      Separate multiple specializations with commas
                    </p>
                  </div>

                  <div>
                    <label htmlFor="max_attendees" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                      Maximum Attendees
                    </label>
                    <input
                      type="number"
                      id="max_attendees"
                      name="max_attendees"
                      value={formData.max_attendees}
                      onChange={handleInputChange}
                      min="1"
                      className={`${COMPONENTS.input.base}`}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="registration_fee" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                      <CurrencyDollarIcon className="w-5 h-5 text-[#007fff] inline mr-2" />
                      Registration Fee
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#007fff] focus-within:ring-4 focus-within:ring-[#007fff]/10 transition-all">
                      <input
                        type="number"
                        id="registration_fee"
                        name="registration_fee"
                        value={formData.registration_fee}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="flex-1 px-4 py-3 border-0 bg-white focus:outline-none focus:ring-0"
                        placeholder="0.00"
                      />
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="px-4 py-3 border-0 border-l border-gray-200 bg-gray-50 focus:outline-none focus:ring-0 text-gray-700 font-medium"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    <p className={`${TEXT_COLORS.secondary} text-sm mt-2`}>
                      Leave at 0.00 for free events
                    </p>
                  </div>

                  <div>
                    <label htmlFor="banner_url" className={`block ${TYPOGRAPHY.body.medium} font-semibold mb-3`}>
                      <PhotoIcon className="w-5 h-5 text-[#007fff] inline mr-2" />
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      id="banner_url"
                      name="banner_url"
                      value={formData.banner_url}
                      onChange={handleInputChange}
                      className={`${COMPONENTS.input.base}`}
                      placeholder="https://example.com/banner.jpg"
                    />
                    <p className={`${TEXT_COLORS.secondary} text-sm mt-2`}>
                      Optional: Add a banner image for your event
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#007fff]/10 rounded-xl mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-[#007fff]" />
                </div>
                <h4 className={`${TYPOGRAPHY.heading.h4} mb-2`}>Ready to Launch?</h4>
                <p className={`${TEXT_COLORS.secondary}`}>
                  Review your event details and create your healthcare event
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/events"
                  className={`${COMPONENTS.button.secondary} min-w-[140px] text-center`}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${COMPONENTS.button.primary} min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Creating Event...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CalendarDaysIcon className="w-5 h-5 mr-2" />
                      Create Event
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
