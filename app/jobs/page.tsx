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
import { uploadToSupabaseStorage } from '@/lib/utils';
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
  DocumentTextIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import type { JobWithCompany } from '@/types/database.types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS,
  ANIMATIONS
} from '@/lib/design-system';

interface JobWithApplication extends JobWithCompany {
  isApplied?: boolean;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobWithApplication[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'applied' | 'my-jobs'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'name'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationJob, setApplicationJob] = useState<JobWithApplication | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  const fetchJobs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      let jobsData: JobWithCompany[] = [];
      
      if (activeTab === 'applied') {
        // Fetch applied jobs
        const applications = await getJobApplications(user.id);
        const jobIds = applications.map(app => app.job_id);
        const allJobs = await getJobs();
        jobsData = allJobs.filter(job => jobIds.includes(job.id));
        
        // Mark as applied
        jobsData = jobsData.map(job => ({ ...job, isApplied: true }));
      } else if (activeTab === 'my-jobs') {
        // Fetch jobs posted by user's institution
        const institution = await getInstitutionByAdminId(user.id);
        if (institution) {
          jobsData = await getJobsByInstitution(institution.id);
        }
      } else {
        // Fetch all available jobs
        jobsData = await getJobs();
        
        // Check which jobs user has applied to
        const applications = await getJobApplications(user.id);
        const appliedJobIds = new Set(applications.map(app => app.job_id));
        jobsData = jobsData.map(job => ({ 
          ...job, 
          isApplied: appliedJobIds.has(job.id) 
        }));
      }

      setJobs(jobsData);
      
      // Extract unique job types
      const types = [...new Set(jobsData.map(job => job.job_type).filter(Boolean))];
      setJobTypes(types);
      
      // Set first job as selected if available
      if (jobsData.length > 0 && !selectedJob) {
        setSelectedJob(jobsData[0]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeTab, user?.id]);

  const handleApply = (job: JobWithApplication) => {
    setApplicationJob(job);
    setShowApplicationModal(true);
    setCoverLetter('');
    setResumeFile(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setResumeFile(file);
    }
  };

  const submitApplication = async () => {
    if (!user?.id || !applicationJob) return;
    
    setSubmittingApplication(true);
    let resumeUrl = null;
    
    try {
      // Upload resume if provided
      if (resumeFile) {
        setUploadingResume(true);
        const fileName = `resumes/${user.id}/${Date.now()}-${resumeFile.name}`;
        const { url, error } = await uploadToSupabaseStorage('documents', fileName, resumeFile);
        
        if (error) {
          toast.error('Failed to upload resume');
          setUploadingResume(false);
          setSubmittingApplication(false);
      return;
    }

        resumeUrl = url;
        setUploadingResume(false);
      }
      
      // Submit application
      const success = await applyToJob({
        job_id: applicationJob.id,
        applicant_id: user.id,
        cover_letter: coverLetter.trim() || null,
        resume_url: resumeUrl,
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        notes: null
      });
      
      if (success) {
        // Update local state
        setJobs(prevJobs => prevJobs.map(j => 
          j.id === applicationJob.id 
            ? { ...j, isApplied: true, applications_count: (j.applications_count || 0) + 1 }
            : j
        ));
        
        if (selectedJob?.id === applicationJob.id) {
          setSelectedJob(prev => prev ? { ...prev, isApplied: true, applications_count: (prev.applications_count || 0) + 1 } : null);
        }
        
        toast.success('Application submitted successfully!');
        setShowApplicationModal(false);
        setApplicationJob(null);
        setCoverLetter('');
        setResumeFile(null);
      } else {
        toast.error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmittingApplication(false);
      setUploadingResume(false);
    }
  };

  const handleLike = (jobId: string) => {
    setLikedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        toast.success('Removed from favorites');
        } else {
        newSet.add(jobId);
        toast.success('Added to favorites');
      }
      return newSet;
    });
  };

  const handleShare = async (job: JobWithApplication) => {
    const jobUrl = `${window.location.origin}/jobs/${job.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title} at ${job.company?.name}`,
          url: jobUrl
        });
        toast.success('Job shared successfully');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Failed to share job');
        }
        }
      } else {
      try {
        await navigator.clipboard.writeText(jobUrl);
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

  const getDisplayJobs = () => {
    if (activeTab === 'applied') return filteredJobs.filter(job => job.isApplied);
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
    <div className={`${BACKGROUNDS.page.primary} min-h-screen`}>
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >

          {/* Top Navigation Bar */}
          <div className={`${COMPONENTS.card.base} mb-4`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                {/* Left Side - Navigation */}
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => setActiveTab('available')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'available'
                        ? `${COMPONENTS.button.primary}`
                        : `${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} hover:bg-gray-100`
                    }`}
                  >
                    Available Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab('applied')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'applied'
                        ? `${COMPONENTS.button.primary}`
                        : `${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} hover:bg-gray-100`
                    }`}
                  >
                    Applied Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab('my-jobs')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'my-jobs'
                        ? `${COMPONENTS.button.primary}`
                        : `${TEXT_COLORS.secondary} hover:${TEXT_COLORS.primary} hover:bg-gray-100`
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
                    className={`${COMPONENTS.button.primary} inline-flex items-center px-4 py-2 text-sm font-medium`}
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
            <div className={`${COMPONENTS.card.base} mb-4`}>
              <div className="p-6">
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
                      <option value="all">Work Format</option>
                      <option value="remote">Remote</option>
                      <option value="on-site">On-site</option>
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

                  <div className="relative">
                <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'popularity' | 'name')}
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

          {/* Main Content Grid */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Job Listings */}
            <div className="lg:col-span-2 mb-6 lg:mb-0">
              <div className="space-y-4">
                {getDisplayJobs().map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${COMPONENTS.card.base} cursor-pointer transition-all duration-200 hover:shadow-lg ${
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
                            size="lg"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h3 className={`${TYPOGRAPHY.heading.h3} mb-1`}>
                              {job.title}
                            </h3>
                            <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary} mb-2`}>
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

                      <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary} mb-4 line-clamp-2`}>
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
                <div className={`${COMPONENTS.card.base} text-center py-12`}>
                  <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className={`${TYPOGRAPHY.heading.h3} mb-2`}>No jobs found</h3>
                  <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
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
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h2 className={`${TYPOGRAPHY.heading.h2} mb-1`}>
                            {selectedJob.title}
                          </h2>
                          <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary} mb-2`}>
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
                        <button 
                          onClick={() => handleShare(selectedJob)}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <ShareIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <button
                        onClick={() => handleApply(selectedJob)}
                        disabled={selectedJob.isApplied}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          selectedJob.isApplied
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : `${COMPONENTS.button.primary}`
                        }`}
                      >
                        {selectedJob.isApplied ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className={`${TYPOGRAPHY.heading.h3} mb-3`}>Job Description</h3>
                        <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                          {selectedJob.description}
                        </p>
                      </div>

                      <div>
                        <h3 className={`${TYPOGRAPHY.heading.h3} mb-3`}>Job Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>Type:</span>
                            <span className={`${TYPOGRAPHY.body.medium} font-medium`}>
                              {selectedJob.job_type?.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>Location:</span>
                            <span className={`${TYPOGRAPHY.body.medium} font-medium`}>
                              {selectedJob.location}
                              </span>
                            </div>
                          <div className="flex justify-between">
                            <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>Salary:</span>
                            <span className={`${TYPOGRAPHY.body.medium} font-medium`}>
                              {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>Posted:</span>
                            <span className={`${TYPOGRAPHY.body.medium} font-medium`}>
                              {formatDate(selectedJob.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className={`${TYPOGRAPHY.heading.h3} mb-3`}>Company</h3>
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={selectedJob.company?.logo_url}
                            alt={selectedJob.company?.name || 'Company'}
                            size="md"
                          />
                          <div>
                            <p className={`${TYPOGRAPHY.body.medium} font-medium`}>
                              {selectedJob.company?.name || 'Unknown Company'}
                            </p>
                            <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                              {selectedJob.company?.type || 'Healthcare Organization'}
                            </p>
                    </div>
          </div>
        </div>
      </div>
    </div>
          </div>
              ) : (
                <div className={`${COMPONENTS.card.base} text-center py-12`}>
                  <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className={`${TYPOGRAPHY.heading.h3} mb-2`}>Select a job</h3>
                  <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                    Choose a job from the list to view details
            </p>
          </div>
              )}
            </div>
            </div>
        </motion.div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && applicationJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className={`${TYPOGRAPHY.heading.h2} mb-2`}>Apply for Position</h2>
                  <h3 className={`${TYPOGRAPHY.heading.h3} ${TEXT_COLORS.primary}`}>
                    {applicationJob.title}
                  </h3>
                  <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                    {applicationJob.company?.name || 'Healthcare Organization'}
                  </p>
    </div>
            <button
                  onClick={() => setShowApplicationModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                  <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

              <div className="space-y-6">
                {/* Resume Upload */}
                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-3`}>
                    Resume *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      {resumeFile ? (
                        <div className="flex items-center justify-center space-x-2">
                          <DocumentIcon className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.primary}`}>
                              {resumeFile.name}
                            </p>
                            <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                              {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.primary} mb-2`}>
                            Upload your resume
                          </p>
                          <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                            PDF or Word document, max 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
          </div>

                {/* Cover Letter */}
                <div>
                  <label className={`block ${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-3`}>
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              />
            </div>

                {/* Application Summary */}
                <div className={`${COMPONENTS.card.base} p-4 bg-gray-50`}>
                  <h4 className={`${TYPOGRAPHY.body.medium} font-medium ${TEXT_COLORS.primary} mb-2`}>
                    Application Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Position:</span>
                      <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.primary}`}>{applicationJob.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Company:</span>
                      <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.primary}`}>
                        {applicationJob.company?.name || 'Healthcare Organization'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Resume:</span>
                      <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.primary}`}>
                        {resumeFile ? 'Uploaded' : 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Cover Letter:</span>
                      <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.primary}`}>
                        {coverLetter.trim() ? 'Provided' : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
                  </button>
                  <button
                    onClick={submitApplication}
                    disabled={!resumeFile || submittingApplication || uploadingResume}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      !resumeFile || submittingApplication || uploadingResume
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {uploadingResume ? 'Uploading...' : submittingApplication ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 