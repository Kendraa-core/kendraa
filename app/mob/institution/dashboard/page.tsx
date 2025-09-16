'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import {
  getConnectionCount,
  getPostsByAuthor,
  getInstitutionByAdminId,
  getJobsByInstitution,
  getEventsByInstitution,
  type PostWithAuthor,
  type Institution,
  type JobWithCompany,
  type EventWithOrganizer
} from '@/lib/queries';
import {
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PlusIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatNumber, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface InstitutionStats {
  followers: number;
  posts: number;
  jobs: number;
  events: number;
}

export default function MobileInstitutionDashboardPage() {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [stats, setStats] = useState<InstitutionStats>({
    followers: 0,
    posts: 0,
    jobs: 0,
    events: 0
  });
  const [recentPosts, setRecentPosts] = useState<PostWithAuthor[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobWithCompany[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithOrganizer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Get institution data
        const institutionData = await getInstitutionByAdminId(user.id);
        setInstitution(institutionData);

        const [
          followersCount,
          userPosts,
          jobs,
          events
        ] = await Promise.all([
          getConnectionCount(user.id),
          getPostsByAuthor(user.id),
          institutionData ? getJobsByInstitution(institutionData.id) : [],
          institutionData ? getEventsByInstitution(institutionData.id) : []
        ]);

        setStats({
          followers: followersCount,
          posts: userPosts.length,
          jobs: jobs.length,
          events: events.length
        });

        setRecentPosts(userPosts.slice(0, 3));
        setRecentJobs(jobs.slice(0, 3));
        setUpcomingEvents(events.slice(0, 3));

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    href, 
    color = 'blue' 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    href: string; 
    color?: string; 
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500 text-blue-600',
      green: 'bg-green-500 text-green-600',
      purple: 'bg-purple-500 text-purple-600',
      orange: 'bg-orange-500 text-orange-600'
    };

    return (
      <Link href={href}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
            </div>
            <div className={`p-3 rounded-lg bg-opacity-10 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
              <Icon className={`w-6 h-6 ${colorClasses[color as keyof typeof colorClasses]?.split(' ')[1] || 'text-blue-600'}`} />
            </div>
          </div>
        </motion.div>
      </Link>
    );
  };

  if (loading) {
    return (
      <MobileLayout title="Dashboard" isInstitution={true}>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="md" text="Loading dashboard..." />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Dashboard" isInstitution={true}>
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <Avatar
              src={institution?.logo_url || user?.user_metadata?.avatar_url}
              alt={institution?.name || user?.user_metadata?.full_name || 'Institution'}
              size="lg"
              className="border-2 border-white"
            />
            <div>
              <h1 className="text-xl font-bold">Institution Dashboard</h1>
              <p className="text-blue-100">{institution?.name || user?.user_metadata?.full_name}</p>
              <p className="text-sm text-blue-200">
                {institution?.type || 'Healthcare Institution'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Followers"
            value={stats.followers}
            icon={UserGroupIcon}
            href="/mob/institution/network"
            color="blue"
          />
          <StatCard
            title="Jobs Posted"
            value={stats.jobs}
            icon={BriefcaseIcon}
            href="/mob/institution/jobs"
            color="green"
          />
          <StatCard
            title="Events"
            value={stats.events}
            icon={CalendarDaysIcon}
            href="/mob/institution/events"
            color="purple"
          />
          <StatCard
            title="Posts"
            value={stats.posts}
            icon={DocumentTextIcon}
            href="/mob/institution/profile"
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/mob/institution/create"
              className="flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Create Post</span>
            </Link>
            <Link
              href="/mob/institution/jobs/create"
              className="flex items-center justify-center p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Post Job</span>
            </Link>
            <Link
              href="/mob/institution/events/create"
              className="flex items-center justify-center p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <CalendarDaysIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Create Event</span>
            </Link>
            <Link
              href="/mob/institution/profile"
              className="flex items-center justify-center p-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <EyeIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">View Profile</span>
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
              <Link
                href="/mob/institution/profile"
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{formatDate(post.created_at)}</span>
                    <div className="flex items-center space-x-3">
                      <span>{post.likes_count || 0} likes</span>
                      <span>{post.comments_count || 0} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        {recentJobs.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Job Postings</h3>
              <Link
                href="/mob/institution/jobs"
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {job.applications_count || 0} applications
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(job.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
              <Link
                href="/mob/institution/events"
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 line-clamp-1">{event.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDaysIcon className="w-4 h-4 mr-1" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="text-sm text-purple-600">
                      {event.attendees_count || 0} attendees
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
