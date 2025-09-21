'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/common/Avatar';
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
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
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
  getInstitutionById,
  getInstitutionByUserId,
} from '@/lib/queries';
import type { Profile, Institution, Experience, Education, Post, JobWithCompany, EventWithOrganizer } from '@/types/database.types';

interface ActivityCardProps {
  posts: Post[];
  jobs: JobWithCompany[];
  events: EventWithOrganizer[];
}

const ActivityCard: React.FC<ActivityCardProps> = ({ posts, jobs, events }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'jobs' | 'events'>('posts');

  const tabs = [
    { id: 'posts', label: 'Posts', count: posts.length },
    { id: 'jobs', label: 'Jobs', count: jobs.length },
    { id: 'events', label: 'Events', count: events.length },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No posts yet</p>
              </div>
            ) : (
              posts.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} onPostDeleted={() => {}} />
              ))
            )}
            {posts.length > 3 && (
              <div className="text-center">
                <Link href={`/institution/profile/${posts[0]?.author_id}/posts`}>
                  <Button variant="outline" size="sm">
                    View All Posts ({posts.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );
      case 'jobs':
        return (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BriefcaseIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No jobs posted yet</p>
              </div>
            ) : (
              jobs.slice(0, 3).map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{job.company?.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <MapPinIcon className="w-3 h-3 mr-1" />
                          {job.location}
                          <span className="mx-2">•</span>
                          <span>{job.job_type}</span>
                        </div>
                      </div>
                      <Link href={`/institution/jobs/${job.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {jobs.length > 3 && (
              <div className="text-center">
                <Link href="/institution/jobs">
                  <Button variant="outline" size="sm">
                    View All Jobs ({jobs.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );
      case 'events':
        return (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No events organized yet</p>
              </div>
            ) : (
              events.slice(0, 3).map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {formatDate(event.start_date)}
                          {event.location && (
                            <>
                              <span className="mx-2">•</span>
                              <MapPinIcon className="w-3 h-3 mr-1" />
                              {event.location}
                            </>
                          )}
                        </div>
                      </div>
                      <Link href={`/institution/events/${event.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {events.length > 3 && (
              <div className="text-center">
                <Link href="/institution/events">
                  <Button variant="outline" size="sm">
                    View All Events ({events.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex space-x-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-[#007fff] text-[#007fff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

interface AboutCardProps {
  profile: Profile;
  institution: Institution | null;
  experiences: Experience[];
  education: Education[];
}

const AboutCard: React.FC<AboutCardProps> = ({ profile, institution, experiences, education }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BuildingOfficeIcon className="w-5 h-5 mr-2" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {profile.bio && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {institution && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Institution Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">{institution.name}</span>
              </div>
              {institution.website && (
                <div className="flex items-center">
                  <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <a 
                    href={institution.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#007fff] hover:underline"
                  >
                    {institution.website}
                  </a>
                </div>
              )}
              {institution.phone && (
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{institution.phone}</span>
                </div>
              )}
              {institution.email && (
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">{institution.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {profile.location && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Location</h4>
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-2" />
              {profile.location}
            </div>
          </div>
        )}

        {experiences.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
            <div className="space-y-3">
              {experiences.slice(0, 3).map((exp) => (
                <div key={exp.id} className="text-sm">
                  <div className="font-medium text-gray-900">{exp.title}</div>
                  <div className="text-gray-600">{exp.company}</div>
                  <div className="text-gray-500 text-xs">
                    {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Education</h4>
            <div className="space-y-3">
              {education.slice(0, 3).map((edu) => (
                <div key={edu.id} className="text-sm">
                  <div className="font-medium text-gray-900">{edu.degree}</div>
                  <div className="text-gray-600">{edu.school}</div>
                  <div className="text-gray-500 text-xs">
                    {formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
      if (!profileData) {
        toast.error('Profile not found');
        router.push('/');
        return;
      }
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
        try {
          const [followData] = await Promise.all([
            getFollowStatus(user.id, id)
          ]);
          setCanSendRequests(true);
          setFollowStatus(followData ? 'following' : 'none');
        } catch (error) {
          console.error('Error checking follow status:', error);
          setCanSendRequests(true);
          setFollowStatus('none');
        }
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
  }, [id, user?.id, isOwnProfile, router]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollow = async () => {
    if (!user?.id || !profile) {
      toast.error('Please sign in to follow this institution');
      return;
    }

    // Optimistically update the UI
    const previousStatus = followStatus;
    const newStatus = followStatus === 'following' ? 'none' : 'following';
    setFollowStatus(newStatus);

    try {
      if (followStatus === 'following') {
        const success = await unfollowInstitution(user.id, profile.id);
        if (success) {
          toast.success('Unfollowed successfully');
          fetchProfileData(); // Refresh data
        } else {
          setFollowStatus(previousStatus);
          toast.error('Failed to unfollow');
        }
      } else {
        const success = await followInstitution(user.id, profile.id);
        if (success) {
          toast.success('Following successfully');
          fetchProfileData(); // Refresh data
        } else {
          setFollowStatus(previousStatus);
          toast.error('Failed to follow');
        }
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      setFollowStatus(previousStatus);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">The profile you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={profile.avatar_url}
                  name={profile.full_name || 'Institution'}
                  size="xl"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.full_name || 'Institution'}
                    </h1>
                    <CheckBadgeIcon className="w-6 h-6 text-[#007fff]" />
                  </div>
                  <p className="text-gray-600">{profile.headline}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <UserGroupIcon className="w-4 h-4 mr-1" />
                      {formatNumber(connectionCount)} followers
                    </span>
                    {profile.location && (
                      <span className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {profile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {!isOwnProfile && user?.id && (
                  <Button
                    onClick={handleFollow}
                    variant={followStatus === 'following' ? 'outline' : 'default'}
                    className="min-w-[120px]"
                  >
                    {followStatus === 'following' ? 'Following' : 'Follow'}
                  </Button>
                )}
                {!user?.id && (
                  <Button onClick={() => router.push('/signin')}>
                    Sign In to Follow
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About */}
          <div className="lg:col-span-1">
            <AboutCard
              profile={profile}
              institution={institution}
              experiences={experiences}
              education={education}
            />
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2">
            <ActivityCard posts={posts} jobs={jobs} events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
