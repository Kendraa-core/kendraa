'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/queries';
import {
  UserCircleIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  BeakerIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Profile, Experience, Education } from '@/types/database.types';

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: () => void;
}

interface ExperienceForm {
  id?: string;
  title: string;
  company: string;
  company_type: 'hospital' | 'clinic' | 'research' | 'pharmaceutical' | 'other' | null;
  location: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
  specialization: string[];
}

interface EducationForm {
  id?: string;
  school: string;
  degree: string;
  field: string;
  specialization: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
  gpa: string;
  honors: string[];
}

const STEPS = [
  { id: 'basic', title: 'Basic Information', icon: UserCircleIcon, description: 'Update your personal details' },
  { id: 'experience', title: 'Professional Experience', icon: BriefcaseIcon, description: 'Manage your work history' },
  { id: 'education', title: 'Medical Education', icon: AcademicCapIcon, description: 'Add your qualifications' },
  { id: 'specializations', title: 'Specializations', icon: BeakerIcon, description: 'Medical expertise areas' },
  { id: 'media', title: 'Profile Photos', icon: PhotoIcon, description: 'Update profile images' },
];

const MEDICAL_SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Radiology', 'Surgery',
  'Internal Medicine', 'Emergency Medicine', 'Anesthesiology', 'Pathology',
  'Dermatology', 'Psychiatry', 'Orthopedics', 'Ophthalmology', 'ENT',
  'Gynecology', 'Urology', 'Pulmonology', 'Gastroenterology', 'Endocrinology',
  'Nephrology', 'Rheumatology', 'Infectious Disease', 'Critical Care',
  'Family Medicine', 'Geriatrics', 'Sports Medicine', 'Pain Management'
];

const COMPANY_TYPES = [
  { value: 'hospital', label: 'Hospital', icon: HeartIcon },
  { value: 'clinic', label: 'Clinic', icon: UserCircleIcon },
  { value: 'research', label: 'Research Institution', icon: BeakerIcon },
  { value: 'pharmaceutical', label: 'Pharmaceutical', icon: SparklesIcon },
  { value: 'other', label: 'Other', icon: ShieldCheckIcon }
];

export default function EditProfileModal({ profile, onClose, onUpdate }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Basic profile data
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    headline: profile.headline || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    phone: profile.phone || '',
    specialization: profile.specialization || [],
  });

  // Experience and Education data
  const [experiences, setExperiences] = useState<ExperienceForm[]>([]);
  const [education, setEducation] = useState<EducationForm[]>([]);
  
  // Media files
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.banner_url || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'avatar') {
          setAvatarFile(file);
          setAvatarPreview(result);
        } else {
          setCoverFile(file);
          setCoverPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save profile data logic here
      toast.success('Profile updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'basic':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#007fff]/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-[#007fff]" />
              </div>
              <h3 className="text-2xl font-bold text-[#007fff] mb-2">Basic Information</h3>
              <p className="text-[#007fff]/60">Update your professional details and contact information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#007fff] mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 transition-all duration-200"
                  placeholder="Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#007fff] mb-2">Professional Title *</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 transition-all duration-200"
                  placeholder="Cardiologist at City Hospital"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#007fff] mb-2">Location</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#007fff]/40" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 transition-all duration-200"
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#007fff] mb-2">Phone Number</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#007fff]/40" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#007fff] mb-2">Website</label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#007fff]/40" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 transition-all duration-200"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#007fff] mb-2">Professional Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-[#007fff]/20 rounded-xl focus:border-[#007fff] focus:ring-2 focus:ring-[#007fff]/10 transition-all duration-200 resize-none"
                  placeholder="Share your medical background, expertise, and professional interests..."
                />
              </div>
            </div>
          </motion.div>
        );

      case 'specializations':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#007fff]/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <BeakerIcon className="w-8 h-8 text-[#007fff]" />
              </div>
              <h3 className="text-2xl font-bold text-[#007fff] mb-2">Medical Specializations</h3>
              <p className="text-[#007fff]/60">Select your areas of medical expertise</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {MEDICAL_SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  onClick={() => {
                    const isSelected = formData.specialization.includes(spec);
                    if (isSelected) {
                      setFormData({
                        ...formData,
                        specialization: formData.specialization.filter(s => s !== spec)
                      });
                    } else {
                      setFormData({
                        ...formData,
                        specialization: [...formData.specialization, spec]
                      });
                    }
                  }}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                    formData.specialization.includes(spec)
                      ? 'bg-[#007fff] text-white border-[#007fff] shadow-lg'
                      : 'bg-white text-[#007fff] border-[#007fff]/20 hover:border-[#007fff]/40 hover:bg-[#007fff]/5'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {formData.specialization.length > 0 && (
              <div className="bg-[#007fff]/5 rounded-xl p-4 border border-[#007fff]/10">
                <h4 className="text-sm font-semibold text-[#007fff] mb-2">Selected Specializations:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.specialization.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#007fff] text-white"
                    >
                      {spec}
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          specialization: formData.specialization.filter(s => s !== spec)
                        })}
                        className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'media':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#007fff]/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <PhotoIcon className="w-8 h-8 text-[#007fff]" />
              </div>
              <h3 className="text-2xl font-bold text-[#007fff] mb-2">Profile Photos</h3>
              <p className="text-[#007fff]/60">Upload your professional profile and banner images</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Avatar Upload */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#007fff]">Profile Picture</h4>
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        width={120}
                        height={120}
                        className="w-32 h-32 rounded-full object-cover border-4 border-[#007fff]/20"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-[#007fff]/10 flex items-center justify-center border-4 border-[#007fff]/20">
                        <UserCircleIcon className="w-16 h-16 text-[#007fff]/40" />
                      </div>
                    )}
                    <button className="absolute -bottom-1 -right-1 bg-[#007fff] text-white p-2 rounded-full hover:bg-[#007fff]/90 transition-colors">
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <label className="cursor-pointer">
                    <span className="px-6 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium">
                      {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'avatar')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Banner Upload */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#007fff]">Banner Image</h4>
                <div className="space-y-4">
                  <div className="relative">
                    {coverPreview ? (
                      <Image
                        src={coverPreview}
                        alt="Banner preview"
                        width={400}
                        height={200}
                        className="w-full h-32 object-cover rounded-xl border-2 border-[#007fff]/20"
                      />
                    ) : (
                      <div className="w-full h-32 bg-[#007fff]/10 rounded-xl flex items-center justify-center border-2 border-[#007fff]/20">
                        <PhotoIcon className="w-12 h-12 text-[#007fff]/40" />
                      </div>
                    )}
                    <button className="absolute top-2 right-2 bg-[#007fff] text-white p-2 rounded-lg hover:bg-[#007fff]/90 transition-colors">
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <label className="cursor-pointer block">
                    <span className="w-full px-6 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium text-center block">
                      {coverPreview ? 'Change Banner' : 'Upload Banner'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-[#007fff]/30 mx-auto mb-4" />
            <p className="text-[#007fff]/60">Step content coming soon...</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-[#007fff]/10 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#007fff] to-[#007fff]/90 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Medical Profile</h2>
                <p className="text-white/80 text-sm">Step {currentStep + 1} of {STEPS.length} - {STEPS[currentStep].description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-xs font-medium">Progress</span>
              <span className="text-white text-xs font-bold">{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="bg-[#007fff]/5 px-8 py-4 border-b border-[#007fff]/10">
          <div className="flex items-center justify-between overflow-x-auto">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  index === currentStep
                    ? 'bg-[#007fff] text-white shadow-lg'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-white text-[#007fff]/60 hover:bg-[#007fff]/10 border border-[#007fff]/20'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  index === currentStep
                    ? 'bg-white/20'
                    : index < currentStep
                    ? 'bg-green-200'
                    : 'bg-[#007fff]/10'
                }`}>
                  {index < currentStep ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className={`text-xs ${
                    index === currentStep ? 'text-white/80' : 'text-current opacity-70'
                  }`}>{step.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderStep()}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-[#007fff] hover:bg-[#007fff]/10 border border-[#007fff]/20'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </button>
            
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-[#007fff] border-2 border-[#007fff]/20 rounded-xl hover:border-[#007fff]/40 hover:bg-[#007fff]/5 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-8 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg transform hover:scale-105 disabled:transform-none flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {loading ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Save Changes' : 'Next Step'}
                {!loading && currentStep < STEPS.length - 1 && (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}