'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getProfile, ensureInstitutionExists, createJob } from '@/lib/queries';
import type { Job, Profile } from '@/types/database.types';
import Link from 'next/link';
import { 
  ChevronRightIcon, 
  ChevronLeftIcon, 
  MapPinIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  PlusIcon, 
  XMarkIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ClockIcon,
  UsersIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS
} from '@/lib/design-system';

const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time', icon: BriefcaseIcon },
  { value: 'part_time', label: 'Part Time', icon: ClockIcon },
  { value: 'contract', label: 'Contract', icon: DocumentTextIcon },
  { value: 'internship', label: 'Internship', icon: AcademicCapIcon },
  { value: 'volunteer', label: 'Volunteer', icon: UsersIcon },
  { value: 'temporary', label: 'Temporary', icon: CalendarIcon },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior Level (6-10 years)' },
  { value: 'lead', label: 'Lead Level (11+ years)' },
  { value: 'executive', label: 'Executive Level' },
];

const WORK_ARRANGEMENTS = [
  { value: 'on_site', label: 'On-Site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

const BENEFITS = [
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  'Life Insurance',
  'Retirement Plan (401k)',
  'Paid Time Off',
  'Sick Leave',
  'Maternity/Paternity Leave',
  'Professional Development',
  'Tuition Reimbursement',
  'Flexible Schedule',
  'Work From Home',
  'Gym Membership',
  'Commuter Benefits',
  'Stock Options',
  'Bonus Program'
];

const MEDICAL_SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Psychiatry',
  'Surgery', 'Emergency Medicine', 'Family Medicine', 'Internal Medicine',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology', 'Ophthalmology',
  'Orthopedics', 'Obstetrics & Gynecology', 'Urology', 'Gastroenterology',
  'Endocrinology', 'Pulmonology', 'Nephrology', 'Hematology', 'Infectious Disease'
];

export default function CreateJobPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full_time',
    experience_level: 'mid',
    work_arrangement: 'on_site',
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    requirements: [] as string[],
    specializations: [] as string[],
    benefits: [] as string[],
    application_deadline: '',
    contact_email: '',
    contact_phone: '',
    company_website: '',
    max_applications: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
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
    if (newSpecialization.trim()) {
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

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const toggleBenefit = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id || !profile) {
        toast.error('User not authenticated');
        return;
      }

      // Ensure institution exists for institution profiles
      let companyId = profile.id;
      if (profile.profile_type === 'institution') {
        const institution = await ensureInstitutionExists(user.id, profile);
        if (institution) {
          companyId = institution.id;
        }
      }

      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        job_type: formData.job_type as Job['job_type'],
        experience_level: formData.experience_level as Job['experience_level'],
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        currency: formData.currency || null,
        requirements: formData.requirements,
        specializations: formData.specializations,
        company_id: companyId,
        posted_by: profile?.id || user.id,
        status: 'active' as const,
        application_deadline: formData.application_deadline || null,
        applications_count: 0,
      };

      const result = await createJob(jobData);
      if (result) {
        toast.success('Job posted successfully!');
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BACKGROUNDS.page.primary}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`${TYPOGRAPHY.heading.h1} mb-2`}>Create Job Posting</h1>
              <p className={`${TYPOGRAPHY.body.large} ${TEXT_COLORS.secondary}`}>
                Post a new healthcare job opportunity and connect with qualified professionals
              </p>
            </div>
            <Link
              href="/jobs"
              className={`flex items-center px-4 py-2 ${COMPONENTS.button.secondary} rounded-lg hover:bg-gray-100 transition-colors`}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className={`${COMPONENTS.card.base} p-6`}>
              <h2 className={`${TYPOGRAPHY.heading.h3} mb-6 flex items-center`}>
                <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Job Title *
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Senior Cardiologist"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Location
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., New York, NY"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className={`${COMPONENTS.card.base} p-6`}>
              <h2 className={`${TYPOGRAPHY.heading.h3} mb-6 flex items-center`}>
                <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" />
                Job Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Job Type *
                  </label>
                  <select
                    required
                    value={formData.job_type}
                    onChange={(e) => handleInputChange('job_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {JOB_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Experience Level *
                  </label>
                  <select
                    required
                    value={formData.experience_level}
                    onChange={(e) => handleInputChange('experience_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Work Arrangement *
                  </label>
                  <select
                    required
                    value={formData.work_arrangement}
                    onChange={(e) => handleInputChange('work_arrangement', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {WORK_ARRANGEMENTS.map(arrangement => (
                      <option key={arrangement.value} value={arrangement.value}>
                        {arrangement.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Compensation & Timeline */}
            <div className={`${COMPONENTS.card.base} p-6`}>
              <h2 className={`${TYPOGRAPHY.heading.h3} mb-6 flex items-center`}>
                <CurrencyDollarIcon className="w-5 h-5 mr-2 text-blue-600" />
                Compensation & Timeline
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Minimum Salary
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Maximum Salary
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Application Deadline
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="date"
                      value={formData.application_deadline}
                      onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className={`${COMPONENTS.card.base} p-6`}>
              <h2 className={`${TYPOGRAPHY.heading.h3} mb-6 flex items-center`}>
                <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                Job Description
              </h2>
              
              <div>
                <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                  Job Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
              </div>
            </div>

            {/* Benefits */}
            <div className={`${COMPONENTS.card.base} p-6`}>
              <h2 className={`${TYPOGRAPHY.heading.h3} mb-6 flex items-center`}>
                <UsersIcon className="w-5 h-5 mr-2 text-blue-600" />
                Benefits & Perks
              </h2>
              
              <div className="mb-6">
                <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-3`}>
                  Select Benefits
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {BENEFITS.map(benefit => (
                    <label key={benefit} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.benefits.includes(benefit)}
                        onChange={() => toggleBenefit(benefit)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.primary}`}>
                        {benefit}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                  Add Custom Benefit
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="e.g., Free parking"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addBenefit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {formData.benefits.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className={`${COMPONENTS.card.base} p-6`}>
              <h2 className={`${TYPOGRAPHY.heading.h3} mb-6 flex items-center`}>
                <EnvelopeIcon className="w-5 h-5 mr-2 text-blue-600" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Contact Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      placeholder="hr@company.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Contact Phone
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Company Website
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="url"
                      value={formData.company_website}
                      onChange={(e) => handleInputChange('company_website', e.target.value)}
                      placeholder="https://company.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className={`${COMPONENTS.card.base} p-6`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`${TYPOGRAPHY.heading.h4} ${TEXT_COLORS.primary}`}>Ready to Post?</h3>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mt-1`}>
                    Review your job posting and click &quot;Post Job&quot; to make it live
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/jobs')}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Posting Job...' : 'Post Job'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 