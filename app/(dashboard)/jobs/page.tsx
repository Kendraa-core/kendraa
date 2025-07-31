'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Avatar from '@/components/common/Avatar';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  PlusIcon,
  CheckBadgeIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getJobs, applyToJob, type JobWithCompany } from '@/lib/queries';

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

const MEDICAL_SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Radiology',
  'Emergency Medicine', 'Surgery', 'Internal Medicine', 'Psychiatry',
  'Dermatology', 'Anesthesiology', 'Pathology', 'Nursing', 'Pharmacy',
  'Physical Therapy', 'Medical Research', 'Healthcare Administration'
];

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithCompany | null>(null);

  // Debug logging
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[JobsPage] ${message}`, data);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, selectedType, selectedLevel, selectedLocation]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    debugLog('Fetching jobs');
    
    try {
      const data = await getJobs();
      setJobs(data);
      debugLog('Jobs fetched successfully', { count: data.length });
    } catch (error) {
      debugLog('Error fetching jobs', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [debugLog]);

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by search query
    if (searchQuery.trim()) {
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
    if (selectedLocation.trim()) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
    debugLog('Jobs filtered', { total: jobs.length, filtered: filtered.length });
  };

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

    debugLog('Submitting job application', { jobId: selectedJob.id, userId: user.id });

    try {
      const application = await applyToJob({
        job_id: selectedJob.id,
        applicant_id: user.id,
        cover_letter: coverLetter,
        status: 'pending',
        resume_url: null,
        reviewed_by: null,
        reviewed_at: null,
        notes: null,
      });

      if (application) {
        toast.success('Application submitted successfully!');
        setShowApplicationModal(false);
        setSelectedJob(null);
        debugLog('Application submitted successfully', { applicationId: application.id });
      } else {
        toast.error('Failed to submit application');
        debugLog('Failed to submit application');
      }
    } catch (error) {
      debugLog('Error submitting application', error);
      toast.error('Failed to submit application');
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency = 'USD') => {
    if (!min && !max) return 'Salary not disclosed';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `From ${formatter.format(min)}`;
    } else if (max) {
      return `Up to ${formatter.format(max)}`;
    }
    
    return 'Salary not disclosed';
  };

  const getJobTypeLabel = (type: string) => {
    return JOB_TYPES.find(t => t.value === type)?.label || type;
  };

  const getExperienceLabel = (level: string) => {
    return EXPERIENCE_LEVELS.find(l => l.value === level)?.label || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen modern-gradient-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-gradient-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Jobs</h1>
              <p className="text-slate-600">Find your next opportunity in healthcare</p>
            </div>
            
            {user && (
              <Button className="modern-button-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Post Job
              </Button>
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
          <Card className="modern-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search jobs, companies, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="modern-input pl-10"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Location"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="modern-input pl-10"
                    />
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="modern-input"
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
                    className="modern-input"
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
          <p className="text-slate-600">
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
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="modern-card hover:shadow-modern-lg transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Company Logo */}
                        <div className="relative flex-shrink-0">
                          <Avatar
                            src={job.company.logo_url}
                            alt={job.company.name}
                            size="lg"
                          />
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
                              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                {job.title}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Link
                                  href={`/institutions/${job.company.id}`}
                                  className="font-medium hover:text-primary-600 transition-colors"
                                >
                                  {job.company.name}
                                </Link>
                                <span>•</span>
                                <span>{formatRelativeTime(job.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Job Meta */}
                          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-slate-500">
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

                            {job.applications_count > 0 && (
                              <div className="flex items-center">
                                <UserGroupIcon className="w-4 h-4 mr-1" />
                                {job.applications_count} applicants
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-slate-700 text-sm mb-4 line-clamp-2">
                            {job.description}
                          </p>

                          {/* Specializations */}
                          {job.specializations && job.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.specializations.slice(0, 4).map((spec, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                                >
                                  {spec}
                                </span>
                              ))}
                              {job.specializations.length > 4 && (
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                                  +{job.specializations.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Application Deadline */}
                          {job.application_deadline && (
                            <div className="text-xs text-amber-600 mb-4">
                              <ClockIcon className="w-3 h-3 inline mr-1" />
                              Apply by {new Date(job.application_deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          onClick={() => handleApply(job)}
                          className="modern-button-primary min-w-[100px]"
                          size="sm"
                        >
                          Apply Now
                        </Button>
                        
                        <Link href={`/jobs/${job.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-w-[100px]"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="modern-card">
              <CardContent className="p-12 text-center">
                <BriefcaseIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery || selectedType !== 'all' || selectedLevel !== 'all'
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Be the first to post a job opportunity.'}
                </p>
                {user && (
                  <Button className="modern-button-primary">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                )}
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

// Application Modal Component
interface ApplicationModalProps {
  job: JobWithCompany;
  onClose: () => void;
  onSubmit: (coverLetter: string) => void;
}

function ApplicationModal({ job, onClose, onSubmit }: ApplicationModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) return;

    setIsSubmitting(true);
    await onSubmit(coverLetter);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Apply for Position</h2>
              <p className="text-slate-600">{job.title} at {job.company.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a compelling cover letter explaining why you're the perfect fit for this role..."
              className="modern-input min-h-[200px] resize-y"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              {coverLetter.length}/1000 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!coverLetter.trim() || isSubmitting}
              className="modern-button-primary flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 