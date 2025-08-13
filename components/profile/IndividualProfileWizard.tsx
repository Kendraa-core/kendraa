'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  UserIcon, 
  AcademicCapIcon, 
  BriefcaseIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  HeartIcon,
  BeakerIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { updateProfile } from '@/lib/queries';
import type { Profile } from '@/types/database.types';

interface IndividualProfileData {
  // Step 1: Basic Information
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  
  // Step 2: Medical Credentials
  medicalDegree: string;
  specialization: string[];
  licenseNumber: string;
  boardCertifications: string[];
  yearsOfExperience: string;
  
  // Step 3: Professional Experience
  currentPosition: string;
  currentInstitution: string;
  previousPositions: Array<{
    title: string;
    institution: string;
    duration: string;
    description: string;
  }>;
  
  // Step 4: Education & Training
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  
  // Step 5: Research & Publications
  researchInterests: string[];
  publications: Array<{
    title: string;
    journal: string;
    year: string;
    doi: string;
  }>;
  
  // Step 6: Professional Summary
  headline: string;
  bio: string;
  avatarUrl: string;
}

const SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Psychiatry', 'Surgery',
  'Emergency Medicine', 'Family Medicine', 'Internal Medicine', 'Obstetrics & Gynecology',
  'Orthopedics', 'Radiology', 'Anesthesiology', 'Dermatology', 'Endocrinology',
  'Gastroenterology', 'Hematology', 'Infectious Disease', 'Nephrology', 'Pulmonology',
  'Rheumatology', 'Urology', 'Ophthalmology', 'Otolaryngology', 'Pathology'
];

const BOARD_CERTIFICATIONS = [
  'American Board of Medical Specialties (ABMS)',
  'American Board of Internal Medicine (ABIM)',
  'American Board of Surgery (ABS)',
  'American Board of Pediatrics (ABP)',
  'American Board of Psychiatry and Neurology (ABPN)',
  'American Board of Radiology (ABR)',
  'American Board of Anesthesiology (ABA)',
  'American Board of Dermatology (ABD)',
  'American Board of Emergency Medicine (ABEM)',
  'American Board of Family Medicine (ABFM)',
  'American Board of Obstetrics and Gynecology (ABOG)',
  'American Board of Orthopaedic Surgery (ABOS)',
  'Royal College of Physicians (RCP)',
  'Royal College of Surgeons (RCS)',
  'Canadian Medical Association (CMA)',
  'European Board of Medical Specialists (EBMS)'
];

const RESEARCH_INTERESTS = [
  'Clinical Trials', 'Drug Development', 'Medical Devices', 'AI in Healthcare',
  'Precision Medicine', 'Genomics', 'Immunotherapy', 'Regenerative Medicine',
  'Public Health', 'Epidemiology', 'Health Policy', 'Medical Education',
  'Patient Safety', 'Quality Improvement', 'Health Informatics', 'Telemedicine'
];

export default function IndividualProfileWizard() {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<IndividualProfileData>({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    website: profile?.website || '',
    medicalDegree: '',
    specialization: [],
    licenseNumber: '',
    boardCertifications: [],
    yearsOfExperience: '',
    currentPosition: '',
    currentInstitution: '',
    previousPositions: [],
    education: [],
    researchInterests: [],
    publications: [],
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    avatarUrl: profile?.avatar_url || ''
  });

  const updateProfileData = (field: keyof IndividualProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.fullName && profileData.email);
      case 2:
        return !!(profileData.medicalDegree && profileData.specialization.length > 0);
      case 3:
        return !!(profileData.currentPosition && profileData.currentInstitution);
      case 4:
        return profileData.education.length > 0;
      case 5:
        return true; // Optional step
      case 6:
        return !!(profileData.headline && profileData.bio);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Please log in to create your profile');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        website: profileData.website,
        headline: profileData.headline,
        bio: profileData.bio,
        avatar_url: profileData.avatarUrl,
        specialization: profileData.specialization,
        // Add custom fields for medical professionals
        medical_degree: profileData.medicalDegree,
        license_number: profileData.licenseNumber,
        board_certifications: profileData.boardCertifications,
        years_of_experience: parseInt(profileData.yearsOfExperience) || 0,
        current_position: profileData.currentPosition,
        current_institution: profileData.currentInstitution,
        previous_positions: profileData.previousPositions,
        education: profileData.education,
        research_interests: profileData.researchInterests,
        publications: profileData.publications,
        user_type: 'individual' as const,
        profile_type: 'individual' as const
      };

      const result = await updateProfile(user.id, updateData);
      
      if (result) {
        toast.success('Medical professional profile created successfully!');
        // Redirect to the profile page
        window.location.href = `/profile/${user.id}`;
      } else {
        toast.error('Failed to create profile');
      }
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <UserIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
        <p className="text-gray-600 mt-2">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <Input
            value={profileData.fullName}
            onChange={(e) => updateProfileData('fullName', e.target.value)}
            placeholder="Dr. John Smith"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <Input
            type="email"
            value={profileData.email}
            onChange={(e) => updateProfileData('email', e.target.value)}
            placeholder="john.smith@hospital.com"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <Input
            type="tel"
            value={profileData.phone}
            onChange={(e) => updateProfileData('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <Input
            value={profileData.location}
            onChange={(e) => updateProfileData('location', e.target.value)}
            placeholder="New York, NY, USA"
            className="w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Website
          </label>
          <Input
            type="url"
            value={profileData.website}
            onChange={(e) => updateProfileData('website', e.target.value)}
            placeholder="https://www.drjohnsmith.com"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <AcademicCapIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Medical Credentials</h2>
        <p className="text-gray-600 mt-2">Your medical qualifications and certifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Degree *
          </label>
          <Input
            value={profileData.medicalDegree}
            onChange={(e) => updateProfileData('medicalDegree', e.target.value)}
            placeholder="e.g., MD, MBBS, DO"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Number
          </label>
          <Input
            value={profileData.licenseNumber}
            onChange={(e) => updateProfileData('licenseNumber', e.target.value)}
            placeholder="e.g., 123456789"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <Input
            type="number"
            value={profileData.yearsOfExperience}
            onChange={(e) => updateProfileData('yearsOfExperience', e.target.value)}
            placeholder="10"
            min="0"
            max="50"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Specialization *
          </label>
          <select
            value={profileData.specialization[0] || ''}
            onChange={(e) => {
              const newSpecializations = [e.target.value, ...profileData.specialization.slice(1)];
              updateProfileData('specialization', newSpecializations);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select specialization</option>
            {SPECIALIZATIONS.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Specializations
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {SPECIALIZATIONS.map(spec => (
              <label key={spec} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profileData.specialization.includes(spec)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateProfileData('specialization', [...profileData.specialization, spec]);
                    } else {
                      updateProfileData('specialization', profileData.specialization.filter(s => s !== spec));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{spec}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Board Certifications
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {BOARD_CERTIFICATIONS.map(cert => (
              <label key={cert} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profileData.boardCertifications.includes(cert)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateProfileData('boardCertifications', [...profileData.boardCertifications, cert]);
                    } else {
                      updateProfileData('boardCertifications', profileData.boardCertifications.filter(c => c !== cert));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{cert}</span>
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
        <BriefcaseIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Professional Experience</h2>
        <p className="text-gray-600 mt-2">Your current and previous positions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Position *
          </label>
          <Input
            value={profileData.currentPosition}
            onChange={(e) => updateProfileData('currentPosition', e.target.value)}
            placeholder="e.g., Cardiologist, Chief of Medicine"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Institution *
          </label>
          <Input
            value={profileData.currentInstitution}
            onChange={(e) => updateProfileData('currentInstitution', e.target.value)}
            placeholder="e.g., Mayo Clinic, Johns Hopkins Hospital"
            className="w-full"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Positions</h3>
        {profileData.previousPositions.map((position, index) => (
          <Card key={index} className="mb-4 border-2 border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Title
                  </label>
                  <Input
                    value={position.title}
                    onChange={(e) => {
                      const newPositions = [...profileData.previousPositions];
                      newPositions[index].title = e.target.value;
                      updateProfileData('previousPositions', newPositions);
                    }}
                    placeholder="e.g., Resident Physician"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution
                  </label>
                  <Input
                    value={position.institution}
                    onChange={(e) => {
                      const newPositions = [...profileData.previousPositions];
                      newPositions[index].institution = e.target.value;
                      updateProfileData('previousPositions', newPositions);
                    }}
                    placeholder="e.g., Harvard Medical School"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <Input
                    value={position.duration}
                    onChange={(e) => {
                      const newPositions = [...profileData.previousPositions];
                      newPositions[index].duration = e.target.value;
                      updateProfileData('previousPositions', newPositions);
                    }}
                    placeholder="e.g., 2018-2022"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={position.description}
                    onChange={(e) => {
                      const newPositions = [...profileData.previousPositions];
                      newPositions[index].description = e.target.value;
                      updateProfileData('previousPositions', newPositions);
                    }}
                    placeholder="Brief description of your role and achievements..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <Button
                onClick={() => {
                  const newPositions = profileData.previousPositions.filter((_, i) => i !== index);
                  updateProfileData('previousPositions', newPositions);
                }}
                variant="outline"
                className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove Position
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={() => {
            const newPosition = {
              title: '',
              institution: '',
              duration: '',
              description: ''
            };
            updateProfileData('previousPositions', [...profileData.previousPositions, newPosition]);
          }}
          variant="outline"
          className="w-full"
        >
          + Add Previous Position
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <AcademicCapIcon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Education & Training</h2>
        <p className="text-gray-600 mt-2">Your educational background and training</p>
      </div>

      {profileData.education.map((edu, index) => (
        <Card key={index} className="border-2 border-gray-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree
                </label>
                <Input
                  value={edu.degree}
                  onChange={(e) => {
                    const newEducation = [...profileData.education];
                    newEducation[index].degree = e.target.value;
                    updateProfileData('education', newEducation);
                  }}
                  placeholder="e.g., MD, PhD, MBBS"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution
                </label>
                <Input
                  value={edu.institution}
                  onChange={(e) => {
                    const newEducation = [...profileData.education];
                    newEducation[index].institution = e.target.value;
                    updateProfileData('education', newEducation);
                  }}
                  placeholder="e.g., Harvard Medical School"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <Input
                  value={edu.year}
                  onChange={(e) => {
                    const newEducation = [...profileData.education];
                    newEducation[index].year = e.target.value;
                    updateProfileData('education', newEducation);
                  }}
                  placeholder="e.g., 2020"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={edu.description}
                  onChange={(e) => {
                    const newEducation = [...profileData.education];
                    newEducation[index].description = e.target.value;
                    updateProfileData('education', newEducation);
                  }}
                  placeholder="Brief description of your studies..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <Button
              onClick={() => {
                const newEducation = profileData.education.filter((_, i) => i !== index);
                updateProfileData('education', newEducation);
              }}
              variant="outline"
              className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
            >
              Remove Education
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button
        onClick={() => {
          const newEducation = {
            degree: '',
            institution: '',
            year: '',
            description: ''
          };
          updateProfileData('education', [...profileData.education, newEducation]);
        }}
        variant="outline"
        className="w-full"
      >
        + Add Education
      </Button>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <BeakerIcon className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Research & Publications</h2>
        <p className="text-gray-600 mt-2">Your research interests and publications (optional)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Research Interests
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
          {RESEARCH_INTERESTS.map(interest => (
            <label key={interest} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={profileData.researchInterests.includes(interest)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateProfileData('researchInterests', [...profileData.researchInterests, interest]);
                  } else {
                    updateProfileData('researchInterests', profileData.researchInterests.filter(i => i !== interest));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Publications</h3>
        {profileData.publications.map((pub, index) => (
          <Card key={index} className="mb-4 border-2 border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Title
                  </label>
                  <Input
                    value={pub.title}
                    onChange={(e) => {
                      const newPublications = [...profileData.publications];
                      newPublications[index].title = e.target.value;
                      updateProfileData('publications', newPublications);
                    }}
                    placeholder="e.g., Novel Treatment for Cardiovascular Disease"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Journal
                  </label>
                  <Input
                    value={pub.journal}
                    onChange={(e) => {
                      const newPublications = [...profileData.publications];
                      newPublications[index].journal = e.target.value;
                      updateProfileData('publications', newPublications);
                    }}
                    placeholder="e.g., New England Journal of Medicine"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <Input
                    value={pub.year}
                    onChange={(e) => {
                      const newPublications = [...profileData.publications];
                      newPublications[index].year = e.target.value;
                      updateProfileData('publications', newPublications);
                    }}
                    placeholder="e.g., 2023"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DOI
                  </label>
                  <Input
                    value={pub.doi}
                    onChange={(e) => {
                      const newPublications = [...profileData.publications];
                      newPublications[index].doi = e.target.value;
                      updateProfileData('publications', newPublications);
                    }}
                    placeholder="e.g., 10.1000/123456"
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                onClick={() => {
                  const newPublications = profileData.publications.filter((_, i) => i !== index);
                  updateProfileData('publications', newPublications);
                }}
                variant="outline"
                className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove Publication
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button
          onClick={() => {
            const newPublication = {
              title: '',
              journal: '',
              year: '',
              doi: ''
            };
            updateProfileData('publications', [...profileData.publications, newPublication]);
          }}
          variant="outline"
          className="w-full"
        >
          + Add Publication
        </Button>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <StarIcon className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Professional Summary</h2>
        <p className="text-gray-600 mt-2">Create your professional headline and bio</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Headline *
        </label>
        <Input
          value={profileData.headline}
          onChange={(e) => updateProfileData('headline', e.target.value)}
          placeholder="e.g., Cardiologist | Chief of Medicine | Mayo Clinic"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Bio *
        </label>
        <textarea
          value={profileData.bio}
          onChange={(e) => updateProfileData('bio', e.target.value)}
          placeholder="Write a compelling professional summary that highlights your expertise, achievements, and what makes you unique in the medical field..."
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          {profileData.bio.length}/2000 characters
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm text-green-800 font-medium">Ready to Submit</p>
            <p className="text-sm text-green-700 mt-1">
              Your medical professional profile is ready to be created. Review all information before submitting.
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
      case 6: return renderStep6();
      default: return null;
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: UserIcon },
    { number: 2, title: 'Credentials', icon: AcademicCapIcon },
    { number: 3, title: 'Experience', icon: BriefcaseIcon },
    { number: 4, title: 'Education', icon: AcademicCapIcon },
    { number: 5, title: 'Research', icon: BeakerIcon },
    { number: 6, title: 'Summary', icon: StarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Medical Professional Profile
          </h1>
          <p className="text-gray-600">
            Establish your professional presence in the medical community
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

          {currentStep < 6 ? (
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
                  <span>Create Professional Profile</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 