'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedProfileImageEditor from '@/components/profile/EnhancedProfileImageEditor';
import { formatNumber, getSupabaseStorageUrl } from '@/lib/utils';
import {
  PencilIcon,
  MapPinIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CameraIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  LinkIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  PhoneIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  PlusIcon as PlusSolidIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  type Profile,
} from '@/lib/queries';



export default function InstitutionProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);

  // Inline editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    full_name?: string;
    bio?: string;
    location?: string;
    established_year?: string;
    website?: string;
    [key: string]: any;
  }>({});

  const isOwnProfile = user?.id === profile?.id;

  const fetchProfileData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [profileData, followersData, followStatus] = await Promise.all([
        getProfile(user.id),
        getFollowers(user.id),
        user?.id ? isFollowing(user.id, user.id) : Promise.resolve(false)
      ]);

      setProfile(profileData);
      setFollowerCount(followersData.length);
      setIsFollowingUser(followStatus);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Redirect if not an institution user
  useEffect(() => {
    if (profile && profile.user_type !== 'institution' && profile.profile_type !== 'institution') {
      router.push(`/profile/${user?.id}`);
    }
  }, [profile, user?.id, router]);

  const startEdit = (field: string, value: any) => {
    setEditingField(field);
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (field: string) => {
    if (!user?.id || !profile) return;

    try {
      const updates = { [field]: editValues[field] };
      await updateProfile(user.id, updates);
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setEditingField(null);
      setEditValues({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleFollow = async () => {
    if (!user?.id || !profile || isOwnProfile) return;

    setFollowLoading(true);
    try {
      if (isFollowingUser) {
        await unfollowUser(user.id, profile.id);
        setIsFollowingUser(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast.success('Unfollowed successfully');
      } else {
        await followUser(user.id, profile.id, 'individual', 'institution');
        setIsFollowingUser(true);
        setFollowerCount(prev => prev + 1);
        toast.success('Following successfully');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditImages = () => {
    setShowImageEditor(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-[#007fff]/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
          <p className="text-sm text-[#007fff]">Loading institution profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-[#007fff]/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Institution profile not found</p>
          <button 
            onClick={() => router.push('/institution/onboarding')}
            className="mt-4 px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors"
          >
            Complete Institution Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* LinkedIn-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Institution Profile</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ShareIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="relative h-64 bg-gradient-to-r from-[#007fff] to-blue-600 overflow-hidden">
        {profile.banner_url ? (
          <div className="relative w-full h-full">
            <Image
              src={profile.banner_url.startsWith('http') ? profile.banner_url : getSupabaseStorageUrl('banners', profile.banner_url)}
              alt="Cover photo"
              fill
              className="object-cover"
              onError={(e) => {
                console.error('Banner image failed to load:', e);
                e.currentTarget.style.display = 'none';
                // Show fallback gradient
                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-gradient');
                if (fallback) {
                  (fallback as HTMLElement).style.display = 'block';
                }
              }}
            />
            <div className="fallback-gradient absolute inset-0 bg-gradient-to-r from-[#007fff] to-blue-600" style={{ display: 'none' }}></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#007fff] to-blue-600"></div>
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Edit Cover Photo Button */}
        {isOwnProfile && (
          <button
            onClick={handleEditImages}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
          >
            <CameraIcon className="w-4 h-4" />
            Edit cover photo
          </button>
        )}
      </div>

      {/* Profile Section */}
      <div className="relative max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 -mt-16 mb-6">
          {/* Profile Header */}
          <div className="p-6 pt-16">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Profile Picture */}
                <div className="relative">
                  {profile.avatar_url ? (
                    <div className="relative">
                      <Image
                        src={profile.avatar_url.startsWith('http') ? profile.avatar_url : getSupabaseStorageUrl('avatars', profile.avatar_url)}
                        alt="Profile picture"
                        width={120}
                        height={120}
                        className="w-30 h-30 object-cover rounded-full border-4 border-white shadow-lg"
                        onError={(e) => {
                          console.error('Avatar image failed to load:', e);
                          e.currentTarget.style.display = 'none';
                          // Show fallback
                          const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                          if (fallback) {
                            (fallback as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div className="avatar-fallback w-30 h-30 bg-gray-200 rounded-full border-4 border-white shadow-lg items-center justify-center" style={{ display: 'none' }}>
                        <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-30 h-30 bg-gray-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Verification Badge */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckBadgeIcon className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Edit Profile Picture Button */}
                  {isOwnProfile && (
                    <button
                      onClick={handleEditImages}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center border-2 border-white transition-colors"
                    >
                      <CameraIcon className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {profile.full_name || 'Healthcare Institution'}
                  </h1>
                  <p className="text-gray-600 mb-2">
                    {profile.bio || 'Connecting healthcare professionals worldwide'}
                  </p>
                  
                  {/* Location and Website */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-1">
                        <GlobeAltIcon className="w-4 h-4" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website
                        </a>
                      </div>
                    )}
                    {(profile as any).established_year && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Est. {(profile as any).established_year}</span>
                      </div>
                    )}
                  </div>

                  {/* Follower Count */}
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">{formatNumber(followerCount)}</span> followers
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${
                      isFollowingUser
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {followLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    ) : isFollowingUser ? (
                      <>
                        <HeartSolidIcon className="w-4 h-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </button>
                )}
                
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-colors">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Message
                </button>
                
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LinkedIn-style Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">About</h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => startEdit('bio', profile.bio)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                {editingField === 'bio' ? (
                  <div className="space-y-4">
                    <textarea
                      value={editValues.bio || profile.bio || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                      rows={4}
                      placeholder="Tell us about your institution..."
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => saveEdit('bio')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {profile.bio || 'No description provided yet. This institution is dedicated to advancing healthcare through innovation and collaboration.'}
                  </p>
                )}
              </div>
            </div>

            {/* Activity Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Activity</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MegaphoneIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No recent activity</p>
                  {isOwnProfile && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Share an update
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Contact info</h2>
              </div>
              <div className="p-6 space-y-4">
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
                
                {profile.location && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{profile.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                
                {(profile as any).established_year && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Established {(profile as any).established_year}</span>
                  </div>
                )}
              </div>
            </div>

            {/* People Also Viewed */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">People also viewed</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No suggestions available</p>
                </div>
              </div>
            </div>

            {/* Jobs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Jobs</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BriefcaseIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm mb-3">No job posts available</p>
                  {isOwnProfile && (
                    <button className="text-blue-600 hover:underline text-sm font-medium">
                      Post a job
                    </button>
                  )}
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
    </div>
  );
}
