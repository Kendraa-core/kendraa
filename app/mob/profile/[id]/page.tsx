'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PostCard from '@/components/post/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProfile,
  getExperiences,
  getEducation,
  getPostsByAuthor,
  getConnectionStatus,
  sendConnectionRequest,
  followInstitution,
  unfollowInstitution,
  getFollowStatus,
  type Profile,
  type Experience,
  type Education,
  type PostWithAuthor
} from '@/lib/queries';
import FollowButton from '@/components/common/FollowButton';
import {
  UserPlusIcon,
  CheckIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  LinkIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function MobileProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [followStatus, setFollowStatus] = useState<'none' | 'following'>('none');
  const [canSendRequests, setCanSendRequests] = useState(true);
  const [actionType, setActionType] = useState<'connect' | 'follow' | 'none'>('none');

  const isOwnProfile = user?.id === id;

  const fetchProfileData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const [profileData, experienceData, educationData, postsData] = await Promise.all([
        getProfile(id),
        getExperiences(id),
        getEducation(id),
        getPostsByAuthor(id)
      ]);
      
      setProfile(profileData);
      setExperiences(experienceData);
      setEducation(educationData);
      setPosts(postsData);
      
      // Check user permissions and determine action type only if user is logged in
      if (!isOwnProfile && user?.id) {
        const [canSend, actionTypeResult, connectionData, followData] = await Promise.all([
          Promise.resolve(true), // Assume user can send requests
          Promise.resolve('connect'), // Default to connect action
          getConnectionStatus(user.id, id),
          profileData?.profile_type === 'institution' 
            ? getFollowStatus(user.id, id)
            : Promise.resolve(false)
        ]);
        
        setCanSendRequests(canSend);
        setActionType(actionTypeResult as 'connect' | 'follow' | 'none');
        setConnectionStatus((connectionData as 'none' | 'pending' | 'connected') || 'none');
        setFollowStatus(followData ? 'following' : 'none');
      }
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, isOwnProfile]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleConnect = async () => {
    if (!profile || !user || !canSendRequests) {
      toast.error('Unable to send request');
      return;
    }

    try {
      if (actionType === 'follow') {
        // Optimistically update the UI
        const previousStatus = followStatus;
        setFollowStatus('following');
        
        const success = await followInstitution(user.id, profile.id);
        if (success) {
          toast.success('Successfully followed institution');
          fetchProfileData(); // Refresh data
        } else {
          setFollowStatus(previousStatus);
          toast.error('Failed to follow institution');
        }
      } else if (actionType === 'connect') {
        // Optimistically update the UI
        const previousStatus = connectionStatus;
        setConnectionStatus('pending');
        
        const result = await sendConnectionRequest(user.id, profile.id);
        if (result) {
          toast.success('Connection request sent');
          fetchProfileData(); // Refresh data
        } else {
          setConnectionStatus(previousStatus);
          toast.error('Failed to send connection request');
        }
      }
    } catch (error) {
      console.error('Error connecting:', error);
      // Revert optimistic updates
      if (actionType === 'follow') {
        setFollowStatus('none');
      } else if (actionType === 'connect') {
        setConnectionStatus('none');
      }
      toast.error('Failed to send request');
    }
  };

  const handleUnfollow = async () => {
    if (!profile || !user) return;

    // Optimistically update the UI
    const previousStatus = followStatus;
    setFollowStatus('none');

    try {
      const success = await unfollowInstitution(user.id, profile.id);
      if (success) {
        toast.success('Unfollowed institution');
        fetchProfileData(); // Refresh data
      } else {
        setFollowStatus(previousStatus);
        toast.error('Failed to unfollow');
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
      setFollowStatus(previousStatus);
      toast.error('Failed to unfollow');
    }
  };

  const handlePostInteraction = () => {
    fetchProfileData();
  };

  const getButtonText = () => {
    if (actionType === 'follow') {
      return followStatus === 'following' ? 'Following' : 'Follow';
    } else if (actionType === 'connect') {
      return connectionStatus === 'pending' ? 'Pending' : 
             connectionStatus === 'connected' ? 'Connected' : 'Connect';
    }
    return '';
  };

  const getButtonAction = () => {
    if (actionType === 'follow' && followStatus === 'following') {
      return handleUnfollow;
    } else if (actionType === 'follow' || actionType === 'connect') {
      return handleConnect;
    }
    return undefined;
  };

  const isButtonDisabled = () => {
    return connectionStatus === 'pending' || connectionStatus === 'connected' || 
           (actionType === 'follow' && followStatus === 'following') ||
           !canSendRequests;
  };

  if (loading) {
    return (
      <MobileLayout title="Profile">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="md" text="Loading profile..." />
        </div>
      </MobileLayout>
    );
  }

  if (!profile) {
    return (
      <MobileLayout title="Profile">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <XCircleIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">Profile not found</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={profile.full_name || 'Profile'}>
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start space-x-4">
            <Avatar
              src={profile.avatar_url}
              alt={profile.full_name || 'User'}
              size="xl"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">
                {profile.full_name}
              </h1>
              <p className="text-gray-600 mt-1">
                {profile.headline || 'Healthcare Professional'}
              </p>
              
              {profile.location && (
                <div className="flex items-center mt-2 text-gray-500">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
              
              {/* Action Button */}
              {!isOwnProfile && user && actionType !== 'none' && (
                <div className="mt-4">
                  <FollowButton
                    targetUserId={profile.id}
                    targetUserType={profile.user_type as 'individual' | 'institution'}
                    currentUserType={user?.user_metadata?.user_type || 'individual'}
                    size="md"
                  />
                </div>
              )}
              
              {/* Sign in prompt for non-logged in users */}
              {!user && (
                <div className="mt-4">
                  <Link
                    href="/signin"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    {actionType === 'follow' ? 'Follow' : 'Connect'}
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}
          
          {/* Contact Info */}
          {(profile.email || profile.website) && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {profile.email && (
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center text-gray-600">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              Experience
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-blue-600">{exp.company}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <CalendarDaysIcon className="w-4 h-4 mr-1" />
                    <span>
                      {formatDate(exp.start_date)} - {exp.current ? 'Present' : formatDate(exp.end_date || '')}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="w-5 h-5 mr-2" />
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-green-200 pl-4">
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-green-600">{edu.school}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <CalendarDaysIcon className="w-4 h-4 mr-1" />
                    <span>
                      {formatDate(edu.start_date)} - {edu.current ? 'Present' : formatDate(edu.end_date || '')}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-gray-700 mt-2 text-sm">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Posts
            </h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-100 rounded-lg">
                  <PostCard
                    post={post}
                    onInteraction={handlePostInteraction}
                    onPostDeleted={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
