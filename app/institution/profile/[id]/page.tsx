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
import PostCard from '@/components/post/PostCard';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import {
  ArrowLeftIcon,
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
  getConnectionCount,
  getJobsByInstitution,
  getEventsByInstitution,
  followInstitution,
  unfollowInstitution,
  getFollowStatus,
  getInstitutionByAdminId
} from '@/lib/queries';
import type { Profile, Institution, Experience, Education, Post, JobWithCompany, EventWithOrganizer } from '@/types/database.types';

interface ActivityCardProps {
  posts: Post[];
  jobs: JobWithCompany[];
  events: EventWithOrganizer[];
  isOwnProfile: boolean;
  connectionCount: number;
  router: any;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ posts, jobs, events, isOwnProfile, connectionCount, router }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'jobs' | 'events'>('posts');

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'posts':
        return posts;
      case 'jobs':
        return jobs;
      case 'events':
        return events;
      default:
        return posts;
    }
  };

  const getCurrentTabCount = () => {
    switch (activeTab) {
      case 'posts':
        return posts.length;
      case 'jobs':
        return jobs.length;
      case 'events':
        return events.length;
      default:
        return posts.length;
    }
  };

  const JobCard = ({ job }: { job: JobWithCompany }) => (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h4>
        <span className="text-sm text-gray-500">{formatDate(job.created_at)}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{job.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <MapPinIcon className="w-3 h-3 mr-1" />
            {job.location}
          </span>
          <span className="flex items-center">
            <BriefcaseIcon className="w-3 h-3 mr-1" />
            {job.job_type}
          </span>
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View Job →
        </Link>
      </div>
    </div>
  );

  const EventCard = ({ event }: { event: EventWithOrganizer }) => (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h4>
        <span className="text-sm text-gray-500">{formatDate(event.created_at)}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <CalendarIcon className="w-3 h-3 mr-1" />
            {formatDate(event.start_date)}
          </span>
          <span className="flex items-center">
            <UserGroupIcon className="w-3 h-3 mr-1" />
            {event.attendees_count || 0} attendees
          </span>
        </div>
        <Link
          href={`/events/${event.id}`}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View Event →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-[#007fff]" />
            Institution Updates
          </h2>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('posts')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'posts'
                ? 'bg-white text-[#007fff] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <DocumentTextIcon className="w-4 h-4" />
              <span>Posts</span>
              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {posts.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'jobs'
                ? 'bg-white text-[#007fff] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <BriefcaseIcon className="w-4 h-4" />
              <span>Jobs</span>
              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {jobs.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'events'
                ? 'bg-white text-[#007fff] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>Events</span>
              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {events.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {getCurrentTabCount() > 0 ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {getCurrentTabData().map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {activeTab === 'posts' && <PostCard post={item as Post} onInteraction={() => {}} />}
                {activeTab === 'jobs' && <JobCard job={item as JobWithCompany} />}
                {activeTab === 'events' && <EventCard event={item as EventWithOrganizer} />}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {activeTab === 'posts' && <DocumentTextIcon className="w-8 h-8 text-gray-400" />}
              {activeTab === 'jobs' && <BriefcaseIcon className="w-8 h-8 text-gray-400" />}
              {activeTab === 'events' && <CalendarDaysIcon className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'posts' && 'No posts yet'}
              {activeTab === 'jobs' && 'No job postings yet'}
              {activeTab === 'events' && 'No events yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'posts' && 'This institution hasn\'t shared any posts yet.'}
              {activeTab === 'jobs' && 'This institution hasn\'t posted any job openings yet.'}
              {activeTab === 'events' && 'This institution hasn\'t organized any events yet.'}
            </p>
            {isOwnProfile && (
              <button className="inline-flex items-center px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors font-medium">
                <PlusIcon className="w-4 h-4 mr-2" />
                {activeTab === 'posts' && 'Create Post'}
                {activeTab === 'jobs' && 'Post Job'}
                {activeTab === 'events' && 'Create Event'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface AboutCardProps {
  profile: Profile | null;
  institution: Institution | null;
  isOwnProfile: boolean;
}

const AboutCard: React.FC<AboutCardProps> = ({ profile, institution, isOwnProfile }) => {
  if (!profile) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BuildingOfficeIcon className="w-5 h-5 text-[#007fff]" />
          About
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {profile.bio && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
              <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}
          
          {institution && (
            <>
              {institution.website && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Website</h3>
                  <a 
                    href={institution.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#007fff] hover:text-[#007fff]/80 transition-colors"
                  >
                    {institution.website}
                  </a>
                </div>
              )}
              
              {institution.specialties && institution.specialties.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {institution.specialties.map((specialty, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {institution.size && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Company Size</h3>
                  <p className="text-gray-600 capitalize">{institution.size}</p>
                </div>
              )}
            </>
          )}
          
          {profile.location && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                {profile.location}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PublicInstitutionProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState<'none' | 'following'>('none');

  const id = params.id as string;
  const isOwnProfile = user?.id === id;

  const fetchProfileData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Fetch profile data
      const profileData = await getProfile(id);
      setProfile(profileData);
      
      // Fetch institution data
      const institutionData = await getInstitutionByAdminId(id);
      setInstitution(institutionData);
      
      // Fetch experiences and education
      const [experiencesData, educationData] = await Promise.all([
        getExperiences(id),
        getEducation(id)
      ]);
      
      setExperiences(experiencesData);
      setEducation(educationData);
      
      // Fetch connection count (public data)
      const countData = await getConnectionCount(id);
      setConnectionCount(countData);
      
      // Fetch posts for activity
      const postsData = await getPostsByAuthor(id);
      setPosts(postsData);

      // Fetch jobs and events for institutions
      if (institutionData?.id) {
        const [jobsData, eventsData] = await Promise.all([
          getJobsByInstitution(institutionData.id),
          getEventsByInstitution(institutionData.id)
        ]);
        setJobs(jobsData);
        setEvents(eventsData);
      }
      
      // Fetch follow status only if user is logged in
      if (!isOwnProfile && user?.id) {
        const followData = await getFollowStatus(user.id, id);
        setFollowStatus(followData ? 'following' : 'none');
      } else {
        setFollowStatus('none');
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, isOwnProfile]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollow = async () => {
    if (!user?.id || !profile) {
      toast.error('Please sign in to follow this institution');
      return;
    }

    try {
      await followInstitution(user.id, profile.id);
      setFollowStatus('following');
      toast.success('Successfully followed institution');
    } catch (error) {
      console.error('Error following:', error);
      toast.error('Failed to follow institution');
    }
  };

  const handleUnfollow = async () => {
    if (!user?.id || !profile) {
      toast.error('Please sign in to unfollow this institution');
      return;
    }

    try {
      await unfollowInstitution(user.id, profile.id);
      setFollowStatus('none');
      toast.success('Unfollowed successfully');
    } catch (error) {
      console.error('Error unfollowing:', error);
      toast.error('Failed to unfollow');
    }
  };

  if (loading) {
    return <LoadingSpinner variant="fullscreen" text="Loading institution profile..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <XCircleIcon className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">The profile you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="flex items-start space-x-6">
                <Avatar
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Profile'}
                  size="xl"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {profile.full_name}
                      </h1>
                      <p className="text-xl text-gray-600 mb-4">
                        {institution?.type ? institution.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Healthcare Organization'}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-2" />
                          <span>{connectionCount} followers</span>
                        </div>
                        {profile.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About Section */}
            <AboutCard profile={profile} institution={institution} isOwnProfile={isOwnProfile} />

            {/* Activity Section */}
            <ActivityCard 
              posts={posts} 
              jobs={jobs}
              events={events}
              isOwnProfile={isOwnProfile} 
              connectionCount={connectionCount} 
              router={router}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Follow Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BuildingOfficeIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Follow This Institution</h3>
                <p className="text-gray-600 text-sm">
                  Stay updated with their latest posts, jobs, and events
                </p>
              </div>

              {user ? (
                <div className="space-y-4">
                  {followStatus === 'following' ? (
                    <button
                      onClick={handleUnfollow}
                      className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Following
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                    >
                      Follow Institution
                    </button>
                  )}
                </div>
              ) : (
                <Link
                  href="/signin"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Sign In to Follow
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
