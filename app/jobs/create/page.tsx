'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getProfile, type Profile } from '@/lib/queries';

const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
  { value: 'fellowship', label: 'Fellowship' },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior Level (6-10 years)' },
  { value: 'lead', label: 'Lead/Principal (10+ years)' },
  { value: 'executive', label: 'Executive Level' },
];

const HEALTHCARE_SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Oncology', 'Surgery', 'Emergency Medicine',
  'Pediatrics', 'Internal Medicine', 'Radiology', 'Pathology', 'Anesthesiology',
  'Dermatology', 'Psychiatry', 'Orthopedics', 'Obstetrics & Gynecology',
  'Ophthalmology', 'ENT', 'Urology', 'Nephrology', 'Endocrinology', 'Pulmonology',
  'Family Medicine', 'Geriatrics', 'Infectious Disease', 'Rheumatology',
  'Nursing', 'Pharmacy', 'Physical Therapy', 'Medical Technology', 'Healthcare Administration'
];

export default function CreateJob() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [benefits, setBenefits] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');

  useEffect(() => {
    const checkInstitutionAccess = async () => {
      if (!user?.id) {
        router.push('/signin');
        return;
      }

      try {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);

        if (!userProfile || userProfile.profile_type !== 'institution') {
          toast.error('Only healthcare institutions can post jobs');
          router.push('/jobs');
          return;
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        toast.error('Error verifying permissions');
        router.push('/jobs');
      } finally {
        setProfileLoading(false);
      }
    };

    checkInstitutionAccess();
  }, [user, router]);

  const handleSpecializationToggle = (specialization: string) => {
    setSpecializations(prev =>
      prev.includes(specialization)
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !location.trim() || !jobType || !experienceLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (specializations.length === 0) {
      toast.error('Please select at least one specialization');
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        responsibilities: responsibilities.trim(),
        location: location.trim(),
        job_type: jobType,
        experience_level: experienceLevel,
        specializations,
        salary_min: salaryMin ? parseInt(salaryMin) : null,
        salary_max: salaryMax ? parseInt(salaryMax) : null,
        benefits: benefits.trim(),
        application_deadline: applicationDeadline || null,
        posted_by: user!.id,
        posted_by_type: 'institution',
        company_id: user!.id, // Institution's profile ID
        status: 'active',
      };

      // TODO: Call API to create job
      console.log('Job data:', jobData);
      
      toast.success('Job posted successfully!');
      router.push('/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.profile_type !== 'institution') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only healthcare institutions can post jobs</p>
          <Button onClick={() => router.push('/jobs')}>
            View Available Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              <BriefcaseIcon className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Post a New Job
          </h1>
          <p className="text-lg text-gray-600">
            Connect with qualified healthcare professionals
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BriefcaseIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Job Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Cardiologist, Emergency Medicine Physician"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select job type</option>
                    {JOB_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select experience level</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Boston, MA or Remote"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the role, working environment, and what makes this opportunity special"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <AcademicCapIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Required Specializations *
              </h2>
              
              <div className="flex flex-wrap gap-2">
                {HEALTHCARE_SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleSpecializationToggle(spec)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      specializations.includes(spec)
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>

              {specializations.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Specializations:</p>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Requirements & Responsibilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requirements
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="List education, certifications, licenses, and experience requirements"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Responsibilities
                </label>
                <textarea
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Describe key responsibilities and daily duties"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Compensation & Benefits */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 mr-2 text-indigo-600" />
                Compensation & Benefits
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Salary (Annual)
                  </label>
                  <Input
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="e.g., 150000"
                    type="number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Salary (Annual)
                  </label>
                  <Input
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="e.g., 250000"
                    type="number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Benefits & Perks
                  </label>
                  <textarea
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    placeholder="Health insurance, retirement plans, CME allowance, vacation time, etc."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <Input
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/jobs')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Posting Job...</span>
                    </div>
                  ) : (
                    'Post Job'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 