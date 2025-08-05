'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileWizard from './ProfileWizard';
import {
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function ProfileCompletionPrompt() {
  const { profile } = useAuth();
  const [showWizard, setShowWizard] = useState(false);

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!profile) return false;
    
    const requiredFields = [
      profile.full_name,
      profile.headline,
      profile.specialization && profile.specialization.length > 0,
    ];
    
    return requiredFields.every(field => field);
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.full_name,
      profile.headline,
      profile.bio,
      profile.location,
      profile.website,
      profile.phone,
      profile.avatar_url,
      profile.specialization && profile.specialization.length > 0,
    ];
    
    const completed = fields.filter(field => field).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (isProfileComplete()) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Profile Complete!</h3>
            <p className="text-sm text-green-700">
              Your profile is 100% complete and ready to make connections.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Complete Your Profile</h3>
            <p className="text-sm text-blue-700 mb-3">
              A complete profile helps you make better connections and opportunities.
            </p>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                <span>Profile Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Missing Fields */}
            <div className="text-xs text-blue-600 mb-3">
              {!profile?.full_name && (
                <div className="flex items-center space-x-1 mb-1">
                  <UserIcon className="w-3 h-3" />
                  <span>Add your full name</span>
                </div>
              )}
              {!profile?.headline && (
                <div className="flex items-center space-x-1 mb-1">
                  <UserIcon className="w-3 h-3" />
                  <span>Add a professional headline</span>
                </div>
              )}
              {(!profile?.specialization || profile.specialization.length === 0) && (
                <div className="flex items-center space-x-1 mb-1">
                  <UserIcon className="w-3 h-3" />
                  <span>Select your specializations</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowWizard(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Complete Profile
            </button>
          </div>
        </div>
      </div>

      <ProfileWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => setShowWizard(false)}
      />
    </>
  );
} 