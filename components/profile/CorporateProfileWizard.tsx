'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  BuildingOffice2Icon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  GlobeAltIcon,
  CalendarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BeakerIcon,
  HeartIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { createInstitution } from '@/lib/queries';
import type { Institution } from '@/types/database.types';

interface CorporateProfileData {
  // Step 1: Organization Details
  organizationName: string;
  organizationEmail: string;
  ceoName: string;
  employeeEmail: string;
  employeeName: string;
  employeeDesignation: string;
  ceoContact: string;
  
  // Step 2: Company Information
  companyUrl: string;
  yearEstablished: string;
  partneredWith: string;
  presenceIn: string[];
  focus: 'pharmaceutical' | 'hospital' | 'research' | 'academics' | 'medical_device' | 'healthcare_tech';
  
  // Step 3: Overview
  overview: string;
  
  // Step 4: Projects
  projects: Array<{
    name: string;
    description: string;
    videoLink?: string;
    analytics: string;
    marketingStrategy: string;
    branding: string;
    revenueGeneration: string;
  }>;
  
  // Step 5: Logo
  logoUrl: string;
}

const FOCUS_OPTIONS = [
  { value: 'pharmaceutical', label: 'Pharmaceutical', icon: BeakerIcon },
  { value: 'hospital', label: 'Hospital & Healthcare', icon: HeartIcon },
  { value: 'research', label: 'Medical Research', icon: AcademicCapIcon },
  { value: 'academics', label: 'Medical Academics', icon: UserGroupIcon },
  { value: 'medical_device', label: 'Medical Devices', icon: BuildingStorefrontIcon },
  { value: 'healthcare_tech', label: 'Healthcare Technology', icon: GlobeAltIcon },
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Japan', 'India', 'China', 'Brazil', 'South Africa', 'Singapore', 'Switzerland',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Italy', 'Spain', 'Mexico'
];

export default function CorporateProfileWizard() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<CorporateProfileData>({
    organizationName: '',
    organizationEmail: '',
    ceoName: '',
    employeeEmail: '',
    employeeName: '',
    employeeDesignation: '',
    ceoContact: '',
    companyUrl: '',
    yearEstablished: '',
    partneredWith: '',
    presenceIn: [],
    focus: 'pharmaceutical',
    overview: '',
    projects: [],
    logoUrl: ''
  });

  const updateProfileData = (field: keyof CorporateProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.organizationName && profileData.organizationEmail && 
                 profileData.ceoName && profileData.employeeEmail && 
                 profileData.employeeName && profileData.employeeDesignation);
      case 2:
        return !!(profileData.companyUrl && profileData.yearEstablished && 
                 profileData.focus && profileData.presenceIn.length > 0);
      case 3:
        return !!profileData.overview.trim();
      case 4:
        return profileData.projects.length > 0;
      case 5:
        return true; // Logo is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Please log in to create a corporate profile');
      return;
    }

    setIsSubmitting(true);
    try {
      const institutionData = {
        name: profileData.organizationName,
        email: profileData.organizationEmail,
        ceo_name: profileData.ceoName,
        ceo_contact: profileData.ceoContact,
        admin_user_id: user.id,
        admin_name: profileData.employeeName,
        admin_designation: profileData.employeeDesignation,
        admin_email: profileData.employeeEmail,
        website_url: profileData.companyUrl,
        year_established: parseInt(profileData.yearEstablished),
        partnered_with: profileData.partneredWith,
        presence_in: profileData.presenceIn,
        focus_area: profileData.focus,
        overview: profileData.overview,
        projects: profileData.projects,
        logo_url: profileData.logoUrl,
        type: 'pharmaceutical' as const,
        // Add missing required properties
        description: profileData.overview || null,
        location: profileData.presenceIn?.[0] || null,
        phone: profileData.ceoContact || null,
        website: profileData.companyUrl || null,
        banner_url: null,
        specialties: profileData.focus ? [profileData.focus] : null,
        license_number: null,
        accreditation: null,
        established_year: parseInt(profileData.yearEstablished) || null,
        size: 'medium' as const,
        verified: false
      };

      const result = await createInstitution(institutionData);
      
      if (result) {
        toast.success('Corporate profile created successfully!');
        // Redirect to the corporate profile page
        window.location.href = `/institution/${result.id}`;
      } else {
        toast.error('Failed to create corporate profile');
      }
    } catch (error: any) {
      console.error('Error creating corporate profile:', error);
      toast.error(error.message || 'Failed to create corporate profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <BuildingOffice2Icon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Organization Details</h2>
        <p className="text-gray-600 mt-2">Tell us about your medical organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name *
          </label>
          <Input
            value={profileData.organizationName}
            onChange={(e) => updateProfileData('organizationName', e.target.value)}
            placeholder="e.g., MedTech Solutions Inc."
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Email *
          </label>
          <Input
            type="email"
            value={profileData.organizationEmail}
            onChange={(e) => updateProfileData('organizationEmail', e.target.value)}
            placeholder="contact@organization.com"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEO/Head Name *
          </label>
          <Input
            value={profileData.ceoName}
            onChange={(e) => updateProfileData('ceoName', e.target.value)}
            placeholder="Dr. John Smith"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CEO Contact Number
          </label>
          <Input
            type="tel"
            value={profileData.ceoContact}
            onChange={(e) => updateProfileData('ceoContact', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name (Employee) *
          </label>
          <Input
            value={profileData.employeeName}
            onChange={(e) => updateProfileData('employeeName', e.target.value)}
            placeholder="Your full name"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Designation *
          </label>
          <Input
            value={profileData.employeeDesignation}
            onChange={(e) => updateProfileData('employeeDesignation', e.target.value)}
            placeholder="e.g., Marketing Manager"
            className="w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Email (Employee) *
          </label>
          <Input
            type="email"
            value={profileData.employeeEmail}
            onChange={(e) => updateProfileData('employeeEmail', e.target.value)}
            placeholder="your.email@organization.com"
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Authorization</p>
            <p className="text-sm text-blue-700 mt-1">
              By proceeding, you authorize <strong>{profileData.employeeName || 'yourself'}</strong> as the official representative 
              of <strong>{profileData.organizationName || 'this organization'}</strong> and confirm you have the right to act on 
              behalf of the organization in creating this profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GlobeAltIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
        <p className="text-gray-600 mt-2">Share your organization&apos;s details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Website *
          </label>
          <Input
            type="url"
            value={profileData.companyUrl}
            onChange={(e) => updateProfileData('companyUrl', e.target.value)}
            placeholder="https://www.company.com"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year of Establishment *
          </label>
          <Input
            type="number"
            value={profileData.yearEstablished}
            onChange={(e) => updateProfileData('yearEstablished', e.target.value)}
            placeholder="2020"
            min="1800"
            max={new Date().getFullYear()}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Partnered With
          </label>
          <Input
            value={profileData.partneredWith}
            onChange={(e) => updateProfileData('partneredWith', e.target.value)}
            placeholder="e.g., WHO, FDA, Medical Associations"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Focus Area *
          </label>
          <select
            value={profileData.focus}
            onChange={(e) => updateProfileData('focus', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {FOCUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Global Presence *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {COUNTRIES.map(country => (
              <label key={country} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profileData.presenceIn.includes(country)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateProfileData('presenceIn', [...profileData.presenceIn, country]);
                    } else {
                      updateProfileData('presenceIn', profileData.presenceIn.filter(c => c !== country));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{country}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <AcademicCapIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Organization Overview</h2>
        <p className="text-gray-600 mt-2">Tell the medical community about your organization</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overview *
        </label>
        <textarea
          value={profileData.overview}
          onChange={(e) => updateProfileData('overview', e.target.value)}
          placeholder="Describe your organization's mission, vision, and key achievements in the medical field..."
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          {profileData.overview.length}/2000 characters
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <BeakerIcon className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Projects & Achievements</h2>
        <p className="text-gray-600 mt-2">Showcase your latest medical projects and innovations</p>
      </div>

      {profileData.projects.map((project, index) => (
        <Card key={index} className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Project {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <Input
                value={project.name}
                onChange={(e) => {
                  const newProjects = [...profileData.projects];
                  newProjects[index].name = e.target.value;
                  updateProfileData('projects', newProjects);
                }}
                placeholder="e.g., AI-Powered Diagnostic System"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                value={project.description}
                onChange={(e) => {
                  const newProjects = [...profileData.projects];
                  newProjects[index].description = e.target.value;
                  updateProfileData('projects', newProjects);
                }}
                placeholder="Brief description of the project, its goals, and outcomes..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Link (Optional)
              </label>
              <Input
                type="url"
                value={project.videoLink || ''}
                onChange={(e) => {
                  const newProjects = [...profileData.projects];
                  newProjects[index].videoLink = e.target.value;
                  updateProfileData('projects', newProjects);
                }}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analytics Overview
                </label>
                <textarea
                  value={project.analytics}
                  onChange={(e) => {
                    const newProjects = [...profileData.projects];
                    newProjects[index].analytics = e.target.value;
                    updateProfileData('projects', newProjects);
                  }}
                  placeholder="Key metrics and results..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marketing Strategy
                </label>
                <textarea
                  value={project.marketingStrategy}
                  onChange={(e) => {
                    const newProjects = [...profileData.projects];
                    newProjects[index].marketingStrategy = e.target.value;
                    updateProfileData('projects', newProjects);
                  }}
                  placeholder="Marketing approach..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branding
                </label>
                <textarea
                  value={project.branding}
                  onChange={(e) => {
                    const newProjects = [...profileData.projects];
                    newProjects[index].branding = e.target.value;
                    updateProfileData('projects', newProjects);
                  }}
                  placeholder="Brand positioning..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue Generation
              </label>
              <textarea
                value={project.revenueGeneration}
                onChange={(e) => {
                  const newProjects = [...profileData.projects];
                  newProjects[index].revenueGeneration = e.target.value;
                  updateProfileData('projects', newProjects);
                }}
                placeholder="Revenue model and financial impact..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <Button
              onClick={() => {
                const newProjects = profileData.projects.filter((_, i) => i !== index);
                updateProfileData('projects', newProjects);
              }}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Remove Project
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button
        onClick={() => {
          const newProject = {
            name: '',
            description: '',
            videoLink: '',
            analytics: '',
            marketingStrategy: '',
            branding: '',
            revenueGeneration: ''
          };
          updateProfileData('projects', [...profileData.projects, newProject]);
        }}
        variant="outline"
        className="w-full"
      >
        + Add Another Project
      </Button>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <BuildingOffice2Icon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Organization Logo</h2>
        <p className="text-gray-600 mt-2">Upload your organization&apos;s logo</p>
      </div>

      <div className="text-center">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <BuildingOffice2Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Upload your organization&apos;s logo (PNG, JPG, SVG up to 5MB)
          </p>
          <Button variant="outline">
            Choose File
          </Button>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm text-green-800 font-medium">Ready to Submit</p>
            <p className="text-sm text-green-700 mt-1">
              Your corporate profile is ready to be created. Review all information before submitting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  const steps = [
    { number: 1, title: 'Organization Details', icon: BuildingOffice2Icon },
    { number: 2, title: 'Company Information', icon: GlobeAltIcon },
    { number: 3, title: 'Overview', icon: AcademicCapIcon },
    { number: 4, title: 'Projects', icon: BeakerIcon },
    { number: 5, title: 'Logo', icon: BuildingOffice2Icon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Corporate Profile
          </h1>
          <p className="text-gray-600">
            Establish your medical organization&apos;s presence on MedProf
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span
                key={step.number}
                className={`text-xs font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Create Corporate Profile</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 