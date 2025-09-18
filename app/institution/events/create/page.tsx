'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createEvent, getInstitutionByUserId } from '@/lib/queries';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, BuildingOfficeIcon, CalendarIcon, MapPinIcon, CurrencyDollarIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Event, Institution } from '@/types/database.types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

const MEDICAL_SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Psychiatry',
  'Surgery', 'Emergency Medicine', 'Family Medicine', 'Internal Medicine',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology', 'Ophthalmology',
  'Orthopedics', 'Obstetrics & Gynecology', 'Urology', 'Gastroenterology',
  'Endocrinology', 'Pulmonology', 'Nephrology', 'Hematology', 'Infectious Disease'
];

export default function InstitutionCreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');
  
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

  const fetchInstitution = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const institutionData = await getInstitutionByUserId(user.id);
      setInstitution(institutionData);
    } catch (error) {
      console.error('Error fetching institution:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchInstitution();
  }, [user, router, fetchInstitution]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const eventData: Partial<Event> = {
        title: formData.title,
        description: formData.description,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        location: formData.location,
        venue: formData.venue,
        event_type: formData.event_type,
        specializations: formData.specializations,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        registration_fee: formData.registration_fee ? parseFloat(formData.registration_fee) : null,
        currency: formData.currency,
        status: formData.status,
        is_virtual: formData.is_virtual,
        meeting_link: formData.meeting_link,
        banner_url: formData.banner_url,
        organizer_id: user.id,
        organizer_type: 'institution' as const,
      };

      const success = await createEvent(eventData as any);
      if (success) {
        toast.success('Event created successfully!');
        router.push('/institution/events');
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/institution/events">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-[#007fff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
              <p className="text-gray-600 mt-2">
                Organize an event for {institution?.name || 'your institution'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Annual Cardiology Conference 2024"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                  placeholder="Describe the event, its purpose, agenda, and what attendees can expect..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                    required
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                    required
                  >
                    {EVENT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Date & Time</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_virtual"
                  checked={formData.is_virtual}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#007fff] border-gray-300 rounded focus:ring-[#007fff]"
                />
                <label className="text-sm font-medium text-gray-700">
                  This is a virtual event
                </label>
              </div>
              
              {formData.is_virtual ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link *
                  </label>
                  <Input
                    type="url"
                    name="meeting_link"
                    value={formData.meeting_link}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/j/..."
                    required={formData.is_virtual}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., New York, NY"
                        className="pl-10"
                        required={!formData.is_virtual}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue
                    </label>
                    <Input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      placeholder="e.g., Convention Center, Room 101"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Specializations</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                >
                  <option value="">Select a specialization...</option>
                  {MEDICAL_SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={addSpecialization} variant="outline">
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specializations.map((specialization, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1 bg-[#007fff]/10 text-[#007fff] rounded-full text-sm">
                      <span>{specialization}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecialization(index)}
                        className="text-[#007fff] hover:text-[#007fff]/70"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Registration & Capacity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration & Capacity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Attendees
                </label>
                <Input
                  type="number"
                  name="max_attendees"
                  value={formData.max_attendees}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Fee
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    name="registration_fee"
                    value={formData.registration_fee}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image URL
              </label>
              <Input
                type="url"
                name="banner_url"
                value={formData.banner_url}
                onChange={handleInputChange}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/institution/events">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#007fff] hover:bg-[#007fff]/90 text-white"
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
