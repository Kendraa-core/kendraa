'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileWizard from './ProfileWizard';
import {
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileCompletionPrompt() {
  const { profile } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

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

  // Show prompt if profile is incomplete
  useEffect(() => {
    if (!isProfileComplete()) {
      // Delay showing the prompt to avoid immediate popup
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const handleClose = () => {
    setShowPrompt(false);
  };

  const handleCompleteProfile = () => {
    setShowPrompt(false);
    setShowWizard(true);
  };

  if (isProfileComplete()) {
    return null; // Don't show anything if profile is complete
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Complete Your Profile
                </h2>
                <p className="text-gray-600">
                  A complete profile helps you make better connections and opportunities.
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
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                  />
                </div>
              </div>

              {/* Missing Fields */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Missing Information:</h3>
                <div className="space-y-2">
                  {!profile?.full_name && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <UserIcon className="w-4 h-4 text-red-500" />
                      <span>Full name</span>
                    </div>
                  )}
                  {!profile?.headline && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <UserIcon className="w-4 h-4 text-red-500" />
                      <span>Professional headline</span>
                    </div>
                  )}
                  {(!profile?.specialization || profile.specialization.length === 0) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <UserIcon className="w-4 h-4 text-red-500" />
                      <span>Specializations</span>
                    </div>
                  )}
                  {!profile?.bio && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <UserIcon className="w-4 h-4 text-yellow-500" />
                      <span>Bio (optional but recommended)</span>
                    </div>
                  )}
                  {!profile?.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <UserIcon className="w-4 h-4 text-yellow-500" />
                      <span>Location (optional)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCompleteProfile}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Complete Profile Now
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  I&apos;ll do this later
                </button>
              </div>

              {/* Benefits */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Benefits of a complete profile:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Better visibility in search results</li>
                  <li>• More connection requests</li>
                  <li>• Enhanced professional credibility</li>
                  <li>• Access to more networking opportunities</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          setShowPrompt(false);
        }}
      />
    </>
  );
} 