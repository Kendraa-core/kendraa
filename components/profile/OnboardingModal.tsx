'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import EditProfileModal from './EditProfileModal';
import {
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';

export default function OnboardingModal() {
  const { profile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  // Show modal if profile is incomplete
  useEffect(() => {
    const checkProfileCompletion = () => {
      if (!isProfileComplete()) {
        // Delay showing the modal to avoid immediate popup
        const timer = setTimeout(() => {
          setShowModal(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    };

    checkProfileCompletion();
  }, [profile]);

  const handleClose = () => {
    setShowModal(false);
  };

  const handleCompleteProfile = () => {
    setShowModal(false);
    setShowEditModal(true);
  };

  if (isProfileComplete()) {
    return null; // Don't show anything if profile is complete
  }

  const completionPercentage = getCompletionPercentage();

  const getCompletionStatus = () => {
    if (completionPercentage >= 80) return 'excellent';
    if (completionPercentage >= 60) return 'good';
    if (completionPercentage >= 40) return 'fair';
    return 'poor';
  };

  const getStatusColor = () => {
    const status = getCompletionStatus();
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    const status = getCompletionStatus();
    switch (status) {
      case 'excellent': return <CheckCircleSolidIcon className="w-5 h-5" />;
      case 'good': return <StarIcon className="w-5 h-5" />;
      case 'fair': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'poor': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <UserIcon className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    const status = getCompletionStatus();
    switch (status) {
      case 'excellent': return 'Excellent!';
      case 'good': return 'Good Progress!';
      case 'fair': return 'Getting There!';
      case 'poor': return 'Needs Work';
      default: return 'Profile Status';
    }
  };

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getStatusColor()}`}>
                  {getStatusIcon()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {getStatusText()}
                </h2>
                <p className="text-gray-600">
                  Your profile is {completionPercentage}% complete
                </p>
              </div>

              {/* Progress Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Profile Completion</span>
                  <span className="font-semibold text-blue-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-3 rounded-full ${
                      completionPercentage >= 80 ? 'bg-green-500' :
                      completionPercentage >= 60 ? 'bg-blue-500' :
                      completionPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              {/* Missing Fields */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Complete these to improve your profile:</h3>
                <div className="space-y-3">
                  {!profile?.full_name && (
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <UserIcon className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">Add your full name</p>
                        <p className="text-xs text-red-600">This is required for your profile</p>
                      </div>
                    </div>
                  )}
                  {!profile?.headline && (
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <UserIcon className="w-5 h-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">Add a professional headline</p>
                        <p className="text-xs text-yellow-600">Help others understand your role</p>
                      </div>
                    </div>
                  )}
                  {(!profile?.specialization || profile.specialization.length === 0) && (
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <UserIcon className="w-5 h-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">Add your specializations</p>
                        <p className="text-xs text-yellow-600">Show your areas of expertise</p>
                      </div>
                    </div>
                  )}
                  {!profile?.bio && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Add a bio</p>
                        <p className="text-xs text-blue-600">Tell others about yourself</p>
                      </div>
                    </div>
                  )}
                  {!profile?.location && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Add your location</p>
                        <p className="text-xs text-blue-600">Help with local connections</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Benefits of a complete profile:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-3 h-3 text-blue-600" />
                    <span>Better visibility in search results</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-3 h-3 text-blue-600" />
                    <span>More connection requests</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-3 h-3 text-blue-600" />
                    <span>Enhanced professional credibility</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-3 h-3 text-blue-600" />
                    <span>Access to more networking opportunities</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCompleteProfile}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <span>Complete Profile Now</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  I&apos;ll do this later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            // Check if profile is now complete
            setTimeout(() => {
              if (isProfileComplete()) {
                setShowModal(false);
              }
            }, 1000);
          }}
        />
      )}
    </>
  );
}
