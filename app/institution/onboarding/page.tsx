'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  BuildingOfficeIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  MapPinIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';
import { getInstitutionByAdminId } from '@/lib/queries';

const INSTITUTION_TYPES = [
  'Hospital',
  'Medical Center',
  'Clinic',
  'Research Institute',
  'Medical School/University',
  'Pharmaceutical Company',
  'Medical Device Company',
  'Healthcare Technology',
  'Government Health Agency',
  'Non-Profit Health Organization',
  'Other'
];

const INSTITUTION_FOCUS_AREAS = [
  'Patient Care & Treatment',
  'Medical Research & Development',
  'Medical Education & Training',
  'Public Health & Prevention',
  'Healthcare Innovation & Technology',
  'Medical Equipment & Devices',
  'Pharmaceutical Development',
  'Healthcare Policy & Administration',
  'Mental Health Services',
  'Emergency & Critical Care',
  'Other'
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
    subtitle: 'Tell us about your healthcare organization',
    type: 'about',
    required: true
  },
  {
    id: 'focus',
    title: 'Institution Type & Focus Area',
    subtitle: 'What type of healthcare institution are you and what do you focus on?',
    type: 'focus',
    required: true
  },
  {
    id: 'establishment',
    title: 'Year of Establishment',
    subtitle: 'When was your institution founded?',
    type: 'establishment',
    required: true
  },
  {
    id: 'nerve_centre',
    title: 'Main Office Location',
    subtitle: 'Where is your primary headquarters located?',
    type: 'nerve_centre',
    required: true
  },
  {
    id: 'url',
    title: 'Website URL',
    subtitle: 'Your institution\'s official website',
    type: 'url',
    required: true
  },
  {
    id: 'employees',
    title: 'Organization Size',
    subtitle: 'How many employees work at your institution?',
    type: 'employees',
    required: true
  },
  {
    id: 'complete',
    title: 'Welcome to Kendraa!',
    subtitle: 'Your institution profile is ready to connect with healthcare professionals',
    type: 'complete',
    required: false
  }
];

export default function InstitutionOnboardingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: '',
    description: '',
    institutionType: '',
    focusArea: '',
    establishmentYear: '',
    location: '',
    website: '',
    employeeCount: ''
  });

  // Redirect if not logged in or not an institution user
  useEffect(() => {
    const guardAndPrefill = async () => {
      if (!user) {
        router.push('/signin');
        return;
      }

      if (profile && (profile.user_type !== 'institution' && profile.profile_type !== 'institution')) {
        router.push('/onboarding');
        return;
      }

      // If onboarding already completed, go to institution profile
      if (profile?.onboarding_completed) {
        router.push('/institution/profile');
        return;
      }

      // Prefill from existing profile
      if (profile) {
        setFormData(prev => ({
          ...prev,
          institutionName: profile.full_name || prev.institutionName,
          description: profile.bio || prev.description,
          location: profile.location || prev.location,
          website: profile.website || prev.website,
        }));
      }

      // If institution already exists for this user, mark onboarding complete and redirect
      try {
        const existing = await getInstitutionByAdminId(user.id);
        if (existing) {
          if (supabase) {
            await supabase
              .from('profiles')
              .update({ onboarding_completed: true })
              .eq('id', user.id);
          }
          router.push('/institution/profile');
          return;
        }
      } catch {
        // silent
      }
    };

    guardAndPrefill();
  }, [user, profile, router]);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const calculateCompletion = () => {
    const completedSteps = ONBOARDING_STEPS.filter((_, index) => {
      if (index === ONBOARDING_STEPS.length - 1) return true; // Complete step
      return isStepCompleted(index);
    }).length;
    return Math.round((completedSteps / ONBOARDING_STEPS.length) * 100);
  };

  const isStepCompleted = (stepIndex: number) => {
    const step = ONBOARDING_STEPS[stepIndex];
    switch (step.type) {
      case 'about':
        return formData.institutionName.trim() !== '' && formData.description.trim() !== '';
      case 'focus':
        return formData.institutionType !== '' && formData.focusArea !== '';
      case 'establishment':
        return formData.establishmentYear !== '';
      case 'nerve_centre':
        return formData.location.trim() !== '';
      case 'url':
        return formData.website.trim() !== '';
      case 'employees':
        return formData.employeeCount !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user?.id || !supabase) return;

        setLoading(true);
    try {
      const categorySlug = (formData.institutionType || '').toLowerCase().replace(/\s+/g, '_');

      // Build institution payload
      const institutionPayload: any = {
        name: formData.institutionName,
        description: formData.description,
        type: categorySlug || 'hospital',
        location: formData.location || null,
        website: formData.website || null,
        established_year: formData.establishmentYear ? parseInt(formData.establishmentYear) : null,
        size: formData.employeeCount || null,
        admin_user_id: user.id,
        email: user.email || null,
        verified: false
      };

      // Check if institution exists for this admin
      let existingId: string | null = null;
      try {
        const existing = await getInstitutionByAdminId(user.id);
        existingId = existing?.id ?? null;
      } catch {
        existingId = null;
      }

      if (existingId) {
        const { error: updateError } = await supabase
          .from('institutions')
          .update(institutionPayload)
          .eq('id', existingId);
        if (updateError) {
          console.error('Error updating institution:', updateError);
          toast.error('Failed to update institution profile');
          setLoading(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from('institutions')
          .insert(institutionPayload);
        if (insertError) {
          console.error('Error creating institution:', insertError);
          toast.error('Failed to create institution profile');
          setLoading(false);
          return;
        }
      }

      // Update user profile to mark onboarding as completed and sync basic fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          full_name: formData.institutionName,
          bio: formData.description,
          location: formData.location,
          website: formData.website
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast.error('Failed to complete onboarding');
        setLoading(false);
        return;
      }

      toast.success('Institution profile saved!');
      router.push('/institution/profile');
      } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
      } finally {
        setLoading(false);
      }
    };

  const renderStepContent = () => {
    switch (currentStepData.type) {
      case 'about':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution Name *
              </label>
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => setFormData(prev => ({ ...prev, institutionName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                placeholder="e.g., City General Hospital, MedTech Innovations Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent h-32 resize-none"
                placeholder="Describe your institution's mission, services, and what makes you unique in healthcare..."
              />
            </div>
          </div>
        );

      case 'focus':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Institution Type *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {INSTITUTION_TYPES.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData(prev => ({ ...prev, institutionType: option }))}
                    className={`p-4 text-left border rounded-lg transition-all ${
                      formData.institutionType === option
                        ? 'border-[#007fff] bg-[#007fff]/5 text-[#007fff]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Focus Area *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {INSTITUTION_FOCUS_AREAS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData(prev => ({ ...prev, focusArea: option }))}
                    className={`p-4 text-left border rounded-lg transition-all ${
                      formData.focusArea === option
                        ? 'border-[#007fff] bg-[#007fff]/5 text-[#007fff]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'establishment':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Establishment *
              </label>
              <input
                type="number"
                value={formData.establishmentYear}
                onChange={(e) => setFormData(prev => ({ ...prev, establishmentYear: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                placeholder="e.g., 1995"
                min="1800"
                max={new Date().getFullYear()}
              />
              <p className="text-sm text-gray-500 mt-1">
                When was your institution first established or founded?
              </p>
            </div>
          </div>
        );

      case 'nerve_centre':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Office Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                placeholder="e.g., New York, NY, USA"
              />
              <p className="text-sm text-gray-500 mt-1">
                Where is your institution&apos;s main headquarters or primary location?
              </p>
            </div>
          </div>
        );

      case 'url':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL *
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                placeholder="https://www.yourinstitution.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Your institution&apos;s official website URL (optional but recommended)
              </p>
            </div>
          </div>
        );

      case 'employees':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Organization Size *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {EMPLOYEE_COUNT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData(prev => ({ ...prev, employeeCount: option }))}
                    className={`p-4 text-left border rounded-lg transition-all ${
                      formData.employeeCount === option
                        ? 'border-[#007fff] bg-[#007fff]/5 text-[#007fff]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Kendraa!</h3>
              <p className="text-gray-600">
                Your institution profile has been created successfully. You can now start connecting with healthcare professionals, sharing your organization&apos;s updates, and building your network in the healthcare community.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
          <p className="text-sm text-[#007fff]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-[#007fff]/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#007fff] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Step Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-gray-600">
              {currentStepData.subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className="px-8 py-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isFirstStep
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Previous
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-[#007fff] rounded-full"></div>
                {calculateCompletion()}% Complete
              </div>

              <button
                onClick={handleNext}
                disabled={!isStepCompleted(currentStep) && !isLastStep}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  !isStepCompleted(currentStep) && !isLastStep
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#007fff] text-white hover:bg-[#007fff]/90'
                }`}
              >
                {isLastStep ? 'Complete Setup' : 'Next'}
                {!isLastStep && <ChevronRightIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}