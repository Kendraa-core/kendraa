'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { formatNumber, getSupabaseStorageUrl, formatRelativeTime } from '@/lib/utils';
import {
  PencilIcon,
  MapPinIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon,
  CameraIcon,
  ShareIcon,
  BuildingOfficeIcon,
  UsersIcon,
  EllipsisHorizontalIcon,
  PhoneIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  getProfile,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  getPostsByAuthor,
  getInstitutionJobs,
  getInstitutionEvents,
  getConnections
} from '@/lib/queries';
import type { Profile, PostWithAuthor, JobWithCompany, EventWithOrganizer } from '@/types/database.types';

export default function ProfilePage() {
  const { id } = useParams();
  const { user, profile: currentUserProfile } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState('Home');
  const [postsCurrentSlide, setPostsCurrentSlide] = useState(0);

  const isOwnProfile = user?.id === id;
  const isInstitution = profile?.user_type === 'institution' || profile?.profile_type === 'institution';

  useEffect(() => {
    if (id) {
      loadProfileData();
    }
  }, [id, user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      const profileData = await getProfile(id as string);
      if (!profileData) {
        toast.error('Profile not found');
        router.push('/');
        return;
      }
      
      setProfile(profileData);
      
      const [
        followingStatus,
        followersData,
        postsData,
        jobsData,
        eventsData,
        connectionsData
      ] = await Promise.all([
        user ? isFollowing(user.id, id as string) : false,
        getFollowers(id as string),
        getPostsByAuthor(id as string),
        profileData.user_type === 'institution' ? getInstitutionJobs(id as string, 6, 0) : Promise.resolve([]),
        profileData.user_type === 'institution' ? getInstitutionEvents(id as string, 3, 0) : Promise.resolve([]),
        getConnections(id as string)
      ]);

      setIsFollowingUser(followingStatus);
      setFollowersCount(followersData.length);
      setPosts(postsData);
      setJobs(jobsData);
      setEvents(eventsData);
      setConnections(connectionsData);

    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile) return;

    try {
      if (isFollowingUser) {
        await unfollowUser(user.id, profile.id);
        setIsFollowingUser(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success('Unfollowed successfully');
      } else {
        const userType = currentUserProfile?.user_type === 'institution' ? 'institution' : 'individual';
        const targetType = profile.user_type === 'institution' ? 'institution' : 'individual';
        await followUser(user.id, profile.id, userType, targetType);
        setIsFollowingUser(true);
        setFollowersCount(prev => prev + 1);
        toast.success('Following successfully');
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
    }
  };

  const nextPostsSlide = () => {
    setPostsCurrentSlide(prev => (prev + 1) % Math.ceil(posts.length / 2));
  };

  const prevPostsSlide = () => {
    setPostsCurrentSlide(prev => prev === 0 ? Math.ceil(posts.length / 2) - 1 : prev - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
          <p className="text-gray-600 mt-2">The profile you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const tabs = isInstitution 
    ? ['Home', 'About', 'Posts', 'Jobs', 'Life', 'People']
    : ['Home', 'About', 'Posts', 'Experience', 'Education', 'Connections'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white">
        {/* Cover Photo */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 to-blue-800">
          {profile.banner_url && (
            <Image
              src={profile.banner_url.startsWith('http') ? profile.banner_url : getSupabaseStorageUrl('banners', profile.banner_url)}
              alt="Cover photo"
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Edit Cover Photo Button */}
          {isOwnProfile && (
            <button className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
              <CameraIcon className="w-4 h-4" />
              Edit cover photo
            </button>
          )}
          
          {/* Company Logo/Profile Picture */}
          <div className="absolute -bottom-16 left-6 md:left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-lg bg-white p-2 shadow-lg">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url.startsWith('http') ? profile.avatar_url : getSupabaseStorageUrl('avatars', profile.avatar_url)}
                    alt={profile.full_name || (profile as any).name || 'Profile'}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    {isInstitution ? (
                      <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                    ) : (
                      <UserIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
              
              {isOwnProfile && (
                <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 pb-6 px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {profile.full_name || (profile as any).name}
                </h1>
                {(profile as any).verified && (
                  <CheckBadgeIcon className="w-6 h-6 text-blue-600" />
                )}
              </div>
              
              <p className="text-lg text-gray-600 mb-3">
                {isInstitution ? (profile as any).description : profile.bio}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
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
                      Visit website
                    </a>
                  </div>
                )}
                {isInstitution && (profile as any).established_year && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Est. {(profile as any).established_year}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{formatNumber(followersCount)}</span>
                  <span className="text-gray-600">followers</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{formatNumber(connections.length)}</span>
                  <span className="text-gray-600">connections</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!isOwnProfile && user && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    isFollowingUser
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowingUser ? 'Following' : 'Follow'}
                </button>
              )}
              
              {isOwnProfile && (
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
                  Edit profile
                </button>
              )}
              
              <button className="p-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
                <ShareIcon className="w-5 h-5" />
              </button>
              
              <button className="p-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
                <EllipsisHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t border-gray-200">
          <nav className="px-6 md:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* Home Tab */}
        {activeTab === 'Home' && (
          <div className="space-y-8">
            {/* Overview Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                {isInstitution 
                  ? (profile as any).description || `${(profile as any).name} is a leading organization in their field.`
                  : profile.bio || 'Professional with expertise in various fields.'
                }
              </p>
              <button className="mt-4 text-blue-600 font-medium hover:underline">
                Show all details →
              </button>
            </div>

            {/* Page Posts Section */}
            {posts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isInstitution ? 'Page posts' : 'Recent posts'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPostsSlide}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={posts.length <= 2}
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPostsSlide}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={posts.length <= 2}
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.slice(postsCurrentSlide * 2, (postsCurrentSlide * 2) + 2).map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {isInstitution ? (
                              <BuildingOfficeIcon className="w-6 h-6" />
                            ) : (
                              (profile.full_name || (profile as any).name || 'U')[0]
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{profile.full_name || (profile as any).name}</h3>
                            <p className="text-sm text-gray-500">{formatRelativeTime(post.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-gray-800 mb-4 line-clamp-3">{post.content}</p>
                        {post.image_url && (
                          <div className="rounded-lg overflow-hidden mb-4">
                            <Image
                              src={post.image_url}
                              alt="Post image"
                              width={400}
                              height={200}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>👍 {post.likes_count}</span>
                          <span>💬 {post.comments_count} comments</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events (for institutions) */}
            {isInstitution && events.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming event</h2>
                  <Link href={`/institution/events`} className="text-blue-600 font-medium hover:underline">
                    Show all events →
                  </Link>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(events[0].start_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <h3 className="font-medium text-gray-900 mb-2">{events[0].title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{events[0].description}</p>
                    <p className="text-sm text-gray-500">{events[0].attendees_count} attendees</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Job Openings (for institutions) */}
            {isInstitution && jobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent job openings</h2>
                  <Link href={`/institution/jobs`} className="text-blue-600 font-medium hover:underline">
                    Show all {jobs.length} jobs →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.slice(0, 2).map((job) => (
                    <div key={job.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Life at Company (for institutions) */}
            {isInstitution && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Life at {(profile as any).name}</h2>
                  <button className="text-blue-600 font-medium hover:underline">
                    See life at {(profile as any).name} →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <PhotoIcon className="w-8 h-8 text-white/70" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-right text-sm text-gray-500 mt-4">+11 photos</p>
              </div>
            )}

            {/* People Highlights (for institutions) */}
            {isInstitution && connections.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">People highlights</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      {connections.length} employees who studied High School/Secondary Diplomas and Certificates
                    </h3>
                    <div className="flex items-center gap-3">
                      {connections.slice(0, 4).map((connection) => (
                        <div key={connection.id} className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                            {connection.avatar_url ? (
                              <Image
                                src={connection.avatar_url.startsWith('http') ? connection.avatar_url : getSupabaseStorageUrl('avatars', connection.avatar_url)}
                                alt={connection.full_name || 'User'}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 text-center max-w-16 truncate">
                            {connection.full_name?.split(' ')[0]}
                          </p>
                        </div>
                      ))}
                      {connections.length > 4 && (
                        <div className="text-sm text-gray-500">
                          99+ others
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'About' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">About</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Overview</h3>
                <p className="text-gray-700 leading-relaxed">
                  {isInstitution 
                    ? (profile as any).description || `${(profile as any).name} is a leading organization dedicated to excellence in their field.`
                    : profile.bio || 'Professional with diverse experience and expertise.'
                  }
                </p>
              </div>
              
              {isInstitution && (
                <>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Industry</h3>
                    <p className="text-gray-700">{(profile as any).specializations?.[0] || 'Healthcare'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Company size</h3>
                    <p className="text-gray-700">
                      {(profile as any).size === 'large' ? '10,000+ employees' : 
                       (profile as any).size === 'medium' ? '1,000-10,000 employees' : 
                       '1-1,000 employees'}
                    </p>
                  </div>
                  
                  {(profile as any).established_year && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Founded</h3>
                      <p className="text-gray-700">{(profile as any).established_year}</p>
                    </div>
                  )}
                </>
              )}
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contact info</h3>
                <div className="space-y-3">
                  {profile.website && (
                    <div className="flex items-center gap-3">
                      <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{profile.phone}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'Posts' && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">Posts will appear here when they&apos;re published.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                        {isInstitution ? (
                          <BuildingOfficeIcon className="w-6 h-6" />
                        ) : (
                          (profile.full_name || (profile as any).name || 'U')[0]
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{profile.full_name || (profile as any).name}</h3>
                          {(profile as any).verified && (
                            <CheckBadgeIcon className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{formatRelativeTime(post.created_at)}</p>
                        
                        <p className="text-gray-800 mb-4">{post.content}</p>
                        
                        {post.image_url && (
                          <div className="rounded-lg overflow-hidden mb-4">
                            <Image
                              src={post.image_url}
                              alt="Post image"
                              width={600}
                              height={300}
                              className="w-full h-64 object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
                          <span>👍 {post.likes_count} likes</span>
                          <span>💬 {post.comments_count} comments</span>
                          <span>↗️ {post.shares_count} shares</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab (for institutions) */}
        {activeTab === 'Jobs' && isInstitution && (
          <div className="space-y-6">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <BriefcaseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No job openings</h3>
                <p className="text-gray-500">Job openings will appear here when they&apos;re posted.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <BriefcaseIcon className="w-4 h-4" />
                            <span>{job.job_type}</span>
                          </div>
                          <span>Posted {formatRelativeTime(job.created_at)}</span>
                        </div>
                      </div>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tabs - placeholder content */}
        {(activeTab === 'Life' || activeTab === 'People' || activeTab === 'Experience' || activeTab === 'Education' || activeTab === 'Connections') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{activeTab}</h2>
            <p className="text-gray-500">Content for {activeTab} tab will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
