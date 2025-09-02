'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import EditProfileModal from './EditProfileModal';
import { uploadToSupabaseStorage, validateFile, generateFilePath } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
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
  DocumentTextIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  IdentificationIcon,
  BeakerIcon,
  HeartIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getUserExperiences, getUserEducations, isCurrentStudent } from '@/lib/queries';
import Logo from '@/components/common/Logo';



const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to <span class="mulish-semibold text-[#007fff]">kendraa</span>',
    subtitle: 'Let\'s set up your professional profile to connect with healthcare professionals',
    type: 'welcome',
    required: false
  },
  {
    id: 'student-status',
    title: 'Professional Status',
    subtitle: 'Select your current professional status to customize your profile requirements',
    type: 'student-selection',
    required: false
  },
  {
    id: 'name',
    title: 'What\'s your full name?',
    subtitle: 'This is how other professionals will see you',
    type: 'input',
    field: 'full_name',
    placeholder: 'Enter your full name',
    required: false
  },
  {
    id: 'headline',
    title: 'What\'s your professional headline?',
    subtitle: 'A brief description of your role and expertise',
    type: 'input',
    field: 'headline',
    placeholder: 'e.g., Cardiologist at Mayo Clinic',
    required: false
  },

  {
    id: 'bio',
    title: 'Tell us about yourself',
    subtitle: 'Share your professional background and interests',
    type: 'textarea',
    field: 'bio',
    placeholder: 'Describe your experience, achievements, and what drives you in healthcare...',
    required: false
  },
  {
    id: 'contact',
    title: 'Contact Information',
    subtitle: 'How can other professionals reach you?',
    type: 'contact',
    required: false
  },
  {
    id: 'experience',
    title: 'Add your work experience',
    subtitle: 'Share your professional experience to build credibility (optional for testing)',
    type: 'experience',
    required: false
  },
  {
    id: 'education',
    title: 'Add your education',
    subtitle: 'Include your academic background and qualifications (optional for testing)',
    type: 'education',
    required: false
  },
  {
    id: 'avatar',
    title: 'Add a profile picture',
    subtitle: 'A professional photo helps build trust with connections (optional)',
    type: 'image',
    field: 'avatar_url',
    required: false
  },

];

export default function OnboardingPage() {
  const { user, profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isStudent, setIsStudent] = useState(false);
  
  // Filter steps based on student status
  const getFilteredSteps = () => {
    if (isStudent) {
      // Remove experience step for students
      return ONBOARDING_STEPS.filter(step => step.id !== 'experience');
    }
    return ONBOARDING_STEPS;
  };
  
  const filteredSteps = getFilteredSteps();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    headline: profile?.headline || '',
    specialization: profile?.specialization || [],
    bio: profile?.bio || '',
    location: profile?.location || '',
    avatar_url: profile?.avatar_url || '',
    // Contact Information
    phone: profile?.phone || '',
    email: profile?.email || '',
    website: profile?.website || '',
    country: profile?.country || '',
  });
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [hasSavedExperience, setHasSavedExperience] = useState(false);
  const [savingInBackground, setSavingInBackground] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(0);
  const router = useRouter();

  // Test database connection
  const testDatabaseConnection = async () => {
    if (!supabase || !user?.id) return false;
    
    try {
      // Test if we can access the experiences table
      const { data, error } = await supabase
        .from('experiences')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection test successful');
      
      // Test if we can access the education table
      const { data: eduData, error: eduError } = await supabase
        .from('education')
        .select('id')
        .limit(1);
      
      if (eduError) {
        console.error('Education table access failed:', eduError);
        return false;
      }
      
      console.log('Education table access successful');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  };

  // Check if profile is 80% complete
  const isProfileComplete = async () => {
    if (!profile || !user?.id) return false;
    
    // Check if user is a current student
    const isStudent = await isCurrentStudent(user.id);
    
    const requiredFields = [
      profile.full_name,
      profile.headline,
      profile.specialization && profile.specialization.length > 0,
      profile.bio,
      educations.length > 0, // At least one education entry - REQUIRED
    ];
    
    // Only require experience if not a current student
    if (!isStudent) {
      requiredFields.push(experiences.length > 0); // At least one experience entry - REQUIRED
    }
    
    const completed = requiredFields.filter(field => field).length;
    const percentage = (completed / requiredFields.length) * 100;
    return percentage >= 80;
  };

  const getCompletionPercentage = () => {
    if (!profile || !user?.id) return 0;
    
    // Use current form data for more accurate completion calculation
    const currentProfile = {
      full_name: formData.full_name || profile.full_name,
      headline: formData.headline || profile.headline,
      specialization: formData.specialization || profile.specialization,
      bio: formData.bio || profile.bio,
      location: formData.location || profile.location,
    };
    
    const requiredFields = [
      currentProfile.full_name,
      currentProfile.headline,
      currentProfile.specialization && currentProfile.specialization.length > 0,
      currentProfile.bio,
      educations.length > 0, // At least one education entry - REQUIRED
    ];
    
    // Only require experience if not a current student
    if (!isStudent) {
      requiredFields.push(experiences.length > 0); // At least one experience entry - REQUIRED
    }
    
    const completed = requiredFields.filter(field => field).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  const recalculateCompletionPercentage = useCallback(() => {
    const percentage = getCompletionPercentage();
    setCompletionPercentage(percentage);
    return percentage;
  }, [formData, experiences, educations, isStudent, profile, user?.id]);

  // Recalculate completion percentage when form data, experiences, or educations change
  useEffect(() => {
    if (profile && user?.id) {
      recalculateCompletionPercentage();
    }
  }, [formData, experiences, educations, isStudent, profile, user?.id]);

  // Redirect if profile is already complete or onboarding has been completed before
  useEffect(() => {
    const checkProfileCompletion = async () => {
      // Check if user has completed onboarding before from database
      if (profile?.onboarding_completed) {
        // User has completed onboarding before, redirect to feed
        router.push('/feed');
        return;
      }
      
      const isComplete = await isProfileComplete();
      if (isComplete && user?.id && supabase) {
        // Mark onboarding as completed in database and redirect
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', user.id);
          
          if (error) {
            console.error('Error updating onboarding status:', error);
          } else {
        router.push('/feed');
          }
        } catch (error) {
          console.error('Error updating onboarding status:', error);
        }
      }
    };
    
    if (profile && user?.id) {
      checkProfileCompletion();
    }
  }, [profile, user?.id, supabase, router]);

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
        // Contact Information
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
          country: profile.country || '',
      });
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

  // Load experiences and educations from database
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        const [userExperiences, userEducations, studentStatus] = await Promise.all([
          getUserExperiences(user.id),
          getUserEducations(user.id),
          isCurrentStudent(user.id)
        ]);

        setExperiences(userExperiences);
        setEducations(userEducations);
        setIsStudent(studentStatus);
        
        // Calculate completion percentage
        const requiredFields = [
          profile?.full_name,
          profile?.headline,
          profile?.specialization && profile.specialization.length > 0,
          profile?.bio,
          userEducations.length > 0, // At least one education entry - REQUIRED
        ];
        
        // Only require experience if not a current student
        if (!studentStatus) {
          requiredFields.push(userExperiences.length > 0); // At least one experience entry - REQUIRED
        }
        
        const completed = requiredFields.filter(field => field).length;
        const percentage = Math.round((completed / requiredFields.length) * 100);
        setCompletionPercentage(percentage);
        setLoading(false);
      } catch (error) {
        console.error('Error loading user experiences and educations:', error);
        toast.error('Failed to load your profile data');
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id, profile]);

  const handleCompleteProfile = () => {
    setShowEditModal(true);
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, {
      id: Date.now(),
      title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      description: ''
    }]);
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setExperiences(prev => prev.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducations(prev => [...prev, {
      id: Date.now(),
      degree: '',
      school: '',
      field: '',
      start_date: '',
      end_date: '',
      current: false,
      description: ''
    }]);
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setEducations(prev => prev.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (index: number) => {
    setEducations(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: string, value: any) => {
    console.log(`handleInputChange - Field: ${field}, Value:`, value);
    setFormData(prev => {
      const newData = {
      ...prev,
      [field]: value
      };
      console.log('Updated formData:', newData);
      return newData;
    });
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
    const currentStepData = filteredSteps[currentStep];
    
    // Skip validation for welcome and student-selection but still persist what we have
    // Proceed to saving logic directly

    if (user?.id && supabase) {
      // Immediately advance to next step for seamless navigation
      const nextStep = Math.min(currentStep + 1, filteredSteps.length - 1);
      setCurrentStep(nextStep);
      
      // DISABLED: Only save data in background for non-welcome and non-student-selection steps
      // This was causing infinite saving loops
      // if (currentStepData.type !== 'welcome' && currentStepData.type !== 'student-selection') {
      //   saveDataInBackground();
      // }
      return;
    }
    
    // If no user/supabase, just advance
    setCurrentStep(Math.min(currentStep + 1, filteredSteps.length - 1));
  };

  // Background data saving function
  const saveDataInBackground = async () => {
    if (!user?.id || !supabase) {
      console.error('User or Supabase not available for background save');
      return;
    }
    
    // Debouncing: prevent multiple saves within 3 seconds
    const now = Date.now();
    if (now - lastSaveTime < 3000) {
      console.log('Skipping background save due to debouncing');
      return;
    }
    setLastSaveTime(now);

    // Prevent multiple simultaneous saves
    if (savingInBackground) {
      console.log('Background save already in progress');
        return;
      }
      
    setSavingInBackground(true);
      try {
        let avatarUrl = formData.avatar_url;

        // Upload avatar if changed
        if (avatarFile && user?.id) {
          const filePath = generateFilePath(user.id, avatarFile.name, 'avatars');
          const { url, error } = await uploadToSupabaseStorage('avatars', filePath, avatarFile);
          if (error) throw new Error(error);
          avatarUrl = url;
        }

        // Always save basic profile data on Next
        console.log('Saving formData to profiles (Next click):', formData);
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            ...formData,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          });
        if (profileError) throw new Error(`Failed to save profile: ${profileError.message}`);

        // Save any valid experiences
          for (const experience of experiences) {
          if (experience.title && experience.company && (experience.start_date || (experience.start_month && experience.start_year))) {
            const startDate = experience.start_month && experience.start_year 
              ? `${experience.start_year}-${experience.start_month}-01`
              : experience.start_date;
            const endDate = experience.end_month && experience.end_year 
              ? `${experience.end_year}-${experience.end_month}-01`
              : experience.end_date;

            const { error } = await supabase
                .from('experiences')
                .upsert({
                  profile_id: user.id,
                  title: experience.title,
                  company: experience.company,
                  location: experience.location || null,
                start_date: startDate,
                end_date: experience.current ? null : (endDate || null),
                  current: experience.current,
                  description: experience.description || null
                });
            if (error) throw new Error(`Failed to save experience: ${error.message}`);
          }
        }

        // Save any valid educations
          for (const education of educations) {
          if (education.degree && education.school && (education.start_date || (education.start_month && education.start_year))) {
            const startDate = education.start_month && education.start_year 
              ? `${education.start_year}-${education.start_month}-01`
              : education.start_date;
            const endDate = education.end_month && education.end_year 
              ? `${education.end_year}-${education.end_month}-01`
              : education.end_date;

            const { error } = await supabase
                .from('education')
                .upsert({
                  profile_id: user.id,
                  school: education.school,
                  degree: education.degree,
                  field: education.field || null,
                start_date: startDate,
                end_date: education.current ? null : (endDate || null),
                  current: education.current,
                  description: education.description || null
                });
            if (error) throw new Error(`Failed to save education: ${error.message}`);
          }
        }

        // Update profile context without triggering recalculation
        await updateProfile({ ...formData, avatar_url: avatarUrl });

        // Show success toast only if there were no errors
        toast.success('Progress saved successfully!');
        
        // Update last save time to prevent immediate re-saves
        setLastSaveTime(Date.now());
        
      } catch (error: any) {
        console.error('Background save error:', error);
        // Don't show error toast for background saves to avoid interrupting user flow
      } finally {
        setSavingInBackground(false);
      }
    };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const currentStepData = filteredSteps[currentStep];
    
    // Always allow proceeding for seamless navigation
    // Data validation and saving happens in background
    return true;
  };

  const handleSkip = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user?.id && supabase) {
        const sb = supabase; // local non-null alias for TS
        const uid = user.id; // local non-null alias for TS
        // Save basic profile data
        console.log('handleSave - Saving formData to profiles:', formData);
        const { error: profileError } = await sb
          .from('profiles')
          .upsert({
            id: uid,
            ...formData,
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          throw profileError;
        }

        // Save experiences in parallel
        const experienceSaves = experiences
          .filter((experience) => experience.title && experience.company && (experience.start_month || experience.start_year))
          .map(async (experience) => {
            const startDate = experience.start_month && experience.start_year 
              ? `${experience.start_year}-${experience.start_month}-01`
              : experience.start_date;
            const endDate = experience.end_month && experience.end_year 
              ? `${experience.end_year}-${experience.end_month}-01`
              : experience.end_date;

            const { error: expError } = await sb
              .from('experiences')
              .upsert({
                profile_id: uid,
                title: experience.title,
                company: experience.company,
                location: experience.location || null,
                start_date: startDate,
                end_date: experience.current ? null : (endDate || null),
                current: experience.current,
                description: experience.description || null
              });
            if (expError) {
              console.error('Error saving experience:', expError);
            }
          });

        // Save educations in parallel
        const educationSaves = educations
          .filter((education) => education.degree && education.school && (education.start_month || education.start_year))
          .map(async (education) => {
            const startDate = education.start_month && education.start_year 
              ? `${education.start_year}-${education.start_month}-01`
              : education.start_date;
            const endDate = education.end_month && education.end_year 
              ? `${education.end_year}-${education.end_month}-01`
              : education.end_date;

            const { error: eduError } = await sb
              .from('education')
              .upsert({
                profile_id: uid,
                degree: education.degree,
                school: education.school,
                field: education.field || null,
                start_date: startDate,
                end_date: education.current ? null : (endDate || null),
                current: education.current,
                description: education.description || null
              });
            if (eduError) {
              console.error('Error saving education:', eduError);
            }
          });

        await Promise.all([...experienceSaves, ...educationSaves]);

        // Explicit submissions should mark onboarding as completed to prevent redirect loops
        const { error: onboardingError } = await sb
          .from('profiles')
          .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
          .eq('id', uid);
        if (onboardingError) {
          console.error('Error updating onboarding status:', onboardingError);
        }

        // Update profile context immediately so UI reflects the change
        await updateProfile({ ...formData, onboarding_completed: true });

        toast.success('Progress saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const step = filteredSteps[currentStep];

    switch (step.type) {
      case 'welcome':
        return (
          <div className="text-center max-w-4xl mx-auto px-6">
            {/* Logo Section */}
            <div className="mb-8">
              <img 
                src="/Kendraa Logo (1).png" 
                alt="Kendraa Logo" 
                className="h-32 md:h-48 lg:h-56 w-auto mx-auto drop-shadow-xl"
              />
            </div>
            
            {/* Typography */}
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight" 
                dangerouslySetInnerHTML={{ __html: step.title }}>
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
              {step.subtitle}
            </p>
            
            {/* Benefits Card */}
            <div className="bg-white border-2 border-[#007fff]/10 rounded-xl p-6 mb-8 shadow-lg hover:border-[#007fff]/20 transition-all duration-300">
              <h3 className="font-bold text-[#007fff] mb-6 text-xl">Why complete your profile?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#007fff] rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-black text-sm font-medium">Build trust with other healthcare professionals</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#007fff] rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-black text-sm font-medium">Get personalized job recommendations</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#007fff] rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-black text-sm font-medium">Connect with relevant industry professionals</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#007fff] rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-black text-sm font-medium">Access exclusive healthcare content</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'student-selection':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#007fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-3">{step.title}</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">{step.subtitle}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsStudent(true);
                  handleNext();
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                  isStudent 
                    ? 'border-[#007fff] bg-[#007fff]/10 text-black' 
                    : 'border-[#007fff]/20 hover:border-[#007fff]/40 hover:bg-[#007fff]/5'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-5 h-5 text-[#007fff]" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-black mb-1">Medical Sciences Student</h3>
                    <p className="text-sm text-gray-600">Medical school, residency, or other healthcare education</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setIsStudent(false);
                  handleNext();
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                  !isStudent 
                    ? 'border-[#007fff] bg-[#007fff]/10 text-black' 
                    : 'border-[#007fff]/20 hover:border-[#007fff]/40 hover:bg-[#007fff]/5'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                    <BriefcaseIcon className="w-5 h-5 text-[#007fff]" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-black mb-1">Medical Sciences Professional</h3>
                    <p className="text-sm text-gray-600">Pharmaceutical, Hospital, Medical Devices, Research Institute, Academia, AI/Robotics, others.</p>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="mt-6 bg-[#007fff]/5 rounded-xl p-3">
              <p className="text-xs text-[#007fff]">
                <InformationCircleIcon className="w-3 h-3 inline mr-1" />
                Students will only need to add education information. Professionals will need both education and work experience.
              </p>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-[#007fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                {step.field === 'full_name' && <UserIcon className="w-8 h-8 text-white" />}
                {step.field === 'headline' && <BriefcaseIcon className="w-8 h-8 text-white" />}
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">{step.title}</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">{step.subtitle}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-[#007fff]/10 rounded-2xl p-6 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
            >
            <input
              type="text"
              value={formData[step.field as keyof typeof formData] as string}
              onChange={(e) => handleInputChange(step.field!, e.target.value)}
              placeholder={step.placeholder}
                className="w-full px-6 py-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white text-xl transition-all duration-200 hover:border-[#007fff]/40"
              autoFocus
            />
            {step.required && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-[#007fff]/5 rounded-xl"
                >
                  <p className="text-sm text-[#007fff] flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                This field is required
              </p>
                </motion.div>
            )}
            </motion.div>
          </div>
        );

      case 'textarea':
        return (
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-[#007fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">{step.title}</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">{step.subtitle}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-[#007fff]/10 rounded-2xl p-6 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
            >
            <textarea
              value={formData[step.field as keyof typeof formData] as string}
              onChange={(e) => handleInputChange(step.field!, e.target.value)}
              placeholder={step.placeholder}
              rows={6}
                className="w-full px-6 py-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white text-lg resize-none transition-all duration-200 hover:border-[#007fff]/40"
              autoFocus
            />
            {step.required && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-[#007fff]/5 rounded-xl"
                >
                  <p className="text-sm text-[#007fff] flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                This field is required
              </p>
                </motion.div>
            )}
            </motion.div>
          </div>
        );



      case 'image':
        return (
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-[#007fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PhotoIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">{step.title}</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">{step.subtitle}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-[#007fff]/10 rounded-2xl p-8 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
            >
            <div className="space-y-6">
              {avatarPreview ? (
                  <div className="relative mx-auto w-40 h-40">
                    <div className="w-40 h-40 rounded-full mx-auto overflow-hidden border-4 border-[#007fff] shadow-lg">
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
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                  <div className="w-40 h-40 mx-auto border-2 border-dashed border-[#007fff]/30 rounded-full flex items-center justify-center hover:border-[#007fff]/50 transition-colors">
                    <PhotoIcon className="w-16 h-16 text-black/40" />
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
                  className="block w-full px-6 py-4 bg-[#007fff] text-white text-center rounded-xl hover:bg-[#007fff]/90 transition-colors cursor-pointer font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
              >
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </label>
                
                {/* Save and Edit buttons - only show when photo is uploaded */}
                {avatarPreview && (
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Save Photo</span>
                    </button>
                    <button
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="flex-1 px-6 py-3 bg-[#007fff]/20 text-black rounded-xl hover:bg-[#007fff]/30 transition-colors font-semibold flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span>Remove Photo</span>
                    </button>
            </div>
                )}
              </div>
              
            {!step.required && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-3 bg-[#007fff]/5 rounded-xl"
                >
                  <p className="text-sm text-[#007fff] flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                This step is optional - you can skip it
              </p>
                </motion.div>
            )}
            </motion.div>
          </div>
        );

      case 'experience':
        return (
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-[#007fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BriefcaseIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">{step.title}</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">{step.subtitle}</p>
            </motion.div>
            
            <div className="space-y-6">
              {experiences.map((experience, index) => (
                <motion.div 
                  key={experience.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border-2 border-[#007fff]/10 rounded-2xl p-6 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#007fff]/10 rounded-xl flex items-center justify-center">
                        <span className="text-[#007fff] font-bold text-lg">{index + 1}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#007fff]">Work Experience</h3>
                    </div>
                    <button
                      onClick={() => removeExperience(index)}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                  
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Job Title */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#007fff]">
                        Job Title *
                      </label>
                    <input
                      type="text"
                        placeholder="e.g., Senior Cardiologist"
                      value={experience.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                      />
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#007fff]">
                        Company *
                      </label>
                    <input
                      type="text"
                        placeholder="e.g., Mayo Clinic"
                      value={experience.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                      />
                    </div>

                    {/* Location */}
                    <div className="lg:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-[#007fff]">
                        Location
                      </label>
                    <input
                      type="text"
                        placeholder="e.g., Rochester, MN"
                      value={experience.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                      />
                    </div>

                    {/* Date Range */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Start Date */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#007fff]">
                            Start Date *
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={experience.start_month || ''}
                              onChange={(e) => updateExperience(index, 'start_month', e.target.value)}
                              className="w-full px-3 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 text-sm"
                            >
                              <option value="">Month</option>
                              <option value="01">January</option>
                              <option value="02">February</option>
                              <option value="03">March</option>
                              <option value="04">April</option>
                              <option value="05">May</option>
                              <option value="06">June</option>
                              <option value="07">July</option>
                              <option value="08">August</option>
                              <option value="09">September</option>
                              <option value="10">October</option>
                              <option value="11">November</option>
                              <option value="12">December</option>
                            </select>
                            <select
                              value={experience.start_year || ''}
                              onChange={(e) => updateExperience(index, 'start_year', e.target.value)}
                              className="w-full px-3 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 text-sm"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 50 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#007fff]">
                            End Date
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={experience.end_month || ''}
                              onChange={(e) => updateExperience(index, 'end_month', e.target.value)}
                        disabled={experience.current}
                              className="w-full px-3 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 disabled:bg-[#007fff]/5 disabled:border-[#007fff]/10 disabled:cursor-not-allowed text-sm"
                            >
                              <option value="">Month</option>
                              <option value="01">January</option>
                              <option value="02">February</option>
                              <option value="03">March</option>
                              <option value="04">April</option>
                              <option value="05">May</option>
                              <option value="06">June</option>
                              <option value="07">July</option>
                              <option value="08">August</option>
                              <option value="09">September</option>
                              <option value="10">October</option>
                              <option value="11">November</option>
                              <option value="12">December</option>
                            </select>
                            <select
                              value={experience.end_year || ''}
                              onChange={(e) => updateExperience(index, 'end_year', e.target.value)}
                              disabled={experience.current}
                              className="w-full px-3 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 disabled:bg-[#007fff]/5 disabled:border-[#007fff]/10 disabled:cursor-not-allowed text-sm"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 50 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                );
                              })}
                            </select>
                    </div>
                        </div>
                      </div>

                      {/* Current Position Checkbox */}
                      <div className="flex items-center space-x-3 mt-4 p-3 bg-[#007fff]/5 rounded-xl">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={experience.current}
                        onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                          className="w-5 h-5 text-[#007fff] border-2 border-[#007fff]/30 rounded focus:ring-[#007fff] focus:ring-2"
                      />
                        <label htmlFor={`current-${index}`} className="text-sm font-medium text-[#007fff]">
                        I currently work here
                      </label>
                    </div>
                  </div>
                  
                    {/* Description */}
                    <div className="lg:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-[#007fff]">
                        Description (optional)
                      </label>
                  <textarea
                        placeholder="Describe your responsibilities, achievements, and key projects..."
                    value={experience.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={3}
                        className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 resize-none"
                  />
                </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Add Experience Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={addExperience}
                className="w-full py-4 border-2 border-dashed border-[#007fff]/30 rounded-2xl text-black hover:border-[#007fff] hover:bg-[#007fff]/5 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <div className="w-8 h-8 bg-[#007fff]/10 rounded-full flex items-center justify-center group-hover:bg-[#007fff]/20 transition-colors duration-200">
                  <span className="text-black font-bold text-lg">+</span>
                </div>
                <span className="font-semibold">Add Work Experience</span>
              </motion.button>
            </div>
            
            {step.required && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-[#007fff]/5 rounded-xl"
              >
                <p className="text-sm text-[#007fff] flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                Please add at least one work experience with title, company, and start date
              </p>
              </motion.div>
            )}
          </div>
        );

      case 'education':
        return (
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-[#007fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">{step.title}</h2>
              <p className="text-lg text-black/70 max-w-2xl mx-auto">{step.subtitle}</p>
            </motion.div>
            
            <div className="space-y-6">
              {educations.map((education, index) => (
                <motion.div 
                  key={education.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border-2 border-[#007fff]/10 rounded-2xl p-6 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#007fff]/10 rounded-xl flex items-center justify-center">
                        <span className="text-[#007fff] font-bold text-lg">{index + 1}</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#007fff]">Education</h3>
                    </div>
                    <button
                      onClick={() => removeEducation(index)}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                  
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Degree */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#007fff]">
                        Degree *
                      </label>
                    <input
                      type="text"
                        placeholder="e.g., MD, PhD, BSN"
                      value={education.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                      />
                    </div>

                    {/* School */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#007fff]">
                        School *
                      </label>
                    <input
                      type="text"
                        placeholder="e.g., Harvard Medical School"
                      value={education.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                      />
                    </div>

                    {/* Field of Study */}
                    <div className="lg:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-[#007fff]">
                        Field of Study
                      </label>
                    <input
                      type="text"
                        placeholder="e.g., Internal Medicine, Nursing"
                      value={education.field}
                      onChange={(e) => updateEducation(index, 'field', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                      />
                    </div>

                    {/* Date Range */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Start Date */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#007fff]">
                            Start Date *
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={education.start_month || ''}
                              onChange={(e) => updateEducation(index, 'start_month', e.target.value)}
                              className="w-full px-3 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 text-sm"
                            >
                              <option value="">Month</option>
                              <option value="01">January</option>
                              <option value="02">February</option>
                              <option value="03">March</option>
                              <option value="04">April</option>
                              <option value="05">May</option>
                              <option value="06">June</option>
                              <option value="07">July</option>
                              <option value="08">August</option>
                              <option value="09">September</option>
                              <option value="10">October</option>
                              <option value="11">November</option>
                              <option value="12">December</option>
                            </select>
                            <select
                              value={education.start_year || ''}
                              onChange={(e) => updateEducation(index, 'start_year', e.target.value)}
                              className="w-full px-3 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 text-sm"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 50 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[#007fff]">
                            End Date
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={education.end_month || ''}
                              onChange={(e) => updateEducation(index, 'end_month', e.target.value)}
                        disabled={education.current}
                              className="w-full px-3 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 disabled:bg-[#007fff]/5 disabled:border-[#007fff]/10 disabled:cursor-not-allowed text-sm"
                            >
                              <option value="">Month</option>
                              <option value="01">January</option>
                              <option value="02">February</option>
                              <option value="03">March</option>
                              <option value="04">April</option>
                              <option value="05">May</option>
                              <option value="06">June</option>
                              <option value="07">July</option>
                              <option value="08">August</option>
                              <option value="09">September</option>
                              <option value="10">October</option>
                              <option value="11">November</option>
                              <option value="12">December</option>
                            </select>
                            <select
                              value={education.end_year || ''}
                              onChange={(e) => updateEducation(index, 'end_year', e.target.value)}
                              disabled={education.current}
                              className="w-full px-3 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 disabled:bg-[#007fff]/5 disabled:border-[#007fff]/10 disabled:cursor-not-allowed text-sm"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 50 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                );
                              })}
                            </select>
                    </div>
                        </div>
                      </div>

                      {/* Current Study Checkbox */}
                      <div className="flex items-center space-x-3 mt-4 p-3 bg-[#007fff]/5 rounded-xl">
                      <input
                        type="checkbox"
                        id={`current-edu-${index}`}
                        checked={education.current}
                        onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                          className="w-5 h-5 text-[#007fff] border-2 border-[#007fff]/30 rounded focus:ring-[#007fff] focus:ring-2"
                      />
                        <label htmlFor={`current-edu-${index}`} className="text-sm font-medium text-[#007fff]">
                        I am currently studying here
                      </label>
                    </div>
                  </div>
                  
                    {/* Description */}
                    <div className="lg:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-[#007fff]">
                        Description (optional)
                      </label>
                  <textarea
                        placeholder="Describe your achievements, coursework, research, or special recognitions..."
                    value={education.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    rows={3}
                        className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 resize-none"
                  />
                </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Add Education Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={addEducation}
                className="w-full py-4 border-2 border-dashed border-[#007fff]/30 rounded-2xl text-black hover:border-[#007fff] hover:bg-[#007fff]/5 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <div className="w-8 h-8 bg-[#007fff]/10 rounded-full flex items-center justify-center group-hover:bg-[#007fff]/20 transition-colors duration-200">
                  <span className="text-black font-bold text-lg">+</span>
                </div>
                <span className="font-semibold">Add Education</span>
              </motion.button>
            </div>
            
            {step.required && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-[#007fff]/5 rounded-xl"
              >
                <p className="text-sm text-[#007fff] flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                Please add at least one education entry with degree, school, and start date
              </p>
              </motion.div>
            )}
          </div>
        );

      case 'contact':
        return (
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-[#007fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">{step.title}</h2>
              <p className="text-lg text-black/70 max-w-2xl mx-auto">{step.subtitle}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-[#007fff]/10 rounded-2xl p-6 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#007fff]">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#007fff]">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#007fff]">
                    Website (optional)
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" />
              <input
                type="url"
                      placeholder="Website URL"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
              />
            </div>
          </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#007fff]">
                    Country *
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" />
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 appearance-none cursor-pointer"
                    >
                      <option value="">Select your country</option>
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Albania">Albania</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Andorra">Andorra</option>
                      <option value="Angola">Angola</option>
                      <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Armenia">Armenia</option>
                      <option value="Australia">Australia</option>
                      <option value="Austria">Austria</option>
                      <option value="Azerbaijan">Azerbaijan</option>
                      <option value="Bahamas">Bahamas</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Barbados">Barbados</option>
                      <option value="Belarus">Belarus</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Belize">Belize</option>
                      <option value="Benin">Benin</option>
                      <option value="Bhutan">Bhutan</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Brunei">Brunei</option>
                      <option value="Bulgaria">Bulgaria</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Burundi">Burundi</option>
                      <option value="Cabo Verde">Cabo Verde</option>
                      <option value="Cambodia">Cambodia</option>
                      <option value="Cameroon">Cameroon</option>
                      <option value="Canada">Canada</option>
                      <option value="Central African Republic">Central African Republic</option>
                      <option value="Chad">Chad</option>
                      <option value="Chile">Chile</option>
                      <option value="China">China</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Comoros">Comoros</option>
                      <option value="Congo">Congo</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Croatia">Croatia</option>
                      <option value="Cuba">Cuba</option>
                      <option value="Cyprus">Cyprus</option>
                      <option value="Czech Republic">Czech Republic</option>
                      <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Djibouti">Djibouti</option>
                      <option value="Dominica">Dominica</option>
                      <option value="Dominican Republic">Dominican Republic</option>
                      <option value="East Timor">East Timor</option>
                      <option value="Ecuador">Ecuador</option>
                      <option value="Egypt">Egypt</option>
                      <option value="El Salvador">El Salvador</option>
                      <option value="Equatorial Guinea">Equatorial Guinea</option>
                      <option value="Eritrea">Eritrea</option>
                      <option value="Estonia">Estonia</option>
                      <option value="Eswatini">Eswatini</option>
                      <option value="Ethiopia">Ethiopia</option>
                      <option value="Fiji">Fiji</option>
                      <option value="Finland">Finland</option>
                      <option value="France">France</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Gambia">Gambia</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Germany">Germany</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Greece">Greece</option>
                      <option value="Grenada">Grenada</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="Guinea">Guinea</option>
                      <option value="Guinea-Bissau">Guinea-Bissau</option>
                      <option value="Guyana">Guyana</option>
                      <option value="Haiti">Haiti</option>
                      <option value="Honduras">Honduras</option>
                      <option value="Hungary">Hungary</option>
                      <option value="Iceland">Iceland</option>
                      <option value="India">India</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Iran">Iran</option>
                      <option value="Iraq">Iraq</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Israel">Israel</option>
                      <option value="Italy">Italy</option>
                      <option value="Jamaica">Jamaica</option>
                      <option value="Japan">Japan</option>
                      <option value="Jordan">Jordan</option>
                      <option value="Kazakhstan">Kazakhstan</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Kiribati">Kiribati</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Kyrgyzstan">Kyrgyzstan</option>
                      <option value="Laos">Laos</option>
                      <option value="Latvia">Latvia</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Lesotho">Lesotho</option>
                      <option value="Liberia">Liberia</option>
                      <option value="Libya">Libya</option>
                      <option value="Liechtenstein">Liechtenstein</option>
                      <option value="Lithuania">Lithuania</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Madagascar">Madagascar</option>
                      <option value="Malawi">Malawi</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Maldives">Maldives</option>
                      <option value="Mali">Mali</option>
                      <option value="Malta">Malta</option>
                      <option value="Marshall Islands">Marshall Islands</option>
                      <option value="Mauritania">Mauritania</option>
                      <option value="Mauritius">Mauritus</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Micronesia">Micronesia</option>
                      <option value="Moldova">Moldova</option>
                      <option value="Monaco">Monaco</option>
                      <option value="Mongolia">Mongolia</option>
                      <option value="Montenegro">Montenegro</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Myanmar">Myanmar</option>
                      <option value="Namibia">Namibia</option>
                      <option value="Nauru">Nauru</option>
                      <option value="Nepal">Nepal</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Niger">Niger</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="North Korea">North Korea</option>
                      <option value="North Macedonia">North Macedonia</option>
                      <option value="Norway">Norway</option>
                      <option value="Oman">Oman</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Palau">Palau</option>
                      <option value="Panama">Panama</option>
                      <option value="Papua New Guinea">Papua New Guinea</option>
                      <option value="Paraguay">Paraguay</option>
                      <option value="Peru">Peru</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Poland">Poland</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Romania">Romania</option>
                      <option value="Russia">Russia</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                      <option value="Saint Lucia">Saint Lucia</option>
                      <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                      <option value="Samoa">Samoa</option>
                      <option value="San Marino">San Marino</option>
                      <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Senegal">Senegal</option>
                      <option value="Serbia">Serbia</option>
                      <option value="Seychelles">Seychelles</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Slovakia">Slovakia</option>
                      <option value="Slovenia">Slovenia</option>
                      <option value="Solomon Islands">Solomon Islands</option>
                      <option value="Somalia">Somalia</option>
                      <option value="South Africa">South Africa</option>
                      <option value="South Korea">South Korea</option>
                      <option value="South Sudan">South Sudan</option>
                      <option value="Spain">Spain</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Sudan">Sudan</option>
                      <option value="Suriname">Suriname</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Syria">Syria</option>
                      <option value="Taiwan">Taiwan</option>
                      <option value="Tajikistan">Tajikistan</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Togo">Togo</option>
                      <option value="Tonga">Tonga</option>
                      <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                      <option value="Tunisia">Tunisia</option>
                      <option value="Turkey">Turkey</option>
                      <option value="Turkmenistan">Turkmenistan</option>
                      <option value="Tuvalu">Tuvalu</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Ukraine">Ukraine</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Uzbekistan">Uzbekistan</option>
                      <option value="Vanuatu">Vanuatu</option>
                      <option value="Vatican City">Vatican City</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Yemen">Yemen</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                    </select>
              </div>
            </div>

            </div>
            
            {!step.required && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-3 bg-[#007fff]/5 rounded-xl"
                >
                  <p className="text-sm text-[#007fff] flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                This step is optional - you can skip it
              </p>
                </motion.div>
            )}
            </motion.div>
          </div>
        );



      default:
        return null;
    }
  };

  // Show loading while checking profile completion
  if (!profile || !user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-azure-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-azure-50 hover:text-azure-600'
                }`}
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Complete Your Profile</h1>
                <p className="text-sm text-gray-600">
                  Step {currentStep + 1} of {filteredSteps.length}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200/50 h-2">
          <div
            className="bg-gradient-to-r from-azure-500 to-blue-500 h-2 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center justify-center min-h-[500px]"
            >
              <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              {renderStep()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-3">

            {/* Background saving indicator */}
            {savingInBackground && (
              <div className="flex items-center text-sm text-black/60 mb-2">
                <div className="w-3 h-3 border-2 border-[#007fff]/30 border-t-[#007fff] rounded-full animate-spin mr-2"></div>
                Saving progress in background...
            </div>
            )}

            <div className="flex justify-center space-x-3 w-full">
              {currentStep < filteredSteps.length - 1 ? (
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
                    disabled={!canProceed() || loading}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                      canProceed() && !loading
                        ? 'bg-gradient-to-r from-azure-500 to-blue-500 text-white hover:from-azure-600 hover:to-blue-600 hover:shadow-xl transform hover:scale-105'
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
                        <span>{currentStep === filteredSteps.length - 2 ? 'Complete' : 'Next'}</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !loading
                        ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
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
                  onClick={async () => {
                     // Mark onboarding as completed in database
                     if (user?.id && supabase) {
                       try {
                         const { error } = await supabase
                           .from('profiles')
                           .update({ onboarding_completed: true })
                           .eq('id', user.id);
                         
                         if (error) {
                           console.error('Error updating onboarding status:', error);
                         }
                       } catch (error) {
                         console.error('Error updating onboarding status:', error);
                       }
                    }
                    router.push('/feed');
                  }}
                  className="px-8 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
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
          onUpdate={async () => {
            setShowEditModal(false);
            // Check if profile is now complete
            const isComplete = await isProfileComplete();
            if (isComplete) {
              router.push('/feed');
            }
          }}
        />
      )}
    </div>
  );
}
