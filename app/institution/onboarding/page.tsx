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
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
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

// Map institution type from UI to database-compatible values
const mapInstitutionType = (type: string): string => {
  switch (type) {
    case 'Hospital':
      return 'hospital';
    case 'Medical Center':
      return 'hospital';
    case 'Clinic':
      return 'clinic';
    case 'Research Institute':
      return 'research_center';
    case 'Medical School/University':
      return 'university';
    case 'Pharmaceutical Company':
      return 'pharmaceutical';
    case 'Medical Device Company':
      return 'medical_device';
    case 'Healthcare Technology':
      return 'other';
    case 'Government Health Agency':
      return 'other';
    case 'Non-Profit Health Organization':
      return 'other';
    case 'Other':
      return 'other';
    default:
      return 'hospital';
  }
};

// Map employee count from UI to database-compatible size values
const mapEmployeeCountToSize = (employeeCount: string): string => {
  switch (employeeCount) {
    case '0 - 10':
      return 'small';
    case '10 - 100':
      return 'small';
    case '100 - 1000':
      return 'medium';
    case '1000 - 10000':
      return 'large';
    case '10000+':
      return 'enterprise';
    default:
      return 'medium';
  }
};

// Map database type values back to UI values for prefill
const mapDatabaseTypeToUI = (dbType: string): string => {
  switch (dbType) {
    case 'hospital':
      return 'Hospital';
    case 'clinic':
      return 'Clinic';
    case 'research_center':
      return 'Research Institute';
    case 'university':
      return 'Medical School/University';
    case 'pharmaceutical':
      return 'Pharmaceutical Company';
    case 'medical_device':
      return 'Medical Device Company';
    default:
      return 'Other';
  }
};

// Map database size values back to UI values for prefill
const mapDatabaseSizeToUI = (dbSize: string): string => {
  switch (dbSize) {
    case 'small':
      return '10 - 100'; // Default to a reasonable small size
    case 'medium':
      return '100 - 1000';
    case 'large':
      return '1000 - 10000';
    case 'enterprise':
      return '10000+';
    default:
      return '100 - 1000'; // Default to medium
  }
};

const ONBOARDING_STEPS = [
  {
    id: 'basic_info',
    title: 'Basic Information',
    subtitle: 'Tell us about your healthcare organization',
    type: 'basic_info',
    required: true
  },
  {
    id: 'institution_details',
    title: 'Institution / Organization Details',
    subtitle: 'Provide detailed information about your institution',
    type: 'institution_details',
    required: true
  },
  {
    id: 'branding',
    title: 'Branding & Visual Identity',
    subtitle: 'Upload your logo and customize your visual identity',
    type: 'branding',
    required: true
  },
  {
    id: 'about_institution',
    title: 'About the Institution / Organization',
    subtitle: 'Share your mission, services, and contact information',
    type: 'about_institution',
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
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    institutionName: '',
    shortTagline: '',
    
    // Institution Details
    institutionType: '',
    establishmentYear: '',
    accreditation: '',
    
    // Branding
    logoUrl: '',
    bannerUrl: '',
    themeColor: '#007fff',
    
    // About Institution
    shortDescription: '',
    detailedDescription: '',
    website: '',
    socialMediaLinks: '',
    headquarters: '',
    employeeCount: '',
    contactEmail: '',
    contactPhone: ''
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
          institutionName: profile.full_name || prev.institutionName || '',
          shortDescription: profile.bio || prev.shortDescription || '',
          headquarters: profile.location || prev.headquarters || '',
          website: profile.website || prev.website || '',
          contactEmail: profile.email || prev.contactEmail || '',
        }));
      }

      // If institution already exists for this user, load existing data
      try {
        const existing = await getInstitutionByAdminId(user.id);
        if (existing) {
          // If onboarding is already completed, redirect to profile
          if (profile?.onboarding_completed) {
            router.push('/institution/profile');
            return;
          }
          
          // Load existing institution data to continue onboarding
          setFormData(prev => ({
            ...prev,
            institutionName: existing.name || prev.institutionName || '',
            shortTagline: (existing as any).short_tagline || prev.shortTagline || '',
            institutionType: existing.type ? mapDatabaseTypeToUI(existing.type) : prev.institutionType || '',
            establishmentYear: existing.established_year?.toString() || prev.establishmentYear || '',
            accreditation: Array.isArray(existing.accreditation) ? existing.accreditation.join(', ') : (existing.accreditation || prev.accreditation || ''),
            logoUrl: existing.logo_url || prev.logoUrl || '',
            bannerUrl: existing.banner_url || prev.bannerUrl || '',
            themeColor: (existing as any).theme_color || prev.themeColor || '#007fff',
            shortDescription: (existing as any).short_description || prev.shortDescription || '',
            detailedDescription: existing.description || prev.detailedDescription || '',
            website: existing.website || prev.website || '',
            socialMediaLinks: (existing as any).social_media_links ? JSON.stringify((existing as any).social_media_links) : prev.socialMediaLinks || '',
            headquarters: existing.location || prev.headquarters || '',
            employeeCount: existing.size ? mapDatabaseSizeToUI(existing.size) : prev.employeeCount || '',
            contactEmail: existing.email || prev.contactEmail || '',
            contactPhone: existing.phone || prev.contactPhone || '',
          }));
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
      case 'basic_info':
        return formData.institutionName.trim() !== '' && formData.shortTagline.trim() !== '';
      case 'institution_details':
        return formData.institutionType !== '' && formData.establishmentYear !== '';
      case 'branding':
        return (logoFile !== null || formData.logoUrl.trim() !== '') && (bannerFile !== null || formData.bannerUrl.trim() !== '');
      case 'about_institution':
        return formData.shortDescription.trim() !== '' && formData.detailedDescription.trim() !== '' && formData.headquarters.trim() !== '';
      default:
        return false;
    }
  };

  const uploadFile = async (file: File, bucketName: string) => {
    if (!supabase || !user?.id) {
      toast.error('Supabase client or user not available.');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      return data.publicUrl;

    } catch (error: any) {
      console.error(`Error uploading file to ${bucketName}:`, error);
      toast.error(`Error uploading ${bucketName.slice(0, -1)}: ${error.message}`);
      return null;
    }
  };

  const savePartialData = async () => {
    if (!user?.id || !supabase) return;

    setSaving(true);
    let currentLogoUrl = formData.logoUrl;
    let currentBannerUrl = formData.bannerUrl;
    
    try {
      const categorySlug = mapInstitutionType(formData.institutionType);

      // Upload logo if a new file is selected
      if (logoFile) {
        setUploadingLogo(true);
        const publicUrl = await uploadFile(logoFile, 'avatars');
        if (publicUrl) {
          currentLogoUrl = publicUrl;
          setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
        }
        setUploadingLogo(false);
      }

      // Upload banner if a new file is selected
      if (bannerFile) {
        setUploadingBanner(true);
        const publicUrl = await uploadFile(bannerFile, 'banners');
        if (publicUrl) {
          currentBannerUrl = publicUrl;
          setFormData(prev => ({ ...prev, bannerUrl: publicUrl }));
        }
        setUploadingBanner(false);
      }

      // Build partial institution payload
      const institutionPayload: any = {
        name: formData.institutionName || null,
        description: formData.detailedDescription || null,
        type: categorySlug || 'hospital',
        location: formData.headquarters || null,
        website: formData.website || null,
        established_year: formData.establishmentYear ? parseInt(formData.establishmentYear) : null,
        size: formData.employeeCount ? mapEmployeeCountToSize(formData.employeeCount) : null,
        admin_user_id: user.id,
        email: formData.contactEmail || user.email || null,
        verified: false,
        // Additional fields
        short_tagline: formData.shortTagline || null,
        accreditation: formData.accreditation?.trim() ? formData.accreditation.trim().split(',').map(item => item.trim()).filter(item => item.length > 0) : null,
        logo_url: currentLogoUrl || null,
        banner_url: currentBannerUrl || null,
        theme_color: formData.themeColor || '#007fff',
        short_description: formData.shortDescription || null,
        social_media_links: formData.socialMediaLinks ? (() => {
          try {
            return JSON.parse(formData.socialMediaLinks);
          } catch {
            return null;
          }
        })() : null,
        phone: formData.contactPhone || null
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
        // Update existing institution
        const { error: updateError } = await supabase
          .from('institutions')
          .update(institutionPayload)
          .eq('id', existingId);
        
        if (updateError) {
          console.error('Error updating institution:', updateError);
          // Don't show error to user for partial saves
        }
      } else {
        // Create new institution
        const { error: insertError } = await supabase
          .from('institutions')
          .insert(institutionPayload);
        
        if (insertError) {
          console.error('Error creating institution:', insertError);
          // Don't show error to user for partial saves
        }
      }

      // Update user profile with basic fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: formData.institutionName || null,
          bio: formData.shortDescription || null,
          location: formData.headquarters || null,
          website: formData.website || null,
          phone: formData.contactPhone || null
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't show error to user for partial saves
      }
    } catch (error) {
      console.error('Error saving partial data:', error);
      // Don't show error to user for partial saves
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    // Save data before proceeding to next step
    await savePartialData();
    
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
    let currentLogoUrl = formData.logoUrl;
    let currentBannerUrl = formData.bannerUrl;
    
    try {
      const categorySlug = mapInstitutionType(formData.institutionType);

      // Upload logo if a new file is selected
      if (logoFile) {
        setUploadingLogo(true);
        const publicUrl = await uploadFile(logoFile, 'avatars');
        if (publicUrl) {
          currentLogoUrl = publicUrl;
          setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
        }
        setUploadingLogo(false);
      }

      // Upload banner if a new file is selected
      if (bannerFile) {
        setUploadingBanner(true);
        const publicUrl = await uploadFile(bannerFile, 'banners');
        if (publicUrl) {
          currentBannerUrl = publicUrl;
          setFormData(prev => ({ ...prev, bannerUrl: publicUrl }));
        }
        setUploadingBanner(false);
      }

      // Build institution payload
      const institutionPayload: any = {
        name: formData.institutionName,
        description: formData.detailedDescription,
        type: categorySlug || 'hospital',
        location: formData.headquarters || null,
        website: formData.website || null,
        established_year: formData.establishmentYear ? parseInt(formData.establishmentYear) : null,
        size: formData.employeeCount ? mapEmployeeCountToSize(formData.employeeCount) : null,
        admin_user_id: user.id,
        email: formData.contactEmail || user.email || null,
        verified: false,
        // Additional fields
        short_tagline: formData.shortTagline,
        accreditation: formData.accreditation?.trim() ? formData.accreditation.trim().split(',').map(item => item.trim()).filter(item => item.length > 0) : null,
        logo_url: currentLogoUrl,
        banner_url: currentBannerUrl,
        theme_color: formData.themeColor,
        short_description: formData.shortDescription,
        social_media_links: formData.socialMediaLinks ? (() => {
          try {
            return JSON.parse(formData.socialMediaLinks);
          } catch {
            return null;
          }
        })() : null,
        phone: formData.contactPhone
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
          bio: formData.shortDescription,
          location: formData.headquarters,
          website: formData.website,
          phone: formData.contactPhone
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
      case 'basic_info':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution Name (Official Legal Name) *
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
                Short Tagline *
              </label>
              <input
                type="text"
                value={formData.shortTagline}
                onChange={(e) => setFormData(prev => ({ ...prev, shortTagline: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                placeholder="One line about your institution"
                maxLength={100}
              />
              <p className="text-sm text-gray-500 mt-1">
                A brief, compelling description of your institution (max 100 characters)
              </p>
            </div>
          </div>
        );

      case 'institution_details':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type *
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accreditation
              </label>
              <input
                type="text"
                value={formData.accreditation}
                onChange={(e) => setFormData(prev => ({ ...prev, accreditation: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                placeholder="e.g., NABH, ISO, NABL, etc."
              />
              <p className="text-sm text-gray-500 mt-1">
                List any accreditations or certifications your institution holds
              </p>
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Logo (Square, High-Res) *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    setLogoFile(file);
                    setFormData(prev => ({ ...prev, logoUrl: URL.createObjectURL(file) }));
                  } else {
                    setLogoFile(null);
                    setFormData(prev => ({ ...prev, logoUrl: '' }));
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#007fff]/10 file:text-[#007fff] hover:file:bg-[#007fff]/20"
              />
              {uploadingLogo && <p className="text-sm text-gray-500 mt-2">Uploading logo...</p>}
              {(formData.logoUrl && !uploadingLogo) && (
                <div className="mt-4 w-24 h-24 relative rounded-full overflow-hidden border border-gray-200">
                  <Image src={formData.logoUrl} alt="Logo Preview" fill className="object-cover" />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Upload a square, high-resolution logo for your institution
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Cover Banner (Wide, Professional Image) *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    setBannerFile(file);
                    setFormData(prev => ({ ...prev, bannerUrl: URL.createObjectURL(file) }));
                  } else {
                    setBannerFile(null);
                    setFormData(prev => ({ ...prev, bannerUrl: '' }));
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#007fff]/10 file:text-[#007fff] hover:file:bg-[#007fff]/20"
              />
              {uploadingBanner && <p className="text-sm text-gray-500 mt-2">Uploading banner...</p>}
              {(formData.bannerUrl && !uploadingBanner) && (
                <div className="mt-4 w-full h-32 relative rounded-lg overflow-hidden border border-gray-200">
                  <Image src={formData.bannerUrl} alt="Banner Preview" fill className="object-cover" />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Upload a wide, professional banner image for your profile
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Theme Color (Optional)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.themeColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                  className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.themeColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                  placeholder="#007fff"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Choose a theme color for your institution&apos;s page styling
              </p>
            </div>
          </div>
        );

      case 'about_institution':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description (Max 200 Characters) *
              </label>
              <textarea
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent h-20 resize-none"
                placeholder="Brief description shown in search results..."
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.shortDescription.length}/200 characters - This will be shown in search results
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed &quot;About Us&quot; (Mission, Services, Specialties) *
              </label>
              <textarea
                value={formData.detailedDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, detailedDescription: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent h-32 resize-none"
                placeholder="Describe your mission, services, specialties, and what makes your institution unique..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                placeholder="https://www.yourinstitution.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Links
              </label>
              <textarea
                value={formData.socialMediaLinks}
                onChange={(e) => setFormData(prev => ({ ...prev, socialMediaLinks: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent h-20 resize-none"
                placeholder="LinkedIn: https://linkedin.com/company/yourinstitution&#10;Twitter: https://twitter.com/yourinstitution"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headquarters *
              </label>
              <input
                type="text"
                value={formData.headquarters}
                onChange={(e) => setFormData(prev => ({ ...prev, headquarters: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                placeholder="e.g., New York, NY, USA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Number of Employees
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                  placeholder="contact@yourinstitution.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff] focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
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
                disabled={(!isStepCompleted(currentStep) && !isLastStep) || saving}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  (!isStepCompleted(currentStep) && !isLastStep) || saving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#007fff] text-white hover:bg-[#007fff]/90'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {isLastStep ? 'Complete Setup' : 'Next'}
                    {!isLastStep && <ChevronRightIcon className="w-5 h-5" />}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}