'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getJobs, applyToJob, hasAppliedToJob, getJobApplications } from '@/lib/queries';
import type { JobWithCompany } from '@/types/database.types';
import { 
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Avatar from '@/components/common/Avatar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatRelativeTime } from '@/lib/utils';
import {
  CheckBadgeIcon as CheckBadgeSolidIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { getProfile } from '@/lib/queries';
import type { Profile, JobApplication } from '@/types/database.types';

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
  const [applicationStatuses, setApplicationStatuses] = useState<Record<string, boolean>>({});
  const [showApplicationsSection, setShowApplicationsSection] = useState(false);
  const [jobApplications, setJobApplications] = useState<Record<string, JobApplication[]>>({});

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const profileData = await getProfile(user.id);
      setProfile(profileData);
    } catch (error) {
      // Silent error handling for profile
    }
  }, [user?.id]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    
    try {
      const data = await getJobs();
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      // Silent error handling for jobs
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check application status for all jobs
  const checkApplicationStatuses = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const statuses: Record<string, boolean> = {};
      for (const job of jobs) {
        statuses[job.id] = await hasAppliedToJob(user.id, job.id);
      }
      setApplicationStatuses(statuses);
    } catch (error) {
      // Silent error handling for application statuses
    }
  }, [user?.id, jobs]);

  // Fetch applications for jobs posted by the current user
  const fetchJobApplications = useCallback(async () => {
    if (!user?.id || !profile) return;
    
    try {
      const applications: Record<string, JobApplication[]> = {};
      for (const job of jobs) {
        if (job.posted_by === profile.id) {
          const jobApps = await getJobApplications(job.id);
          applications[job.id] = jobApps;
        }
      }
      setJobApplications(applications);
    } catch (error) {
      // Silent error handling for job applications
    }
  }, [user?.id, profile, jobs]);

  useEffect(() => {
    fetchProfile();
    fetchJobs();
  }, [fetchProfile, fetchJobs]);

  useEffect(() => {
    if (jobs.length > 0) {
      checkApplicationStatuses();
    }
  }, [jobs, checkApplicationStatuses]);

  useEffect(() => {
    if (jobs.length > 0 && profile) {
      fetchJobApplications();
    }
  }, [jobs, profile, fetchJobApplications]);

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
        // Update application status
        setApplicationStatuses(prev => ({ ...prev, [selectedJob.id]: true }));
      } else {
        toast.error('Failed to submit application');
      }
    } catch (error) {
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message === 'You have already applied to this job') {
          toast.error('You have already applied to this job');
        } else {
          toast.error(error.message || 'Failed to submit application');
        }
      } else {
        toast.error('Failed to submit application');
      }
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

  const isJobPoster = (job: JobWithCompany) => {
    return profile?.id === job.posted_by;
  };

  const getApplicationCount = (jobId: string) => {
    return jobApplications[jobId]?.length || 0;
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs</h1>
              <p className="text-gray-600">
                Find your next opportunity in healthcare
              </p>
            </div>
            {isInstitution && (
              <Link
                href="/jobs/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Post a Job
              </Link>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search jobs, companies, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Job Posters Section */}
          {isInstitution && jobs.some(job => isJobPoster(job)) && (
            <div className="mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">My Posted Jobs</h2>
                  <button
                    onClick={() => setShowApplicationsSection(!showApplicationsSection)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {showApplicationsSection ? 'Hide' : 'View'} Applications
                  </button>
                </div>
                
                {showApplicationsSection && (
                  <div className="space-y-4">
                    {jobs.filter(job => isJobPoster(job)).map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                          <div className="flex items-center space-x-2">
                            <UsersIcon className="w-5 h-5 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {getApplicationCount(job.id)} applications
                            </span>
                          </div>
                        </div>
                        
                        {jobApplications[job.id] && jobApplications[job.id].length > 0 ? (
                          <div className="space-y-2">
                            {jobApplications[job.id].slice(0, 3).map((application) => (
                              <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="w-4 h-4 text-primary-600" />
                </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      Application #{application.id.slice(0, 8)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatRelativeTime(application.created_at)}
                                    </p>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  application.status === 'reviewed' ? 'bg-primary-100 text-primary-800' :
                                  application.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {application.status}
                                </span>
                              </div>
                            ))}
                            {jobApplications[job.id].length > 3 && (
                              <Link
                                href={`/jobs/${job.id}/applications`}
                                className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium py-2"
                              >
                                View all {jobApplications[job.id].length} applications
                              </Link>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No applications yet</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BriefcaseIcon className="w-6 h-6 text-primary-600" />
                </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {job.title}
                              </h3>
                              {job.company.verified && (
                                <CheckBadgeSolidIcon className="w-5 h-5 text-primary-600" />
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{job.company.name}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              {job.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPinIcon className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <BriefcaseIcon className="w-4 h-4" />
                                <span>{getJobTypeLabel(job.job_type)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <StarIcon className="w-4 h-4" />
                                <span>{getExperienceLabel(job.experience_level)}</span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3 line-clamp-2">
                              {job.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatSalary(job.salary_min, job.salary_max, job.currency || 'USD')}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Posted {formatRelativeTime(job.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {isJobPoster(job) ? (
                          <div className="text-right">
                            <span className="text-sm text-gray-500">Your job</span>
                            <div className="flex items-center space-x-1 mt-1">
                              <UsersIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {getApplicationCount(job.id)} applications
                              </span>
                            </div>
                          </div>
                        ) : applicationStatuses[job.id] ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Already Applied</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleApply(job)}
                            className="bg-primary-600 hover:bg-primary-700"
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
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
      <div
        
        
        
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Introduce yourself and explain why you're interested in this position..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
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
      </div>
    </div>
  );
} 