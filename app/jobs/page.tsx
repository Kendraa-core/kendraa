'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getJobs, 
  getJobsByInstitution,
  applyToJob, 
  hasAppliedToJob, 
  getJobApplications,
  getInstitutionByAdminId
} from '@/lib/queries';
import { 
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon, 
  PlusIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  SparklesIcon,
  FireIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ChevronDownIcon,
  TrophyIcon,
  EyeIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  Bars3Icon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import type { JobWithCompany } from '@/types/database.types';
import {
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS,
  ANIMATIONS,
  EVENT_TYPE_COLORS,
  getEventTypeColor
} from '@/lib/design-system';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface JobWithApplication extends JobWithCompany {
  isApplied?: boolean;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobWithApplication | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'applied' | 'my-jobs'>('available');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const [jobTypes, setJobTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user?.id) {
      setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let allJobs: JobWithCompany[] = [];
        
        if (activeTab === 'applied') {
          const applications = await getJobApplications(user.id);
          const jobIds = applications.map(app => app.job_id);
          const allJobsData = await getJobs();
          allJobs = allJobsData.filter(job => jobIds.includes(job.id));
        } else if (activeTab === 'my-jobs') {
          allJobs = await getJobsByInstitution(user.id);
        } else {
          allJobs = await getJobs();
        }
        
        const jobsWithCompanies = await fetchCompanyInfo(allJobs);
        
        if (activeTab !== 'my-jobs') {
          const jobsWithApplication = await Promise.all(
            jobsWithCompanies.map(async (job) => {
              const isApplied = await hasAppliedToJob(job.id, user.id);
              return { ...job, isApplied };
            })
          );
          setJobs(jobsWithApplication);
        } else {
          setJobs(jobsWithCompanies);
        }

        // Filter out closed jobs from the default "available" tab
        let filteredJobs = jobsWithCompanies;
        if (activeTab === 'available') {
          filteredJobs = jobsWithCompanies.filter(job => 
            job.status === 'active'
          );
        }
        
        if (activeTab !== 'my-jobs') {
          const jobsWithApplication = await Promise.all(
            filteredJobs.map(async (job) => {
              const isApplied = await hasAppliedToJob(job.id, user.id);
              return { ...job, isApplied };
            })
          );
          setJobs(jobsWithApplication);
        } else {
          setJobs(filteredJobs);
        }

        // Set first job as selected by default
        if (filteredJobs.length > 0 && !selectedJob) {
          setSelectedJob(filteredJobs[0]);
        }
        
        // Extract unique job types dynamically from filtered jobs
        const types = [...new Set(filteredJobs.map(job => job.job_type).filter(Boolean))];
        setJobTypes(types);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user?.id, activeTab]);

  const fetchCompanyInfo = async (jobs: JobWithCompany[]) => {
    // Jobs already have company info from JobWithCompany interface
    return jobs;
  };

  const handleApply = async (jobId: string) => {
    if (!user?.id) {
      toast.error('Please log in to apply for jobs');
      return;
    }

    try {
      const application = await applyToJob({
        job_id: jobId,
        applicant_id: user.id,
        cover_letter: null,
        resume_url: null,
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        notes: null
      });
      if (application) {
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, isApplied: true, applications_count: (job.applications_count || 0) + 1 }
            : job
        ));
        
        // Update selected job if it's the one being applied to
        if (selectedJob?.id === jobId) {
          setSelectedJob(prev => prev ? { ...prev, isApplied: true, applications_count: (prev.applications_count || 0) + 1 } : null);
        }
        
        toast.success('Application submitted successfully');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to apply to job');
    }
  };

  const handleLike = (jobId: string) => {
    setLikedJobs(prev => {
      const newLikedJobs = new Set(prev);
      if (newLikedJobs.has(jobId)) {
        newLikedJobs.delete(jobId);
        toast.success('Removed from favorites');
        } else {
        newLikedJobs.add(jobId);
        toast.success('Added to favorites');
      }
      return newLikedJobs;
    });
  };

  const handleShare = async (job: JobWithApplication) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: job.description,
          url: window.location.origin + `/jobs/${job.id}`,
        });
        toast.success('Job shared successfully');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Failed to share job');
        }
        }
      } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + `/jobs/${job.id}`);
        toast.success('Job link copied to clipboard');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy job link');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'full_time': return <BriefcaseIcon className="w-4 h-4" />;
      case 'part_time': return <ClockIcon className="w-4 h-4" />;
      case 'contract': return <DocumentTextIcon className="w-4 h-4" />;
      case 'internship': return <AcademicCapIcon className="w-4 h-4" />;
      case 'volunteer': return <HeartIcon className="w-4 h-4" />;
      default: return <BriefcaseIcon className="w-4 h-4" />;
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'bg-blue-100 text-blue-700';
      case 'part_time': return 'bg-green-100 text-green-700';
      case 'contract': return 'bg-purple-100 text-purple-700';
      case 'internship': return 'bg-orange-100 text-orange-700';
      case 'volunteer': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  // Filter and sort jobs
  const filteredJobs = jobs.filter(job => {
    const matchesType = selectedType === 'all' || job.job_type === selectedType;
    const matchesFormat = selectedFormat === 'all' || 
                         (selectedFormat === 'remote' && job.location?.toLowerCase().includes('remote')) ||
                         (selectedFormat === 'on-site' && !job.location?.toLowerCase().includes('remote'));
    const matchesSearch = searchQuery === '' || 
                         job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesFormat && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'popularity':
        return (b.applications_count || 0) - (a.applications_count || 0);
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const availableJobs = filteredJobs.filter(job => !job.isApplied);
  const appliedJobs = filteredJobs.filter(job => job.isApplied);

  const getDisplayJobs = () => {
    if (activeTab === 'applied') return appliedJobs;
    if (activeTab === 'my-jobs') return filteredJobs.filter(j => j.company_id === user?.id);
    return filteredJobs;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BriefcaseIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Join the Community</h2>
          <p className="text-gray-600 mb-6">Sign in to discover and apply for healthcare jobs</p>
          <Link
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner variant="fullscreen" text="Loading jobs..." />;
  }

  return (
    <div className={`min-h-screen ${BACKGROUNDS.page.tertiary}`}>
        {/* Header */}
      <Header />
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Navigation */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'available'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Available Jobs
              </button>
              <button
                onClick={() => setActiveTab('applied')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'applied'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Applied Jobs
              </button>
              <button
                onClick={() => setActiveTab('my-jobs')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'my-jobs'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                My Jobs
              </button>
            </div>

            {/* Right Side - Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
              </button>

              <Link
                href="/jobs/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Post Job
              </Link>
            </div>
          </div>
                </div>
              </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Job Type</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Location</option>
                  <option value="remote">Remote</option>
                  <option value="on-site">On-Site</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="popularity">Sort by Popularity</option>
                  <option value="name">Sort by Name</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
                </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jobs List */}
          <div className="lg:col-span-2">
                  <div className="space-y-4">
              {getDisplayJobs().map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${COMPONENTS.card.base} cursor-pointer hover:shadow-md transition-all duration-200 ${
                    selectedJob?.id === job.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <Avatar
                          src={job.company?.logo_url}
                          alt={job.company?.name || 'Company'}
                          size="md"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {job.company?.name || 'Unknown Company'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatDate(job.created_at)}
                            </div>
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                              {formatSalary(job.salary_min, job.salary_max)}
                            </div>
                          </div>
                          </div>
                        </div>
                        
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(job.id);
                          }}
                          className={`p-2 transition-colors ${
                            likedJobs.has(job.id) 
                              ? 'text-red-500' 
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          {likedJobs.has(job.id) ? (
                            <HeartSolidIcon className="w-5 h-5" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(job);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <ShareIcon className="w-5 h-5" />
                        </button>
                                  </div>
                                </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getJobTypeColor(job.job_type)}`}>
                          {job.job_type?.replace('_', ' ')}
                        </span>
                        {job.location?.toLowerCase().includes('remote') && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            Remote
                                </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <UsersIcon className="w-4 h-4" />
                        <span>{job.applications_count || 0} applicants</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {getDisplayJobs().length === 0 && (
              <div className="text-center py-12">
                <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500">
                  {activeTab === 'applied' 
                    ? "You haven't applied to any jobs yet."
                    : activeTab === 'my-jobs'
                    ? "You haven't posted any jobs yet."
                    : "No jobs match your current filters."
                  }
                </p>
              </div>
                              )}
                            </div>

          {/* Job Details Panel */}
          <div className="lg:col-span-1">
            {selectedJob ? (
              <div className={`${COMPONENTS.card.base} sticky top-24`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <Avatar
                        src={selectedJob.company?.logo_url}
                        alt={selectedJob.company?.name || 'Company'}
                        size="lg"
                      />
                      <div>
                        <h1 className={`${TYPOGRAPHY.heading.h2} mb-1`}>
                          {selectedJob.title}
                        </h1>
                        <p className={`${TYPOGRAPHY.body.medium} mb-4`}>
                          {selectedJob.company?.name || 'Unknown Company'}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {selectedJob.location}
                              </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatDate(selectedJob.created_at)}
                          </div>
                        </div>
                      </div>
                            </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleLike(selectedJob.id)}
                        className={`p-2 transition-colors ${
                          likedJobs.has(selectedJob.id) 
                            ? 'text-red-500' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        {likedJobs.has(selectedJob.id) ? (
                          <HeartSolidIcon className="w-5 h-5" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                        <BriefcaseIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleShare(selectedJob)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleLike(selectedJob.id)}
                          className={`p-2 transition-colors ${
                            likedJobs.has(selectedJob.id) 
                              ? 'text-red-500' 
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          {likedJobs.has(selectedJob.id) ? (
                            <HeartSolidIcon className="w-5 h-5" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <BriefcaseIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleShare(selectedJob)}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <ShareIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {user?.id !== selectedJob.company_id && (
                      <button
                        onClick={() => selectedJob.isApplied ? null : handleApply(selectedJob.id)}
                        disabled={selectedJob.isApplied}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                          selectedJob.isApplied
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {selectedJob.isApplied ? 'Applied' : 'Apply Now'}
                      </button>
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className={`${TYPOGRAPHY.heading.h4} mb-3`}>Job Description</h3>
                      <p className={`${TYPOGRAPHY.body.medium} whitespace-pre-wrap`}>
                        {selectedJob.description}
                      </p>
                    </div>

                    <div>
                      <h3 className={`${TYPOGRAPHY.heading.h4} mb-3`}>Job Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Type</span>
                          <span className="font-medium">{selectedJob.job_type?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Location</span>
                          <span className="font-medium">{selectedJob.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Posted</span>
                          <span className="font-medium">{formatDate(selectedJob.created_at)}</span>
          </div>
        </div>
      </div>

                    <div>
                      <h3 className={`${TYPOGRAPHY.heading.h4} mb-3`}>Company</h3>
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={selectedJob.company?.logo_url}
                          alt={selectedJob.company?.name || 'Company'}
                          size="md"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedJob.company?.name || 'Unknown Company'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedJob.company?.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Healthcare Organization'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
    </div>
          </div>
            ) : (
              <div className={`${COMPONENTS.card.base} sticky top-24`}>
                <div className="p-6 text-center">
                  <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className={`${TYPOGRAPHY.heading.h4} mb-2`}>Select a Job</h3>
                  <p className={`${TYPOGRAPHY.body.medium}`}>
                    Choose a job from the list to view details
            </p>
          </div>
            </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
} 