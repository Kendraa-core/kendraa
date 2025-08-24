'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import EditProfileModal from './EditProfileModal';
import { uploadToSupabaseStorage, validateFile, generateFilePath } from '@/lib/utils';
import {
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowRightIcon,
  StarIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  BriefcaseIcon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Kendraa',
    subtitle: 'Let\'s set up your professional profile to connect with healthcare professionals',
    type: 'welcome',
    required: true
  },
  {
    id: 'name',
    title: 'What\'s your full name?',
    subtitle: 'This is how other professionals will see you',
    type: 'input',
    field: 'full_name',
    placeholder: 'Enter your full name',
    required: true
  },
  {
    id: 'headline',
    title: 'What\'s your professional headline?',
    subtitle: 'A brief description of your role and expertise',
    type: 'input',
    field: 'headline',
    placeholder: 'e.g., Cardiologist at Mayo Clinic',
    required: true
  },
  {
    id: 'specialization',
    title: 'What\'s your medical specialization?',
    subtitle: 'Select your primary area of expertise',
    type: 'select',
    field: 'specialization',
    options: [
      'Cardiology',
      'Neurology',
      'Oncology',
      'Pediatrics',
      'Psychiatry',
      'Surgery',
      'Emergency Medicine',
      'Family Medicine',
      'Internal Medicine',
      'Obstetrics & Gynecology',
      'Orthopedics',
      'Radiology',
      'Anesthesiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Hematology',
      'Infectious Disease',
      'Nephrology',
      'Ophthalmology',
      'Otolaryngology',
      'Pathology',
      'Physical Medicine',
      'Pulmonology',
      'Rheumatology',
      'Urology',
      'Other'
    ],
    required: true
  },
  {
    id: 'bio',
    title: 'Tell us about yourself',
    subtitle: 'Share your professional background and interests',
    type: 'textarea',
    field: 'bio',
    placeholder: 'Describe your experience, achievements, and what drives you in healthcare...',
    required: true
  },
  {
    id: 'location',
    title: 'Where are you located?',
    subtitle: 'Your location helps connect you with nearby professionals',
    type: 'input',
    field: 'location',
    placeholder: 'e.g., San Francisco, CA',
    required: true
  },
  {
    id: 'avatar',
    title: 'Add a profile picture',
    subtitle: 'A professional photo helps build trust with connections',
    type: 'image',
    field: 'avatar_url',
    required: true
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    subtitle: 'Your profile is ready to help you connect with healthcare professionals',
    type: 'complete'
  }
];

export default function OnboardingPage() {
  const { user, profile, updateProfile } = useAuth();
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
  const router = useRouter();

  // Check if profile is 80% complete
  const isProfileComplete = () => {
    if (!profile) return false;
    
    const fields = [
      profile.full_name,
      profile.headline,
      profile.specialization && profile.specialization.length > 0,
      profile.bio,
      profile.location,
      profile.avatar_url,
    ];
    
    const completed = fields.filter(field => field).length;
    const percentage = (completed / fields.length) * 100;
    return percentage >= 80;
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

  // Redirect if profile is already complete
  useEffect(() => {
    if (isProfileComplete()) {
      router.push('/feed');
    }
  }, [profile, router]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        specialization: profile.specialization || [],
        bio: profile.bio || '',
        location: profile.location || '',
        avatar_url: profile.avatar_url || '',
      });
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

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
      // Validate file using utility function
      const validation = validateFile(file, 5);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file');
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
        if (avatarFile && user?.id) {
          const filePath = generateFilePath(user.id, avatarFile.name, 'avatars');
          const { url, error } = await uploadToSupabaseStorage('public', filePath, avatarFile);
          
          if (error) {
            throw new Error(error);
          }
          
          avatarUrl = url;
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

  const canProceed = () => {
    const currentStepData = ONBOARDING_STEPS[currentStep];
    if (!currentStepData.required) return true;
    
    const fieldValue = formData[currentStepData.field as keyof typeof formData];
    if (currentStepData.type === 'select') {
      return Array.isArray(fieldValue) && fieldValue.length > 0;
    }
    return fieldValue && String(fieldValue).trim().length > 0;
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
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{step.title}</h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">{step.subtitle}</p>
            <div className="bg-blue-50 rounded-xl p-6 mb-10">
              <h3 className="font-semibold text-blue-900 mb-4 text-lg">Why complete your profile?</h3>
              <ul className="text-blue-800 space-y-3 text-left">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  Get 10x more connection requests
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  Appear in relevant search results
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  Build professional credibility
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  Access exclusive networking opportunities
                </li>
              </ul>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              {step.field === 'full_name' && <UserIcon className="w-8 h-8 text-blue-500 mr-3" />}
              {step.field === 'headline' && <BriefcaseIcon className="w-8 h-8 text-blue-500 mr-3" />}
              {step.field === 'location' && <MapPinIcon className="w-8 h-8 text-blue-500 mr-3" />}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            <input
              type="text"
              value={formData[step.field as keyof typeof formData] as string}
              onChange={(e) => handleInputChange(step.field!, e.target.value)}
              placeholder={step.placeholder}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-xl transition-all duration-200"
              autoFocus
            />
            {step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                This field is required
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            <textarea
              value={formData[step.field as keyof typeof formData] as string}
              onChange={(e) => handleInputChange(step.field!, e.target.value)}
              placeholder={step.placeholder}
              rows={6}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg resize-none transition-all duration-200"
              autoFocus
            />
            {step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                This field is required
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <StarIcon className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {step.options?.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInputChange(step.field!, [option])}
                  className={`p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    (formData[step.field as keyof typeof formData] as string[])?.includes(option)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Please select your specialization
              </p>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <PhotoIcon className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            <div className="space-y-6">
              {avatarPreview ? (
                <div className="relative">
                  <div className="w-32 h-32 rounded-full mx-auto overflow-hidden border-4 border-blue-500">
                    <img
                      src={avatarPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors">
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="block w-full px-6 py-4 bg-blue-500 text-white text-center rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
              >
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </label>
            </div>
            {step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                A profile photo is required
              </p>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircleIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{step.title}</h2>
            <p className="text-xl text-gray-600 mb-10">{step.subtitle}</p>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-semibold text-green-900 mb-4">Profile Completion: {getCompletionPercentage()}%</h3>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // If profile is complete, redirect to feed
  if (isProfileComplete()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`p-2 rounded-lg transition-colors ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Complete Your Profile</h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                </p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {getCompletionPercentage()}% Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-blue-500 h-1 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center min-h-[400px] sm:min-h-[500px]"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-500">
              {currentStep < ONBOARDING_STEPS.length - 1 && (
                <span>
                  {getCompletionPercentage()}% Complete
                </span>
              )}
            </div>
            <div className="flex space-x-3 sm:space-x-4 w-full sm:w-auto">
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl font-medium transition-colors ${
                      currentStep === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 ${
                      canProceed() && !loading
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>{currentStep === ONBOARDING_STEPS.length - 2 ? 'Complete' : 'Next'}</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push('/feed')}
                  className="w-full sm:w-auto px-8 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            // Check if profile is now complete
            if (isProfileComplete()) {
              router.push('/feed');
            }
          }}
        />
      )}
    </div>
  );
}
