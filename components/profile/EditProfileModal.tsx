'use client';

import { useState } from 'react';
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
  { id: 'basic', title: 'Basic Info', icon: UserCircleIcon },
  { id: 'experience', title: 'Experience', icon: PhotoIcon },
  { id: 'education', title: 'Education', icon: PhotoIcon },
  { id: 'media', title: 'Photos', icon: PhotoIcon },
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

  // Load existing data
  useState(() => {
    // Load experiences and education from profile
    // This would be populated from API calls
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarFile(file);
          setAvatarPreview(reader.result as string);
        } else {
          setCoverFile(file);
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      title: '',
      company: '',
      company_type: null,
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      description: '',
      specialization: [],
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof ExperienceForm, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addEducation = () => {
    setEducation([...education, {
      school: '',
      degree: '',
      field: '',
      specialization: '',
      start_date: '',
      end_date: '',
      current: false,
      description: '',
      gpa: '',
      honors: [],
    }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof EducationForm, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = profile.avatar_url;
      let coverUrl = profile.banner_url;

      // Upload avatar if changed
      if (avatarFile) {
        const avatarExt = avatarFile.name.split('.').pop();
        const avatarPath = `avatars/${user.id}_${Date.now()}.${avatarExt}`;
        const { error: avatarError } = await getSupabase().storage
          .from('public')
          .upload(avatarPath, avatarFile);

        if (avatarError) {
          console.error('Avatar upload error:', avatarError);
          throw new Error('Failed to upload avatar image');
        }
        
        const { data: { publicUrl } } = getSupabase().storage
          .from('public')
          .getPublicUrl(avatarPath);
        avatarUrl = publicUrl;
      }

      // Upload cover if changed
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `covers/${user.id}_${Date.now()}.${coverExt}`;
        const { error: coverError } = await getSupabase().storage
          .from('public')
          .upload(coverPath, coverFile);

        if (coverError) {
          console.error('Cover upload error:', coverError);
          throw new Error('Failed to upload cover image');
        }
        
        const { data: { publicUrl } } = getSupabase().storage
          .from('public')
          .getPublicUrl(coverPath);
        coverUrl = publicUrl;
      }

      // Update profile
      await updateProfile({
        ...formData,
        avatar_url: avatarUrl,
        banner_url: coverUrl,
      });

      // TODO: Save experiences and education
      // This would require creating the API functions

      toast.success('Profile updated successfully!');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors"
                placeholder="e.g. Senior Cardiologist at City Hospital"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors resize-none"
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors"
                  placeholder="e.g. +1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-colors"
                placeholder="e.g. https://yourwebsite.com"
              />
            </div>
          </div>
        );

      case 1: // Experience
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center space-x-2 px-4 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Experience</span>
              </button>
            </div>

            {experiences.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No experience added yet</p>
                <p className="text-sm">Add your work experience to build your professional profile</p>
              </div>
            ) : (
              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          placeholder="e.g. Senior Cardiologist"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          placeholder="e.g. City Hospital"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          placeholder="e.g. San Francisco, CA"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                        <input
                          type="date"
                          value={exp.start_date}
                          onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={exp.end_date}
                          onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          disabled={exp.current}
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">I currently work here</label>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 resize-none"
                        placeholder="Describe your role and achievements..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2: // Education
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Education</h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center space-x-2 px-4 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Education</span>
              </button>
            </div>

            {education.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No education added yet</p>
                <p className="text-sm">Add your educational background</p>
              </div>
            ) : (
              <div className="space-y-6">
                {education.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          placeholder="e.g. Harvard Medical School"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          placeholder="e.g. Doctor of Medicine"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          placeholder="e.g. Medicine"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                        <input
                          type="text"
                          value={edu.specialization}
                          onChange={(e) => updateEducation(index, 'specialization', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          placeholder="e.g. Cardiology"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                        <input
                          type="date"
                          value={edu.start_date}
                          onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={edu.end_date}
                          onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          disabled={edu.current}
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={edu.current}
                          onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">I am currently studying here</label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500"
                          placeholder="e.g. 3.8"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={edu.description}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 resize-none"
                        placeholder="Describe your studies, achievements, or activities..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3: // Media
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo
              </label>
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                {coverPreview ? (
                  <Image
                    src={coverPreview}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'cover')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Click to upload
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="relative w-32 h-32">
                <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-full h-full text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'avatar')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded text-center">
                  Upload
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <p className="text-sm text-gray-600">Step {currentStep + 1} of {STEPS.length}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < currentStep ? 'bg-azure-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index <= currentStep ? 'text-azure-500' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-azure-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                
                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-2 inline" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
} 