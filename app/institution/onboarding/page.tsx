'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  BuildingOfficeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowRightIcon,
  ChevronLeftIcon, 
  ChevronRightIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  InformationCircleIcon,
  StarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getInstitutionByUserId } from '@/lib/queries';

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

const EMPLOYEE_COUNT_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to <span class="mulish-semibold text-[#007fff]">kendraa</span>',
    subtitle: 'Let\'s set up your institution profile to connect with healthcare professionals',
    type: 'welcome',
    required: false
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    subtitle: 'Tell us about your institution',
    type: 'basic-info',
    required: true
  },
  {
    id: 'institution-type',
    title: 'Institution Type',
    subtitle: 'What type of healthcare institution are you?',
    type: 'institution-type',
    required: true
  },
  {
    id: 'description',
    title: 'About Your Institution',
    subtitle: 'Describe your mission, services, and what makes you unique',
    type: 'description',
    required: true
  },
  {
    id: 'contact',
    title: 'Contact Information',
    subtitle: 'How can professionals reach your institution?',
    type: 'contact',
    required: true
  },
  {
    id: 'completion',
    title: 'You\'re All Set!',
    subtitle: 'Your institution profile is ready to connect with healthcare professionals',
    type: 'completion',
    required: false
  }
];

export default function InstitutionOnboardingPage() {
  const { user, profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    type: '',
    establishedYear: '',
    size: '',
    location: '',
    
    // Description
    shortDescription: '',
    detailedDescription: '',
    
    // Contact Information
    website: '',
    email: '',
    phone: '',
    
    // Branding
    logoUrl: '',
    bannerUrl: '',
    themeColor: '#007fff',
    
    // Additional
    accreditation: '',
    specialties: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [existingInstitution, setExistingInstitution] = useState<any>(null);

  const router = useRouter();

  // Map database size values back to form values
  const mapSizeFromDatabase = (dbSize: string): string => {
    switch (dbSize) {
      case 'small': return '1-10'; // Default to first small option
      case 'medium': return '51-200'; // Default to first medium option
      case 'large': return '501-1000';
      case 'enterprise': return '1000+';
      default: return '';
    }
  };

  // Load existing data
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Load existing institution data
        const institution = await getInstitutionByUserId(user.id);
        if (institution) {
          setExistingInstitution(institution);
          setFormData({
            name: institution.name || '',
            type: institution.type || '',
            establishedYear: institution.established_year?.toString() || '',
            size: mapSizeFromDatabase(institution.size || ''),
            location: institution.location || '',
            shortDescription: institution.short_description || '',
            detailedDescription: institution.description || '',
            website: institution.website || '',
            email: institution.email || '',
            phone: institution.phone || '',
            logoUrl: institution.logo_url || '',
            bannerUrl: institution.banner_url || '',
            themeColor: institution.theme_color || '#007fff',
            accreditation: institution.accreditation?.join(', ') || '',
            specialties: institution.specialties?.join(', ') || ''
          });
          
        }
      } catch (error) {
        console.error('Error loading institution data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExistingData();
  }, [user?.id]);

  // Redirect if not logged in or not an institution user
  useEffect(() => {
      if (!user) {
        router.push('/signin');
        return;
      }

      if (profile && (profile.user_type !== 'institution' && profile.profile_type !== 'institution')) {
        router.push('/onboarding');
        return;
      }

      // If onboarding already completed, go to institution feed
      if (profile?.onboarding_completed) {
        router.push('/institution/feed');
        return;
      }
  }, [user, profile, router]);

  const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
          ...prev,
      [field]: value
    }));
  };


  const saveInstitutionData = async (markCompleted = false) => {
    if (!user?.id || !supabase) {
      console.error('Missing user or supabase client:', { user: !!user, supabase: !!supabase });
      return;
    }

    try {
      setUploading(true);
      console.log('Saving institution data:', { formData, markCompleted });

      // Use existing URLs or empty strings
      let logoUrl = formData.logoUrl || '';
      let bannerUrl = formData.bannerUrl || '';

      // Map institution type to database format
      const mapInstitutionType = (formType: string): string => {
        switch (formType) {
          case 'Hospital': return 'hospital';
          case 'Medical Center': return 'hospital';
          case 'Clinic': return 'clinic';
          case 'Research Institute': return 'research_center';
          case 'Medical School/University': return 'university';
          case 'Pharmaceutical Company': return 'pharmaceutical';
          case 'Medical Device Company': return 'medical_device';
          case 'Healthcare Technology': return 'medical_device';
          case 'Government Health Agency': return 'other';
          case 'Non-Profit Health Organization': return 'other';
          case 'Other': return 'other';
          default: return 'hospital';
        }
      };

      // Map organization size to database format
      const mapOrganizationSize = (formSize: string): string => {
        switch (formSize) {
          case '1-10': return 'small';
          case '11-50': return 'small';
          case '51-200': return 'medium';
          case '201-500': return 'medium';
          case '501-1000': return 'large';
          case '1000+': return 'enterprise';
          default: return 'small';
        }
      };

      // Prepare institution data
      const institutionData = {
        name: formData.name,
        type: mapInstitutionType(formData.type),
        description: formData.detailedDescription,
        location: formData.location,
        website: formData.website,
        phone: formData.phone,
        email: formData.email,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        established_year: formData.establishedYear ? parseInt(formData.establishedYear, 10) : null,
        size: mapOrganizationSize(formData.size),
        short_description: formData.detailedDescription.substring(0, 200), // Use first 200 chars of detailed description as short description
        theme_color: formData.themeColor,
        accreditation: formData.accreditation ? formData.accreditation.split(',').map(a => a.trim()) : [],
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
        verified: false,
        updated_at: new Date().toISOString()
      };

      // Try to save to institutions table first
      try {
        if (existingInstitution) {
          // Update existing institution
          console.log('Updating existing institution:', existingInstitution.id);
          const { error: updateError } = await supabase
            .from('institutions')
            .update(institutionData)
            .eq('id', existingInstitution.id);
          
          if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
          }
          console.log('Institution updated successfully');
        } else {
          // Create new institution
          console.log('Creating new institution for user:', user.id);
          const { error: insertError } = await supabase
            .from('institutions')
            .insert({
              ...institutionData,
              admin_user_id: user.id
            });
          
          if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
          }
          console.log('Institution created successfully');
          
          // Add a small delay to ensure the database is updated
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (institutionError) {
        console.warn('Failed to save to institutions table, trying profiles table:', institutionError);
        
        // Fallback: save basic info to profiles table
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.name,
            location: formData.location,
            bio: formData.detailedDescription,
            phone: formData.phone,
            email: formData.email,
            website: formData.website,
            avatar_url: logoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (profileUpdateError) {
          console.error('Profile update error:', profileUpdateError);
          throw profileUpdateError;
        }
        console.log('Saved to profiles table as fallback');
      }

      // Update profile if needed
      if (markCompleted) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
            onboarding_completed: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

        if (profileError) throw profileError;

        await updateProfile({ onboarding_completed: true });
      }

      // Only show success toast if not auto-saving (when markCompleted is false, it's auto-save)
      if (markCompleted) {
        toast.success('Institution data saved successfully!');
      }
      console.log('Institution data saved successfully');
    } catch (error: any) {
      console.error('Error saving institution data:', error);
      toast.error('Failed to save institution data');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    try {
      console.log('handleNext called, current step:', currentStep);
      console.log('Form data:', formData);
      console.log('Can proceed:', canProceed());
      
      // Always try to save data, even if validation doesn't pass
      // This allows partial saves for non-required fields
      await saveInstitutionData(false);
      
      const nextStep = Math.min(currentStep + 1, ONBOARDING_STEPS.length - 1);
      console.log('Moving to next step:', nextStep);
      setCurrentStep(nextStep);
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    if (!step.required) return true;
    
    switch (step.type) {
      case 'basic-info':
        return !!(formData.name && formData.location);
      case 'institution-type':
        return !!(formData.type && formData.establishedYear && formData.size);
      case 'description':
        return !!(formData.detailedDescription);
      case 'contact':
        return !!(formData.email && formData.phone);
      case 'branding':
        return true; // Skip validation for now since we removed image upload
      default:
        return true;
    }
  };

  const renderStep = () => {
    const step = ONBOARDING_STEPS[currentStep];

    switch (step.type) {
      case 'welcome':
        return (
          <div className="text-center max-w-4xl mx-auto px-6">
            <div className="mb-8">
              <Image 
                src="/Kendraa Logo (5).png" 
                alt="Kendraa Logo" 
                width={12}
                height={12}
                className="h-2 md:h-2.5 lg:h-3 w-auto mx-auto drop-shadow-lg"
              />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight" 
                  dangerouslySetInnerHTML={{ __html: step.title }}>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {step.subtitle}
              </p>
            </div>
            
          </div>
        );

      case 'basic-info':
        return (
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-[#007fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BuildingOfficeIcon className="w-8 h-8 text-white" />
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
          <div className="space-y-6">
            <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Institution Name *
              </label>
              <input
                type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., City General Hospital"
                    className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
              />
            </div>

            <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Location *
              </label>
              <input
                type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., New York, NY, USA"
                    className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                  />
            </div>
              </div>
            </motion.div>
          </div>
        );

      case 'institution-type':
        return (
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 bg-[#007fff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">{step.title}</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">{step.subtitle}</p>
            </motion.div>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white border-2 border-[#007fff]/10 rounded-2xl p-6 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
              >
          <div className="space-y-6">
            <div>
                    <label className="block text-sm font-semibold text-[#007fff] mb-3">
                      Institution Type *
              </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {INSTITUTION_TYPES.map((type) => (
                  <button
                          key={type}
                          onClick={() => handleInputChange('type', type)}
                          className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                            formData.type === type
                              ? 'border-[#007fff] bg-[#007fff]/10 text-[#007fff]'
                              : 'border-gray-200 hover:border-[#007fff]/40 hover:bg-[#007fff]/5'
                          }`}
                        >
                          <span className="font-medium">{type}</span>
                  </button>
                ))}
              </div>
            </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                      <label className="block text-sm font-semibold text-[#007fff] mb-2">
                        Year Established *
              </label>
              <input
                type="number"
                        value={formData.establishedYear}
                        onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                placeholder="e.g., 1995"
                min="1800"
                max={new Date().getFullYear()}
                        className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
              />
            </div>

            <div>
                      <label className="block text-sm font-semibold text-[#007fff] mb-3">
                        Organization Size *
              </label>
                      <div className="grid grid-cols-2 gap-3">
                        {EMPLOYEE_COUNT_OPTIONS.map((size) => (
                          <button
                            key={size}
                            onClick={() => handleInputChange('size', size)}
                            className={`p-3 text-center border-2 rounded-lg transition-all duration-200 ${
                              formData.size === size
                                ? 'border-[#007fff] bg-[#007fff]/10 text-[#007fff]'
                                : 'border-gray-200 hover:border-[#007fff]/40 hover:bg-[#007fff]/5'
                            }`}
                          >
                            <span className="text-sm font-medium">{size}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 'description':
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
          <div className="space-y-6">

            <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Detailed Description *
              </label>
                  <textarea
                    value={formData.detailedDescription}
                    onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                    placeholder="Describe your mission, services, specialties, and what makes your institution unique..."
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40 resize-none"
                  />
                </div>

            <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Specialties & Services
              </label>
                <input
                    type="text"
                    value={formData.specialties}
                    onChange={(e) => handleInputChange('specialties', e.target.value)}
                    placeholder="e.g., Cardiology, Oncology, Emergency Medicine (comma-separated)"
                    className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Accreditations
                  </label>
                <input
                  type="text"
                    value={formData.accreditation}
                    onChange={(e) => handleInputChange('accreditation', e.target.value)}
                    placeholder="e.g., NABH, ISO, NABL (comma-separated)"
                    className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                />
              </div>
            </div>
            </motion.div>
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
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">{step.subtitle}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-[#007fff]/10 rounded-2xl p-6 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
            >
          <div className="space-y-6">
            <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Email Address *
              </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@yourinstitution.com"
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
                    />
            </div>
                </div>

            <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Phone Number *
              </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
              />
            </div>
                </div>

            <div>
                  <label className="block text-sm font-semibold text-[#007fff] mb-2">
                    Website
              </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.yourinstitution.com"
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 bg-white transition-all duration-200 hover:border-[#007fff]/40"
              />
            </div>
                </div>
              </div>
            </motion.div>
          </div>
        );


      case 'completion':
        return (
          <div className="text-center max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-white" />
            </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">You&apos;re All Set!</h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {step.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-[#007fff]/10 rounded-2xl p-8 max-w-2xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-[#007fff] mb-4">What&apos;s Next?</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#007fff] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
            </div>
                  <p className="text-gray-700">Start posting updates about your institution</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#007fff] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-700">Connect with healthcare professionals in your field</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#007fff] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-700">Post job openings and events to attract talent</p>
                </div>
              </div>
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
          <div className="w-8 h-8 border-4 border-[#007fff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your institution profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#007fff]/5 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-[#007fff]/10 hover:text-[#007fff]'
                }`}
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Institution Onboarding</h1>
                <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1">
            <div 
            className="bg-[#007fff] h-1 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6">
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
              <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 md:p-8">
                {renderStep()}
                
                {/* Navigation Buttons - Inside Container */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-3">
                    <div className="flex justify-center space-x-3 w-full">
                      {currentStep < ONBOARDING_STEPS.length - 1 ? (
                        <>
                          <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                              currentStep === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                            }`}
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleNext}
                            disabled={!canProceed() || loading || uploading}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                              canProceed() && !loading && !uploading
                                ? 'bg-[#007fff] text-white hover:bg-[#007fff]/90 hover:shadow-xl transform hover:scale-105'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {loading || uploading ? (
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
                          onClick={async () => {
                            setLoading(true);
                            try {
                              await saveInstitutionData(true);
                              toast.success('Welcome to Kendraa!');
                              router.push('/institution/feed');
                            } catch (error) {
                              toast.error('Failed to complete onboarding.');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading || uploading}
                          className="px-8 py-3 bg-[#007fff] text-white rounded-xl font-semibold hover:bg-[#007fff]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {loading || uploading ? 'Completing...' : 'Get Started'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}