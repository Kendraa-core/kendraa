'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import {
  getConnectionCount,
  getPostsByAuthor,
  getSavedPosts,
  getUserApplications,
  getUserRegisteredEvents,
  type PostWithAuthor
} from '@/lib/queries';
import { type JobApplication, type Event } from '@/types/database.types';
import {
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  BookmarkIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatNumber, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DashboardStats {
  connections: number;
  posts: number;
  applications: number;
  events: number;
  savedPosts: number;
}

export default function MobileDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    connections: 0,
    posts: 0,
    applications: 0,
    events: 0,
    savedPosts: 0
  });
  const [recentPosts, setRecentPosts] = useState<PostWithAuthor[]>([]);
  const [recentApplications, setRecentApplications] = useState<(JobApplication & { job?: { id: string; title: string; company?: { name: string } } })[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        const [
          connectionsCount,
          userPosts,
          savedPosts,
          applications,
          events
        ] = await Promise.all([
          getConnectionCount(user.id),
          getPostsByAuthor(user.id),
          getSavedPosts(user.id),
          getUserApplications(user.id),
          getUserRegisteredEvents(user.id)
        ]);

        setStats({
          connections: connectionsCount,
          posts: userPosts.length,
          applications: applications.length,
          events: events.length,
          savedPosts: savedPosts.length
        });

        setRecentPosts(userPosts.slice(0, 3));
        setRecentApplications(applications.slice(0, 3));
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
      orange: 'bg-orange-500 text-orange-600',
      pink: 'bg-pink-500 text-pink-600'
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
      <MobileLayout title="Dashboard">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="md" text="Loading dashboard..." />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Dashboard">
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <Avatar
              src={user?.user_metadata?.avatar_url}
              alt={user?.user_metadata?.full_name || 'User'}
              size="lg"
              className="border-2 border-white"
            />
            <div>
              <h1 className="text-xl font-bold">Welcome back!</h1>
              <p className="text-blue-100">{user?.user_metadata?.full_name}</p>
              <p className="text-sm text-blue-200">
                {user?.user_metadata?.headline || 'Healthcare Professional'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Connections"
            value={stats.connections}
            icon={UserGroupIcon}
            href="/mob/network"
            color="blue"
          />
          <StatCard
            title="Applications"
            value={stats.applications}
            icon={BriefcaseIcon}
            href="/mob/jobs"
            color="green"
          />
          <StatCard
            title="Events"
            value={stats.events}
            icon={CalendarDaysIcon}
            href="/mob/events"
            color="purple"
          />
          <StatCard
            title="Saved Posts"
            value={stats.savedPosts}
            icon={BookmarkIcon}
            href="/mob/saved-items"
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/mob/create"
              className="flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Create Post</span>
            </Link>
            <Link
              href="/mob/jobs"
              className="flex items-center justify-center p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Find Jobs</span>
            </Link>
            <Link
              href="/mob/events"
              className="flex items-center justify-center p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <CalendarDaysIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Browse Events</span>
            </Link>
            <Link
              href="/mob/network"
              className="flex items-center justify-center p-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <UserGroupIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Network</span>
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
              <Link
                href="/mob/profile"
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
                      <div className="flex items-center">
                        <HeartIcon className="w-3 h-3 mr-1" />
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-3 h-3 mr-1" />
                        <span>{post.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Applications */}
        {recentApplications.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <Link
                href="/mob/applications"
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{application.job?.title}</p>
                    <p className="text-sm text-gray-600">{application.job?.company?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {application.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(application.created_at)}
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
                href="/mob/events"
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
                    {event.is_virtual && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                        Virtual
                      </span>
                    )}
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
