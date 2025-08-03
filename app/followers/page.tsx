'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  UserGroupIcon,
  MapPinIcon,
  AcademicCapIcon,
  UserIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/common/Avatar';
import { getProfile, getFollowers, getFollowing } from '@/lib/queries';
import type { Profile, FollowWithProfile } from '@/lib/queries';

export default function FollowersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [followers, setFollowers] = useState<FollowWithProfile[]>([]);
  const [following, setFollowing] = useState<FollowWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  // Debug logging
  const debugLog = useCallback((message: string, data?: unknown) => {
    console.log(`[FollowersPage] ${message}`, data);
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) {
        router.push('/signin');
        return;
      }

      try {
        const profile = await getProfile(user.id);
        setUserProfile(profile);

        if (!profile || profile.profile_type !== 'institution') {
          toast.error('This page is only available for healthcare institutions');
          router.push('/feed');
          return;
        }

        // Load followers and following data
        const [followersData, followingData] = await Promise.all([
          getFollowers(user.id),
          getFollowing(user.id),
        ]);

        setFollowers(followersData);
        setFollowing(followingData);
        debugLog('Data loaded successfully', { 
          followers: followersData.length, 
          following: followingData.length 
        });
      } catch (error) {
        debugLog('Error loading data', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, router, debugLog]);

  const getProfileTypeIcon = (profileType: string) => {
    switch (profileType) {
      case 'student':
        return <AcademicCapIcon className="h-4 w-4" />;
      case 'institution':
        return <UserGroupIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getProfileTypeLabel = (profileType: string) => {
    switch (profileType) {
      case 'student':
        return 'Student';
      case 'institution':
        return 'Institution';
      default:
        return 'Professional';
    }
  };

  const handleViewProfile = (profileId: string) => {
    router.push(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading followers...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.profile_type !== 'institution') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only available for healthcare institutions</p>
          <Button onClick={() => router.push('/feed')}>
            Go to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          
          
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              <UsersIcon className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userProfile.full_name} Network
          </h1>
          <p className="text-lg text-gray-600">
            Healthcare professionals following your institution
          </p>
        </div>

        {/* Stats Cards */}
        <div
          
          
          
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Followers</p>
                  <p className="text-3xl font-bold text-indigo-600">{followers.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Healthcare professionals</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <UsersIcon className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Following</p>
                  <p className="text-3xl font-bold text-purple-600">{following.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Other institutions</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <UserGroupIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div
          
          
          
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('followers')}
                className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'followers'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Followers ({followers.length})
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'following'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Following ({following.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'followers' ? (
              <div>
                {followers.length === 0 ? (
                  <div className="text-center py-12">
                    <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No followers yet</h3>
                    <p className="text-gray-500">
                      Healthcare professionals who follow your institution will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {followers.map((follow) => (
                      <div
                        key={follow.id}
                        
                        
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar 
                            src={follow.follower.avatar_url} 
                            alt={follow.follower.full_name || 'User'} 
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {follow.follower.full_name || 'Anonymous User'}
                            </h3>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              {getProfileTypeIcon(follow.follower.profile_type)}
                              <span>{getProfileTypeLabel(follow.follower.profile_type)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {follow.follower.headline && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {follow.follower.headline}
                          </p>
                        )}
                        
                        {follow.follower.location && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{follow.follower.location}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Followed {new Date(follow.created_at).toLocaleDateString()}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewProfile(follow.follower.id)}
                            className="text-xs"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {following.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Not following anyone</h3>
                    <p className="text-gray-500">
                      Institutions you follow will appear here
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Use the search bar to discover and follow institutions
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {following.map((follow) => (
                      <div
                        key={follow.id}
                        
                        
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar 
                            src={follow.following.avatar_url} 
                            alt={follow.following.full_name || 'Institution'} 
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {follow.following.full_name || 'Anonymous Institution'}
                            </h3>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              {getProfileTypeIcon(follow.following.profile_type)}
                              <span>{getProfileTypeLabel(follow.following.profile_type)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {follow.following.headline && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {follow.following.headline}
                          </p>
                        )}
                        
                        {follow.following.location && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{follow.following.location}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Following since {new Date(follow.created_at).toLocaleDateString()}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewProfile(follow.following.id)}
                            className="text-xs"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 