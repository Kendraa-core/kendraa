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
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS,
  ANIMATIONS 
} from '@/lib/design-system';
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
  DocumentTextIcon,
  CameraIcon
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
  getInstitutionById,
  getInstitutionByUserId,
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
    <div className={COMPONENTS.card.base}>
      <div className={COMPONENTS.card.header}>
        <div className="flex items-center justify-between">
          <h2 className={`${TYPOGRAPHY.heading.h3} flex items-center gap-2`}>
            <DocumentTextIcon className={COMPONENTS.icon.primary} />
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

  // Helper function to format institution size
  const formatInstitutionSize = (size: string) => {
    switch (size) {
      case 'small': return '1-50 employees';
      case 'medium': return '51-500 employees';
      case 'large': return '501-2000 employees';
      case 'enterprise': return '2000+ employees';
      default: return size;
    }
  };

  // Helper function to format institution type
  const formatInstitutionType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={COMPONENTS.card.base}>
      <div className={COMPONENTS.card.header}>
        <h2 className={`${TYPOGRAPHY.heading.h3} flex items-center gap-2`}>
          <BuildingOfficeIcon className={COMPONENTS.icon.primary} />
          About Our Institution
        </h2>
        {isOwnProfile && (
          <button className="text-[#007fff] hover:text-[#007fff]/80 transition-colors text-sm font-medium">
            Edit
          </button>
        )}
      </div>
      <div className={COMPONENTS.card.content}>
        <div className="space-y-6">
          {/* Institution Description */}
          {institution?.description && (
            <div>
              <p className="text-gray-600 leading-relaxed">{institution.description}</p>
            </div>
          )}

          {/* Institution Type */}
          {institution?.type && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
                Institution Type
              </h3>
              <p className="text-gray-600">{formatInstitutionType(institution.type)}</p>
            </div>
          )}

          {/* Institution Size */}
          {institution?.size && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <UserGroupIcon className="w-4 h-4 mr-2 text-gray-400" />
                Institution Size
              </h3>
              <p className="text-gray-600">{formatInstitutionSize(institution.size)}</p>
            </div>
          )}

          {/* Established Year */}
          {institution?.established_year && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                Established
              </h3>
              <p className="text-gray-600">{institution.established_year}</p>
            </div>
          )}

          {/* Location */}
          {institution?.location && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                Location
              </h3>
              <p className="text-gray-600">{institution.location}</p>
            </div>
          )}

          {/* Website */}
          {institution?.website && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-400" />
                Website
              </h3>
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

          {/* Contact Information */}
          {(institution?.email || institution?.phone) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                Contact Information
              </h3>
              <div className="space-y-2">
                {institution.email && (
                  <div className="flex items-center text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`mailto:${institution.email}`} className="hover:text-[#007fff] transition-colors">
                      {institution.email}
                    </a>
                  </div>
                )}
                {institution.phone && (
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`tel:${institution.phone}`} className="hover:text-[#007fff] transition-colors">
                      {institution.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Specialties */}
          {institution?.specialties && institution.specialties.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <AcademicCapIcon className="w-4 h-4 mr-2 text-gray-400" />
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {institution.specialties.map((specialty, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Accreditation */}
          {institution?.accreditation && institution.accreditation.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <CheckBadgeIcon className="w-4 h-4 mr-2 text-gray-400" />
                Accreditation
              </h3>
              <div className="flex flex-wrap gap-2">
                {institution.accreditation.map((accred, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {accred}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification Status */}
          {institution?.verified !== undefined && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <CheckBadgeIcon className="w-4 h-4 mr-2 text-gray-400" />
                Verification Status
              </h3>
              <div className="flex items-center">
                {institution.verified ? (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <CheckIcon className="w-4 h-4 mr-1" />
                    Verified Institution
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Pending Verification
                  </span>
                )}
              </div>
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
  const [canSendRequests, setCanSendRequests] = useState(true);

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
      const institutionData = await getInstitutionByUserId(id);
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
        try {
          const [jobsData, eventsData] = await Promise.all([
            getJobsByInstitution(institutionData.id),
            getEventsByInstitution(institutionData.id)
          ]);
          setJobs(jobsData);
          setEvents(eventsData);
        } catch (error) {
          console.error('Error fetching institution jobs/events:', error);
          // Don't throw here, just log the error and continue
        }
      }
      
      // Check user permissions and follow status only if user is logged in
      if (!isOwnProfile && user?.id) {
        const [followData] = await Promise.all([
          getFollowStatus(user.id, id)
        ]);
        setCanSendRequests(true);
        setFollowStatus(followData ? 'following' : 'none');
      } else {
        setCanSendRequests(true);
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

    if (!canSendRequests) {
      toast.error('Institutions cannot follow other institutions');
      return;
    }

    try {
      const success = await followInstitution(user.id, profile.id);
      if (success) {
        setFollowStatus('following');
        toast.success('Successfully followed institution');
      } else {
        toast.error('Failed to follow institution');
      }
    } catch (error: any) {
      console.error('Error following:', error);
      toast.error(error.message || 'Failed to follow institution');
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
    <div className={`min-h-screen ${BACKGROUNDS.page.primary}`}>
      <div className="flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="space-y-8">
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
                {institution?.banner_url && (
                  <Image
                    src={institution.banner_url}
                    alt="Institution banner"
                    fill
                    className="object-cover mix-blend-overlay"
                  />
                )}
                
                {/* Edit Banner Button */}
                {isOwnProfile && (
                  <button
                    onClick={() => {/* Handle edit banner */}}
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
                      src={institution?.logo_url || profile.avatar_url}
                      alt={profile.full_name || 'Institution'}
                      size="2xl"
                      className="border-4 border-white shadow-2xl ring-4 ring-[#007fff]/20 w-36 h-36"
                    />
                    {/* Edit Avatar Button */}
                    {isOwnProfile && (
                      <button
                        onClick={() => {/* Handle edit avatar */}}
                        className="absolute -bottom-2 -right-2 bg-[#007fff] text-white p-2 rounded-full hover:bg-[#007fff]/90 transition-all duration-300 shadow-lg transform hover:scale-110"
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
                      <h1 className="text-3xl sm:text-4xl font-bold text-[#007fff] leading-tight">
                        {profile.full_name || 'Healthcare Institution'}
                      </h1>
                      
                      {/* Headline */}
                      <p className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed">
                        {institution?.type ? institution.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Healthcare Organization'}
                      </p>
                    </div>

                    {/* Institution Details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {institution?.location && (
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span>{institution.location}</span>
                        </div>
                      )}
                      {institution?.established_year && (
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          <span>Est. {institution.established_year}</span>
                        </div>
                      )}
                      {institution?.size && (
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          <span>
                            {institution.size === 'small' ? '1-50 employees' :
                             institution.size === 'medium' ? '51-500 employees' :
                             institution.size === 'large' ? '501-2000 employees' :
                             institution.size === 'enterprise' ? '2000+ employees' :
                             institution.size}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Connections and Contact */}
                    <div className="flex items-center gap-6 pt-2 text-sm text-gray-600">
                      <button 
                        onClick={() => {/* Handle followers click */}}
                        className="hover:text-[#007fff] transition-colors duration-200"
                      >
                        <span className="font-semibold text-[#007fff]">{formatNumber(connectionCount)}</span> followers
                      </button>
                      {institution?.email && (
                        <button 
                          onClick={() => {/* Handle contact info */}}
                          className="text-[#007fff] hover:text-[#007fff]/80 hover:underline font-semibold transition-all duration-200 flex items-center gap-2 group"
                        >
                          <div className="w-4 h-4 bg-[#007fff]/10 rounded-full flex items-center justify-center group-hover:bg-[#007fff]/20 transition-colors duration-200">
                            <EnvelopeIcon className="w-2 h-2 text-[#007fff]" />
                          </div>
                          Contact info
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side: Action Buttons */}
                  <div className="flex flex-col gap-3 min-w-[320px]">
                    {user ? (
                      <div className="space-y-3">
                        {!canSendRequests ? (
                          <div className="w-full px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold text-center">
                            <XCircleIcon className="w-4 h-4 inline mr-2" />
                            Institutions Cannot Follow Other Institutions
                          </div>
                        ) : followStatus === 'following' ? (
                          <button
                            onClick={handleUnfollow}
                            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                          >
                            <CheckIcon className="w-4 h-4 inline mr-2" />
                            Following
                          </button>
                        ) : (
                          <button
                            onClick={handleFollow}
                            className="w-full px-6 py-3 bg-gradient-to-r from-[#007fff] to-[#00a8ff] text-white rounded-xl hover:from-[#007fff]/90 hover:to-[#00a8ff]/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                          >
                            <PlusIcon className="w-4 h-4 inline mr-2" />
                            Follow Institution
                          </button>
                        )}
                        <button className="w-full px-6 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-xl hover:bg-[#007fff]/5 transition-all duration-200 font-semibold transform hover:scale-[1.02] hover:border-[#007fff]/80">
                          <ShareIcon className="w-4 h-4 inline mr-2" />
                          Share
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          href="/signin"
                          className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#007fff] to-[#00a8ff] text-white rounded-xl hover:from-[#007fff]/90 hover:to-[#00a8ff]/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Sign In to Follow
                        </Link>
                        <Link
                          href="/signin"
                          className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-xl hover:bg-[#007fff]/5 transition-all duration-200 font-semibold transform hover:scale-[1.02] hover:border-[#007fff]/80"
                        >
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          Message
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            
              {/* Profile Content */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
                <div className="space-y-6">
                  {/* Activity Section */}
                  <ActivityCard 
                    posts={posts} 
                    jobs={jobs}
                    events={events}
                    isOwnProfile={isOwnProfile} 
                    connectionCount={connectionCount} 
                    router={router}
                  />

                  {/* About Section */}
                  <AboutCard profile={profile} institution={institution} isOwnProfile={isOwnProfile} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
