'use client';

import { useState, useEffect } from 'react';
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
    required: false
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
    id: 'contact',
    title: 'Contact Information',
    subtitle: 'How can other professionals reach you?',
    type: 'contact',
    required: false
  },
  {
    id: 'experience',
    title: 'Add your work experience',
    subtitle: 'Share your professional experience to build credibility (minimum 1 experience required)',
    type: 'experience',
    required: true
  },
  {
    id: 'education',
    title: 'Add your education',
    subtitle: 'Include your academic background and qualifications (minimum 1 education required)',
    type: 'education',
    required: true
  },
  {
    id: 'certifications',
    title: 'Professional Certifications',
    subtitle: 'Add your medical licenses and certifications',
    type: 'certifications',
    required: false
  },
  {
    id: 'skills',
    title: 'Professional Skills',
    subtitle: 'What are your key skills and expertise areas?',
    type: 'skills',
    required: false
  },
  {
    id: 'languages',
    title: 'Languages Spoken',
    subtitle: 'What languages do you speak?',
    type: 'languages',
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
    // Contact Information
    phone: profile?.phone || '',
    email: profile?.email || '',
    website: profile?.website || '',
    // Professional Details
    certifications: profile?.certifications || [],
    skills: profile?.skills || [],
    languages: profile?.languages || [],
    years_of_experience: typeof profile?.years_of_experience === 'number' ? profile.years_of_experience : 0,
    current_position: profile?.current_position || '',
    current_institution: profile?.current_institution || '',
    npi_number: profile?.npi_number || '',
    dea_number: profile?.dea_number || '',
    // Research and Interests
    research_interests: profile?.research_interests || [],
    clinical_interests: profile?.clinical_interests || [],
    teaching_experience: profile?.teaching_experience || false,
    mentoring_availability: profile?.mentoring_availability || false,
  });
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();

  // Check if profile is 80% complete
  const isProfileComplete = () => {
    if (!profile) return false;
    
    const requiredFields = [
      profile.full_name,
      profile.headline,
      profile.specialization && profile.specialization.length > 0,
      profile.bio,
      profile.location,
      experiences.length > 0, // At least one experience entry - REQUIRED
      educations.length > 0, // At least one education entry - REQUIRED
    ];
    
    const completed = requiredFields.filter(field => field).length;
    const percentage = (completed / requiredFields.length) * 100;
    return percentage >= 80;
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;
    
    const requiredFields = [
      profile.full_name,
      profile.headline,
      profile.specialization && profile.specialization.length > 0,
      profile.bio,
      profile.location,
      experiences.length > 0, // At least one experience entry - REQUIRED
      educations.length > 0, // At least one education entry - REQUIRED
    ];
    
    const completed = requiredFields.filter(field => field).length;
    return Math.round((completed / requiredFields.length) * 100);
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
        // Contact Information
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        // Professional Details
        certifications: profile.certifications || [],
        skills: profile.skills || [],
        languages: profile.languages || [],
        years_of_experience: typeof profile.years_of_experience === 'number' ? profile.years_of_experience : 0,
        current_position: profile.current_position || '',
        current_institution: profile.current_institution || '',
        npi_number: profile.npi_number || '',
        dea_number: profile.dea_number || '',
        // Research and Interests
        research_interests: profile.research_interests || [],
        clinical_interests: profile.clinical_interests || [],
        teaching_experience: profile.teaching_experience || false,
        mentoring_availability: profile.mentoring_availability || false,
      });
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

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
      institution: '',
      field_of_study: '',
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
    
    // Skip validation for welcome step since it has no fields
    if (currentStepData.type === 'welcome') {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    // Validate required fields
    if (currentStepData.required) {
      if (currentStepData.type === 'image') {
        if (!avatarPreview) {
          toast.error('Please upload a profile picture');
          return;
        }
      } else if (currentStepData.type === 'experience') {
        if (experiences.length === 0) {
          toast.error('Please add at least one work experience');
          return;
        }
        // Validate that all experience entries have required fields
        const hasValidExperience = experiences.some(exp => 
          exp.title.trim() && exp.company.trim() && exp.start_date
        );
        if (!hasValidExperience) {
          toast.error('Please fill in all required fields for at least one experience');
          return;
        }
      } else if (currentStepData.type === 'education') {
        if (educations.length === 0) {
          toast.error('Please add at least one education entry');
          return;
        }
        // Validate that all education entries have required fields
        const hasValidEducation = educations.some(edu => 
          edu.degree.trim() && edu.institution.trim() && edu.start_date
        );
        if (!hasValidEducation) {
          toast.error('Please fill in all required fields for at least one education');
          return;
        }
      } else {
        const fieldValue = formData[currentStepData.field as keyof typeof formData];
        if (!fieldValue || String(fieldValue).trim().length === 0) {
          toast.error('This field is required');
          return;
        }
      }
    }
    
    // For optional image step, allow proceeding even without image
    if (currentStepData.type === 'image' && !currentStepData.required) {
      // Allow proceeding without image upload
    }

    // If this is the second to last step (before the complete step), save the data
    if (currentStep === ONBOARDING_STEPS.length - 2) {
      setLoading(true);
      try {
        let avatarUrl = formData.avatar_url;

        // Upload avatar if changed
        if (avatarFile && user?.id) {
          const filePath = generateFilePath(user.id, avatarFile.name, 'avatars');
          const { url, error } = await uploadToSupabaseStorage('avatars', filePath, avatarFile);
          
          if (error) {
            throw new Error(error);
          }
          
          avatarUrl = url;
        }

        // Save experience and education data
        if (user?.id && supabase) {
          // Save experiences
          for (const experience of experiences) {
            if (experience.title && experience.company && experience.start_date) {
              await supabase
                .from('experiences')
                .upsert({
                  user_id: user.id,
                  title: experience.title,
                  company: experience.company,
                  location: experience.location || null,
                  start_date: experience.start_date,
                  end_date: experience.current ? null : (experience.end_date || null),
                  current: experience.current,
                  description: experience.description || null
                });
            }
          }

          // Save educations
          for (const education of educations) {
            if (education.degree && education.institution && education.start_date) {
              await supabase
                .from('education')
                .upsert({
                  user_id: user.id,
                  degree: education.degree,
                  institution: education.institution,
                  field_of_study: education.field_of_study || null,
                  start_date: education.start_date,
                  end_date: education.current ? null : (education.end_date || null),
                  current: education.current,
                  description: education.description || null
                });
            }
          }
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
    
    // Welcome step should always allow proceeding
    if (currentStepData.type === 'welcome') {
      return true;
    }
    
    if (!currentStepData.required) return true;
    
    // Special handling for image step - allow proceeding if optional
    if (currentStepData.type === 'image') {
      return !currentStepData.required || avatarPreview !== null;
    }
    
    // Special handling for experience step
    if (currentStepData.type === 'experience') {
      return experiences.length > 0 && experiences.some(exp => 
        exp.title.trim() && exp.company.trim() && exp.start_date
      );
    }
    
    // Special handling for education step
    if (currentStepData.type === 'education') {
      return educations.length > 0 && educations.some(edu => 
        edu.degree.trim() && edu.institution.trim() && edu.start_date
      );
    }
    
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
            <div className="bg-azure-50 rounded-xl p-6 mb-10">
              <h3 className="font-semibold text-azure-900 mb-4 text-lg">Why complete your profile?</h3>
              <ul className="text-azure-800 space-y-3 text-left">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-azure-600 mr-3 flex-shrink-0" />
                  <span>Build trust with other healthcare professionals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-azure-600 mr-3 flex-shrink-0" />
                  <span>Get personalized job recommendations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-azure-600 mr-3 flex-shrink-0" />
                  <span>Connect with relevant industry events</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-azure-600 mr-3 flex-shrink-0" />
                  <span>Access exclusive healthcare content</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              {step.field === 'full_name' && <UserIcon className="w-8 h-8 text-azure-500 mr-3" />}
              {step.field === 'headline' && <BriefcaseIcon className="w-8 h-8 text-azure-500 mr-3" />}
              {step.field === 'location' && <MapPinIcon className="w-8 h-8 text-azure-500 mr-3" />}
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
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-azure-500 focus:border-azure-500 text-xl transition-all duration-200"
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
              <DocumentTextIcon className="w-8 h-8 text-azure-500 mr-3" />
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
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-azure-500 focus:border-azure-500 text-lg resize-none transition-all duration-200"
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
              <StarIcon className="w-8 h-8 text-azure-500 mr-3" />
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
                      ? 'border-azure-500 bg-azure-50 text-azure-700'
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
              <PhotoIcon className="w-8 h-8 text-azure-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            <div className="space-y-6">
              {avatarPreview ? (
                <div className="relative">
                  <div className="w-32 h-32 rounded-full mx-auto overflow-hidden border-4 border-azure-500">
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
                className="block w-full px-6 py-4 bg-azure-500 text-white text-center rounded-xl hover:bg-azure-600 transition-colors cursor-pointer"
              >
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </label>
            </div>
            {!step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                This step is optional - you can skip it
              </p>
            )}
          </div>
        );

      case 'experience':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <BriefcaseIcon className="w-8 h-8 text-azure-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {experiences.map((experience, index) => (
                <div key={experience.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">Experience {index + 1}</h3>
                    <button
                      onClick={() => removeExperience(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Job Title *"
                      value={experience.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Company *"
                      value={experience.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={experience.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        placeholder="Start Date *"
                        value={experience.start_date}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={experience.end_date}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                        disabled={experience.current}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={experience.current}
                        onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                        className="rounded border-gray-300 text-azure-600 focus:ring-azure-500"
                      />
                      <label htmlFor={`current-${index}`} className="text-sm text-gray-600">
                        I currently work here
                      </label>
                    </div>
                  </div>
                  
                  <textarea
                    placeholder="Description (optional)"
                    value={experience.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent resize-none"
                  />
                </div>
              ))}
              
              <button
                onClick={addExperience}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add Experience
              </button>
            </div>
            
            {step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Please add at least one work experience with title, company, and start date
              </p>
            )}
          </div>
        );

      case 'education':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="w-8 h-8 text-azure-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {educations.map((education, index) => (
                <div key={education.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">Education {index + 1}</h3>
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Degree *"
                      value={education.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Institution *"
                      value={education.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={education.field_of_study}
                      onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        placeholder="Start Date *"
                        value={education.start_date}
                        onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={education.end_date}
                        onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                        disabled={education.current}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`current-edu-${index}`}
                        checked={education.current}
                        onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                        className="rounded border-gray-300 text-azure-600 focus:ring-azure-500"
                      />
                      <label htmlFor={`current-edu-${index}`} className="text-sm text-gray-600">
                        I am currently studying here
                      </label>
                    </div>
                  </div>
                  
                  <textarea
                    placeholder="Description (optional)"
                    value={education.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent resize-none"
                  />
                </div>
              ))}
              
              <button
                onClick={addEducation}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add Education
              </button>
            </div>
            
            {step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Please add at least one education entry with degree, institution, and start date
              </p>
            )}
          </div>
        );

      case 'contact':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <HomeIcon className="w-8 h-8 text-azure-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-azure-500 focus:border-azure-500 text-lg transition-all duration-200"
                autoFocus
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-azure-500 focus:border-azure-500 text-lg transition-all duration-200"
              />
              <input
                type="url"
                placeholder="Website (optional)"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-azure-500 focus:border-azure-500 text-lg transition-all duration-200"
              />
            </div>
            
            {!step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                This step is optional - you can skip it
              </p>
            )}
          </div>
        );

      case 'certifications':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <DocumentTextIcon className="w-8 h-8 text-azure-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="NPI Number (US)"
                  value={formData.npi_number}
                  onChange={(e) => handleInputChange('npi_number', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="DEA Number (US)"
                  value={formData.dea_number}
                  onChange={(e) => handleInputChange('dea_number', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Current Position"
                  value={formData.current_position}
                  onChange={(e) => handleInputChange('current_position', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Current Institution"
                  value={formData.current_institution}
                  onChange={(e) => handleInputChange('current_institution', e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Years of Experience"
                  value={formData.years_of_experience}
                  onChange={(e) => handleInputChange('years_of_experience', parseInt(e.target.value) || 0)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {!step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                This step is optional - you can skip it
              </p>
            )}
          </div>
        );

      case 'skills':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <StarIcon className="w-8 h-8 text-azure-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <textarea
                placeholder="Enter your skills (comma-separated)"
                value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
                onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent resize-none"
              />
              <div className="flex flex-wrap gap-2">
                {Array.isArray(formData.skills) && formData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-azure-100 text-azure-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            {!step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                This step is optional - you can skip it
              </p>
            )}
          </div>
        );

      case 'languages':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <MapPinIcon className="w-8 h-8 text-azure-500 mr-3" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600 mt-2">{step.subtitle}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <textarea
                placeholder="Enter languages you speak (comma-separated)"
                value={Array.isArray(formData.languages) ? formData.languages.join(', ') : ''}
                onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent resize-none"
              />
              <div className="flex flex-wrap gap-2">
                {Array.isArray(formData.languages) && formData.languages.map((language, index) => (
                  <span key={index} className="px-3 py-1 bg-azure-100 text-azure-700 rounded-full text-sm">
                    {language}
                  </span>
                ))}
              </div>
            </div>
            
            {!step.required && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                This step is optional - you can skip it
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
            <div className="bg-azure-50 rounded-xl p-6">
              <h3 className="font-semibold text-azure-900 mb-4">Profile Completion: {getCompletionPercentage()}%</h3>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-azure-500 h-3 rounded-full transition-all duration-500"
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
            className="bg-azure-500 h-1 transition-all duration-300"
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
                        ? 'bg-azure-500 text-white hover:bg-azure-600'
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
