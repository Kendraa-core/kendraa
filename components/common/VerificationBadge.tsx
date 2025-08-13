'use client';

import React from 'react';
import { ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface VerificationBadgeProps {
  status: 'verified' | 'pending' | 'unverified' | 'rejected';
  type?: 'license' | 'degree' | 'certification' | 'general';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  tooltip?: string;
}

export default function VerificationBadge({ 
  status, 
  type = 'general', 
  size = 'md', 
  showLabel = false,
  tooltip 
}: VerificationBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: ShieldCheckIcon,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-100',
          borderColor: 'border-emerald-200',
          label: 'Verified',
          description: 'Medical credentials verified and authenticated'
        };
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          label: 'Pending',
          description: 'Verification in progress'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          label: 'Rejected',
          description: 'Verification failed or rejected'
        };
      default:
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          label: 'Unverified',
          description: 'Not yet verified'
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          iconSize: 'w-3 h-3',
          padding: 'p-1',
          textSize: 'text-xs',
          spacing: 'space-x-1'
        };
      case 'lg':
        return {
          iconSize: 'w-6 h-6',
          padding: 'p-3',
          textSize: 'text-base',
          spacing: 'space-x-3'
        };
      default:
        return {
          iconSize: 'w-4 h-4',
          padding: 'p-2',
          textSize: 'text-sm',
          spacing: 'space-x-2'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();
  const Icon = statusConfig.icon;

  const badge = (
    <div
      className={`inline-flex items-center ${sizeConfig.spacing} ${sizeConfig.padding} rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor} transition-all hover:shadow-sm`}
      title={tooltip || statusConfig.description}
    >
      <Icon className={`${sizeConfig.iconSize} ${statusConfig.color}`} />
      {showLabel && (
        <span className={`font-medium ${statusConfig.color} ${sizeConfig.textSize}`}>
          {statusConfig.label}
        </span>
      )}
    </div>
  );

  return badge;
}

interface MedicalVerificationDisplayProps {
  profile: {
    verification_status: 'verified' | 'pending' | 'unverified' | 'rejected';
    medical_license?: {
      status: 'active' | 'expired' | 'suspended' | 'pending_verification';
    };
    medical_degrees: {
      verification_status: 'verified' | 'pending' | 'unverified';
    }[];
    certifications: {
      verification_status: 'verified' | 'pending' | 'unverified';
    }[];
  };
  showDetails?: boolean;
}

export function MedicalVerificationDisplay({ profile, showDetails = false }: MedicalVerificationDisplayProps) {
  const hasVerifiedDegree = profile.medical_degrees.some(degree => degree.verification_status === 'verified');
  const hasVerifiedCertifications = profile.certifications.some(cert => cert.verification_status === 'verified');
  const hasActiveLicense = profile.medical_license?.status === 'active';

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2">
        <VerificationBadge 
          status={profile.verification_status} 
          size="md" 
          showLabel 
          tooltip="Overall verification status"
        />
        {hasActiveLicense && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 rounded-full">
            <ShieldCheckIcon className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Licensed</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
        <VerificationBadge 
          status={profile.verification_status} 
          size="lg" 
          showLabel 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Medical License</span>
            <VerificationBadge 
              status={hasActiveLicense ? 'verified' : 'unverified'} 
              type="license"
              size="sm"
            />
          </div>
          <p className="text-xs text-gray-500">
            {hasActiveLicense ? 'Active medical license verified' : 'No active license on file'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Education</span>
            <VerificationBadge 
              status={hasVerifiedDegree ? 'verified' : 'unverified'} 
              type="degree"
              size="sm"
            />
          </div>
          <p className="text-xs text-gray-500">
            {profile.medical_degrees.length} degree(s) • {profile.medical_degrees.filter(d => d.verification_status === 'verified').length} verified
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Certifications</span>
            <VerificationBadge 
              status={hasVerifiedCertifications ? 'verified' : 'unverified'} 
              type="certification"
              size="sm"
            />
          </div>
          <p className="text-xs text-gray-500">
            {profile.certifications.length} certification(s) • {profile.certifications.filter(c => c.verification_status === 'verified').length} verified
          </p>
        </div>
      </div>
    </div>
  );
}
