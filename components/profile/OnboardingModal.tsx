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
  PhotoIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Kendraa!',
    subtitle: 'Let\'s get your profile set up in just a few steps',
    type: 'welcome'
  },
  {
    id: 'name',
    title: 'What\'s your full name?',
    subtitle: 'This will be displayed on your profile',
    type: 'input',
    field: 'full_name',
    placeholder: 'Enter your full name',
    required: true
  },
  {
    id: 'headline',
    title: 'What\'s your professional headline?',
    subtitle: 'A brief description of your role or expertise',
    type: 'input',
    field: 'headline',
    placeholder: 'e.g., Senior Cardiologist at City Hospital',
    required: true
  },
  {
    id: 'specialization',
    title: 'What\'s your medical specialization?',
    subtitle: 'Select your primary area of expertise',
    type: 'select',
    field: 'specialization',
    options: [
      'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics',
      'Dermatology', 'Psychiatry', 'Emergency Medicine', 'Family Medicine',
      'Internal Medicine', 'Surgery', 'Radiology', 'Anesthesiology', 'Other'
    ],
    required: true
  },
  {
    id: 'bio',
    title: 'Tell us about yourself',
    subtitle: 'Share your experience, achievements, and what drives you',
    type: 'textarea',
    field: 'bio',
    placeholder: 'I am a passionate healthcare professional with over 10 years of experience...',
    required: false
  },
  {
    id: 'location',
    title: 'Where are you located?',
    subtitle: 'This helps with local networking opportunities',
    type: 'input',
    field: 'location',
    placeholder: 'e.g., San Francisco, CA',
    required: false
  },
  {
    id: 'avatar',
    title: 'Add a profile picture',
    subtitle: 'A professional photo helps build trust with connections',
    type: 'image',
    field: 'avatar_url',
    required: false
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    subtitle: 'Your profile is ready to help you connect with healthcare professionals',
    type: 'complete'
  }
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    headline: profile?.headline || '',
    specialization: profile?.specialization || [],
    bio: profile?.bio || '',
    location: profile?.location || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [loading, setLoading] = useState(false);
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
      profile.avatar_url,
      profile.specialization && profile.specialization.length > 0,
    ];
    
    const completed = fields.filter(field => field).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Show modal if profile is incomplete
  useEffect(() => {
    if (!isProfileComplete() && isOpen) {
      setCurrentStep(0);
    }
  }, [profile, isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleCompleteProfile = () => {
    setShowEditModal(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    const currentStepData = ONBOARDING_STEPS[currentStep];
    
    // Validate required fields
    if (currentStepData.required && !formData[currentStepData.field as keyof typeof formData]) {
      toast.error('This field is required');
      return;
    }

    // If this is the last step, save the data
    if (currentStep === ONBOARDING_STEPS.length - 2) {
      setLoading(true);
      try {
        let avatarUrl = formData.avatar_url;

        // Upload avatar if changed
        if (avatarFile) {
          // TODO: Implement actual file upload to Supabase
          // For now, we'll just use the preview
          avatarUrl = avatarPreview || '';
        }

        await updateProfile({
          ...formData,
          avatar_url: avatarUrl,
        });

        setCurrentStep(currentStep + 1);
        toast.success('Profile updated successfully!');
      } catch (error: any) {
        console.error('Error updating profile:', error);
        toast.error(error.message || 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStep = () => {
    const step = ONBOARDING_STEPS[currentStep];

    switch (step.type) {
      case 'welcome':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h2>
            <p className="text-lg text-gray-600 mb-8">{step.subtitle}</p>
            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">Why complete your profile?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Get 10x more connection requests</li>
                <li>• Appear in relevant search results</li>
                <li>• Build professional credibility</li>
                <li>• Access exclusive networking opportunities</li>
              </ul>
            </div>
          </div>
        );

      case 'input':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
            <p className="text-gray-600 mb-6">{step.subtitle}</p>
                         <input
               type="text"
               value={formData[step.field as keyof typeof formData] as string}
               onChange={(e) => handleInputChange(step.field!, e.target.value)}
               placeholder={step.placeholder}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
               autoFocus
             />
          </div>
        );

      case 'textarea':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
            <p className="text-gray-600 mb-6">{step.subtitle}</p>
                         <textarea
               value={formData[step.field as keyof typeof formData] as string}
               onChange={(e) => handleInputChange(step.field!, e.target.value)}
               placeholder={step.placeholder}
               rows={4}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg resize-none"
               autoFocus
             />
          </div>
        );

      case 'select':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
            <p className="text-gray-600 mb-6">{step.subtitle}</p>
            <div className="grid grid-cols-2 gap-3">
              {step.options?.map((option) => (
                                 <button
                   key={option}
                   onClick={() => handleInputChange(step.field!, [option])}
                   className={`p-3 text-left rounded-lg border-2 transition-all ${
                     formData[step.field as keyof typeof formData]?.includes(option)
                       ? 'border-blue-500 bg-blue-50 text-blue-700'
                       : 'border-gray-200 hover:border-gray-300 text-gray-700'
                   }`}
                 >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'image':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
            <p className="text-gray-600 mb-6">{step.subtitle}</p>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <PhotoIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                  <PhotoIcon className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Click the camera icon to upload a photo
            </p>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleSolidIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h2>
            <p className="text-lg text-gray-600 mb-8">{step.subtitle}</p>
            <div className="bg-green-50 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-green-900 mb-2">Profile Completion: {getCompletionPercentage()}%</h3>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getCompletionPercentage()}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleCompleteProfile}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue to Full Profile
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div>
                  <div className="text-sm text-gray-500">
                    Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          {ONBOARDING_STEPS[currentStep].type !== 'welcome' && ONBOARDING_STEPS[currentStep].type !== 'complete' && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>{loading ? 'Saving...' : 'Continue'}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
