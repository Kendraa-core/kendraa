'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getJobs, getJobApplications, getInstitutionByAdminId } from '@/lib/queries';
import type { JobWithCompany, JobApplication, Institution } from '@/types/database.types';
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
  DocumentTextIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon
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

const formatSalary = (minSalary: number | null, maxSalary: number | null, currency: string | null) => {
  if (minSalary && maxSalary) {
    return `${currency || '$'}${minSalary.toLocaleString()} - ${currency || '$'}${maxSalary.toLocaleString()}`;
  } else if (minSalary) {
    return `${currency || '$'}${minSalary.toLocaleString()}+`;
  } else if (maxSalary) {
    return `Up to ${currency || '$'}${maxSalary.toLocaleString()}`;
  }
  
  return 'Salary not specified';
};

export default function InstitutionJobsPage() {
  const { user, profile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [jobApplications, setJobApplications] = useState<Record<string, JobApplication[]>>({});

  const fetchInstitution = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const institutionData = await getInstitutionByAdminId(user.id);
      setInstitution(institutionData);
    } catch (error) {
      console.error('Error fetching institution:', error);
    }
  }, [user?.id]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    
    try {
      const data = await getJobs();
      // Filter jobs to only show those posted by the current institution
      const institutionJobs = data.filter(job => job.posted_by === profile?.id);
      setJobs(institutionJobs);
      setFilteredJobs(institutionJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  // Fetch applications for each job
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
      console.error('Error fetching job applications:', error);
    }
  }, [user?.id, profile, jobs]);

  useEffect(() => {
    fetchInstitution();
  }, [fetchInstitution]);

  useEffect(() => {
    if (profile) {
      fetchJobs();
    }
  }, [fetchJobs, profile]);

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
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getApplicationCount = (jobId: string) => {
    return jobApplications[jobId]?.length || 0;
  };

  const getPendingApplications = (jobId: string) => {
    return jobApplications[jobId]?.filter(app => app.status === 'pending').length || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007fff] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
              <p className="text-gray-600 mt-2">
                Manage your job postings and applications
              </p>
            </div>
            <Link href="/institution/jobs/create">
              <Button className="bg-[#007fff] hover:bg-[#007fff]/90 text-white">
                <PlusIcon className="w-5 h-5 mr-2" />
                Post New Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Jobs
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
              >
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                type="text"
                placeholder="Enter location..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                            <BuildingOfficeIcon className="w-6 h-6 text-[#007fff]" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {job.title}
                              </h3>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <BriefcaseIcon className="w-4 h-4" />
                                  <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                                </div>
                                
                                {job.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPinIcon className="w-4 h-4" />
                                    <span>{job.location}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-1">
                                  <UserGroupIcon className="w-4 h-4" />
                                  <span className="capitalize">{job.experience_level.replace('_', ' ')}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>{formatRelativeTime(job.created_at)}</span>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-4 line-clamp-2">
                                {job.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-green-600">
                                  <UsersIcon className="w-4 h-4" />
                                  <span>{getApplicationCount(job.id)} applications</span>
                                </div>
                                
                                {getPendingApplications(job.id) > 0 && (
                                  <div className="flex items-center gap-1 text-orange-600">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>{getPendingApplications(job.id)} pending</span>
                                  </div>
                                )}
                                
                                {job.salary_min || job.salary_max ? (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <CurrencyDollarIcon className="w-4 h-4" />
                                    <span>{formatSalary(job.salary_min, job.salary_max, 'USD')}</span>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/institution/jobs/${job.id}/applications`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Applications
                        </Button>
                      </Link>
                      
                      <Button variant="outline" size="sm">
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">
                {jobs.length === 0 
                  ? "You haven't posted any jobs yet. Create your first job posting to get started."
                  : "No jobs match your current filters. Try adjusting your search criteria."
                }
              </p>
              {jobs.length === 0 && (
                <Link href="/institution/jobs/create">
                  <Button className="bg-[#007fff] hover:bg-[#007fff]/90 text-white">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
