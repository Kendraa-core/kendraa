'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import {
  getInstitutionByUserId,
  getJobsByInstitution,
  getJobApplications,
  type JobWithCompany
} from '@/lib/queries';
import { type JobApplication } from '@/types/database.types';
import {
  BriefcaseIcon,
  PlusIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UsersIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatDate, formatNumber } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function MobileInstitutionJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [applications, setApplications] = useState<{ [key: string]: JobApplication[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'closed'>('active');
  const [selectedJob, setSelectedJob] = useState<JobWithCompany | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const institution = await getInstitutionByUserId(user.id);
      if (!institution) {
        toast.error('Institution not found');
        return;
      }

      const jobsData = await getJobsByInstitution(institution.id);
      setJobs(jobsData);

      // Fetch applications for each job
      const applicationsData: { [key: string]: JobApplication[] } = {};
      for (const job of jobsData) {
        try {
          const jobApplications = await getJobApplications(job.id);
          applicationsData[job.id] = jobApplications;
        } catch (error) {
          console.error(`Error fetching applications for job ${job.id}:`, error);
          applicationsData[job.id] = [];
        }
      }
      setApplications(applicationsData);

    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${formatNumber(min)} - $${formatNumber(max)}`;
    if (min) return `From $${formatNumber(min)}`;
    if (max) return `Up to $${formatNumber(max)}`;
    return 'Salary not specified';
  };

  const getJobStatus = (job: JobWithCompany) => {
    const now = new Date();
    const deadline = job.application_deadline ? new Date(job.application_deadline) : null;
    
    if (deadline && deadline < now) {
      return 'closed';
    }
    return job.status || 'active';
  };

  const filteredJobs = jobs.filter(job => {
    const status = getJobStatus(job);
    return activeTab === status;
  });

  const JobCard = ({ job }: { job: JobWithCompany }) => {
    const applicationCount = applications[job.id]?.length || 0;
    const status = getJobStatus(job);
    
    return (
      <div 
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        onClick={() => setSelectedJob(job)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span>{job.location || 'Remote'}</span>
              </div>
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                <span className="truncate">
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'active' ? 'bg-green-100 text-green-700' :
              status === 'closed' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span>{applicationCount} applications</span>
            </div>
            <div className="flex items-center">
              <CalendarDaysIcon className="w-4 h-4 mr-1" />
              <span>{formatDate(job.created_at)}</span>
            </div>
          </div>
          
          <Link
            href={`/mob/institution/jobs/${job.id}/applications`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            View
          </Link>
        </div>
      </div>
    );
  };

  return (
    <MobileLayout title="Jobs" isInstitution={true}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">Job Postings</h1>
            <Link
              href="/mob/institution/jobs/create"
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Post Job
            </Link>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'draft'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'closed'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Jobs List */}
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
              <p className="text-gray-500 text-center mb-4">
                {activeTab === 'active' && 'No active job postings'}
                {activeTab === 'draft' && 'No draft job postings'}
                {activeTab === 'closed' && 'No closed job postings'}
              </p>
              <Link
                href="/mob/institution/jobs/create"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Post Your First Job
              </Link>
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
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedJob.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>{selectedJob.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                      <span>{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      <span>{applications[selectedJob.id]?.length || 0} applications</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      <span>Posted {formatDate(selectedJob.created_at)}</span>
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
                    <Link
                      href={`/mob/institution/jobs/${selectedJob.id}/edit`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Edit Job
                    </Link>
                    
                    <Link
                      href={`/mob/institution/jobs/${selectedJob.id}/applications`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Applications
                    </Link>
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
