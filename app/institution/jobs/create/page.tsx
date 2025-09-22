'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getProfile, getInstitutionByUserId, createJob } from '@/lib/queries';
import type { Job, Profile, Institution } from '@/types/database.types';
import Link from 'next/link';
import { ChevronRightIcon, ChevronLeftIcon, MapPinIcon, CalendarIcon, CurrencyDollarIcon, PlusIcon, XMarkIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'executive', label: 'Executive' },
];

const MEDICAL_SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Psychiatry',
  'Surgery', 'Emergency Medicine', 'Family Medicine', 'Internal Medicine',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology', 'Ophthalmology',
  'Orthopedics', 'Obstetrics & Gynecology', 'Urology', 'Gastroenterology',
  'Endocrinology', 'Pulmonology', 'Nephrology', 'Hematology', 'Infectious Disease'
];

export default function InstitutionCreateJobPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full_time',
    experience_level: 'mid',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    requirements: [] as string[],
    specializations: [] as string[],
    benefits: '',
    application_deadline: '',
    start_date: '',
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
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
    if (!user || !profile) return;

    setLoading(true);
    try {
      const jobData: Partial<Job> = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        job_type: formData.job_type as Job['job_type'],
        experience_level: formData.experience_level as Job['experience_level'],
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        currency: formData.salary_currency || null,
        requirements: formData.requirements,
        specializations: formData.specializations,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        posted_by: profile.id,
        company_id: institution?.id || profile.id, // Use profile.id as fallback
        status: 'active' as const,
        applications_count: 0,
      };

      const success = await createJob(jobData as any);
      if (success) {
        toast.success('Job posted successfully!');
        router.push('/institution/jobs');
      } else {
        toast.error('Failed to post job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to post job');
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
            <Link href="/institution/jobs">
              <Button variant="outline" size="sm">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-[#007fff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600 mt-2">
                Create a job posting for {institution?.name || 'your institution'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Senior Cardiologist"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., New York, NY"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  value={formData.job_type}
                  onChange={(e) => handleInputChange('job_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                  required
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => handleInputChange('experience_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                  required
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Salary Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => handleInputChange('salary_min', e.target.value)}
                    placeholder="50000"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => handleInputChange('salary_max', e.target.value)}
                    placeholder="80000"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.salary_currency}
                  onChange={(e) => handleInputChange('salary_currency', e.target.value)}
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

          {/* Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirements</h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} variant="outline">
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.requirements.length > 0 && (
                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-sm">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits & Perks
                </label>
                <textarea
                  value={formData.benefits}
                  onChange={(e) => handleInputChange('benefits', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                  placeholder="List benefits, perks, and what makes this opportunity special..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      value={formData.application_deadline}
                      onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/institution/jobs">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#007fff] hover:bg-[#007fff]/90 text-white"
            >
              {loading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
