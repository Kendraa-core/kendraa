'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getJobApplications, updateJobApplicationStatus, getProfile, getInstitutionByUserId } from '@/lib/queries';
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
  ArrowLeftIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import type { JobApplication, Profile, Institution } from '@/types/database.types';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Avatar from '@/components/common/Avatar';

type JobApplicationWithApplicant = JobApplication & { applicant: Profile };

export default function InstitutionJobApplicationsPage() {
  const { id: jobId } = useParams();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [applications, setApplications] = useState<JobApplicationWithApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationWithApplicant | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<{
    status: JobApplication['status'];
    notes: string;
  }>({
    status: 'pending',
    notes: ''
  });

  const fetchInstitution = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const institutionData = await getInstitutionByUserId(user.id);
      setInstitution(institutionData);
    } catch (error) {
      console.error('Error fetching institution:', error);
    }
  }, [user?.id]);

  const fetchApplications = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const data = await getJobApplications(jobId as string);
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchInstitution();
    fetchApplications();
  }, [user, jobId, fetchInstitution, fetchApplications, router]);

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !user?.id) return;

    try {
      const success = await updateJobApplicationStatus(
        selectedApplication.id,
        statusUpdate.status,
        user.id,
        statusUpdate.notes
      );

      if (success) {
        toast.success('Application status updated successfully');
        setShowStatusModal(false);
        setSelectedApplication(null);
        fetchApplications(); // Refresh the list
      } else {
        toast.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
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
        return 'Application received and under review';
      case 'reviewed':
        return 'Application has been reviewed';
      case 'interview':
        return 'Interview scheduled or completed';
      case 'accepted':
        return 'Application accepted';
      case 'rejected':
        return 'Application not selected';
      default:
        return 'Status unknown';
    }
  };

  const openStatusModal = (application: JobApplicationWithApplicant) => {
    setSelectedApplication(application);
    setStatusUpdate({
      status: application.status,
      notes: application.notes || ''
    });
    setShowStatusModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007fff] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/institution/jobs">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
              <p className="text-gray-600 mt-2">
                Review and manage applications for this position
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-[#007fff]">{applications.length}</p>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {applications.length > 0 ? (
            applications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Applicant Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar
                        src={application.applicant.avatar_url}
                        name={application.applicant.full_name || 'Applicant'}
                        size="lg"
                      />
                    </div>
                    
                    {/* Application Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {application.applicant.full_name}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {application.applicant.headline || 'Healthcare Professional'}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Applied {formatRelativeTime(application.created_at)}</span>
                            </div>
                            
                            {application.applicant.location && (
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                <span>{application.applicant.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Application Message */}
                      {application.cover_letter && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Application Message</h4>
                          <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {application.notes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                          <p className="text-gray-700 bg-blue-50 rounded-lg p-3 text-sm">
                            {application.notes}
                          </p>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => openStatusModal(application)}
                          className="bg-[#007fff] hover:bg-[#007fff]/90 text-white"
                        >
                          Update Status
                        </Button>
                        
                        <Link href={`/profile/${application.applicant.id}`}>
                          <Button variant="outline">
                            <UserIcon className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        </Link>
                        
                        {application.resume_url && (
                          <Button variant="outline">
                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                            View Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">
                Applications for this job will appear here once candidates start applying.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Application Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value as JobApplication['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="interview">Interview</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                  placeholder="Add any notes about this application..."
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <Button
                onClick={handleStatusUpdate}
                className="bg-[#007fff] hover:bg-[#007fff]/90 text-white"
              >
                Update Status
              </Button>
              <Button
                onClick={() => setShowStatusModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
