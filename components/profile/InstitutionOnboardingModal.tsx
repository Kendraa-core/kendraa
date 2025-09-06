'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  BuildingOfficeIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface InstitutionOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STUDENT_OPTIONS = [
  'I AM A MEDICAL SCIENCES STUDENT'
];

const PROFESSIONAL_OPTIONS = [
  'Pharmaceutical',
  'Hospital', 
  'Medical Devices',
  'Medical Engineering',
  'Genetics',
  'Research Institute',
  'Academia',
  'AI/Robotics',
  'Others'
];

const EMPLOYEE_COUNT_OPTIONS = [
  '0 - 10',
  '10 - 100',
  '100 - 1000',
  '1000 - 10000',
  '10000+'
];

const ONBOARDING_STEPS = [
  {
    id: 'about',
    title: 'About Your Institution',
    subtitle: 'Tell us about your organization',
    type: 'about',
    required: true
  },
  {
    id: 'focus',
    title: 'I AM A MEDICAL SCIENCES STUDENT / PROFESSIONAL',
    subtitle: 'Select your category and focus area',
    type: 'focus',
    required: true
  },
  {
    id: 'establishment',
    title: 'Year of Establishment',
    subtitle: 'When was your institution established?',
    type: 'establishment',
    required: true
  },
  {
    id: 'nerve_centre',
    title: 'Nerve Centre',
    subtitle: 'Where is your main office located?',
    type: 'nerve_centre',
    required: true
  },
  {
    id: 'url',
    title: 'Website URL',
    subtitle: 'Your organization\'s website',
    type: 'url',
    required: true
  },
  {
    id: 'employees',
    title: 'Number of Employees',
    subtitle: 'How many people work at your institution?',
    type: 'employees',
    required: true
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    subtitle: 'Your institution profile is ready',
    type: 'complete',
    required: false
  }
];

export default function InstitutionOnboardingModal({ 
  isOpen, 
  onClose, 
  onComplete 
}: InstitutionOnboardingModalProps) {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [savingInBackground, setSavingInBackground] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);

  // Institution Data
  const [institutionData, setInstitutionData] = useState({
    about: '',
    focus: '',
    year_of_establishment: '',
    nerve_centre: '',
    url: '',
    employee_count: '',
    other_focus: '', // For "Others" option
    is_student: false // Track if user is a student
  });

  // Calculate completion percentage
  const calculateCompletion = () => {
    const requiredFields = [
      institutionData.about,
      institutionData.focus,
      institutionData.year_of_establishment,
      institutionData.nerve_centre,
      institutionData.url,
      institutionData.employee_count
    ];
    
    const completed = requiredFields.filter(field => field.trim() !== '').length;
    const percentage = Math.round((completed / requiredFields.length) * 100);
    setCompletionPercentage(percentage);
  };

  useEffect(() => {
    calculateCompletion();
  }, [institutionData]);

  const handleNext = async () => {
    // Immediately advance to next step for seamless navigation
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      // Save data in background without blocking navigation
      saveDataInBackground();
    } else {
      // Complete onboarding
      await handleComplete();
    }
  };

  // Background data saving function
  const saveDataInBackground = async () => {
    if (!user?.id || !supabase) {
      return;
    }

    // Debouncing: prevent multiple saves within 2 seconds
    const now = Date.now();
    if (now - lastSaveTime < 2000) {
      return;
    }
    setLastSaveTime(now);

    // Prevent multiple simultaneous saves
    if (savingInBackground) {
      return;
    }

    setSavingInBackground(true);
    try {
      // Save institution data to database
      const { error } = await supabase
        .from('institutions')
        .upsert({
          user_id: user.id,
          about: institutionData.about,
          focus: institutionData.focus,
          year_of_establishment: institutionData.year_of_establishment,
          nerve_centre: institutionData.nerve_centre,
          url: institutionData.url,
          employee_count: institutionData.employee_count,
          other_focus: institutionData.other_focus,
          is_student: institutionData.is_student,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        // Silent error handling for background saves
      } else {
        toast.success('Progress saved successfully!');
      }
    } catch (error: any) {
      // Silent error handling for background saves
    } finally {
      setSavingInBackground(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Save institution data to database
      const { error: institutionError } = await supabase
        .from('institutions')
        .upsert({
          user_id: user?.id,
          about: institutionData.about,
          focus: institutionData.focus,
          year_of_establishment: institutionData.year_of_establishment,
          nerve_centre: institutionData.nerve_centre,
          url: institutionData.url,
          employee_count: institutionData.employee_count,
          other_focus: institutionData.other_focus,
          is_student: institutionData.is_student,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (institutionError) {
        console.error('Institution creation error:', institutionError);
        // Continue even if institution creation fails
      }

      // Mark user profile onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) {
        throw new Error(`Failed to update profile: ${profileError.message}`);
      }

      toast.success('Institution profile created successfully!');
      onComplete();
    } catch (error: any) {
      toast.error('Failed to create institution profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const step = ONBOARDING_STEPS[currentStep];

    switch (step.type) {
      case 'about':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="w-8 h-8 text-[#007fff] mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-black">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={institutionData.about}
                onChange={(e) => setInstitutionData(prev => ({ ...prev, about: e.target.value }))}
                placeholder="Tell us about your institution, its mission, vision, and key achievements..."
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#007fff] text-lg transition-all duration-200 min-h-[200px]"
                autoFocus
              />
            </div>
          </div>
        );

      case 'focus':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="w-8 h-8 text-[#007fff] mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-black">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Student Option */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-black">I AM A MEDICAL SCIENCES STUDENT</h3>
                <button
                  onClick={() => setInstitutionData(prev => ({ 
                    ...prev, 
                    focus: 'I AM A MEDICAL SCIENCES STUDENT',
                    is_student: true 
                  }))}
                  className={`w-full px-6 py-4 border-2 rounded-xl text-lg transition-all duration-200 text-left ${
                    institutionData.focus === 'I AM A MEDICAL SCIENCES STUDENT'
                      ? 'border-[#007fff] bg-[#007fff]/10 text-[#007fff]'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  I AM A MEDICAL SCIENCES STUDENT
                </button>
              </div>

              {/* Professional Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-black">I AM A MEDICAL SCIENCES PROFESSIONAL</h3>
                <div className="grid grid-cols-1 gap-3">
                  {PROFESSIONAL_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => setInstitutionData(prev => ({ 
                        ...prev, 
                        focus: option,
                        is_student: false 
                      }))}
                      className={`px-6 py-4 border-2 rounded-xl text-lg transition-all duration-200 text-left ${
                        institutionData.focus === option
                          ? 'border-[#007fff] bg-[#007fff]/10 text-[#007fff]'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Others specification input */}
              {institutionData.focus === 'Others' && (
                <input
                  type="text"
                  value={institutionData.other_focus}
                  onChange={(e) => setInstitutionData(prev => ({ ...prev, other_focus: e.target.value }))}
                  placeholder="Please specify your focus area"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#007fff] text-lg transition-all duration-200"
                />
              )}
            </div>
          </div>
        );

      case 'establishment':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="w-8 h-8 text-[#007fff] mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-black">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <input
                type="number"
                value={institutionData.year_of_establishment}
                onChange={(e) => setInstitutionData(prev => ({ ...prev, year_of_establishment: e.target.value }))}
                placeholder="e.g., 2020"
                min="1800"
                max="2024"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#007fff] text-lg transition-all duration-200"
                autoFocus
              />
            </div>
          </div>
        );

      case 'nerve_centre':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="w-8 h-8 text-[#007fff] mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-black">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={institutionData.nerve_centre}
                onChange={(e) => setInstitutionData(prev => ({ ...prev, nerve_centre: e.target.value }))}
                placeholder="e.g., New York, NY"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#007fff] text-lg transition-all duration-200"
                autoFocus
              />
            </div>
          </div>
        );

      case 'url':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="w-8 h-8 text-[#007fff] mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-black">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <input
                type="url"
                value={institutionData.url}
                onChange={(e) => setInstitutionData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://your-institution.com"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#007fff] text-lg transition-all duration-200"
                autoFocus
              />
            </div>
          </div>
        );

      case 'employees':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="w-8 h-8 text-[#007fff] mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-black">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <select
                value={institutionData.employee_count}
                onChange={(e) => setInstitutionData(prev => ({ ...prev, employee_count: e.target.value }))}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#007fff] text-lg transition-all duration-200 bg-white"
                autoFocus
              >
                <option value="">Select number of employees</option>
                {EMPLOYEE_COUNT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircleIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">{step.title}</h2>
            <p className="text-lg text-gray-600 mb-8">{step.subtitle}</p>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Your Institution Profile</h3>
              <div className="space-y-2 text-left">
                <p><span className="font-medium">About:</span> {institutionData.about || 'Not provided'}</p>
                <p><span className="font-medium">Category:</span> {institutionData.is_student ? 'Medical Sciences Student' : 'Medical Sciences Professional'}</p>
                <p><span className="font-medium">Focus:</span> {institutionData.focus || 'Not provided'}</p>
                {institutionData.other_focus && (
                  <p><span className="font-medium">Other Focus:</span> {institutionData.other_focus}</p>
                )}
                <p><span className="font-medium">Established:</span> {institutionData.year_of_establishment || 'Not provided'}</p>
                <p><span className="font-medium">Location:</span> {institutionData.nerve_centre || 'Not provided'}</p>
                <p><span className="font-medium">Website:</span> {institutionData.url || 'Not provided'}</p>
                <p><span className="font-medium">Employees:</span> {institutionData.employee_count || 'Not provided'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-[#007fff]/10 hover:text-azure-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-black">Institution Onboarding</h1>
                <p className="text-sm text-gray-600">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">{completionPercentage}% Complete</div>
              <div className="w-32 bg-gray-200/50 h-2 rounded-full mt-1">
                <div 
                  className="bg-gradient-to-r from-[#007fff] to-[#007fff]/80 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
          <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {renderStep()}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-3">

            {/* Background saving indicator */}
            {savingInBackground && (
              <div className="flex items-center text-sm text-[#007fff]/60 mb-2">
                <div className="w-3 h-3 border-2 border-[#007fff]/30 border-t-[#007fff] rounded-full animate-spin mr-2"></div>
                Saving progress in background...
              </div>
            )}

            <div className="flex justify-center space-x-3 w-full">
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <>
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      currentStep === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                      !loading
                        ? 'bg-gradient-to-r from-[#007fff] to-[#007fff]/80 text-white hover:from-[#007fff]/90 hover:to-[#007fff]/70 hover:shadow-xl transform hover:scale-105'
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
                        <ChevronRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => saveDataInBackground()}
                    disabled={loading || savingInBackground}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !loading && !savingInBackground
                        ? 'bg-[#007fff] text-white hover:bg-[#007fff]/90 hover:shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {savingInBackground ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="px-8 py-3 bg-[#007fff] text-white rounded-xl font-medium hover:bg-[#007fff]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Completing...' : 'Get Started'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
