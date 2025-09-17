'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PostCard from '@/components/post/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import {
  getInstitutionByUserId,
  getProfile,
  getPostsByAuthor,
  getConnectionCount,
  getJobsByInstitution,
  getEventsByInstitution,
  type Institution,
  type Profile,
  type PostWithAuthor,
  type JobWithCompany,
  type EventWithOrganizer
} from '@/lib/queries';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  EnvelopeIcon,
  LinkIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function MobileInstitutionProfilePage() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'jobs' | 'events'>('posts');

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        const [institutionData, profileData] = await Promise.all([
          getInstitutionByUserId(user.id),
          getProfile(user.id)
        ]);

        setInstitution(institutionData);
        setProfile(profileData);

        if (institutionData) {
          const [postsData, jobsData, eventsData, followersCount] = await Promise.all([
            getPostsByAuthor(user.id),
            getJobsByInstitution(institutionData.id),
            getEventsByInstitution(institutionData.id),
            getConnectionCount(user.id)
          ]);

          setPosts(postsData);
          setJobs(jobsData);
          setEvents(eventsData);
          setFollowers(followersCount);
        }

      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user?.id]);

  const handlePostInteraction = () => {
    // Refresh posts when there's an interaction
    if (user?.id) {
      getPostsByAuthor(user.id).then(setPosts);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    href 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    href?: string; 
  }) => {
    const content = (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center"
      >
        <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </motion.div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
  };

  if (loading) {
    return (
      <MobileLayout title="Profile" isInstitution={true}>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="md" text="Loading profile..." />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Profile" isInstitution={true}>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-b-xl p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <Avatar
              src={institution?.logo_url || profile?.avatar_url}
              alt={institution?.name || profile?.full_name || 'Institution'}
              size="xl"
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900">
                    {institution?.name || profile?.full_name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {institution?.type || 'Healthcare Institution'}
                  </p>
                  
                  {(institution?.location || profile?.location) && (
                    <div className="flex items-center mt-2 text-gray-500">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span className="text-sm">{institution?.location || profile?.location}</span>
                    </div>
                  )}
                </div>
                
                <Link
                  href="/mob/institution/profile/edit"
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PencilIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Bio/Description */}
          {(institution?.description || profile?.bio) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-700">{institution?.description || profile?.bio}</p>
            </div>
          )}
          
          {/* Contact Info */}
          {(institution?.email || profile?.email || institution?.website || profile?.website) && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {(institution?.email || profile?.email) && (
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  <a 
                    href={`mailto:${institution?.email || profile?.email}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {institution?.email || profile?.email}
                  </a>
                </div>
              )}
              {(institution?.website || profile?.website) && (
                <div className="flex items-center text-gray-600">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  <a 
                    href={institution?.website || profile?.website || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {institution?.website || profile?.website}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="px-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              title="Followers"
              value={followers}
              icon={UserGroupIcon}
              href="/mob/institution/network"
            />
            <StatCard
              title="Jobs Posted"
              value={jobs.length}
              icon={BriefcaseIcon}
              href="/mob/institution/jobs"
            />
            <StatCard
              title="Events"
              value={events.length}
              icon={CalendarDaysIcon}
              href="/mob/institution/events"
            />
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-4">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Events ({events.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-20">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <PostCard
                      post={post}
                      onInteraction={handlePostInteraction}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No posts yet</p>
                  <Link
                    href="/mob/institution/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Post
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{job.location}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {job.applications_count || 0} applications
                        </p>
                      </div>
                      <Link
                        href={`/mob/institution/jobs/${job.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No jobs posted yet</p>
                  <Link
                    href="/mob/institution/jobs/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post Your First Job
                  </Link>
                </div>
              )}
              
              {jobs.length > 5 && (
                <Link
                  href="/mob/institution/jobs"
                  className="block text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                >
                  View All Jobs ({jobs.length})
                </Link>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              {events.length > 0 ? (
                events.slice(0, 5).map((event) => (
                  <div key={event.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.is_virtual ? 'Virtual Event' : event.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.attendees_count || 0} attendees
                        </p>
                      </div>
                      <Link
                        href={`/mob/institution/events/${event.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No events created yet</p>
                  <Link
                    href="/mob/institution/events/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Event
                  </Link>
                </div>
              )}
              
              {events.length > 5 && (
                <Link
                  href="/mob/institution/events"
                  className="block text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                >
                  View All Events ({events.length})
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
