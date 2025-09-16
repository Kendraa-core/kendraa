'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/common/Avatar';
import Breadcrumb from '@/components/common/Breadcrumb';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EditProfileModal from '@/components/profile/EditProfileModal';
import EnhancedProfileImageEditor from '@/components/profile/EnhancedProfileImageEditor';
import PostCard from '@/components/post/PostCard';
import SimilarPeople from '@/components/profile/SimilarPeople';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS,
  ANIMATIONS 
} from '@/lib/design-system';
import {
  ArrowLeftIcon,
  PencilIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  UserPlusIcon,
  ShareIcon,
  UserGroupIcon,
  BookmarkIcon,
  CalendarDaysIcon,
  CameraIcon,
  CheckIcon,
  PlusIcon,
  ChevronRightIcon,
  StarIcon,
  BuildingOfficeIcon,
  UserIcon,
  FireIcon,
  BellIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  getProfile,
  getExperiences,
  getEducation,
  getPostsByAuthor,
  getConnectionStatus,
  sendConnectionRequest,
  followUser,
  unfollowUser,
  isFollowing,
  followInstitution,
  unfollowInstitution,
  getFollowStatus,
  getConnectionCount,
  getEventsByOrganizer,
  updateProfile,
  createExperience,
  updateExperience,
  createEducation,
  updateEducation,
  getSuggestedConnectionsWithMutualCounts,
  type Profile,
  type Experience,
  type Education,
  type PostWithAuthor,
} from '@/lib/queries';

// Helper function to format dates to month/year
const formatDateToMonthYear = (dateString: string | null): string => {
  if (!dateString) return '';
  
  // If it's already in "Month Year" format, return as is
  if (dateString.includes(' ') && !dateString.includes('-')) {
    return dateString;
  }
  
  // If it's a date string like "2020-06-01", convert to "June 2020"
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  } catch {
    return dateString; // Return original if parsing fails
  }
};

// Helper function to convert month/year to ISO date format
const convertMonthYearToISO = (month: string, year: string): string => {
  if (!month || !year) return '';
  
  try {
    // Create a date object for the first day of the month
    const date = new Date(parseInt(year), getMonthIndex(month), 1);
    if (isNaN(date.getTime())) return '';
    
    // Return ISO date string (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// Helper function to get month index
const getMonthIndex = (monthName: string): number => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.indexOf(monthName);
};


// Contact Info Modal Component
const ContactInfoModal = React.memo(function ContactInfoModal({ profile, isOpen, onClose }: {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.full_name}</h2>
          <h3 className="text-lg font-semibold text-[#007fff] mb-4">Contact Info</h3>
        </div>

        <div className="space-y-6">
          {/* LinkedIn Profile */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#007fff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-[#007fff]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Your Profile</p>
              <p className="text-[#007fff] hover:underline cursor-pointer">
                kendraa.com/in/{profile.id}
              </p>
            </div>
          </div>

          {/* Email */}
          {profile.email && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#007fff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="w-5 h-5 text-[#007fff]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-[#007fff] hover:underline cursor-pointer">
                  {profile.email}
                </p>
              </div>
            </div>
          )}

          {/* Phone */}
          {profile.phone && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#007fff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <PhoneIcon className="w-5 h-5 text-[#007fff]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <p className="text-gray-700">{profile.phone}</p>
              </div>
            </div>
          )}

          {/* Website */}
          {profile.website && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#007fff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="w-5 h-5 text-[#007fff]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Website</p>
                <p className="text-[#007fff] hover:underline cursor-pointer">
                  {profile.website}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          {profile.location && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#007fff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPinIcon className="w-5 h-5 text-[#007fff]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Location</p>
                <p className="text-gray-700">{profile.location}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// AboutCard Component
const AboutCard = React.memo(function AboutCard({ profile, isOwnProfile, editingField, editValues, onStartEdit, onSaveEdit, onCancelEdit }: { 
  profile: Profile;
  isOwnProfile: boolean;
  editingField: string | null;
  editValues: any;
  onStartEdit: (field: string, value: any) => void;
  onSaveEdit: (field: string) => void;
  onCancelEdit: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4 text-[#007fff]" />
        </div>
          <h3 className="text-lg font-bold text-gray-900">About</h3>
      </div>
        {isOwnProfile && editingField !== 'bio' && (
          <button
            onClick={() => onStartEdit('bio', profile.bio || '')}
            className="text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-colors duration-200"
          >
            Edit
          </button>
        )}
      </div>

      {editingField === 'bio' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#007fff]/5 to-white rounded-xl border-2 border-[#007fff]/20 p-6 shadow-lg">
            <div className="space-y-4">
              <label className="text-lg font-semibold text-[#007fff] flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                About Section
              </label>
              <textarea
                value={editValues.bio || profile.bio || ''}
                onChange={(e) => onStartEdit('bio', e.target.value)}
                className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm"
                rows={5}
                placeholder="Share your medical background, expertise, research interests, and professional journey..."
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => onSaveEdit('bio')}
                  className="px-8 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Save Changes
                </button>
              <button 
                  onClick={onCancelEdit}
                  className="px-8 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-xl hover:bg-[#007fff]/10 transition-all duration-300 text-sm font-semibold"
                >
                  Cancel
              </button>
                </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="text-gray-700 leading-relaxed">
        {profile.bio ? (
          <p className="whitespace-pre-wrap">{profile.bio}</p>
        ) : (
            <div className="text-center py-6">
              <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 italic">Share your medical background and professional interests</p>
            {isOwnProfile && (
                                          <button
                  onClick={() => onStartEdit('bio', '')}
                  className="mt-3 px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors text-sm font-medium"
                    >
                Add About Section
                    </button>
              )}
            </div>
        )}
          </div>
      )}
    </motion.div>
  );
});



// ExperienceCard Component
const ExperienceCard = React.memo(function ExperienceCard({ experience, isOwnProfile, editingField, editValues, onStartEdit, onSaveEdit, onCancelEdit, onUpdateEditValue }: { 
  experience: Experience; 
  isOwnProfile: boolean; 
  editingField: string | null;
  editValues: any;
  onStartEdit: (field: string, value: any) => void;
  onSaveEdit: (field: string) => void;
  onCancelEdit: () => void;
  onUpdateEditValue: (field: string, value: any) => void;
}) {
  const isEditing = editingField === `experience_${experience.id}`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="group bg-gray-50 rounded-lg border border-gray-100 p-4 hover:border-[#007fff]/20 hover:shadow-sm transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-[#007fff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <BriefcaseIcon className="w-5 h-5 text-[#007fff]" />
          </div>
            <div className="flex-1 min-w-0">
                            {isEditing ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#007fff]/5 to-white rounded-xl border-2 border-[#007fff]/20 p-6 shadow-lg">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <BriefcaseIcon className="w-4 h-4" />
                            Job Title *
                          </label>
                          <input
                            type="text"
                            value={editValues[`experience_${experience.id}_title`] || experience.title || ''}
                            onChange={(e) => onUpdateEditValue(`experience_${experience.id}_title`, e.target.value)}
                            className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 font-medium text-gray-900 bg-white/80 backdrop-blur-sm"
                            placeholder="e.g., Senior Cardiologist"
                          />
        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            Company *
                          </label>
                          <input
                            type="text"
                            value={editValues[`experience_${experience.id}_company`] || experience.company || ''}
                            onChange={(e) => onUpdateEditValue(`experience_${experience.id}_company`, e.target.value)}
                            className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 font-medium text-[#007fff] bg-white/80 backdrop-blur-sm"
                            placeholder="e.g., Mayo Clinic"
                          />
      </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            Start Date *
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={editValues[`experience_${experience.id}_start_month`] || ''}
                              onChange={(e) => onUpdateEditValue(`experience_${experience.id}_start_month`, e.target.value)}
                              className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            >
                              <option value="">Month</option>
                              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                <option key={month} value={month}>{month}</option>
                              ))}
                            </select>
                            <select
                              value={editValues[`experience_${experience.id}_start_year`] || ''}
                              onChange={(e) => onUpdateEditValue(`experience_${experience.id}_start_year`, e.target.value)}
                              className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
          </div>
      </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            End Date
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={editValues[`experience_${experience.id}_end_month`] || ''}
                              onChange={(e) => onUpdateEditValue(`experience_${experience.id}_end_month`, e.target.value)}
                              className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            >
                              <option value="">Month</option>
                              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                <option key={month} value={month}>{month}</option>
                              ))}
                            </select>
                            <select
                              value={editValues[`experience_${experience.id}_end_year`] || ''}
                              onChange={(e) => onUpdateEditValue(`experience_${experience.id}_end_year`, e.target.value)}
                              className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
          </div>
        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4" />
                            Location
                          </label>
                          <input
                            type="text"
                            value={editValues[`experience_${experience.id}_location`] || experience.location || ''}
                            onChange={(e) => onUpdateEditValue(`experience_${experience.id}_location`, e.target.value)}
                            className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            placeholder="e.g., Rochester, MN"
                          />
                        </div>
      </div>
      <div className="space-y-3">
                        <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4" />
                          Job Description
                        </label>
                        <textarea
                          value={editValues[`experience_${experience.id}_description`] || experience.description || ''}
                          onChange={(e) => onUpdateEditValue(`experience_${experience.id}_description`, e.target.value)}
                          className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm"
                          rows={4}
                          placeholder="Describe your role, responsibilities, and achievements..."
                        />
                      </div>
                      <div className="flex gap-4 pt-6 border-t-2 border-[#007fff]/20">
                    <button 
                          onClick={() => onSaveEdit(`experience_${experience.id}`)}
                          className="px-8 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                          Save Changes
                    </button>
              <button 
                          onClick={onCancelEdit}
                          className="px-8 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-xl hover:bg-[#007fff]/10 transition-all duration-300 text-sm font-semibold"
              >
                          Cancel
              </button>
          </div>
      </div>
            </div>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{experience.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[#007fff] font-semibold text-sm">{experience.company}</p>
                    {experience.location && (
                      <>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPinIcon className="w-3 h-3 text-[#007fff]" />
                          <span>{experience.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <CalendarIcon className="w-3 h-3 text-[#007fff]" />
                <span className="font-medium">
                      {formatDateToMonthYear(experience.start_date)} - {experience.end_date ? formatDateToMonthYear(experience.end_date) : 'Present'}
                </span>
                {!experience.end_date && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Current</span>
                )}
              </div>
              {experience.description && (
                    <div className="bg-white rounded-lg p-3 mt-2">
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {experience.description}
                  </p>
                </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {isOwnProfile && !isEditing && (
          <button 
            onClick={() => onStartEdit(`experience_${experience.id}`, experience)}
            className="opacity-0 group-hover:opacity-100 text-[#007fff]/60 hover:text-[#007fff] ml-3 p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
});

// EducationCard Component
const EducationCard = React.memo(function EducationCard({ education, isOwnProfile, editingField, editValues, onStartEdit, onSaveEdit, onCancelEdit, onUpdateEditValue }: { 
  education: Education; 
  isOwnProfile: boolean; 
  editingField: string | null;
  editValues: any;
  onStartEdit: (field: string, value: any) => void;
  onSaveEdit: (field: string) => void;
  onCancelEdit: () => void;
  onUpdateEditValue: (field: string, value: any) => void;
}) {
  const isEditing = editingField === `education_${education.id}`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="group bg-gray-50 rounded-lg border border-gray-100 p-4 hover:border-[#007fff]/20 hover:shadow-sm transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-[#007fff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <AcademicCapIcon className="w-5 h-5 text-[#007fff]" />
            </div>
            <div className="flex-1 min-w-0">
                            {isEditing ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-[#007fff]/5 to-white rounded-xl border-2 border-[#007fff]/20 p-6 shadow-lg">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <AcademicCapIcon className="w-4 h-4" />
                            Degree *
                          </label>
                          <input
                            type="text"
                            value={editValues[`education_${education.id}_degree`] || education.degree || ''}
                            onChange={(e) => onUpdateEditValue(`education_${education.id}_degree`, e.target.value)}
                            className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 font-medium text-gray-900 bg-white/80 backdrop-blur-sm"
                            placeholder="e.g., Doctor of Medicine (MD)"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            School/University *
                          </label>
                          <input
                            type="text"
                            value={editValues[`education_${education.id}_school`] || education.school || ''}
                            onChange={(e) => onUpdateEditValue(`education_${education.id}_school`, e.target.value)}
                            className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 font-medium text-[#007fff] bg-white/80 backdrop-blur-sm"
                            placeholder="e.g., Harvard Medical School"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4" />
                            Field of Study
                          </label>
                          <input
                            type="text"
                            value={editValues[`education_${education.id}_field`] || education.field || ''}
                            onChange={(e) => onUpdateEditValue(`education_${education.id}_field`, e.target.value)}
                            className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            placeholder="e.g., Medicine, Cardiology"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            Start Date *
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={editValues[`education_${education.id}_start_month`] || ''}
                              onChange={(e) => onUpdateEditValue(`education_${education.id}_start_month`, e.target.value)}
                              className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            >
                              <option value="">Month</option>
                              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                <option key={month} value={month}>{month}</option>
                              ))}
                            </select>
                            <select
                              value={editValues[`education_${education.id}_start_year`] || ''}
                              onChange={(e) => onUpdateEditValue(`education_${education.id}_start_year`, e.target.value)}
                              className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            End Date
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={editValues[`education_${education.id}_end_month`] || ''}
                              onChange={(e) => onUpdateEditValue(`education_${education.id}_end_month`, e.target.value)}
                              className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            >
                              <option value="">Month</option>
                              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                <option key={month} value={month}>{month}</option>
                              ))}
                            </select>
                            <select
                              value={editValues[`education_${education.id}_end_year`] || ''}
                              onChange={(e) => onUpdateEditValue(`education_${education.id}_end_year`, e.target.value)}
                              className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-6 border-t-2 border-[#007fff]/20">
                        <button
                          onClick={() => onSaveEdit(`education_${education.id}`)}
                          className="px-8 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="px-8 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-xl hover:bg-[#007fff]/10 transition-all duration-300 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{education.degree}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[#007fff] font-semibold text-sm">{education.school}</p>
                    {education.field && (
                      <>
                        <span className="text-gray-400">•</span>
                        <p className="text-xs text-gray-600">{education.field}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <CalendarIcon className="w-3 h-3 text-[#007fff]" />
                <span className="font-medium">
                      {formatDateToMonthYear(education.start_date)} - {education.end_date ? formatDateToMonthYear(education.end_date) : 'Present'}
                </span>
              </div>
              {education.description && (
                    <div className="bg-white rounded-lg p-3 mt-2">
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {education.description}
                  </p>
                </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {isOwnProfile && !isEditing && (
          <button 
            onClick={() => onStartEdit(`education_${education.id}`, education)}
            className="opacity-0 group-hover:opacity-100 text-[#007fff]/60 hover:text-[#007fff] ml-3 p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
});

// ActivityCard Component
const ActivityCard = React.memo(function ActivityCard({ posts, isOwnProfile, connectionCount, router }: { 
  posts: PostWithAuthor[]; 
  isOwnProfile: boolean; 
  connectionCount: number; 
  router: any; 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
            <FireIcon className="w-4 h-4 text-[#007fff]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">{formatNumber(connectionCount)} followers</p>
          </div>
      </div>
      
      </div>

      {/* Posts */}
      {posts.length > 0 ? (
        <div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {posts.slice(0, 3).map((post, index) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex-shrink-0 w-80 border border-gray-100 rounded-lg p-5 hover:border-[#007fff]/20 transition-colors shadow-sm"
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
          {posts.length > 3 && (
            <div className="mt-4 text-center">
              <button className="text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-all duration-200">
                Show all {posts.length} posts →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <FireIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-lg mb-2">No posts yet</p>
          <p className="text-gray-500 text-sm mb-4">Share your medical insights and professional updates</p>
          {isOwnProfile && (
            <button 
              onClick={() => router.push('/feed')}
              className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors text-sm font-medium"
            >
              Create Your First Post
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
});

// Profile Viewers Component
const ProfileViewers = React.memo(function ProfileViewers({ viewers }: { viewers: Profile[] }) {
  if (viewers.length === 0) {
    return (
      <div className="text-center py-4">
        <EyeIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No recent profile views</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {viewers.slice(0, 5).map((viewer) => (
        <div key={viewer.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Avatar
            src={viewer.avatar_url}
            alt={viewer.full_name || 'Profile Viewer'}
            size="sm"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {viewer.full_name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {viewer.headline || 'Healthcare Professional'}
            </p>
          </div>
        </div>
      ))}
      {viewers.length > 5 && (
        <Link
          href="/network"
          className="block text-center text-sm text-[#007fff] hover:text-blue-600 font-medium py-2"
        >
          View all {viewers.length} viewers
        </Link>
      )}
    </div>
  );
});

// People You May Know Component
const PeopleYouMayKnow = React.memo(function PeopleYouMayKnow({ 
  suggestions, 
  onConnect 
}: { 
  suggestions: Array<Profile & { mutual_connections: number }>;
  onConnect: (userId: string) => void;
}) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-4">
        <UserGroupIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No suggestions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.slice(0, 5).map((person) => (
        <div key={person.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <Avatar
            src={person.avatar_url}
            alt={person.full_name || 'Suggested Connection'}
            size="sm"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {person.full_name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {person.headline || 'Healthcare Professional'}
            </p>
            {person.mutual_connections > 0 && (
              <p className="text-xs text-[#007fff]">
                {person.mutual_connections} mutual connection{person.mutual_connections !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => onConnect(person.id)}
            className="flex-shrink-0 p-1.5 text-[#007fff] hover:bg-blue-50 rounded-full transition-colors"
            title="Connect"
          >
            <UserPlusIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
      {suggestions.length > 5 && (
        <Link
          href="/network"
          className="block text-center text-sm text-[#007fff] hover:text-blue-600 font-medium py-2"
        >
          View all suggestions
        </Link>
      )}
    </div>
  );
});

// SidebarCard Component
const SidebarCard = React.memo(function SidebarCard({ profile, isOwnProfile }: { 
  profile: Profile; 
  isOwnProfile: boolean; 
}) {
  return (
    <div className="space-y-6">
      {/* Sidebar content can be added here in the future */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-[#007fff]" />
          Profile Overview
        </h4>
        <p className="text-sm text-gray-600">
          Additional profile information and insights can be displayed here.
        </p>
      </div>
    </div>
  );
});

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>('none');
  const [followStatus, setFollowStatus] = useState<string>('none');
  const [connectionCount, setConnectionCount] = useState(0);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [profileViewers, setProfileViewers] = useState<Profile[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<Array<Profile & { mutual_connections: number }>>([]);
  const [canSendRequests, setCanSendRequests] = useState(true);
  const [actionType, setActionType] = useState<'connect' | 'follow' | 'none'>('none');

  // Inline editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    full_name?: string;
    headline?: string;
    location?: string;
    specialization?: string[];
    bio?: string;
    [key: string]: any; // For dynamic experience and education fields
  }>({});

  const isOwnProfile = user?.id === id;

  // Redirect institution users to their dedicated profile page
  useEffect(() => {
    if (profile && (profile.user_type === 'institution' || profile.profile_type === 'institution')) {
      router.push('/institution/profile');
    }
  }, [profile, router]);

  // Get only current (ongoing) experiences and education
  const currentExperiences = useMemo(() => 
    experiences.filter(exp => exp.current), [experiences]
  );
  
  const currentEducation = useMemo(() => 
    education.filter(edu => edu.current), [education]
  );

  const fetchProfileData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Fetch profile data
      const profileData = await getProfile(id as string);
      setProfile(profileData);
      
      // Fetch experiences and education
      const [experiencesData, educationData] = await Promise.all([
        getExperiences(id as string),
        getEducation(id as string)
      ]);
      
      setExperiences(experiencesData);
      setEducation(educationData);
      
      // Fetch connection count (public data)
      const countData = await getConnectionCount(id as string);
      setConnectionCount(countData);
      
      // Fetch connection data and determine action type only if user is logged in
      if (!isOwnProfile && user?.id) {
        // Check if current user can send requests
        setCanSendRequests(true); // Assume user can send requests
        setActionType('connect'); // Default to connect action

        // Fetch connection/follow status based on action type
        if (actionType === 'follow') {
          const followData = await getFollowStatus(user.id, id as string);
          setFollowStatus(followData ? 'following' : 'none');
          setConnectionStatus('none');
        } else if (actionType === 'connect') {
          const connectionData = await getConnectionStatus(user.id, id as string);
          setConnectionStatus(connectionData || 'none');
          setFollowStatus('none');
        } else {
          setConnectionStatus('none');
          setFollowStatus('none');
        }
      } else {
        setConnectionStatus('none');
        setFollowStatus('none');
        setCanSendRequests(true);
        setActionType('none');
      }
      
      // Fetch posts for activity
      const postsData = await getPostsByAuthor(id as string);
      setPosts(postsData);
      
      // Fetch sidebar data only for own profile
      if (isOwnProfile && user?.id) {
        const [viewersData, suggestionsData] = await Promise.all([
          Promise.resolve([]), // No profile viewers for now
          getSuggestedConnectionsWithMutualCounts(user.id, 5)
        ]);
        setProfileViewers(viewersData);
        setSuggestedConnections(suggestionsData);
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, isOwnProfile]);

  useEffect(() => {
    if (id && !profile) {
    fetchProfileData();
    }
  }, [id, profile, fetchProfileData]);

  const handleConnect = async () => {
    if (!profile || !user) {
      toast.error('Please sign in to connect with this user');
      return;
    }

    if (!canSendRequests) {
      toast.error('Institutions cannot send connection or follow requests');
      return;
    }

    try {
      if (actionType === 'follow') {
        const success = await followInstitution(user.id, profile.id);
        if (success) {
          setFollowStatus('following');
          toast.success('Successfully followed institution');
        } else {
          toast.error('Failed to follow institution');
        }
      } else if (actionType === 'connect') {
        const result = await sendConnectionRequest(user.id, profile.id);
        if (result) {
          setConnectionStatus('pending');
          toast.success('Connection request sent');
        } else {
          toast.error('Failed to send connection request');
        }
      } else {
        toast.error('Action not allowed');
      }
    } catch (error: any) {
      console.error('Error connecting:', error);
      toast.error(error.message || 'Failed to connect');
    }
  };

  const handleUnfollow = async () => {
    if (!profile || !user) {
      toast.error('Please sign in to unfollow this user');
      return;
    }
    
    try {
      if (profile.profile_type === 'institution') {
        await unfollowInstitution(user.id, profile.id);
      } else {
        await unfollowUser(user.id, profile.id);
      }
      setFollowStatus('none');
      toast.success('Unfollowed successfully');
    } catch (error) {
      console.error('Error unfollowing:', error);
      toast.error('Failed to unfollow');
    }
  };

  const handleSuggestedConnect = async (userId: string) => {
    if (!user) {
      toast.error('Please sign in to connect');
      return;
    }

    try {
      await sendConnectionRequest(user.id, userId);
      toast.success('Connection request sent');
      // Refresh suggestions to remove the connected user
      const updatedSuggestions = await getSuggestedConnectionsWithMutualCounts(user.id, 5);
      setSuggestedConnections(updatedSuggestions);
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleEditImages = () => {
    setShowImageEditor(true);
  };

  const handleViewContactInfo = () => {
    setShowContactModal(true);
  };

  // Inline editing functions
  const updateEditValue = (field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    
    if (field === 'bio') {
      setEditValues({ bio: currentValue });
    } else if (field.startsWith('experience_')) {
      const experienceId = field.split('_')[1];
      const experience = experiences.find(exp => exp.id === experienceId);
      if (experience) {
        // Parse existing dates to populate month/year fields
        const startDate = experience.start_date ? new Date(experience.start_date) : null;
        const endDate = experience.end_date ? new Date(experience.end_date) : null;
        
        setEditValues({
          [`experience_${experienceId}_title`]: experience.title || '',
          [`experience_${experienceId}_company`]: experience.company || '',
          [`experience_${experienceId}_description`]: experience.description || '',
          [`experience_${experienceId}_start_month`]: startDate ? startDate.toLocaleDateString('en-US', { month: 'long' }) : '',
          [`experience_${experienceId}_start_year`]: startDate ? startDate.getFullYear().toString() : '',
          [`experience_${experienceId}_end_month`]: endDate ? endDate.toLocaleDateString('en-US', { month: 'long' }) : '',
          [`experience_${experienceId}_end_year`]: endDate ? endDate.getFullYear().toString() : '',
          [`experience_${experienceId}_location`]: experience.location || ''
        });
      }
    } else if (field.startsWith('education_')) {
      const educationId = field.split('_')[1];
      const educationItem = education.find(edu => edu.id === educationId);
      if (educationItem) {
        // Parse existing dates to populate month/year fields
        const startDate = educationItem.start_date ? new Date(educationItem.start_date) : null;
        const endDate = educationItem.end_date ? new Date(educationItem.end_date) : null;
        
        setEditValues({
          [`education_${educationId}_degree`]: educationItem.degree || '',
          [`education_${educationId}_school`]: educationItem.school || '',
          [`education_${educationId}_field`]: educationItem.field || '',
          [`education_${educationId}_start_month`]: startDate ? startDate.toLocaleDateString('en-US', { month: 'long' }) : '',
          [`education_${educationId}_start_year`]: startDate ? startDate.getFullYear().toString() : '',
          [`education_${educationId}_end_month`]: endDate ? endDate.toLocaleDateString('en-US', { month: 'long' }) : '',
          [`education_${educationId}_end_year`]: endDate ? endDate.getFullYear().toString() : ''
        });
      }
    } else {
      setEditValues({ [field]: currentValue });
    }
  };

  const saveEdit = async (field: string) => {
    if (!profile || !user) return;
    
    try {
      const updates: { [key: string]: any } = {};
      const fieldName = field; // Keep the original field name

      if (fieldName === 'bio') {
        updates.bio = editValues.bio;

      } else if (fieldName === 'location') {
        updates.location = editValues.location;
      } else if (fieldName === 'headline') {
        updates.headline = editValues.headline;
      } else if (fieldName === 'full_name') {
        updates.full_name = editValues.full_name;
      } else if (fieldName.startsWith('experience_') && !fieldName.startsWith('add_')) {
        const experienceId = fieldName.split('_')[1];
        const expStartDate = editValues[`experience_${experienceId}_start_month`] && editValues[`experience_${experienceId}_start_year`]
          ? convertMonthYearToISO(editValues[`experience_${experienceId}_start_month`], editValues[`experience_${experienceId}_start_year`])
          : '';
        const expEndDate = editValues[`experience_${experienceId}_end_month`] && editValues[`experience_${experienceId}_end_year`]
          ? convertMonthYearToISO(editValues[`experience_${experienceId}_end_month`], editValues[`experience_${experienceId}_end_year`])
          : '';
        
        const experienceUpdates = {
          title: editValues[`experience_${experienceId}_title`],
          company: editValues[`experience_${experienceId}_company`],
          description: editValues[`experience_${experienceId}_description`],
          start_date: expStartDate,
          end_date: expEndDate || null,
          location: editValues[`experience_${experienceId}_location`] || null,
          current: !expEndDate
        };
        
        try {
          await updateExperience(experienceId, experienceUpdates);
          
          // Update local state
          const updatedExperiences = experiences.map(exp => 
            exp.id === experienceId ? { ...exp, ...experienceUpdates } : exp
          );
          setExperiences(updatedExperiences);
          
          setEditingField(null);
          setEditValues({});
          toast.success('Experience updated successfully');
        } catch (error) {
          console.error('Error updating experience:', error);
          toast.error('Failed to update experience. Please try again.');
          return;
        }
        return; // Don't continue with profile update
      } else if (fieldName.startsWith('education_') && !fieldName.startsWith('add_')) {
        const educationId = fieldName.split('_')[1];
        const eduStartDate = editValues[`education_${educationId}_start_month`] && editValues[`education_${educationId}_start_year`]
          ? convertMonthYearToISO(editValues[`education_${educationId}_start_month`], editValues[`education_${educationId}_start_year`])
          : '';
        const eduEndDate = editValues[`education_${educationId}_end_month`] && editValues[`education_${educationId}_end_year`]
          ? convertMonthYearToISO(editValues[`education_${educationId}_end_month`], editValues[`education_${educationId}_end_year`])
          : '';
        
        const educationUpdates = {
          degree: editValues[`education_${educationId}_degree`],
          school: editValues[`education_${educationId}_school`],
          field: editValues[`education_${educationId}_field`] || null,
          start_date: eduStartDate,
          end_date: eduEndDate || null,
          current: !eduEndDate
        };
        
        try {
          await updateEducation(educationId, educationUpdates);
          
          // Update local state
          const updatedEducation = education.map(edu => 
            edu.id === educationId ? { ...edu, ...educationUpdates } : edu
          );
          setEducation(updatedEducation);
          
          setEditingField(null);
          setEditValues({});
          toast.success('Education updated successfully');
        } catch (error) {
          console.error('Error updating education:', error);
          toast.error('Failed to update education. Please try again.');
          return;
        }
        return; // Don't continue with profile update
      } else if (fieldName === 'add_experience') {
         // Handle adding new experience
         const newExpStartDate = editValues.new_experience_start_month && editValues.new_experience_start_year 
           ? convertMonthYearToISO(editValues.new_experience_start_month, editValues.new_experience_start_year)
           : '';
         const newExpEndDate = editValues.new_experience_end_month && editValues.new_experience_end_year
           ? convertMonthYearToISO(editValues.new_experience_end_month, editValues.new_experience_end_year)
           : '';
         
         // Validate required fields
         if (!editValues.new_experience_title || !editValues.new_experience_company || !newExpStartDate) {
           toast.error('Please fill in all required fields (Title, Company, and Start Date)');
           return;
         }
         
         const newExperienceData = {
           profile_id: profile!.id,
           title: editValues.new_experience_title,
           company: editValues.new_experience_company,
           company_type: 'other' as const,
           description: editValues.new_experience_description || null,
           start_date: newExpStartDate,
           end_date: newExpEndDate || null,
           location: editValues.new_experience_location || null,
           current: !newExpEndDate,
           specialization: []
         };
         
         const newExperience = await createExperience(newExperienceData);
         setExperiences(prev => [...prev, newExperience]);
         
         setEditingField(null);
         setEditValues({});
         toast.success('Experience added successfully');
         return; // Don't continue with profile update
       } else if (fieldName === 'add_education') {
         // Handle adding new education
         const newEduStartDate = editValues.new_education_start_month && editValues.new_education_start_year 
           ? convertMonthYearToISO(editValues.new_education_start_month, editValues.new_education_start_year)
           : '';
         const newEduEndDate = editValues.new_education_end_month && editValues.new_education_end_year
           ? convertMonthYearToISO(editValues.new_education_end_month, editValues.new_education_end_year)
           : '';
         
         // Validate required fields
         if (!editValues.new_education_degree || !editValues.new_education_school || !newEduStartDate) {
           toast.error('Please fill in all required fields (Degree, School, and Start Date)');
           return;
         }
         
         const newEducationData = {
           profile_id: profile!.id,
           school: editValues.new_education_school,
           degree: editValues.new_education_degree,
           field: editValues.new_education_field || null,
           specialization: null,
           start_date: newEduStartDate,
           end_date: newEduEndDate || null,
           current: !newEduEndDate,
           description: null,
           gpa: null,
           honors: []
         };
         
         const newEducation = await createEducation(newEducationData);
         setEducation(prev => [...prev, newEducation]);
         
         setEditingField(null);
         setEditValues({});
         toast.success('Education added successfully');
         return; // Don't continue with profile update
       }
      
      // Only update profile if we have profile updates
      if (Object.keys(updates).length > 0) {
        const updatedProfile = await updateProfile(profile!.id, updates);
        setProfile(updatedProfile);
        toast.success(`${field.replace('_', ' ')} updated successfully`);
      }
      
      setEditingField(null);
      setEditValues({});
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };


  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    let score = 0;
    if (profile.full_name) score += 25;
    if (profile.headline) score += 20;
    if (profile.bio) score += 20;
    if (profile.avatar_url) score += 15;
    if (profile.location) score += 10;
    if (experiences.length > 0) score += 5;
    if (education.length > 0) score += 5;
    
    return Math.min(score, 100);
  };

  if (loading) {
    return <LoadingSpinner variant="fullscreen" text="Loading medical profile..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-24 h-24 text-[#007fff]/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#007fff] mb-3">Profile not found</h2>
          <p className="text-[#007fff]/60 text-lg">The medical professional you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BACKGROUNDS.page.primary} relative`}>
      {/* Floating Right Island */}
      <div className="hidden xl:block fixed right-6 top-24 w-80 z-10 space-y-4">
        {/* Who Viewed Your Profile Section - Only for own profile */}
        {isOwnProfile && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <EyeIcon className="w-4 h-4 text-[#007fff]" />
                Who Viewed Your Profile
              </h3>
            </div>
            <div className="p-3">
              <ProfileViewers viewers={profileViewers} />
            </div>
          </div>
        )}

        {/* People You May Know Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4 text-[#007fff]" />
              People You May Know
            </h3>
          </div>
          <div className="p-3">
            {isOwnProfile ? (
              <PeopleYouMayKnow 
                suggestions={suggestedConnections} 
                onConnect={handleSuggestedConnect}
              />
            ) : (
              <SimilarPeople />
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
          <SidebarCard profile={profile} isOwnProfile={isOwnProfile} />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className={`w-full ${isOwnProfile ? 'xl:mr-96' : 'xl:mr-96'} max-w-4xl mx-auto space-y-8`}>
          {/* Profile Header */}
          <div className={`${COMPONENTS.card.base} shadow-xl`}>
            {/* Banner */}
            <div className="relative h-56 bg-[#007fff] overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-6 right-6 w-16 h-16 border-2 border-white rounded-full"></div>
                <div className="absolute top-16 left-8 w-12 h-12 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-8 right-1/4 w-8 h-8 border border-white rounded-full"></div>
                <div className="absolute bottom-16 left-1/3 w-10 h-10 border border-white rounded-full"></div>
              </div>
              
              {/* Banner Image if exists */}
              {profile.banner_url && (
                <Image
                  src={profile.banner_url}
                  alt="Profile banner"
                  fill
                  className="object-cover mix-blend-overlay"
                />
              )}
              
              {/* Edit Banner Button */}
              {isOwnProfile && (
                <button
                  onClick={handleEditImages}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110 border border-white/30"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Content */}
            <div className="px-6 py-6">
              {/* Avatar positioned to overlap banner */}
              <div className="flex justify-start -mt-24 mb-6">
                <div className="relative">
                  <Avatar
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    size="2xl"
                    className="border-4 border-white shadow-2xl ring-4 ring-[#007fff]/20 w-36 h-36"
                  />
                  {/* Edit Avatar Button */}
                  {isOwnProfile && (
                    <button
                      onClick={handleEditImages}
                      className="absolute -bottom-2 -right-2 bg-[#007fff] text-white p-2.5 rounded-full hover:bg-[#007fff]/90 transition-all duration-300 shadow-lg transform hover:scale-110"
                    >
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  )}
                  </div>
                </div>

              {/* Profile Information and Actions */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Left Side: Profile Info and Stats */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    {editingField === 'full_name' ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editValues.full_name || profile.full_name || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, full_name: e.target.value }))}
                          className="text-3xl sm:text-4xl font-bold text-[#007fff] bg-transparent border-b-2 border-[#007fff] focus:outline-none focus:border-[#007fff]/80"
                          placeholder="Enter your name"
                        />
                        <div className="flex gap-2">
                    <button 
                            onClick={() => saveEdit('full_name')}
                            className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                    >
                            <CheckIcon className="w-4 h-4" />
                    </button>
                    <button 
                            onClick={cancelEdit}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                            <XCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 group">
                        <h1 className="text-3xl sm:text-4xl font-bold text-[#007fff] leading-tight">
                          {profile.full_name || 'Anonymous User'}
                        </h1>
                        {isOwnProfile && (
                          <button
                            onClick={() => startEdit('full_name', profile.full_name)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-[#007fff] hover:bg-[#007fff]/10 rounded-full transition-all duration-200"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                )}
              </div>
                    )}
                    
                    {/* Headline */}
                    {editingField === 'headline' ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editValues.headline || profile.headline || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, headline: e.target.value }))}
                          className="text-lg sm:text-xl text-gray-700 font-medium bg-transparent border-b-2 border-[#007fff] focus:outline-none focus:border-[#007fff]/80"
                          placeholder="Enter your headline"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit('headline')}
                            className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                          >
                            <CheckIcon className="w-4 h-4" />
                    </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                </div>
              ) : (
                      <div className="flex items-center gap-3 group">
                        <p className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed">
                          {profile.headline || 'Healthcare Professional'}
                        </p>
                  {isOwnProfile && (
                    <button 
                            onClick={() => startEdit('headline', profile.headline)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-[#007fff] hover:bg-[#007fff]/10 rounded-full transition-all duration-200"
                    >
                            <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
                  </div>

                  {/* Location - Moved Up */}
                  <div className="pt-2">
                    {editingField === 'location' ? (
                <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                          <MapPinIcon className="w-3 h-3 text-gray-500" />
                  </div>
                        <input
                          type="text"
                          value={editValues.location || profile.location || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, location: e.target.value }))}
                          className="text-sm font-medium bg-transparent border-b border-[#007fff] focus:outline-none focus:border-[#007fff]/80 px-1"
                          placeholder="Enter your location"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => saveEdit('location')}
                            className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                          >
                            <CheckIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <XCircleIcon className="w-3 h-3" />
                          </button>
                </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600 group">
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#007fff]/10 transition-colors duration-200">
                          <MapPinIcon className="w-3 h-3 text-gray-500 group-hover:text-[#007fff] transition-colors duration-200" />
                        </div>
                        <p className="text-sm font-medium group-hover:text-[#007fff] transition-colors duration-200">
                          {profile.location || 'No location set'}
                        </p>
                {isOwnProfile && (
                    <button 
                            onClick={() => startEdit('location', profile.location)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[#007fff] hover:bg-[#007fff]/10 rounded-full transition-all duration-200"
                    >
                            <PencilIcon className="w-3 h-3" />
                    </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Connections and Followers - Plain Text */}
                  <div className="flex items-center gap-6 pt-2 text-sm text-gray-600">
                    <button 
                      onClick={() => router.push(`/profile/${profile.id}/connections`)}
                      className="hover:text-[#007fff] transition-colors duration-200"
                    >
                      <span className="font-semibold text-[#007fff]">{formatNumber(connectionCount)}</span> connections
                    </button>
                    <button 
                      onClick={() => router.push(`/profile/${profile.id}/followers`)}
                      className="hover:text-[#007fff] transition-colors duration-200"
                    >
                      <span className="font-semibold text-[#007fff]">{formatNumber(connectionCount)}</span> followers
                    </button>
                    <button 
                      onClick={handleViewContactInfo}
                      className="text-[#007fff] hover:text-[#007fff]/80 hover:underline font-semibold transition-all duration-200 flex items-center gap-2 group"
                    >
                      <div className="w-4 h-4 bg-[#007fff]/10 rounded-full flex items-center justify-center group-hover:bg-[#007fff]/20 transition-colors duration-200">
                        <EnvelopeIcon className="w-2 h-2 text-[#007fff]" />
                  </div>
                      Contact info
                    </button>
                  </div>
              </div>
              
                {/* Right Side: Current Position and Similar Professionals */}
                <div className="flex flex-col gap-3 min-w-[320px]">
                  {/* Current Position - Moved to Right Sidebar */}
                  {currentExperiences.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#007fff]/20 transition-all duration-300 group">
                      <div className="w-8 h-8 bg-[#007fff] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <BuildingOfficeIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 group-hover:text-[#007fff] transition-colors duration-300">
                          {currentExperiences[0].company}
                        </p>
                        {currentExperiences[0].title && (
                          <p className="text-sm text-gray-600 mt-1">
                            {currentExperiences[0].title}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Current Position
                        </p>
              </div>
                    </div>
                  )}

                  
                  {/* Current Education */}
                  {currentEducation.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#007fff]/20 transition-all duration-300 group">
                      <div className="w-8 h-8 bg-[#007fff] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <AcademicCapIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 group-hover:text-[#007fff] transition-colors duration-300">
                          {currentEducation[0].school}
                        </p>
                        {currentEducation[0].degree && (
                          <p className="text-sm text-gray-600 mt-1">
                            {currentEducation[0].degree}
                          </p>
                        )}
                        {currentEducation[0].field && (
                          <p className="text-sm text-gray-600 mt-1">
                            {currentEducation[0].field}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Currently Studying
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for non-own profiles */}
                  {!isOwnProfile && (
                    <div className="flex flex-col gap-4">
                      {user ? (
                        // Logged in user actions
                        <>
                          {!canSendRequests ? (
                            // Institution users cannot send requests
                            <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold border border-gray-200 w-full">
                              <XCircleIcon className="w-4 h-4 mr-2" />
                              Institutions Cannot Send Requests
                            </div>
                          ) : actionType === 'follow' ? (
                            // Follow logic for institutions
                            followStatus === 'following' ? (
                              <button
                                onClick={handleUnfollow}
                                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-semibold border border-gray-200 w-full group hover:scale-[1.02]"
                              >
                                <CheckIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                Following
                              </button>
                            ) : (
                              <button
                                onClick={handleConnect}
                                className="inline-flex items-center justify-center px-6 py-3 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-all duration-200 text-sm font-semibold w-full group hover:scale-[1.02] shadow-lg hover:shadow-xl"
                              >
                                <PlusIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                Follow
                              </button>
                            )
                          ) : actionType === 'connect' ? (
                            // Connection logic for individuals
                            connectionStatus === 'connected' ? (
                              <span className="inline-flex items-center justify-center px-6 py-3 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 w-full">
                                <CheckIcon className="w-4 h-4 mr-2" />
                                Connected
                              </span>
                            ) : connectionStatus === 'pending' ? (
                              <span className="inline-flex items-center justify-center px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-semibold border border-yellow-200 w-full">
                                <ClockIcon className="w-4 h-4 mr-2" />
                                Pending
                              </span>
                            ) : (
                              <button
                                onClick={handleConnect}
                                className="inline-flex items-center justify-center px-6 py-3 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-all duration-200 text-sm font-semibold w-full group hover:scale-[1.02] shadow-lg hover:shadow-xl"
                              >
                                <UserPlusIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                Connect
                              </button>
                            )
                          ) : (
                            // No action available
                            <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold border border-gray-200 w-full">
                              <XCircleIcon className="w-4 h-4 mr-2" />
                              No Action Available
                            </div>
                          )}
                          <button 
                            onClick={() => router.push(`/messages?user=${profile.id}`)}
                            className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-lg hover:bg-[#007fff]/5 transition-all duration-200 text-sm font-semibold w-full group hover:scale-[1.02] hover:border-[#007fff]/80"
                          >
                            <EnvelopeIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                            Message
                          </button>
                        </>
                      ) : (
                        // Non-logged in user actions
                        <>
                          <Link
                            href="/signin"
                            className="inline-flex items-center justify-center px-6 py-3 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-all duration-200 text-sm font-semibold w-full group hover:scale-[1.02] shadow-lg hover:shadow-xl"
                          >
                            <UserPlusIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                            Sign In to {profile.profile_type === 'institution' || profile.user_type === 'institution' ? 'Follow' : 'Connect'}
                          </Link>
                          <Link
                            href="/signin"
                            className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-lg hover:bg-[#007fff]/5 transition-all duration-200 text-sm font-semibold w-full group hover:scale-[1.02] hover:border-[#007fff]/80"
                          >
                            <EnvelopeIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                            Message
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                    </div>
                  </div>
                  </div>
            
            {/* Profile Content */}
            <div className="px-4 py-4 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
              <div className="space-y-3">
                  {/* Activity Section */}
                  <ActivityCard 
                    posts={posts} 
                    isOwnProfile={isOwnProfile} 
                    connectionCount={connectionCount} 
                    router={router}
                  />

                  {/* About Section */}
                  <AboutCard
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                    editingField={editingField}
                    editValues={editValues}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                  />
                  

                  
                  {/* Experience Section */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <BuildingOfficeIcon className="w-5 h-5 text-[#007fff]" />
                          Experience
                        </h2>
                  {isOwnProfile && (
                    <button 
                            onClick={() => startEdit('add_experience', {})}
                            className="text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-colors duration-200"
                    >
                            Add Experience
                    </button>
                  )}
                </div>
                    </div>
                    <div className="p-6">
                      {editingField === 'add_experience' ? (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-[#007fff]/5 to-white rounded-xl border-2 border-[#007fff]/20 shadow-lg p-8">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 bg-[#007fff]/20 rounded-2xl flex items-center justify-center">
                                <BriefcaseIcon className="w-6 h-6 text-[#007fff]" />
                  </div>
                              <h4 className="text-2xl font-bold text-[#007fff]">Add New Experience</h4>
                  </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <BriefcaseIcon className="w-4 h-4" />
                                  Job Title *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Senior Cardiologist"
                                  value={editValues.new_experience_title || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, new_experience_title: e.target.value }))}
                                  className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                />
          </div>

                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <BuildingOfficeIcon className="w-4 h-4" />
                                  Company/Institution *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Mayo Clinic"
                                  value={editValues.new_experience_company || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, new_experience_company: e.target.value }))}
                                  className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                />
                              </div>
                              
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4" />
                                  Start Date *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                  <select
                                    value={editValues.new_experience_start_month || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, new_experience_start_month: e.target.value }))}
                                    className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  >
                                    <option value="">Month</option>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                      <option key={month} value={month}>{month}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={editValues.new_experience_start_year || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, new_experience_start_year: e.target.value }))}
                                    className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  >
                                    <option value="">Year</option>
                                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                      </div>
                    </div>
                              
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4" />
                                  End Date
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                  <select
                                    value={editValues.new_experience_end_month || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, new_experience_end_month: e.target.value }))}
                                    className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  >
                                    <option value="">Month</option>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                      <option key={month} value={month}>{month}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={editValues.new_experience_end_year || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, new_experience_end_year: e.target.value }))}
                                    className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  >
                                    <option value="">Year</option>
                                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                  </div>
                  </div>
                              
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <MapPinIcon className="w-4 h-4" />
                                  Location
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Rochester, MN"
                                  value={editValues.new_experience_location || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, new_experience_location: e.target.value }))}
                                  className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                />
                              </div>
                              
                              <div className="md:col-span-2 space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <DocumentTextIcon className="w-4 h-4" />
                                  Job Description
                                </label>
                                <textarea
                                  placeholder="Describe your role, responsibilities, and achievements..."
                                  value={editValues.new_experience_description || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, new_experience_description: e.target.value }))}
                                  rows={4}
                                  className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm"
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-4 mt-8 pt-6 border-t-2 border-[#007fff]/20">
                   <button
                                onClick={() => saveEdit('add_experience')}
                                className="px-8 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                   >
                                Save Experience
                   </button>
                              <button
                                onClick={cancelEdit}
                                className="px-8 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-xl hover:bg-[#007fff]/10 transition-all duration-300 text-sm font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : experiences.length > 0 ? (
                        <div className="space-y-6">
                          {experiences.slice(0, 3).map((experience, index) => (
                            <ExperienceCard
                              key={experience.id}
                              experience={experience}
                              isOwnProfile={isOwnProfile}
                              editingField={editingField}
                              editValues={editValues}
                              onStartEdit={startEdit}
                              onSaveEdit={saveEdit}
                              onCancelEdit={cancelEdit}
                              onUpdateEditValue={updateEditValue}
                            />
                          ))}
                          {experiences.length > 3 && (
                            <div className="text-center pt-4">
                              <button className="text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-colors duration-200">
                                View all {experiences.length} experiences
                              </button>
                    </div>
                  )}
                    </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BuildingOfficeIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-600">No experience added yet</p>
                          {isOwnProfile && (
                            <button
                              onClick={() => startEdit('add_experience', {})}
                              className="mt-3 text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-colors duration-200"
                            >
                              Add your first experience
                            </button>
                          )}
            </div>
                      )}
          </div>
        </div>

                  {/* Education Section */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <AcademicCapIcon className="w-5 h-5 text-[#007fff]" />
                          Education
                        </h2>
                        {isOwnProfile && (
                          <button
                            onClick={() => startEdit('add_education', {})}
                            className="text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-colors duration-200"
                          >
                            Add Education
                          </button>
                        )}
            </div>
          </div>
                                        <div className="p-6">
                      {editingField === 'add_education' ? (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-[#007fff]/5 to-white rounded-xl border-2 border-[#007fff]/20 shadow-lg p-8">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 bg-[#007fff]/20 rounded-2xl flex items-center justify-center">
                                <AcademicCapIcon className="w-6 h-6 text-[#007fff]" />
                              </div>
                              <h4 className="text-2xl font-bold text-[#007fff]">Add New Education</h4>
        </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <AcademicCapIcon className="w-4 h-4" />
                                  Degree *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Doctor of Medicine (MD)"
                                  value={editValues.new_education_degree || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, new_education_degree: e.target.value }))}
                                  className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                />
                              </div>
                              
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <BuildingOfficeIcon className="w-4 h-4" />
                                  School/University *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Harvard Medical School"
                                  value={editValues.new_education_school || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, new_education_school: e.target.value }))}
                                  className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                />
                              </div>
                              
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <DocumentTextIcon className="w-4 h-4" />
                                  Field of Study
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Medicine, Cardiology"
                                  value={editValues.new_education_field || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, new_education_field: e.target.value }))}
                                  className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                />
                              </div>
                              

                              
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4" />
                                  Start Date *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                  <select
                                    value={editValues.new_education_start_month || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, new_education_start_month: e.target.value }))}
                                    className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  >
                                    <option value="">Month</option>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                      <option key={month} value={month}>{month}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={editValues.new_education_start_year || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, new_education_start_year: e.target.value }))}
                                    className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  >
                                    <option value="">Year</option>
                                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#007fff] flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4" />
                                  End Date
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                  <select
                                    value={editValues.new_education_end_month || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, new_education_end_month: e.target.value }))}
                                    className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  >
                                    <option value="">Month</option>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                      <option key={month} value={month}>{month}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={editValues.new_education_end_year || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, new_education_end_year: e.target.value }))}
                                    className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                  >
                                    <option value="">Year</option>
                                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 mt-8 pt-6 border-t-2 border-[#007fff]/20">
                <button 
                                onClick={() => saveEdit('add_education')}
                                className="px-8 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                                Save Education
                </button>
                <button 
                                onClick={cancelEdit}
                                className="px-8 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-xl hover:bg-[#007fff]/10 transition-all duration-300 text-sm font-semibold"
                              >
                                Cancel
                </button>
              </div>
            </div>
                        </div>
                      ) : education.length > 0 ? (
                        <div className="space-y-6">
                          {education.slice(0, 3).map((edu, index) => (
                            <EducationCard
                              key={edu.id}
                              education={edu}
                              isOwnProfile={isOwnProfile}
                              editingField={editingField}
                              editValues={editValues}
                              onStartEdit={startEdit}
                              onSaveEdit={saveEdit}
                              onCancelEdit={cancelEdit}
                              onUpdateEditValue={updateEditValue}
                            />
                          ))}
                          {education.length > 3 && (
                            <div className="text-center pt-4">
                              <button className="text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-colors duration-200">
                                View all {education.length} education entries
                              </button>
          </div>
        )}
            </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <AcademicCapIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-600">No education added yet</p>
                          {isOwnProfile && (
                            <button
                              onClick={() => startEdit('add_education', {})}
                              className="mt-3 text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-colors duration-200"
                            >
                              Add your first education
                            </button>
                          )}
          </div>
        )}
                    </div>
          </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        
      {/* Modals */}
      {showImageEditor && profile && (
        <EnhancedProfileImageEditor
          isOpen={showImageEditor}
          onClose={() => setShowImageEditor(false)}
          onUpdate={() => {
            setShowImageEditor(false);
            fetchProfileData();
          }}
          currentAvatar={profile.avatar_url}
          currentBanner={profile.banner_url}
        />
      )}

      {/* Contact Info Modal */}
      <ContactInfoModal
        profile={profile}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
} 