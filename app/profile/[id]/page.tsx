'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
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
  ClockIcon
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
  type Profile,
  type Experience,
  type Education,
  type PostWithAuthor,
} from '@/lib/queries';

// Memoized components for better performance
const ProfileHeader = React.memo(function ProfileHeader({ profile, isOwnProfile, connectionStatus, followStatus, connectionCount, experiences, education, onConnect, onUnfollow, onEditProfile, onEditImages }: {
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
}) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-azure-500 to-azure-600 relative">
        {profile.banner_url && (
          <Image
            src={profile.banner_url}
            alt="Profile banner"
            fill
            className="object-cover"
          />
        )}
        
        {/* Edit banner button for own profile */}
        {isOwnProfile && (
          <button
            onClick={onEditImages}
            className="absolute top-3 right-3 bg-black/20 text-white p-2 rounded-lg hover:bg-black/30 transition-colors"
          >
            <CameraIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between -mt-12 sm:-mt-16 mb-4 gap-3">
          {/* Avatar */}
          <div className="relative self-start">
            <Avatar
              src={profile.avatar_url}
              alt={profile.full_name || 'Profile'}
              size="2xl"
              className="border-4 border-white shadow-lg"
            />
            {isOwnProfile && (
              <button
                onClick={onEditImages}
                className="absolute -bottom-1 -right-1 bg-azure-600 text-white p-1.5 rounded-full hover:bg-azure-700 transition-colors"
              >
                <CameraIcon className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 self-start">
            {isOwnProfile ? (
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors text-sm font-medium">
                  <PlusIcon className="w-4 h-4 mr-1.5" />
                  Open to
                </button>
                <button className="inline-flex items-center px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  <PlusIcon className="w-4 h-4 mr-1.5" />
                  Add profile section
                </button>
                <button 
                  onClick={onEditProfile}
                  className="inline-flex items-center px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <PencilIcon className="w-4 h-4 mr-1.5" />
                  Edit Profile
                </button>
              </div>
            ) : (
              <>
                {profile.profile_type === 'institution' ? (
                  followStatus === 'following' ? (
                    <button
                      onClick={onUnfollow}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Following
                    </button>
                  ) : (
                    <button
                      onClick={onConnect}
                      className="inline-flex items-center px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors text-sm font-medium"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Follow
                    </button>
                  )
                ) : (
                  connectionStatus === 'connected' ? (
                    <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Connected
                    </span>
                  ) : connectionStatus === 'pending' ? (
                    <span className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                      Pending
                    </span>
                  ) : (
                    <button
                      onClick={onConnect}
                      className="inline-flex items-center px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors text-sm font-medium"
                    >
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Connect
                    </button>
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              {profile.full_name || 'Anonymous User'}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mt-1">
              {profile.headline || 'Healthcare Professional'}
            </p>
          </div>

          {/* Location & Contact */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {profile.location && (
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1.5" />
                {profile.location}
              </div>
            )}
            <div className="flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-1.5" />
              <span className="text-azure-600 hover:underline cursor-pointer">Contact info</span>
            </div>
          </div>

          {/* Connections & Followers */}
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-azure-600 font-medium hover:underline cursor-pointer">{formatNumber(connectionCount)} connections</span>
            <span className="text-azure-600 font-medium hover:underline cursor-pointer">{formatNumber(connectionCount)} followers</span>
          </div>

          {/* Current Role & Education */}
          <div className="flex flex-wrap gap-4 text-sm">
            {experiences.length > 0 && (
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                <span className="text-azure-600 hover:underline cursor-pointer">{experiences[0].company}</span>
              </div>
            )}
            {education.length > 0 && (
              <div className="flex items-center">
                <AcademicCapIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                <span className="text-azure-600 hover:underline cursor-pointer">{education[0].school}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});



const AboutCard = React.memo(function AboutCard({ profile, isOwnProfile, onEditProfile }: { profile: Profile; isOwnProfile: boolean; onEditProfile: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">About</h3>
        {isOwnProfile && (
          <button 
            onClick={onEditProfile}
            className="text-gray-500 hover:text-gray-700"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="text-gray-700 leading-relaxed">
        {profile.bio ? (
          <p>{profile.bio}</p>
        ) : (
          <p className="text-gray-500 italic">No bio available</p>
        )}
      </div>
    </div>
  );
});

const SkillsCard = React.memo(function SkillsCard({ profile, isOwnProfile, onEditSkills }: { profile: Profile; isOwnProfile: boolean; onEditSkills: () => void }) {
  const skills = profile.specialization || [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top skills</h3>
        {isOwnProfile && (
          <button 
            onClick={onEditSkills}
            className="text-gray-500 hover:text-gray-700"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <span className="text-gray-700">{skill}</span>
              {isOwnProfile && (
                <button 
                  onClick={onEditSkills}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No skills added yet</p>
          </div>
        )}
      </div>
    </div>
  );
});

const ExperienceCard = React.memo(function ExperienceCard({ experience, isOwnProfile, onEditExperience }: { experience: Experience; isOwnProfile: boolean; onEditExperience: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BriefcaseIcon className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{experience.title}</h3>
              <p className="text-azure-600 font-medium text-sm sm:text-base">{experience.company}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {formatDate(experience.start_date)} - {experience.end_date ? formatDate(experience.end_date) : 'Present'}
              </p>
              {experience.description && (
                <p className="text-gray-700 mt-2 text-xs sm:text-sm leading-relaxed">
                  {experience.description}
                </p>
              )}
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <button 
            onClick={onEditExperience}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});

const EducationCard = React.memo(function EducationCard({ education, isOwnProfile, onEditEducation }: { education: Education; isOwnProfile: boolean; onEditEducation: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AcademicCapIcon className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{education.degree}</h3>
              <p className="text-azure-600 font-medium text-sm sm:text-base">{education.school}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {formatDate(education.start_date)} - {education.end_date ? formatDate(education.end_date) : 'Present'}
              </p>
              {education.description && (
                <p className="text-gray-700 mt-2 text-xs sm:text-sm leading-relaxed">
                  {education.description}
                </p>
              )}
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <button 
            onClick={onEditEducation}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});

const ActivityCard = React.memo(function ActivityCard({ posts, isOwnProfile, connectionCount }: { posts: PostWithAuthor[]; isOwnProfile: boolean; connectionCount: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
          <p className="text-sm text-gray-600">{formatNumber(connectionCount)} followers</p>
        </div>
        {isOwnProfile && (
          <button className="inline-flex items-center px-3 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors text-sm font-medium">
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Create a post
          </button>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button className="px-4 py-2 text-azure-600 border-b-2 border-azure-600 font-medium text-sm">
          Posts
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm">
          Comments
        </button>
      </div>

      {/* Posts */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          <button className="text-azure-600 hover:text-azure-700 text-sm font-medium">
            Show all posts →
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No posts yet</p>
        </div>
      )}
    </div>
  );
});

const SidebarCard = React.memo(function SidebarCard({ profile, isOwnProfile }: { profile: Profile; isOwnProfile: boolean }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="space-y-3">
          <button className="w-full text-left text-gray-600 hover:text-gray-900 text-sm">
            Resources
          </button>
          <button className="w-full text-left text-gray-600 hover:text-gray-900 text-sm">
            Add profile section
          </button>
          <button className="w-full text-left text-gray-600 hover:text-gray-900 text-sm">
            Open to
          </button>
        </div>
      </div>



      {/* Similar People */}
      <SimilarPeople />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-azure-200 border-t-azure-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
        <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
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
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* About */}
            <AboutCard profile={profile} isOwnProfile={isOwnProfile} onEditProfile={handleEditProfile} />

            {/* Skills */}
            <SkillsCard profile={profile} isOwnProfile={isOwnProfile} onEditSkills={handleEditSkills} />

            {/* Experience */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
                {isOwnProfile && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleEditExperience}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleEditExperience}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {experiences.length > 0 ? (
                <div className="space-y-4">
                                  {experiences.map((experience) => (
                  <ExperienceCard key={experience.id} experience={experience} isOwnProfile={isOwnProfile} onEditExperience={handleEditExperience} />
                ))}
                  <button className="text-azure-600 hover:text-azure-700 text-sm font-medium">
                    Show all {experiences.length} experiences →
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No experience added yet</p>
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                {isOwnProfile && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleEditEducation}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleEditEducation}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {education.length > 0 ? (
                <div className="space-y-4">
                                  {education.map((edu) => (
                  <EducationCard key={edu.id} education={edu} isOwnProfile={isOwnProfile} onEditEducation={handleEditEducation} />
                ))}
                  <button className="text-azure-600 hover:text-azure-700 text-sm font-medium">
                    Show all {education.length} educations →
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No education added yet</p>
                </div>
              )}
            </div>

            {/* Activity */}
            <ActivityCard posts={posts} isOwnProfile={isOwnProfile} connectionCount={connectionCount} />
          </div>

                     {/* Right Column - Sidebar */}
           <div className="lg:col-span-4 space-y-6">
             {/* Profile Completion Card - Only show for own profile */}
             {isOwnProfile && (
               <div className="bg-white rounded-lg border border-gray-200 p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                   <span className="text-2xl font-bold text-azure-600">{getProfileCompletionPercentage()}%</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                   <div
                     className="bg-azure-500 h-2 rounded-full transition-all duration-500"
                     style={{ width: `${getProfileCompletionPercentage()}%` }}
                   ></div>
                 </div>
                 {getProfileCompletionPercentage() < 50 && !localStorage.getItem(`onboarding_completed_${user?.id}`) && (
                   <button
                     onClick={() => router.push('/onboarding')}
                     className="w-full px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 transition-colors text-sm font-medium"
                   >
                     Complete Profile
                   </button>
                 )}
               </div>
             )}
             <SidebarCard profile={profile} isOwnProfile={isOwnProfile} />
           </div>
         </div>
       </div>

       {/* Modals */}
       {showEditModal && (
         <EditProfileModal
           profile={profile}
           onClose={() => setShowEditModal(false)}
           onUpdate={handleProfileUpdate}
         />
       )}

       {showImageEditor && (
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
     </div>
   );
 } 