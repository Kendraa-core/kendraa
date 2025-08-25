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
    const checkProfileCompletion = () => {
      if (!isProfileComplete()) {
        // Delay showing the prompt to avoid immediate popup
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    };

    checkProfileCompletion();
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
                <div className="w-16 h-16 bg-azure-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-azure-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
                <p className="text-gray-600 mb-4 text-center">
                  Your profile is only <span className="font-semibold text-azure-600">{completionPercentage}%</span> complete. 
                  Complete it to unlock all features and connect with other healthcare professionals.
                </p>

                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-azure-500" />
                    <span className="text-sm text-gray-600">Basic Info</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-azure-500" />
                    <span className="text-sm text-gray-600">Experience</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-azure-500" />
                    <span className="text-sm text-gray-600">Education</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Skills</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Photo</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCompleteProfile}
                    className="w-full bg-azure-600 text-white py-3 px-4 rounded-lg hover:bg-azure-700 transition-colors font-medium"
                  >
                    Complete Profile
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    I&apos;ll do this later
                  </button>
                </div>
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