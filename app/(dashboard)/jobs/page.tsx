'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatRelativeTime } from '@/lib/utils';
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  PlusIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getJobs, applyToJob, getProfile, type JobWithCompany } from '@/lib/queries';
import type { Profile } from '@/types/database.types';

const JOB_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
];

const EXPERIENCE_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'executive', label: 'Executive' },
];

const formatSalary = (min: number | null, max: number | null, currency = 'USD') => {
  if (!min && !max) return 'Salary not specified';
  
  const format = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  if (min && max) {
    return `${format(min)} - ${format(max)}`;
  } else if (min) {
    return `${format(min)}+`;
  } else if (max) {
    return `Up to ${format(max)}`;
  }
  
  return 'Salary not specified';
};

export default function JobsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithCompany | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const profileData = await getProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user?.id]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchJobs();
  }, [fetchProfile, fetchJobs]);

  const filterJobs = useCallback(() => {
    let filtered = jobs;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by job type
    if (selectedType !== 'all') {
      filtered = filtered.filter(job => job.job_type === selectedType);
    }

    // Filter by experience level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(job => job.experience_level === selectedLevel);
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, selectedType, selectedLevel, selectedLocation]);

  useEffect(() => {
    filterJobs();
  }, [filterJobs]);

  const handleApply = async (job: JobWithCompany) => {
    if (!user?.id) {
      toast.error('Please log in to apply for jobs');
      return;
    }

    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const submitApplication = async (coverLetter: string) => {
    if (!user?.id || !selectedJob) return;

    try {
      const result = await applyToJob({
        job_id: selectedJob.id,
        applicant_id: user.id,
        cover_letter: coverLetter,
        resume_url: null,
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        notes: null,
      });

      if (result) {
        toast.success('Application submitted successfully!');
        setShowApplicationModal(false);
        setSelectedJob(null);
      } else {
        toast.error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    }
  };

  const getJobTypeLabel = (type: string) => {
    const jobType = JOB_TYPES.find(t => t.value === type);
    return jobType?.label || type;
  };

  const getExperienceLabel = (level: string) => {
    const expLevel = EXPERIENCE_LEVELS.find(l => l.value === level);
    return expLevel?.label || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isInstitution = profile?.profile_type === 'institution';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Healthcare Jobs</h1>
              <p className="text-gray-600">
                {isInstitution ? 'Post and manage job opportunities' : 'Find your next opportunity in healthcare'}
              </p>
            </div>
            
            {user && isInstitution && (
              <Link href="/jobs/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search jobs, companies, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Location"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {JOB_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Experience Level */}
                <div>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </motion.div>

        {/* Jobs List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Company Logo */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            {job.company.name.charAt(0)}
                          </div>
                          {job.company.verified && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckBadgeSolidIcon className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Job Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {job.title}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Link
                                  href={`/profile/${job.company.admin_user_id}`}
                                  className="font-medium hover:text-blue-600 transition-colors"
                                >
                                  {job.company.name}
                                </Link>
                                <span>•</span>
                                <span>{formatRelativeTime(job.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Job Meta */}
                          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-500">
                            {job.location && (
                              <div className="flex items-center">
                                <MapPinIcon className="w-4 h-4 mr-1" />
                                {job.location}
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {getJobTypeLabel(job.job_type)}
                            </div>
                            
                            <div className="flex items-center">
                              <StarIcon className="w-4 h-4 mr-1" />
                              {getExperienceLabel(job.experience_level)}
                            </div>

                            <div className="flex items-center">
                              <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                              {formatSalary(job.salary_min, job.salary_max, job.currency || 'USD')}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                            {job.description}
                          </p>

                          {/* Specializations */}
                          {job.specializations && job.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.specializations.slice(0, 3).map((spec, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                >
                                  {spec}
                                </span>
                              ))}
                              {job.specializations.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  +{job.specializations.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          onClick={() => handleApply(job)}
                          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                          size="sm"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-12 text-center">
                <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedLocation || selectedType !== 'all' || selectedLevel !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'No jobs are currently available. Check back later!'}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <ApplicationModal
          job={selectedJob}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedJob(null);
          }}
          onSubmit={submitApplication}
        />
      )}
    </div>
  );
}

interface ApplicationModalProps {
  job: JobWithCompany;
  onClose: () => void;
  onSubmit: (coverLetter: string) => void;
}

function ApplicationModal({ job, onClose, onSubmit }: ApplicationModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(coverLetter);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Apply for {job.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>{job.company.name}</strong> • {job.location}
            </p>
            <p className="text-sm text-gray-500">
              {formatSalary(job.salary_min, job.salary_max, job.currency || 'USD')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Introduce yourself and explain why you're interested in this position..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 