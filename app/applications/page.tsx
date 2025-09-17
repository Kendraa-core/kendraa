'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserApplications } from '@/lib/queries';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import type { JobApplication } from '@/types/database.types';

interface JobApplicationWithJob extends JobApplication {
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
}

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getUserApplications(user.id);
      setApplications(data as JobApplicationWithJob[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [user?.id, fetchApplications]);

  const getStatusIcon = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'reviewed':
        return <EyeIcon className="w-5 h-5 text-blue-500" />;
      case 'interview':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-purple-500" />;
      case 'accepted':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return 'Your application is being reviewed';
      case 'reviewed':
        return 'Your application has been reviewed';
      case 'interview':
        return 'You have been selected for an interview!';
      case 'accepted':
        return 'Congratulations! Your application has been accepted';
      case 'rejected':
        return 'Your application was not selected for this position';
      default:
        return 'Application status unknown';
    }
  };

  const filteredApplications = applications.filter(app => 
    selectedStatus === 'all' || app.status === selectedStatus
  );

  if (!user) {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-gray-600">
            Track the status of your job applications
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'reviewed', 'interview', 'accepted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative">
                {/* Main spinner */}
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                
                {/* Pulse effect */}
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-400 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <p className="text-gray-600 mt-4 text-sm font-medium">Loading applications...</p>
              
              {/* Progress dots */}
              <div className="flex justify-center mt-2 space-x-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications found
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'all' 
                ? "You haven't submitted any job applications yet."
                : `No ${selectedStatus} applications found.`
              }
            </p>
            <button
              onClick={() => router.push('/jobs')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(application.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.job.title}
                      </h3>
                      <p className="text-gray-600">
                        {application.job.company.name}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-700">
                    {getStatusMessage(application.status)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied {formatRelativeTime(application.created_at)}
                  </p>
                </div>

                {application.cover_letter && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                    <p className="text-gray-700 text-sm">
                      {application.cover_letter.length > 200
                        ? `${application.cover_letter.substring(0, 200)}...`
                        : application.cover_letter
                      }
                    </p>
                  </div>
                )}

                {application.status === 'interview' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Interview Details</h4>
                    <p className="text-blue-700 text-sm">
                      You will receive interview details via email or through the platform.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 