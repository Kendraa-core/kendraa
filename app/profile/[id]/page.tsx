'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/common/Avatar';
import Breadcrumb from '@/components/common/Breadcrumb';

import ShareButton from '@/components/common/ShareButton';
import PostCard from '@/components/post/PostCard';
import { cn, formatDate } from '@/lib/utils';
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
  ChatBubbleLeftIcon,
  EyeIcon,
  ShareIcon,
  UserGroupIcon,
  BookmarkIcon,
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
  getOrCreateConversation,
  followUser,
  unfollowUser,
  isFollowing,
  type Profile,
  type Experience,
  type Education,
  type PostWithAuthor,
} from '@/lib/queries';

// Memoized components for better performance
const ProfileHeader = React.memo(function ProfileHeader({ profile, isOwnProfile, connectionStatus, followStatus, onConnect, onUnfollow, realTimeViewsCount }: {
  profile: Profile;
  isOwnProfile: boolean;
  connectionStatus: string;
  followStatus: string;
  onConnect: () => void;
  onUnfollow: () => void;
  realTimeViewsCount: number;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const handleMessage = async () => {
    if (!user?.id) {
      toast.error('Please log in to send messages');
      return;
    }

    if (isOwnProfile) {
      toast.error('You cannot message yourself');
      return;
    }

    try {
      const conversation = await getOrCreateConversation(user.id, profile.id);
      if (conversation) {
        toast.success('Conversation started!');
        router.push(`/messaging?conversation=${conversation.id}`);
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-br from-linkedin-primary via-linkedin-secondary to-linkedin-accent rounded-t-xl overflow-hidden">
        {profile.banner_url ? (
          <Image
            src={profile.banner_url}
            alt="Profile banner"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-linkedin-primary via-linkedin-secondary to-linkedin-accent" />
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-16 left-6">
          <Avatar
            src={profile.avatar_url}
            alt={profile.full_name || 'User'}
            size="2xl"
            className="ring-4 ring-white shadow-xl bg-white"
          />
          {profile.is_premium && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center ring-2 ring-white">
              <CheckBadgeIcon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 space-x-3">
          {!isOwnProfile && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white shadow-sm"
              >
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleMessage}
                variant="outline" 
                size="sm"
                className="bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white shadow-sm"
              >
                <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                Message
              </Button>
              {profile.profile_type === 'institution' ? (
                // Institution - Show Follow/Unfollow
                followStatus === 'following' ? (
                  <Button
                    onClick={onUnfollow}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-lg"
                    size="sm"
                  >
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Following
                  </Button>
                ) : (
                  <Button
                    onClick={onConnect}
                    className="bg-linkedin-primary hover:bg-linkedin-secondary text-white shadow-lg"
                    size="sm"
                  >
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                )
              ) : (
                // Individual - Show Connect
                <Button
                  onClick={onConnect}
                  disabled={connectionStatus === 'pending' || connectionStatus === 'connected'}
                  className="bg-linkedin-primary hover:bg-linkedin-secondary text-white shadow-lg"
                  size="sm"
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'pending' ? 'Pending' : 'Connect'}
                </Button>
              )}
            </>
          )}
          
          {isOwnProfile && (
            <Button className="bg-linkedin-primary hover:bg-linkedin-secondary text-white shadow-lg" size="sm">
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Details */}
        <div className="mt-16">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.full_name || 'Anonymous User'}
            </h1>
            {profile.is_premium && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                Premium
              </span>
            )}
          </div>
          
          {profile.headline && (
            <p className="text-lg text-gray-600 mb-4">{profile.headline}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            {profile.location && (
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {profile.location}
              </div>
            )}
            {/* Profile views removed - only visible in dashboard */}
          </div>

          {profile.bio && (
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
});

const ContactInfo = React.memo(function ContactInfo({ profile }: { profile: Profile }) {
  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {profile.email && (
          <div className="flex items-center text-sm">
            <EnvelopeIcon className="w-4 h-4 mr-3 text-gray-400" />
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 text-gray-900">{profile.email}</span>
          </div>
        )}
        {profile.phone && (
          <div className="flex items-center text-sm">
            <PhoneIcon className="w-4 h-4 mr-3 text-gray-400" />
            <span className="text-gray-600">Phone:</span>
            <span className="ml-2 text-gray-900">{profile.phone}</span>
          </div>
        )}
        {profile.website && (
          <div className="flex items-center text-sm">
            <GlobeAltIcon className="w-4 h-4 mr-3 text-gray-400" />
            <span className="text-gray-600">Website:</span>
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-linkedin-primary hover:underline"
            >
              {profile.website}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [followStatus, setFollowStatus] = useState<'following' | 'not_following'>('not_following');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('about');
  // const [realTimeViewsCount, setRealTimeViewsCount] = useState<number>(0);

  const profileId = params.id as string;
  const isOwnProfile = user?.id === profileId;

  // Debug logging
  const debugLog = useCallback((message: string, data?: unknown) => {
    console.log(`[ProfilePage] ${message}`, data);
  }, []);

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

      // Profile views functionality commented out - no longer tracking views
      // const viewsCount = await getProfileViewsCount(profileId);
      // setRealTimeViewsCount(viewsCount);

      // Record profile view if not own profile
      // if (!isOwnProfile && user?.id) {
      //   await recordProfileView(profileId, user.id);
      //   // Update the views count after recording the view
      //   const updatedViewsCount = await getProfileViewsCount(profileId);
      //   setRealTimeViewsCount(updatedViewsCount);
      // }

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

      debugLog('Profile data loaded successfully', {
        profile: profileData,
        experiencesCount: experiencesData.length,
        educationCount: educationData.length,
        postsCount: postsData.length,
      });
    } catch (error) {
      debugLog('Error fetching profile data', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [profileId, isOwnProfile, user?.id, debugLog, router]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleConnect = useCallback(async () => {
    if (!user?.id || !profileId || !profile) {
      toast.error('Please log in to connect with others');
      return;
    }

    debugLog('Handling connect/follow action', { fromUserId: user.id, toUserId: profileId, profileType: profile.profile_type });

    try {
      if (profile.profile_type === 'institution') {
        // For institutions, use follow system
        const success = await followUser(user.id, profileId, 'individual', 'institution');
        if (success) {
          setFollowStatus('following');
          toast.success('Now following this institution!');
          debugLog('Follow action successful');
        } else {
          toast.error('Failed to follow institution');
          debugLog('Failed to follow institution');
        }
      } else {
        // For individuals, use connection system
        const success = await sendConnectionRequest(user.id, profileId);
        if (success) {
          setConnectionStatus('pending');
          toast.success('Connection request sent!');
          debugLog('Connection request sent successfully');
        } else {
          toast.error('Failed to send connection request');
          debugLog('Failed to send connection request');
        }
      }
    } catch (error) {
      debugLog('Error in connect/follow action', error);
      toast.error('Failed to complete action');
    }
  }, [user?.id, profileId, profile, debugLog]);

  const handleUnfollow = useCallback(async () => {
    if (!user?.id || !profileId) {
      toast.error('Please log in to unfollow');
      return;
    }

    debugLog('Unfollowing institution', { fromUserId: user.id, toUserId: profileId });

    try {
      const success = await unfollowUser(user.id, profileId);
      if (success) {
        setFollowStatus('not_following');
        toast.success('Unfollowed institution');
        debugLog('Unfollow action successful');
      } else {
        toast.error('Failed to unfollow institution');
        debugLog('Failed to unfollow institution');
      }
    } catch (error) {
      debugLog('Error unfollowing institution', error);
      toast.error('Failed to unfollow institution');
    }
  }, [user?.id, profileId, debugLog]);

  // Memoized section navigation
  const sections = useMemo(() => [
    { id: 'about', label: 'About', icon: UserPlusIcon },
    { id: 'experience', label: 'Experience', icon: BriefcaseIcon },
    { id: 'education', label: 'Education', icon: AcademicCapIcon },
    { id: 'activity', label: 'Activity', icon: CalendarIcon },
  ], []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-xl mb-4"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
          <Button onClick={() => router.push('/feed')} className="bg-linkedin-primary hover:bg-linkedin-secondary text-white">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div
          
          
          className="mb-6"
        >
          <Breadcrumb 
            items={[
              { label: 'Profiles', href: '/network' },
              { label: profile?.full_name || 'Profile' }
            ]} 
          />
        </div>

        {/* Elegant Header */}
        <div className="mb-6 flex justify-end">
          <ShareButton 
            title={`${profile?.full_name || 'User'}'s Profile`}
            description={`Check out ${profile?.full_name || 'this user'}'s professional profile on Kendraa`}
            url={window.location.href}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Profile Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Profile Header */}
            <div
              
              
              className="bg-white shadow-lg rounded-xl overflow-hidden"
            >
              <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                connectionStatus={connectionStatus}
                followStatus={followStatus}
                onConnect={handleConnect}
                onUnfollow={handleUnfollow}
                realTimeViewsCount={0}
              />
            </div>

            {/* Specializations */}
            {profile.specialization && profile.specialization.length > 0 && (
              <div
                
                
                
              >
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">Specialization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialization.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-linkedin-primary/10 text-linkedin-primary rounded-full text-sm font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Section Navigation */}
            <div
              
              
              
            >
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-0">
                  <div className="flex border-b border-gray-200">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2',
                          activeSection === section.id
                            ? 'text-linkedin-primary border-b-2 border-linkedin-primary bg-linkedin-primary/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        <section.icon className="w-4 h-4" />
                        <span>{section.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section Content */}
            <div
              key={activeSection}
              
              
              
            >
              {activeSection === 'about' && (
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.bio ? (
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {profile.bio}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">No bio available</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeSection === 'experience' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                  {experiences.length > 0 ? (
                    experiences.map((exp) => (
                      <Card key={exp.id} className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <BriefcaseIcon className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                              <p className="text-linkedin-primary font-medium">{exp.company}</p>
                              {exp.location && (
                                <p className="text-sm text-gray-500">{exp.location}</p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(exp.start_date)} - {exp.current ? 'Present' : (exp.end_date ? formatDate(exp.end_date) : 'Present')}
                              </p>
                              {exp.description && (
                                <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                              )}
                              {exp.specialization && exp.specialization.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {exp.specialization.map((spec, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-white shadow-lg border-0">
                      <CardContent className="p-6 text-center text-gray-500">
                        No experience added yet
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeSection === 'education' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                  {education.length > 0 ? (
                    education.map((edu) => (
                      <Card key={edu.id} className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <AcademicCapIcon className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                              <p className="text-linkedin-primary font-medium">{edu.school}</p>
                              {edu.field && (
                                <p className="text-sm text-gray-600">{edu.field}</p>
                              )}
                              {edu.specialization && (
                                <p className="text-sm text-gray-600">Specialization: {edu.specialization}</p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(edu.start_date)} - {edu.current ? 'Present' : (edu.end_date ? formatDate(edu.end_date) : 'Present')}
                              </p>
                              {edu.gpa && (
                                <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>
                              )}
                              {edu.honors && edu.honors.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {edu.honors.map((honor, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs"
                                    >
                                      {honor}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-white shadow-lg border-0">
                      <CardContent className="p-6 text-center text-gray-500">
                        No education added yet
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeSection === 'activity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  {posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-white shadow-lg border-0">
                      <CardContent className="p-6 text-center text-gray-500">
                        No recent activity
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Contact Information */}
            <div
              
              
              
            >
              <ContactInfo profile={profile} />
            </div>

            {/* Quick Stats */}
            <div
              
              
              
            >
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Profile Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Profile views removed - no longer displaying */}
                  {/* <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">Profile views</span>
                    <span className="font-semibold text-gray-900">{realTimeViewsCount}</span>
                  </div> */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Posts</span>
                    <span className="font-semibold text-gray-900">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-semibold text-gray-900">{experiences.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Links */}
            <div
              
              
              
            >
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Link
                      href="/network"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                    >
                      <UserGroupIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">My network</span>
                    </Link>
                    <Link
                      href="/saved"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                    >
                      <BookmarkSolidIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Saved items</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 