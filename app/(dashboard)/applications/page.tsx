'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
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
  };

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
        return 'Congratulations! Your application has been accepted!';
      case 'rejected':
        return 'Your application was not selected for this position';
      default:
        return 'Application status updated';
    }
  };

  const filteredApplications = applications.filter(app => 
    selectedStatus === 'all' || app.status === selectedStatus
  );

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">
            Track the status of your job applications
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending ({applications.filter(app => app.status === 'pending').length})
            </button>
            <button
              onClick={() => setSelectedStatus('reviewed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'reviewed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Reviewed ({applications.filter(app => app.status === 'reviewed').length})
            </button>
            <button
              onClick={() => setSelectedStatus('interview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'interview'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Interview ({applications.filter(app => app.status === 'interview').length})
            </button>
            <button
              onClick={() => setSelectedStatus('accepted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'accepted'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Accepted ({applications.filter(app => app.status === 'accepted').length})
            </button>
            <button
              onClick={() => setSelectedStatus('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Rejected ({applications.filter(app => app.status === 'rejected').length})
            </button>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedStatus === 'all' ? 'No applications yet' : `No ${selectedStatus} applications`}
            </h3>
            <p className="text-gray-600">
              {selectedStatus === 'all' 
                ? 'Start applying to jobs to see your applications here.'
                : `You don't have any ${selectedStatus} applications.`
              }
            </p>
            {selectedStatus === 'all' && (
              <button
                onClick={() => router.push('/jobs')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.job?.title || 'Unknown Position'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">
                        {application.job?.company?.name || 'Unknown Company'}
                      </p>
                      <p className="text-gray-600 mb-2">
                        Applied {formatRelativeTime(application.created_at)}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {getStatusMessage(application.status)}
                      </p>
                      {application.notes && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {application.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 