'use client';

import React, { useState } from 'react';
import { 
  UserIcon, 
  AcademicCapIcon, 
  DocumentCheckIcon, 
  BeakerIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface MedicalProfileData {
  // Basic Information
  full_name: string;
  current_position: string;
  current_institution: string;
  years_of_experience: number;
  specialization: string[];
  languages_spoken: string[];
  
  // Medical License
  medical_license: {
    license_number: string;
    issuing_authority: string;
    issue_date: string;
    expiry_date: string;
  };
  
  // Education
  medical_degrees: {
    degree: string;
    institution: string;
    graduation_year: number;
  }[];
  
  // Certifications
  certifications: {
    name: string;
    issuing_body: string;
    issue_date: string;
    expiry_date?: string;
  }[];
  
  // Research & Interests
  research_interests: string[];
  clinical_interests: string[];
  research_papers: {
    title: string;
    journal: string;
    publication_date: string;
    doi?: string;
  }[];
  
  // Professional Settings
  privacy_settings: {
    show_license_number: boolean;
    show_contact_info: boolean;
    allow_research_collaboration: boolean;
    allow_case_consultation: boolean;
    allow_mentoring_requests: boolean;
  };
}

const MEDICAL_SPECIALTIES = [
  'Anesthesiology', 'Cardiology', 'Dermatology', 'Emergency Medicine', 'Endocrinology',
  'Family Medicine', 'Gastroenterology', 'General Surgery', 'Hematology', 'Infectious Disease',
  'Internal Medicine', 'Nephrology', 'Neurology', 'Neurosurgery', 'Obstetrics & Gynecology',
  'Oncology', 'Ophthalmology', 'Orthopedic Surgery', 'Otolaryngology', 'Pathology',
  'Pediatrics', 'Physical Medicine & Rehabilitation', 'Plastic Surgery', 'Psychiatry',
  'Pulmonology', 'Radiology', 'Rheumatology', 'Urology', 'Other'
];

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Arabic', 'Chinese (Mandarin)', 'Japanese', 'Korean', 'Hindi', 'Other'
];

const MEDICAL_DEGREES = [
  'MD (Doctor of Medicine)', 'DO (Doctor of Osteopathic Medicine)', 'MBBS (Bachelor of Medicine, Bachelor of Surgery)',
  'DDS (Doctor of Dental Surgery)', 'PharmD (Doctor of Pharmacy)', 'PhD (Doctor of Philosophy)',
  'MSN (Master of Science in Nursing)', 'RN (Registered Nurse)', 'PA (Physician Assistant)',
  'Other'
];

interface MedicalProfileWizardProps {
  onComplete: (data: MedicalProfileData) => void;
  onCancel: () => void;
}

export default function MedicalProfileWizard({ onComplete, onCancel }: MedicalProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<MedicalProfileData>({
    full_name: '',
    current_position: '',
    current_institution: '',
    years_of_experience: 0,
    specialization: [],
    languages_spoken: [],
    medical_license: {
      license_number: '',
      issuing_authority: '',
      issue_date: '',
      expiry_date: ''
    },
    medical_degrees: [],
    certifications: [],
    research_interests: [],
    clinical_interests: [],
    research_papers: [],
    privacy_settings: {
      show_license_number: false,
      show_contact_info: true,
      allow_research_collaboration: true,
      allow_case_consultation: true,
      allow_mentoring_requests: true
    }
  });

  const steps = [
    { id: 1, title: 'Basic Information', icon: UserIcon },
    { id: 2, title: 'Medical License', icon: ShieldCheckIcon },
    { id: 3, title: 'Education & Degrees', icon: AcademicCapIcon },
    { id: 4, title: 'Certifications', icon: DocumentCheckIcon },
    { id: 5, title: 'Research & Interests', icon: BeakerIcon },
    { id: 6, title: 'Privacy Settings', icon: GlobeAltIcon },
  ];

  const updateProfileData = (updates: Partial<MedicalProfileData>) => {
    setProfileData(prev => ({ ...prev, ...updates }));
  };

  const addArrayItem = <T,>(field: keyof MedicalProfileData, item: T) => {
    setProfileData(prev => ({
      ...prev,
      [field]: [...(prev[field] as T[]), item]
    }));
  };

  const removeArrayItem = <T,>(field: keyof MedicalProfileData, index: number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: (prev[field] as T[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete(profileData);
    } catch (error) {
      // Silent error handling for profile saving
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => updateProfileData({ full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Position
                  </label>
                  <Input
                    value={profileData.current_position}
                    onChange={(e) => updateProfileData({ current_position: e.target.value })}
                    placeholder="e.g., Attending Physician, Resident, Nurse Practitioner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Institution
                  </label>
                  <Input
                    value={profileData.current_institution}
                    onChange={(e) => updateProfileData({ current_institution: e.target.value })}
                    placeholder="e.g., Mayo Clinic, Johns Hopkins Hospital"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    value={profileData.years_of_experience.toString()}
                    onChange={(e) => updateProfileData({ years_of_experience: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Specialties
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                {MEDICAL_SPECIALTIES.map(specialty => (
                  <label key={specialty} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profileData.specialization.includes(specialty)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateProfileData({ 
                            specialization: [...profileData.specialization, specialty] 
                          });
                        } else {
                          updateProfileData({ 
                            specialization: profileData.specialization.filter(s => s !== specialty) 
                          });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Spoken
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-4">
                {COMMON_LANGUAGES.map(language => (
                  <label key={language} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profileData.languages_spoken.includes(language)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateProfileData({ 
                            languages_spoken: [...profileData.languages_spoken, language] 
                          });
                        } else {
                          updateProfileData({ 
                            languages_spoken: profileData.languages_spoken.filter(l => l !== language) 
                          });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{language}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Medical License Information</h3>
              <p className="text-gray-600 mb-6">
                Your medical license information helps verify your credentials and build trust with colleagues.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <Input
                    value={profileData.medical_license.license_number}
                    onChange={(e) => updateProfileData({
                      medical_license: { ...profileData.medical_license, license_number: e.target.value }
                    })}
                    placeholder="Enter your medical license number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issuing Authority
                  </label>
                  <Input
                    value={profileData.medical_license.issuing_authority}
                    onChange={(e) => updateProfileData({
                      medical_license: { ...profileData.medical_license, issuing_authority: e.target.value }
                    })}
                    placeholder="e.g., State Medical Board"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <Input
                    type="date"
                    value={profileData.medical_license.issue_date}
                    onChange={(e) => updateProfileData({
                      medical_license: { ...profileData.medical_license, issue_date: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={profileData.medical_license.expiry_date}
                    onChange={(e) => updateProfileData({
                      medical_license: { ...profileData.medical_license, expiry_date: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Medical Education</h3>
              <p className="text-gray-600 mb-6">
                Add your medical degrees and educational background.
              </p>
            </div>

            <div className="space-y-4">
              {profileData.medical_degrees.map((degree, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={degree.degree}
                      onChange={(e) => {
                        const updatedDegrees = [...profileData.medical_degrees];
                        updatedDegrees[index].degree = e.target.value;
                        updateProfileData({ medical_degrees: updatedDegrees });
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="">Select Degree</option>
                      {MEDICAL_DEGREES.map(deg => (
                        <option key={deg} value={deg}>{deg}</option>
                      ))}
                    </select>
                    <Input
                      placeholder="Institution"
                      value={degree.institution}
                      onChange={(e) => {
                        const updatedDegrees = [...profileData.medical_degrees];
                        updatedDegrees[index].institution = e.target.value;
                        updateProfileData({ medical_degrees: updatedDegrees });
                      }}
                    />
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Year"
                        value={degree.graduation_year.toString()}
                        onChange={(e) => {
                          const updatedDegrees = [...profileData.medical_degrees];
                          updatedDegrees[index].graduation_year = parseInt(e.target.value) || 0;
                          updateProfileData({ medical_degrees: updatedDegrees });
                        }}
                      />
                      <button
                        onClick={() => removeArrayItem('medical_degrees', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addArrayItem('medical_degrees', { degree: '', institution: '', graduation_year: new Date().getFullYear() })}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                + Add Medical Degree
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Certifications</h3>
              <p className="text-gray-600 mb-6">
                Add your board certifications, subspecialty certifications, and other professional credentials.
              </p>
            </div>

            <div className="space-y-4">
              {profileData.certifications.map((cert, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Certification Name"
                      value={cert.name}
                      onChange={(e) => {
                        const updatedCerts = [...profileData.certifications];
                        updatedCerts[index].name = e.target.value;
                        updateProfileData({ certifications: updatedCerts });
                      }}
                    />
                    <Input
                      placeholder="Issuing Body"
                      value={cert.issuing_body}
                      onChange={(e) => {
                        const updatedCerts = [...profileData.certifications];
                        updatedCerts[index].issuing_body = e.target.value;
                        updateProfileData({ certifications: updatedCerts });
                      }}
                    />
                    <Input
                      type="date"
                      placeholder="Issue Date"
                      value={cert.issue_date}
                      onChange={(e) => {
                        const updatedCerts = [...profileData.certifications];
                        updatedCerts[index].issue_date = e.target.value;
                        updateProfileData({ certifications: updatedCerts });
                      }}
                    />
                    <div className="flex space-x-2">
                      <Input
                        type="date"
                        placeholder="Expiry Date (optional)"
                        value={cert.expiry_date || ''}
                        onChange={(e) => {
                          const updatedCerts = [...profileData.certifications];
                          updatedCerts[index].expiry_date = e.target.value;
                          updateProfileData({ certifications: updatedCerts });
                        }}
                      />
                      <button
                        onClick={() => removeArrayItem('certifications', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addArrayItem('certifications', { 
                  name: '', 
                  issuing_body: '', 
                  issue_date: '', 
                  expiry_date: '' 
                })}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                + Add Certification
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Research & Professional Interests</h3>
              <p className="text-gray-600 mb-6">
                Help colleagues find you for collaboration opportunities and knowledge sharing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Interests
                </label>
                <textarea
                  placeholder="Enter research areas, separated by commas"
                  value={profileData.research_interests.join(', ')}
                  onChange={(e) => updateProfileData({ 
                    research_interests: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Interests
                </label>
                <textarea
                  placeholder="Enter clinical areas of interest, separated by commas"
                  value={profileData.clinical_interests.join(', ')}
                  onChange={(e) => updateProfileData({ 
                    clinical_interests: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 h-32"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Privacy & Communication Settings</h3>
              <p className="text-gray-600 mb-6">
                Control how your information is shared and who can contact you.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'show_license_number', label: 'Show license number on profile', description: 'Your license number will be visible to other verified professionals' },
                { key: 'show_contact_info', label: 'Show contact information', description: 'Allow others to see your email and phone number' },
                { key: 'allow_research_collaboration', label: 'Allow research collaboration requests', description: 'Researchers can invite you to collaborate on studies' },
                { key: 'allow_case_consultation', label: 'Allow case consultation requests', description: 'Colleagues can ask for your opinion on challenging cases' },
                { key: 'allow_mentoring_requests', label: 'Allow mentoring requests', description: 'Junior professionals can request mentoring sessions' },
              ].map(setting => (
                <div key={setting.key} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={profileData.privacy_settings[setting.key as keyof typeof profileData.privacy_settings]}
                    onChange={(e) => updateProfileData({
                      privacy_settings: {
                        ...profileData.privacy_settings,
                        [setting.key]: e.target.checked
                      }
                    })}
                    className="mt-1 rounded border-gray-300"
                  />
                  <div>
                    <label className="font-medium text-gray-900">{setting.label}</label>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : isCurrent 
                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    isCompleted ? 'bg-emerald-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep - 1].title}</h2>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onCancel}
            className="ml-2"
          >
            Cancel
          </Button>
        </div>
        
        <div>
          {currentStep < steps.length ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 1 && !profileData.full_name}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <><LoadingSpinner size={16} /> Creating Profile...</>
              ) : (
                <>
                  <HeartIcon className="w-4 h-4 mr-2" />
                  Complete Profile
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
