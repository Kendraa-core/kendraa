'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const INSTITUTION_TYPES = [
  { value: 'hospital', label: 'Hospital', description: 'General and specialty hospitals' },
  { value: 'clinic', label: 'Clinic', description: 'Outpatient clinics and medical centers' },
  { value: 'medical_college', label: 'Medical College', description: 'Educational institutions' },
  { value: 'research_center', label: 'Research Center', description: 'Medical research facilities' },
  { value: 'pharmaceutical', label: 'Pharmaceutical', description: 'Drug development companies' },
  { value: 'other', label: 'Other', description: 'Other healthcare organizations' },
];

const COMMON_DEPARTMENTS = [
  'Cardiology', 'Neurology', 'Oncology', 'Surgery', 'Emergency Medicine',
  'Pediatrics', 'Internal Medicine', 'Radiology', 'Pathology', 'Anesthesiology',
  'Dermatology', 'Psychiatry', 'Orthopedics', 'Obstetrics & Gynecology',
  'Ophthalmology', 'ENT', 'Urology', 'Nephrology', 'Endocrinology', 'Pulmonology'
];

const COMMON_ACCREDITATIONS = [
  'Joint Commission Accreditation',
  'ANCC Magnet Recognition',
  'LCME Accreditation',
  'AAMC Membership',
  'ACGME Accreditation',
  'CAHIIM Accreditation',
  'ISO 15189 Certification',
  'CAP Accreditation',
  'AABB Accreditation',
  'FDA Registration'
];

export default function InstitutionSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Basic Information
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [description, setDescription] = useState('');
  const [headline, setHeadline] = useState('');

  // Contact Information
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Departments
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [customDepartment, setCustomDepartment] = useState('');

  // Accreditations
  const [selectedAccreditations, setSelectedAccreditations] = useState<string[]>([]);
  const [customAccreditation, setCustomAccreditation] = useState('');

  const handleDepartmentToggle = (department: string) => {
    setSelectedDepartments(prev =>
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  const handleAddCustomDepartment = () => {
    if (customDepartment.trim() && !selectedDepartments.includes(customDepartment.trim())) {
      setSelectedDepartments(prev => [...prev, customDepartment.trim()]);
      setCustomDepartment('');
    }
  };

  const handleAccreditationToggle = (accreditation: string) => {
    setSelectedAccreditations(prev =>
      prev.includes(accreditation)
        ? prev.filter(a => a !== accreditation)
        : [...prev, accreditation]
    );
  };

  const handleAddCustomAccreditation = () => {
    if (customAccreditation.trim() && !selectedAccreditations.includes(customAccreditation.trim())) {
      setSelectedAccreditations(prev => [...prev, customAccreditation.trim()]);
      setCustomAccreditation('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!institutionName.trim() || !institutionType || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create institution profile
      const profileData = {
        full_name: institutionName,
        headline,
        bio: description,
        user_type: 'institution' as const,
        profile_type: 'institution' as const,
        institution_type: institutionType as 'hospital' | 'clinic' | 'medical_college' | 'research_center' | 'pharmaceutical' | 'other',
        departments: selectedDepartments,
        accreditations: selectedAccreditations,
        contact_info: {
          address,
          phone,
          email,
          website,
        },
      };

      // TODO: Call API to create/update profile
      console.log('Institution profile data:', profileData);
      
      toast.success('Institution profile created successfully!');
      router.push('/feed');
    } catch (error) {
      console.error('Error creating institution profile:', error);
      toast.error('Failed to create institution profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div
          
          
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              <BuildingOffice2Icon className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Institution Profile
          </h1>
          <p className="text-lg text-gray-600">
            Help healthcare professionals discover and connect with your institution
          </p>
        </div>

        <div
          
          
          
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BuildingOffice2Icon className="h-6 w-6 mr-2 text-indigo-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Institution Name *
                  </label>
                  <Input
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Enter institution name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Institution Type *
                  </label>
                  <select
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select type</option>
                    {INSTITUTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Headline
                  </label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Brief tagline about your institution"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your institution, services, and mission"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPinIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    type="tel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@institution.org"
                    type="email"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.institution.org"
                    type="url"
                  />
                </div>
              </div>
            </div>

            {/* Departments */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CheckBadgeIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Departments & Specializations
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => handleDepartmentToggle(dept)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDepartments.includes(dept)
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="Add custom department"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomDepartment())}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomDepartment}
                    variant="outline"
                    size="sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>

                {selectedDepartments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Departments:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDepartments.map((dept) => (
                        <span
                          key={dept}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
                        >
                          {dept}
                          <button
                            type="button"
                            onClick={() => handleDepartmentToggle(dept)}
                            className="ml-2 hover:text-indigo-900"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Accreditations */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CheckBadgeIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Accreditations & Certifications
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {COMMON_ACCREDITATIONS.map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => handleAccreditationToggle(acc)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedAccreditations.includes(acc)
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {acc}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={customAccreditation}
                    onChange={(e) => setCustomAccreditation(e.target.value)}
                    placeholder="Add custom accreditation"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAccreditation())}
                  />
                  <Button
                    type="button"
                    onClick={handleAddCustomAccreditation}
                    variant="outline"
                    size="sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>

                {selectedAccreditations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Accreditations:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAccreditations.map((acc) => (
                        <span
                          key={acc}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                        >
                          {acc}
                          <button
                            type="button"
                            onClick={() => handleAccreditationToggle(acc)}
                            className="ml-2 hover:text-green-900"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/feed')}
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Profile...</span>
                    </div>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 