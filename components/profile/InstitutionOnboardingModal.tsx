'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { uploadToSupabaseStorage } from '@/lib/utils';
import { 
  BuildingOfficeIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface InstitutionOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ONBOARDING_STEPS = [
  {
    id: 'corporate_info',
    title: 'Corporate Profile',
    subtitle: 'Create Corporate Profile on Medprof for easy access by the Medical Professionals across globe. Only current employees are eligible to create a Corporate Page.',
    required: true
  },
  {
    id: 'company_info',
    title: 'Company Information',
    subtitle: 'Provide detailed information about your organization',
    required: true
  },
  {
    id: 'overview',
    title: 'Overview',
    subtitle: 'Create an overview of your organization',
    required: true
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Showcase your latest projects',
    required: false
  },
  {
    id: 'talent',
    title: 'Talent Requirements',
    subtitle: 'Post talent requirements and get the best talent to respond',
    required: false
  },
  {
    id: 'promotions',
    title: 'Promotions',
    subtitle: 'Upload promotions, campaigns, images, banners, videos',
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

  // Corporate Profile Data
  const [corporateData, setCorporateData] = useState({
    organization_name: '',
    organization_email: '',
    organization_head_name: '',
    organization_head_contact: '',
    employee_email: '',
    employee_name: '',
    employee_designation: '',
    authorized_representative: ''
  });

  // Company Info Data
  const [companyData, setCompanyData] = useState({
    company_url: '',
    year_of_establishment: '',
    partnered_with: '',
    presence_in: '',
    focus: 'pharmaceutical' as 'pharmaceutical' | 'hospital' | 'research' | 'academics'
  });

  // Overview Data
  const [overview, setOverview] = useState('');

  // Projects Data
  const [currentProjects, setCurrentProjects] = useState<any[]>([]);
  const [earlierProjects, setEarlierProjects] = useState<any[]>([]);

  // Talent Requirements Data
  const [talentRequirements, setTalentRequirements] = useState<any[]>([]);

  // Promotions Data
  const [promotions, setPromotions] = useState<any[]>([]);

  // Logo Upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      calculateCompletion();
    }
  }, [isOpen]);

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Corporate Info
    total += 8;
    completed += Object.values(corporateData).filter(v => v.trim() !== '').length;

    // Company Info
    total += 5;
    completed += Object.values(companyData).filter(v => v.trim() !== '').length;

    // Overview
    total += 1;
    if (overview.trim() !== '') completed += 1;

    // Projects (optional)
    if (currentProjects.length > 0 || earlierProjects.length > 0) completed += 1;

    // Talent (optional)
    if (talentRequirements.length > 0) completed += 1;

    // Promotions (optional)
    if (promotions.length > 0) completed += 1;

    setCompletionPercentage(Math.round((completed / total) * 100));
  };

  const handleNext = async () => {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      await handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleComplete = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Upload logo if selected
      let logoUrl = null;
      if (logoFile) {
        const filePath = `institution-logos/${user.id}_${Date.now()}.${logoFile.name.split('.').pop()}`;
        const { url, error } = await uploadToSupabaseStorage('logos', filePath, logoFile);
        if (error) {
          throw new Error(`Logo upload failed: ${error}`);
        }
        logoUrl = url;
      }

      // Create institution profile
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data: institution, error } = await supabase
        .from('institutions')
        .insert({
          name: corporateData.organization_name,
          type: 'pharmaceutical', // Default, can be updated later
          description: overview,
          website: companyData.company_url,
          email: corporateData.organization_email,
          phone: corporateData.organization_head_contact,
          logo_url: logoUrl,
          admin_user_id: user.id,
          
          // Corporate Profile Fields
          organization_email: corporateData.organization_email,
          organization_head_name: corporateData.organization_head_name,
          organization_head_contact: corporateData.organization_head_contact,
          employee_email: corporateData.employee_email,
          employee_name: corporateData.employee_name,
          employee_designation: corporateData.employee_designation,
          authorized_representative: corporateData.authorized_representative,
          
          // Company Information
          company_url: companyData.company_url,
          year_of_establishment: companyData.year_of_establishment ? parseInt(companyData.year_of_establishment) : null,
          partnered_with: companyData.partnered_with ? [companyData.partnered_with] : null,
          presence_in: companyData.presence_in ? [companyData.presence_in] : null,
          focus: companyData.focus,
          
          // Overview
          overview: overview,
          
          // Verification Status
          verification_status: 'pending',
          email_verified: false,
          confirmation_email_sent: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Institution profile created successfully!');
      onComplete();
    } catch (error) {
      console.error('Error creating institution profile:', error);
      toast.error('Failed to create institution profile');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step.id) {
      case 'corporate_info':
        return corporateData.organization_name.trim() !== '' &&
               corporateData.organization_email.trim() !== '' &&
               corporateData.organization_head_name.trim() !== '' &&
               corporateData.employee_email.trim() !== '' &&
               corporateData.employee_name.trim() !== '' &&
               corporateData.employee_designation.trim() !== '' &&
               corporateData.authorized_representative.trim() !== '';
      
      case 'company_info':
        return companyData.company_url.trim() !== '' &&
               companyData.year_of_establishment.trim() !== '';
      
      case 'overview':
        return overview.trim() !== '';
      
      default:
        return true;
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStep = () => {
    const step = ONBOARDING_STEPS[currentStep];

    switch (step.id) {
      case 'corporate_info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <BuildingOfficeIcon className="w-12 h-12 text-azure-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{step.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={corporateData.organization_name}
                  onChange={(e) => setCorporateData(prev => ({ ...prev, organization_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Email ID *
                </label>
                <input
                  type="email"
                  value={corporateData.organization_email}
                  onChange={(e) => setCorporateData(prev => ({ ...prev, organization_email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="org@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Head / CEO Name *
                </label>
                <input
                  type="text"
                  value={corporateData.organization_head_name}
                  onChange={(e) => setCorporateData(prev => ({ ...prev, organization_head_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="CEO Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Head Contact # (Not for public display) *
                </label>
                <input
                  type="tel"
                  value={corporateData.organization_head_contact}
                  onChange={(e) => setCorporateData(prev => ({ ...prev, organization_head_contact: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Email ID *
                </label>
                <input
                  type="email"
                  value={corporateData.employee_email}
                  onChange={(e) => setCorporateData(prev => ({ ...prev, employee_email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="employee@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Name *
                </label>
                <input
                  type="text"
                  value={corporateData.employee_name}
                  onChange={(e) => setCorporateData(prev => ({ ...prev, employee_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="Employee Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Designation *
                </label>
                <input
                  type="text"
                  value={corporateData.employee_designation}
                  onChange={(e) => setCorporateData(prev => ({ ...prev, employee_designation: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="e.g., HR Manager"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  We authorize [Name] as the official representative *
                </label>
                <input
                  type="text"
                  value={corporateData.authorized_representative}
                  onChange={(e) => setCorporateData(prev => ({ ...prev, authorized_representative: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="Authorized Representative Name"
                />
              </div>
            </div>
          </div>
        );

      case 'company_info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company URL *
                </label>
                <input
                  type="url"
                  value={companyData.company_url}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, company_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Establishment *
                </label>
                <input
                  type="number"
                  value={companyData.year_of_establishment}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, year_of_establishment: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partnered with (Link to 3D Association)
                </label>
                <input
                  type="text"
                  value={companyData.partnered_with}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, partnered_with: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="Partner organizations"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presence in (Countries)
                </label>
                <input
                  type="text"
                  value={companyData.presence_in}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, presence_in: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                  placeholder="e.g., USA, UK, India"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus *
                </label>
                <select
                  value={companyData.focus}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, focus: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                >
                  <option value="pharmaceutical">Pharmaceutical</option>
                  <option value="hospital">Hospital</option>
                  <option value="research">Research</option>
                  <option value="academics">Academics</option>
                </select>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Logo Upload
              </label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <PhotoIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        );

      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.subtitle}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overview *
              </label>
              <textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azure-500 focus:border-transparent"
                placeholder="Create an overview of your organization..."
              />
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.subtitle}</p>
            </div>

            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Projects section will be available after profile creation</p>
            </div>
          </div>
        );

      case 'talent':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.subtitle}</p>
            </div>

            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Talent requirements will be available after profile creation</p>
            </div>
          </div>
        );

      case 'promotions':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.subtitle}</p>
            </div>

            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Promotions will be available after profile creation</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Institution Profile Setup
              </h1>
              <p className="text-sm text-gray-500">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-azure-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-500">{completionPercentage}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="flex items-center space-x-2 px-6 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete Setup' : 'Next'}</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
