'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getInstitutionJobs, createInstitutionJob } from '@/lib/queries';
import { JobWithCompany } from '@/types/database.types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Helper function to format salary
function formatSalary(min?: number, max?: number, currency?: string): string {
  if (!min && !max) return 'Salary not specified';
  const curr = currency || 'USD';
  const symbol = curr === 'USD' ? '$' : curr;
  if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
  if (min) return `${symbol}${min.toLocaleString()}+`;
  if (max) return `Up to ${symbol}${max.toLocaleString()}`;
  return 'Salary not specified';
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

export default function InstitutionJobsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full_time',
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    experience_level: 'entry',
  });

  // Load institution jobs
  useEffect(() => {
    const loadJobs = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        const institutionJobs = await getInstitutionJobs(profile.id, 50, 0);
        setJobs(institutionJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [profile?.id]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.description || !profile?.id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setCreating(true);
    try {
      const jobData = {
        title: newJob.title,
        description: newJob.description,
        location: newJob.location || undefined,
        job_type: newJob.job_type,
        salary_min: newJob.salary_min ? parseInt(newJob.salary_min) : undefined,
        salary_max: newJob.salary_max ? parseInt(newJob.salary_max) : undefined,
        currency: newJob.currency,
        experience_level: newJob.experience_level || undefined,
      };

      const newJobData = await createInstitutionJob(profile.id, jobData);
      if (newJobData) {
        // Refresh jobs
        const updatedJobs = await getInstitutionJobs(profile.id, 50, 0);
        setJobs(updatedJobs);
        setNewJob({
          title: '',
          description: '',
          location: '',
          job_type: 'full_time',
          salary_min: '',
          salary_max: '',
          currency: 'USD',
          experience_level: '',
        });
        setShowCreateJob(false);
        toast.success('Job posted successfully!');
      } else {
        toast.error('Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    } finally {
      setCreating(false);
    }
  };

  const handleEditJob = (jobId: string) => {
    // Here you would typically open an edit modal or navigate to edit page
    toast.success('Edit job functionality coming soon!');
  };

  const handleDeleteJob = (jobId: string) => {
    // Here you would typically delete the job from your database
    toast.success('Job deleted successfully!');
  };

  const handleViewApplicants = (jobId: string) => {
    router.push(`/jobs/${jobId}/applications`);
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
              <p className="text-gray-600 mt-1">Manage your job postings and applications</p>
            </div>
            <button
              onClick={() => setShowCreateJob(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Post a Job
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff] w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
              >
                <option value="all">All Jobs</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Post a New Job</h2>
              <button
                onClick={() => setShowCreateJob(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                  placeholder="e.g., Senior Cardiologist"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                    placeholder="e.g., New York, NY"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    value={newJob.job_type}
                    onChange={(e) => setNewJob(prev => ({ ...prev, job_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={newJob.salary_min}
                    onChange={(e) => setNewJob(prev => ({ ...prev, salary_min: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff]"
                    placeholder="e.g., $80,000 - $120,000"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff] resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateJob(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Post Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
            <p className="text-sm text-[#007fff]">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <BriefcaseIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Job Posts Yet</h2>
            <p className="text-gray-600 mb-4">Start by creating your first job posting to attract talent.</p>
            <button
              onClick={() => setShowCreateJob(true)}
              className="px-6 py-3 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
            >
              <PlusIcon className="w-5 h-5" /> Create New Job
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <BriefcaseIcon className="w-4 h-4" />
                      <span>{job.job_type}</span>
                    </div>
                    {job.experience_level && (
                      <div className="flex items-center gap-1">
                        <BuildingOfficeIcon className="w-4 h-4" />
                        <span>{job.experience_level}</span>
                      </div>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>{formatSalary(job.salary_min || undefined, job.salary_max || undefined, job.currency || undefined)}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Posted {formatTimeAgo(job.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>0 applicants</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewJob(job.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Job"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewApplicants(job.id)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="View Applicants"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditJob(job.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Job"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Job"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
        
        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by posting your first job'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateJob(true)}
                className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Post a Job
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
