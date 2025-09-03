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
import EditProfileModal from '@/components/profile/EditProfileModal';
import ProfileImageEditor from '@/components/profile/ProfileImageEditor';
import PostCard from '@/components/post/PostCard';
import SimilarPeople from '@/components/profile/SimilarPeople';
import { cn, formatDate, formatNumber } from '@/lib/utils';
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
  EyeIcon,
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
  SparklesIcon,
  FireIcon,
  BellIcon,
  XCircleIcon,
  ClockIcon,
  BeakerIcon,
  HeartIcon,
  ShieldCheckIcon,
  DocumentTextIcon
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
  getConnectionCount,
  getEventsByOrganizer,
  updateProfile,
  type Profile,
  type Experience,
  type Education,
  type PostWithAuthor,
} from '@/lib/queries';

// Medical specialization badges mapping
const MEDICAL_SPECIALIZATIONS = {
  'Cardiology': { color: 'bg-red-100 text-red-700 border-red-200', icon: HeartIcon },
  'Neurology': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: BeakerIcon },
  'Oncology': { color: 'bg-pink-100 text-pink-700 border-pink-200', icon: ShieldCheckIcon },
  'Pediatrics': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: UserIcon },
  'Radiology': { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: EyeIcon },
  'Surgery': { color: 'bg-green-100 text-green-700 border-green-200', icon: SparklesIcon },
  'Default': { color: 'bg-[#007fff]/10 text-[#007fff] border-[#007fff]/20', icon: UserIcon }
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

// Memoized components for better performance
const ProfileHeader = React.memo(function ProfileHeader({ profile, isOwnProfile, connectionStatus, followStatus, connectionCount, experiences, education, onConnect, onUnfollow, onEditProfile, onEditImages, onRemoveOpportunities, showOpportunities, onViewContactInfo }: {
  profile: Profile;
  isOwnProfile: boolean;
  connectionStatus: string;
  followStatus: string;
  connectionCount: number;
  experiences: Experience[];
  education: Education[];
  onConnect: () => void;
  onUnfollow: () => void;
  onEditProfile: () => void;
  onEditImages: () => void;
  onRemoveOpportunities: () => void;
  showOpportunities: boolean;
  onViewContactInfo: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl border border-[#007fff]/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
    >
      {/* Modern Banner with Gradient Overlay */}
      <div className="relative h-64 bg-gradient-to-br from-[#007fff] via-[#007fff]/90 to-[#007fff]/80 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-8 left-8 w-16 h-16 border-2 border-white rounded-full"></div>
          <div className="absolute top-16 right-16 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-12 left-1/3 w-8 h-8 border border-white rounded-full"></div>
          <div className="absolute bottom-16 right-1/4 w-10 h-10 border border-white rounded-full"></div>
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
            onClick={onEditImages}
            className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/30 transition-all duration-300 transform hover:scale-110 border border-white/30"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Profile Content Section */}
      <div className="px-8 py-8">
        {/* Top Row: Avatar, Name, and Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between -mt-24 mb-8 gap-8">
          {/* Left Side: Avatar and Profile Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar Container */}
            <div className="relative self-start">
              <div className="relative">
                <Avatar
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Profile'}
                  size="2xl"
                  className="border-4 border-white shadow-2xl ring-4 ring-[#007fff]/20 w-32 h-32"
                />
              </div>
              {/* Edit Avatar Button */}
              {isOwnProfile && (
                <button
                  onClick={onEditImages}
                  className="absolute -bottom-2 -right-2 bg-[#007fff] text-white p-2.5 rounded-full hover:bg-[#007fff]/90 transition-all duration-300 shadow-lg transform hover:scale-110"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Information */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Name */}
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl font-bold text-black">
                  {profile.full_name || 'Anonymous User'}
                </h1>
              </div>
              
              {/* Headline */}
              <p className="text-2xl sm:text-3xl text-gray-700 font-medium">
                {profile.headline || 'Healthcare Professional'}
              </p>
              
              {/* Medical Specializations */}
              {profile.specialization && profile.specialization.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {profile.specialization.slice(0, 3).map((spec, index) => {
                    const badgeStyle = MEDICAL_SPECIALIZATIONS[spec as keyof typeof MEDICAL_SPECIALIZATIONS] || MEDICAL_SPECIALIZATIONS.Default;
                    const IconComponent = badgeStyle.icon;
                    return (
                      <span key={index} className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold border-2 ${badgeStyle.color} hover:scale-105 transition-transform duration-200`}>
                        <IconComponent className="w-4 h-4 mr-2" />
                        {spec}
                      </span>
                    );
                  })}
                  {profile.specialization.length > 3 && (
                    <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold bg-gray-100 text-gray-600 border-2 border-gray-200">
                      +{profile.specialization.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Profile Stats and Action Buttons */}
          <div className="flex flex-col gap-6 self-start lg:self-start min-w-[280px]">
            {/* Current Position and Education - Vertical Layout */}
            <div className="space-y-4">
              {experiences.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BriefcaseIcon className="w-4 h-4 text-[#007fff]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{experiences[0].title}</p>
                    <p className="text-sm text-[#007fff]">{experiences[0].company}</p>
                    {experiences[0].location && (
                      <p className="text-xs text-gray-600">📍 {experiences[0].location}</p>
                    )}
                  </div>
                </div>
              )}
              
              {education.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AcademicCapIcon className="w-4 h-4 text-[#007fff]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{education[0].degree}</p>
                    <p className="text-sm text-[#007fff]">{education[0].school}</p>
                    {education[0].field && (
                      <p className="text-xs text-gray-600">📚 {education[0].field}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Network Stats */}
            <div className="flex gap-6">
              <button 
                onClick={() => router.push(`/profile/${profile.id}/connections`)}
                className="text-center group"
              >
                <div className="text-2xl font-bold text-[#007fff] group-hover:scale-110 transition-transform duration-200">
                  {formatNumber(connectionCount)}
                </div>
                <div className="text-sm font-medium text-[#007fff]/80 group-hover:text-[#007fff] transition-colors duration-200">
                  connections
                </div>
              </button>
              
              <button 
                onClick={() => router.push(`/profile/${profile.id}/followers`)}
                className="text-center group"
              >
                <div className="text-2xl font-bold text-[#007fff] group-hover:scale-110 transition-transform duration-200">
                  {formatNumber(connectionCount)}
                </div>
                <div className="text-sm font-medium text-[#007fff]/80 group-hover:text-[#007fff] transition-colors duration-200">
                  followers
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {isOwnProfile ? (
                <>
                  <button 
                    className="inline-flex items-center justify-center px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-all duration-200 text-sm font-semibold w-full"
                  >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Open to work
                  </button>
                  <button 
                    onClick={() => router.push('/profile/setup')}
                    className="inline-flex items-center justify-center px-4 py-2 bg-white text-[#007fff] border border-[#007fff] rounded-lg hover:bg-[#007fff]/5 transition-all duration-200 text-sm font-semibold w-full"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add profile section
                  </button>
                </>
              ) : (
                <>
                  {profile.profile_type === 'institution' ? (
                    followStatus === 'following' ? (
                      <button
                        onClick={onUnfollow}
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-semibold border border-gray-200 w-full"
                      >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Following
                      </button>
                    ) : (
                                          <button
                      onClick={onConnect}
                      className="inline-flex items-center justify-center px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-all duration-200 text-sm font-semibold w-full"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Follow
                    </button>
                    )
                  ) : (
                    connectionStatus === 'connected' ? (
                      <span className="inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 w-full">
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Connected
                      </span>
                    ) : connectionStatus === 'pending' ? (
                      <span className="inline-flex items-center justify-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-semibold border border-yellow-200 w-full">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Pending
                      </span>
                    ) : (
                      <button
                        onClick={onConnect}
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-all duration-200 text-sm font-semibold w-full"
                      >
                        <UserPlusIcon className="w-4 h-4 mr-2" />
                        Connect
                      </button>
                    )
                  )}
                  <button 
                    onClick={() => router.push(`/messages?user=${profile.id}`)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-white text-[#007fff] border border-[#007fff] rounded-lg hover:bg-[#007fff]/5 transition-all duration-200 text-sm font-semibold w-full"
                  >
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {profile.location && (
              <p className="text-gray-600 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                {profile.location}
              </p>
            )}
            <button 
              onClick={onViewContactInfo}
              className="text-[#007fff] hover:underline text-sm font-medium flex items-center gap-2"
            >
              <UserGroupIcon className="w-4 h-4" />
              Contact info
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});



const AboutCard = React.memo(function AboutCard({ profile, isOwnProfile, onEditProfile }: { profile: Profile; isOwnProfile: boolean; onEditProfile: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-3xl border border-[#007fff]/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#007fff]/10 rounded-xl flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-[#007fff]" />
          </div>
          <h3 className="text-xl font-bold text-[#007fff]">About</h3>
        </div>
        {isOwnProfile && (
          <button 
            onClick={onEditProfile}
            className="text-[#007fff]/60 hover:text-[#007fff] p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="text-gray-700 leading-relaxed text-base">
        {profile.bio ? (
          <p className="whitespace-pre-wrap">{profile.bio}</p>
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-[#007fff]/30 mx-auto mb-3" />
            <p className="text-gray-500 italic">Share your medical background and professional interests</p>
            {isOwnProfile && (
              <button 
                onClick={onEditProfile}
                className="mt-4 px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors text-sm font-medium"
              >
                Add About Section
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

const SkillsCard = React.memo(function SkillsCard({ profile, isOwnProfile, onEditSkills }: { profile: Profile; isOwnProfile: boolean; onEditSkills: () => void }) {
  const skills = profile.specialization || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-3xl border border-[#007fff]/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#007fff]/10 rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-[#007fff]" />
          </div>
          <h3 className="text-xl font-bold text-[#007fff]">Medical Specializations</h3>
        </div>
        {isOwnProfile && (
          <button 
            onClick={onEditSkills}
            className="text-[#007fff]/60 hover:text-[#007fff] p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="space-y-3">
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, index) => {
              const badgeStyle = MEDICAL_SPECIALIZATIONS[skill as keyof typeof MEDICAL_SPECIALIZATIONS] || MEDICAL_SPECIALIZATIONS.Default;
              const IconComponent = badgeStyle.icon;
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`group flex items-center px-4 py-3 rounded-xl border-2 ${badgeStyle.color} hover:shadow-lg transition-all duration-200 cursor-pointer`}
                >
                  <IconComponent className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{skill}</span>
                  {isOwnProfile && (
                    <button 
                      onClick={onEditSkills}
                      className="ml-2 opacity-0 group-hover:opacity-100 text-current hover:scale-110 transition-all duration-200"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <SparklesIcon className="w-16 h-16 text-[#007fff]/30 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No specializations added yet</p>
            <p className="text-gray-500 text-sm mb-6">Showcase your medical expertise and areas of focus</p>
            {isOwnProfile && (
              <button 
                onClick={onEditSkills}
                className="px-6 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium"
              >
                Add Specializations
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

const ExperienceCard = React.memo(function ExperienceCard({ experience, isOwnProfile, onEditExperience }: { experience: Experience; isOwnProfile: boolean; onEditExperience: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-xl border border-[#007fff]/10 p-6 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-[#007fff]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#007fff]/20 transition-colors">
              <BriefcaseIcon className="w-7 h-7 text-[#007fff]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-black text-lg mb-1">{experience.title}</h3>
              <p className="text-[#007fff] font-semibold text-base mb-2 hover:underline cursor-pointer">{experience.company}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <CalendarIcon className="w-4 h-4 text-[#007fff]" />
                <span className="font-medium">
                  {formatDate(experience.start_date)} - {experience.end_date ? formatDate(experience.end_date) : 'Present'}
                </span>
                {!experience.end_date && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Current</span>
                )}
              </div>
              {experience.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPinIcon className="w-4 h-4 text-[#007fff]" />
                  <span>{experience.location}</span>
                </div>
              )}
              {experience.description && (
                <div className="bg-[#007fff]/5 rounded-lg p-4 mt-3">
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {experience.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <button 
            onClick={onEditExperience}
            className="opacity-0 group-hover:opacity-100 text-[#007fff]/60 hover:text-[#007fff] ml-3 p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
});

const EducationCard = React.memo(function EducationCard({ education, isOwnProfile, onEditEducation }: { education: Education; isOwnProfile: boolean; onEditEducation: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="group bg-white rounded-xl border border-[#007fff]/10 p-6 hover:border-[#007fff]/20 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 bg-[#007fff]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#007fff]/20 transition-colors">
              <AcademicCapIcon className="w-7 h-7 text-[#007fff]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-black text-lg mb-1">{education.degree}</h3>
              <p className="text-[#007fff] font-semibold text-base mb-2 hover:underline cursor-pointer">{education.school}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <CalendarIcon className="w-4 h-4 text-[#007fff]" />
                <span className="font-medium">
                  {formatDate(education.start_date)} - {education.end_date ? formatDate(education.end_date) : 'Present'}
                </span>
              </div>
              {education.field && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <BeakerIcon className="w-4 h-4 text-[#007fff]" />
                  <span className="font-medium">{education.field}</span>
                </div>
              )}
              {education.description && (
                <div className="bg-[#007fff]/5 rounded-lg p-4 mt-3">
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                    {education.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <button 
            onClick={onEditEducation}
            className="opacity-0 group-hover:opacity-100 text-[#007fff]/60 hover:text-[#007fff] ml-3 p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
});

const ActivityCard = React.memo(function ActivityCard({ posts, isOwnProfile, connectionCount }: { posts: PostWithAuthor[]; isOwnProfile: boolean; connectionCount: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl border border-[#007fff]/10 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#007fff]/10 rounded-xl flex items-center justify-center">
            <FireIcon className="w-5 h-5 text-[#007fff]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#007fff]">Recent Activity</h3>
            <p className="text-sm text-[#007fff]/60">{formatNumber(connectionCount)} followers</p>
          </div>
        </div>
        {isOwnProfile && (
          <button className="inline-flex items-center px-4 py-2.5 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-200 text-sm font-medium shadow-lg transform hover:scale-105">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Post
          </button>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-[#007fff]/20 mb-6">
        <button className="px-4 py-3 text-[#007fff] border-b-2 border-[#007fff] font-semibold text-sm bg-[#007fff]/5 rounded-t-lg">
          Posts
        </button>
        <button className="px-4 py-3 text-[#007fff]/60 hover:text-[#007fff] font-medium text-sm transition-colors">
          Articles
        </button>
        <button className="px-4 py-3 text-[#007fff]/60 hover:text-[#007fff] font-medium text-sm transition-colors">
          Research
        </button>
      </div>

      {/* Posts */}
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.slice(0, 2).map((post, index) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-[#007fff]/10 rounded-xl p-4 hover:border-[#007fff]/20 transition-colors"
            >
              <PostCard post={post} />
            </motion.div>
          ))}
          <button className="w-full text-center py-3 text-[#007fff] hover:text-[#007fff]/80 text-sm font-semibold border border-[#007fff]/20 rounded-xl hover:bg-[#007fff]/5 transition-all duration-200">
            Show all {posts.length} posts →
          </button>
        </div>
      ) : (
                  <div className="text-center py-12">
            <FireIcon className="w-16 h-16 text-[#007fff]/30 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No posts yet</p>
            <p className="text-gray-500 text-sm mb-6">Share your medical insights and professional updates</p>
          {isOwnProfile && (
            <button className="px-6 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium">
              Create Your First Post
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
});

const SidebarCard = React.memo(function SidebarCard({ profile, isOwnProfile }: { 
  profile: Profile; 
  isOwnProfile: boolean; 
}) {
  return (
    <div className="space-y-8">
      {/* Profile Strength */}
      <div className="bg-white rounded-3xl border border-[#007fff]/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
        <h4 className="text-lg font-bold text-[#007fff] mb-4 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5" />
          Profile Strength
        </h4>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">60%</span>
            <span className="text-xs text-gray-500">Intermediate</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#007fff] h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>
        <p className="text-sm text-gray-600">Add more details to improve your profile strength</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border border-[#007fff]/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
        <h4 className="text-lg font-bold text-[#007fff] mb-4 flex items-center gap-2">
          <StarIcon className="w-5 h-5" />
          Quick Actions
        </h4>
        <div className="space-y-3">
          <button className="w-full text-left text-gray-600 hover:text-[#007fff] text-sm font-medium p-3 rounded-xl hover:bg-[#007fff]/5 transition-all duration-200 flex items-center gap-3">
            <DocumentTextIcon className="w-4 h-4 text-[#007fff]" />
            Medical Resources
          </button>
          <button className="w-full text-left text-gray-600 hover:text-[#007fff] text-sm font-medium p-3 rounded-xl hover:bg-[#007fff]/5 transition-all duration-200 flex items-center gap-3">
            <PlusIcon className="w-4 h-4 text-[#007fff]" />
            Add Profile Section
          </button>
          <button className="w-full text-left text-gray-600 hover:text-[#007fff] text-sm font-medium p-3 rounded-xl hover:bg-[#007fff]/5 transition-all duration-200 flex items-center gap-3">
            <SparklesIcon className="w-4 h-4 text-[#007fff]" />
            Open to Opportunities
          </button>
          <button className="w-full text-left text-gray-600 hover:text-[#007fff] text-sm font-medium p-3 rounded-xl hover:bg-[#007fff]/5 transition-all duration-200 flex items-center gap-3">
            <ShareIcon className="w-4 h-4 text-[#007fff]" />
            Share Profile
          </button>
        </div>
      </div>

      {/* Medical Interests */}
      <div className="bg-white rounded-3xl border border-[#007fff]/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
        <h4 className="text-lg font-bold text-[#007fff] mb-4 flex items-center gap-2">
          <BeakerIcon className="w-5 h-5" />
          Medical Interests
        </h4>
        <div className="space-y-2">
          {['Cardiology', 'Research', 'Innovation', 'Patient Care'].map((interest, index) => (
            <span key={index} className="inline-block bg-[#007fff]/10 text-[#007fff] px-3 py-1.5 rounded-full text-xs font-medium mr-2 mb-2">
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Similar Professionals */}
      <div className="bg-white rounded-3xl border border-[#007fff]/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
        <h4 className="text-lg font-bold text-[#007fff] mb-4 flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5" />
          Similar Professionals
        </h4>
        <SimilarPeople />
      </div>
    </div>
  );
});

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const profileId = params.id as string;
  const isOwnProfile = user?.id === profileId;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('none');
  const [followStatus, setFollowStatus] = useState<string>('not_following');
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showOpportunities, setShowOpportunities] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);

  const debugLog = (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Profile] ${message}`, data);
    }
  };

  // Memoized data fetching functions
  const fetchProfileData = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    debugLog('Fetching profile data', { profileId });

    try {
      const [profileData, experiencesData, educationData, postsData] = await Promise.all([
        getProfile(profileId),
        getExperiences(profileId),
        getEducation(profileId),
        getPostsByAuthor(profileId),
      ]);

      if (!profileData) {
        debugLog('Profile not found', { profileId });
        toast.error('Profile not found');
        router.push('/feed');
        return;
      }

      setProfile(profileData);
      setExperiences(experiencesData);
      setEducation(educationData);
      setPosts(postsData);

      // Get connection count
      try {
        const connections = await getConnectionCount(profileId);
        setConnectionCount(connections);
      } catch (error) {
        console.error('Error fetching connection count:', error);
      }

      // Get user events if it's their own profile
      if (isOwnProfile) {
        try {
          const events = await getEventsByOrganizer(profileId);
          setUserEvents(events);
        } catch (error) {
          console.error('Error fetching user events:', error);
        }
      }

      // Get connection/follow status if not own profile
      if (!isOwnProfile && user?.id) {
        if (profileData.profile_type === 'institution') {
          // For institutions, check follow status
          const isFollowingUser = await isFollowing(user.id, profileId);
          setFollowStatus(isFollowingUser ? 'following' : 'not_following');
        } else {
          // For individuals, check connection status
          const status = await getConnectionStatus(user.id, profileId);
          setConnectionStatus((status as 'none' | 'pending' | 'connected') || 'none');
        }
      }

      debugLog('Profile data fetched successfully', {
        profile: profileData,
        experiences: experiencesData.length,
        education: educationData.length,
        posts: postsData.length
      });
    } catch (error) {
      debugLog('Error fetching profile data', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [profileId, isOwnProfile, user?.id, router]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleConnect = async () => {
    if (!user?.id || !profile) return;

    try {
      if (profile.profile_type === 'institution') {
        const success = await followUser(user.id, profile.id, 'individual', 'institution');
        if (success) {
          setFollowStatus('following');
          toast.success('Now following this institution!');
        } else {
          toast.error('Failed to follow institution');
        }
      } else {
        const success = await sendConnectionRequest(user.id, profile.id);
        if (success) {
          setConnectionStatus('pending');
          toast.success('Connection request sent!');
        } else {
          toast.error('Failed to send connection request');
        }
      }
    } catch (error) {
      console.error('Error connecting/following:', error);
      toast.error('Failed to complete action');
    }
  };

  const handleUnfollow = async () => {
    if (!user?.id || !profile) return;

    try {
      const success = await unfollowUser(user.id, profile.id);
      if (success) {
        setFollowStatus('not_following');
        toast.success('Unfollowed institution');
      } else {
        toast.error('Failed to unfollow institution');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
      toast.error('Failed to unfollow');
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleEditExperience = () => {
    setShowEditModal(true);
    // TODO: Open experience tab in modal
  };

  const handleEditEducation = () => {
    setShowEditModal(true);
    // TODO: Open education tab in modal
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.full_name,
      profile.headline,
      profile.bio,
      profile.location,
      profile.avatar_url
    ];
    
    const completed = fields.filter(field => {
      if (typeof field === 'string') {
        return field && field.trim() !== '';
      }
      return field;
    }).length;
    
    return Math.round((completed / fields.length) * 100);
  };

  const handleEditSkills = () => {
    setShowEditModal(true);
    // TODO: Open skills tab in modal
  };

  const handleEditImages = () => {
    setShowImageEditor(true);
  };

  const handleProfileUpdate = () => {
    fetchProfileData();
    setShowEditModal(false);
  };

  const handleRemoveOpportunities = () => {
    setShowOpportunities(false);
    toast.success('You are no longer open to opportunities.');
  };

  const handleViewContactInfo = () => {
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#007fff]/20 border-t-[#007fff] rounded-full animate-spin mx-auto"></div>
          <p className="text-[#007fff] mt-6 text-lg font-medium">Loading medical profile...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-[#007fff]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Profile Header */}
                      <ProfileHeader
              profile={profile}
              isOwnProfile={isOwnProfile}
              connectionStatus={connectionStatus}
              followStatus={followStatus}
              connectionCount={connectionCount}
              experiences={experiences}
              education={education}
              onConnect={handleConnect}
              onUnfollow={handleUnfollow}
              onEditProfile={handleEditProfile}
              onEditImages={handleEditImages}
              onRemoveOpportunities={handleRemoveOpportunities}
              showOpportunities={showOpportunities}
              onViewContactInfo={handleViewContactInfo}
            />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            {/* Left Column - Main Content */}
            <div className="xl:col-span-8 space-y-12">
              {/* About */}
              <AboutCard profile={profile} isOwnProfile={isOwnProfile} onEditProfile={handleEditProfile} />

              {/* Skills */}
              <SkillsCard profile={profile} isOwnProfile={isOwnProfile} onEditSkills={handleEditSkills} />

                          {/* Experience */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl border border-[#007fff]/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#007fff]/10 rounded-xl flex items-center justify-center">
                    <BriefcaseIcon className="w-5 h-5 text-[#007fff]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#007fff]">Professional Experience</h2>
                </div>
                {isOwnProfile && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleEditExperience}
                      className="text-[#007fff]/60 hover:text-[#007fff] p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
                      title="Add Experience"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleEditExperience}
                      className="text-[#007fff]/60 hover:text-[#007fff] p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
                      title="Edit Experience"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              {experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiences.map((experience, index) => (
                    <motion.div
                      key={experience.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ExperienceCard experience={experience} isOwnProfile={isOwnProfile} onEditExperience={handleEditExperience} />
                    </motion.div>
                  ))}
                  {experiences.length > 2 && (
                    <button className="w-full text-center py-3 text-[#007fff] hover:text-[#007fff]/80 text-sm font-semibold border border-[#007fff]/20 rounded-xl hover:bg-[#007fff]/5 transition-all duration-200">
                      Show all {experiences.length} experiences →
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BriefcaseIcon className="w-16 h-16 text-[#007fff]/30 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No experience added yet</p>
                  <p className="text-gray-500 text-sm mb-6">Showcase your medical career and professional achievements</p>
                  {isOwnProfile && (
                    <button 
                      onClick={handleEditExperience}
                      className="px-6 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium"
                    >
                      Add Experience
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Education */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="bg-white rounded-3xl border border-[#007fff]/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#007fff]/10 rounded-xl flex items-center justify-center">
                    <AcademicCapIcon className="w-5 h-5 text-[#007fff]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#007fff]">Medical Education</h2>
                </div>
                {isOwnProfile && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleEditEducation}
                      className="text-[#007fff]/60 hover:text-[#007fff] p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
                      title="Add Education"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleEditEducation}
                      className="text-[#007fff]/60 hover:text-[#007fff] p-2 rounded-lg hover:bg-[#007fff]/5 transition-all duration-200"
                      title="Edit Education"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              {education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <motion.div
                      key={edu.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <EducationCard education={edu} isOwnProfile={isOwnProfile} onEditEducation={handleEditEducation} />
                    </motion.div>
                  ))}
                  {education.length > 2 && (
                    <button className="w-full text-center py-3 text-[#007fff] hover:text-[#007fff]/80 text-sm font-semibold border border-[#007fff]/20 rounded-xl hover:bg-[#007fff]/5 transition-all duration-200">
                      Show all {education.length} education →
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AcademicCapIcon className="w-16 h-16 text-[#007fff]/30 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No education added yet</p>
                  <p className="text-gray-500 text-sm mb-6">Add your medical degree and educational background</p>
                  {isOwnProfile && (
                    <button 
                      onClick={handleEditEducation}
                      className="px-6 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium"
                    >
                      Add Education
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Activity */}
            <ActivityCard posts={posts} isOwnProfile={isOwnProfile} connectionCount={connectionCount} />
          </div>

            {/* Right Column - Sidebar */}
            <div className="xl:col-span-4 space-y-12">
              {/* Profile Completion Card - Only show for own profile */}
              {isOwnProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-white rounded-3xl border border-[#007fff]/10 p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#007fff]/10 rounded-xl flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-[#007fff]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#007fff]">Profile Strength</h3>
                    </div>
                    <span className="text-3xl font-bold text-[#007fff]">{getProfileCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-[#007fff]/10 rounded-full h-3 mb-4">
                    <div
                      className="bg-gradient-to-r from-[#007fff] to-[#007fff]/80 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${getProfileCompletionPercentage()}%` }}
                    ></div>
                  </div>
                                   {getProfileCompletionPercentage() < 50 && !profile.onboarding_completed && (
                   <button
                     onClick={() => router.push('/onboarding')}
                     className="w-full px-4 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-200 text-sm font-medium shadow-lg transform hover:scale-105"
                   >
                     Complete Your Profile
                   </button>
                 )}
                  {getProfileCompletionPercentage() >= 80 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <CheckBadgeIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-700 font-medium text-sm">Excellent! Your profile is complete</p>
                    </div>
                  )}
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <SidebarCard profile={profile} isOwnProfile={isOwnProfile} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showEditModal && profile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Edit Profile - Test Modal</h3>
              <p>Profile: {profile.full_name}</p>
              <p>Email: {profile.email}</p>
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    handleProfileUpdate();
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 bg-[#007fff] text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Debug: Show when modal should be visible */}
        {showEditModal && !profile && (
          <div className="fixed inset-0 bg-red-500/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <h3>Debug: Modal should be visible but no profile</h3>
              <p>showEditModal: {showEditModal.toString()}</p>
              <p>profile: {profile ? 'exists' : 'null'}</p>
            </div>
          </div>
        )}
        

        


        {showImageEditor && profile && (
          <ProfileImageEditor
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
          onClose={handleCloseContactModal}
        />
      </div>
    </div>
  );
} 