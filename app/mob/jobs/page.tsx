'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import {
  getJobs,
  getUserApplications,
  getJobsByInstitution,
  applyToJob,
  hasAppliedToJob,
  type JobWithCompany
} from '@/lib/queries';
import { type JobApplication } from '@/types/database.types';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { formatDate, formatNumber } from '@/lib/utils';

interface JobWithApplication extends JobWithCompany {
  isApplied?: boolean;
}

export default function MobileJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'applied' | 'saved'>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobWithApplication | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      let jobsData: JobWithCompany[] = [];
      
      if (activeTab === 'applied') {
        // Get jobs user has applied to
        const applications = await getUserApplications(user.id);
        jobsData = applications.map(app => app.job).filter((job): job is JobWithCompany => job !== undefined);
      } else {
        // Get all available jobs
        jobsData = await getJobs();
      }

      // Check application status for each job
      const jobsWithApplicationStatus = await Promise.all(
        jobsData.map(async (job) => {
          const isApplied = await hasAppliedToJob(user.id, job.id);
          return { ...job, isApplied };
        })
      );

      setJobs(jobsWithApplicationStatus);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeTab]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (jobId: string) => {
    if (!user?.id) return;
    
    try {
      const application = {
        job_id: jobId,
        applicant_id: user.id,
        status: 'pending' as const,
        cover_letter: 'Applied via mobile app',
        resume_url: null,
        reviewed_by: null,
        reviewed_at: null,
        notes: null
      };

      const result = await applyToJob(application);
      
      if (result) {
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, isApplied: true, applications_count: (job.applications_count || 0) + 1 }
            : job
        ));
        
        if (selectedJob?.id === jobId) {
          setSelectedJob(prev => prev ? { ...prev, isApplied: true } : null);
        }
        
        toast.success('Application submitted successfully!');
      } else {
        toast.error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.company?.name?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${formatNumber(min)} - $${formatNumber(max)}`;
    if (min) return `From $${formatNumber(min)}`;
    if (max) return `Up to $${formatNumber(max)}`;
    return 'Salary not specified';
  };

  const JobCard = ({ job }: { job: JobWithApplication }) => (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      onClick={() => setSelectedJob(job)}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          src={job.company?.logo_url}
          alt={job.company?.name || 'Company'}
          size="md"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {job.company?.name}
          </p>
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center">
              <MapPinIcon className="w-3 h-3 mr-1" />
              <span>{job.location || 'Remote'}</span>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-3 h-3 mr-1" />
              <span>
                {formatSalary(job.salary_min, job.salary_max)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <CalendarDaysIcon className="w-3 h-3" />
              <span>{formatDate(job.created_at)}</span>
            </div>
            
            {job.isApplied ? (
              <div className="flex items-center text-green-600 text-xs">
                <CheckIcon className="w-3 h-3 mr-1" />
                <span>Applied</span>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply(job.id);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MobileLayout title="Jobs">
      <div className="flex flex-col h-full">
        {/* Search and Filters */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'available'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'applied'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Applied
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Saved
            </button>
          </div>
        </div>

        {/* Job List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" text="Loading jobs..." />
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <BriefcaseIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {searchQuery ? 'No jobs found matching your search' : 'No jobs available'}
              </p>
              {activeTab === 'applied' && (
                <button
                  onClick={() => setActiveTab('available')}
                  className="text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  Browse available jobs
                </button>
              )}
            </div>
          )}
        </div>

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ×
                  </button>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Avatar
                    src={selectedJob.company?.logo_url}
                    alt={selectedJob.company?.name || 'Company'}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedJob.title}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      {selectedJob.company?.name}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span>{selectedJob.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                        <span>{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedJob.description || 'No description provided.'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedJob.requirements || 'No specific requirements listed.'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-500">
                      Posted {formatDate(selectedJob.created_at)}
                    </div>
                    
                    {selectedJob.isApplied ? (
                      <div className="flex items-center text-green-600">
                        <CheckIcon className="w-5 h-5 mr-2" />
                        <span className="font-medium">Applied</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(selectedJob.id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
