'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BuildingOfficeIcon,
  EyeIcon,
  BellIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  CreditCardIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { formatRelativeTime } from '@/lib/utils';
import { getConnectionStats, getPostStats, getNotifications, getInstitutionByAdminId, getSavedPosts } from '@/lib/queries';
import ShareButton from '@/components/common/ShareButton';
import ProfileCompletionPrompt from '@/components/profile/ProfileCompletionPrompt';
import Link from 'next/link';
import type { Institution, Post } from '@/types/database.types';

interface DashboardStats {
  connections: number;
  posts: number;
  comments: number;
  likes: number;
  jobApplications: number;
  events: number;
}

interface RecentActivity {
  id: string;
  type: 'connection_request' | 'post_like' | 'comment' | 'job_application' | 'connection_accepted' | 'post_comment' | 'event_reminder' | 'mention';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<any>;
}

export default function InstitutionDashboard() {
  const { user, profile, signOut } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [signOutLoading, setSignOutLoading] = useState(false);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      window.location.href = '/institution/onboarding';
    }
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.full_name,
      profile.bio,
      profile.location,
      profile.avatar_url,
      institution?.description,
      institution?.website,
      institution?.type
    ];
    
    const completed = fields.filter(field => {
      if (typeof field === 'string') {
        return field && field.trim() !== '';
      }
      return field;
    }).length;
    
    return Math.round((completed / fields.length) * 100);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load institution data
      if (user?.id) {
        const institutionData = await getInstitutionByAdminId(user.id);
        setInstitution(institutionData);
      }
      
      // Load connection stats
      const connectionStats = await getConnectionStats(user!.id);
      
      // Load post stats
      const postStats = await getPostStats(user!.id);

      setStats({
        connections: connectionStats.connections || 0,
        posts: postStats.posts || 0,
        comments: postStats.comments || 0,
        likes: postStats.likes || 0,
        jobApplications: 0, // TODO: Implement job application stats
        events: 0, // TODO: Implement event stats
      });

      // Load real notifications for recent activity
      if (user?.id) {
        const notifications = await getNotifications(user.id);
        const recentNotifications = notifications.slice(0, 5).map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          description: notification.message,
          timestamp: notification.created_at,
          icon: getActivityIcon(notification.type),
        }));
        setRecentActivity(recentNotifications);

        // Load saved posts
        const saved = await getSavedPosts(user.id);
        setSavedPosts(saved.slice(0, 5)); // Show only the 5 most recent saved posts
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSignOutLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'profile', name: 'Institution Profile', icon: BuildingOfficeIcon },
    { id: 'privacy', name: 'Privacy & Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'account', name: 'Account Settings', icon: CogIcon },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'connection_request':
        return UserPlusIcon;
      case 'post_like':
        return HeartIcon;
      case 'comment':
        return ChatBubbleLeftIcon;
      case 'job_application':
        return BriefcaseIcon;
      case 'connection_accepted':
        return CheckCircleIcon;
      case 'post_comment':
        return ChatBubbleLeftIcon;
      case 'event_reminder':
        return CalendarIcon;
      case 'mention':
        return UserIcon;
      default:
        return BellIcon;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007fff] mx-auto"></div>
          <p className="mt-4 text-[#007fff]">Loading your institution dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Institution Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {institution?.name || profile?.full_name || 'Institution'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ShareButton />
              <button
                onClick={handleSignOut}
                disabled={signOutLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {signOutLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Completion Prompt */}
        {profile && getProfileCompletionPercentage() < 80 && (
          <div className="mb-8">
            <ProfileCompletionPrompt />
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Connections</p>
                  <p className="text-3xl font-bold text-[#007fff]">{stats.connections}</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-[#007fff]/20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Posts</p>
                  <p className="text-3xl font-bold text-green-600">{stats.posts}</p>
                </div>
                <DocumentTextIcon className="h-8 w-8 text-green-600/20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Job Applications</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.jobApplications}</p>
                </div>
                <BriefcaseIcon className="h-8 w-8 text-purple-600/20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.events}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-orange-600/20" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-[#007fff]/10 rounded-full flex items-center justify-center">
                          <activity.icon className="w-5 h-5 text-[#007fff]" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatRelativeTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
            </div>

            {/* Saved Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Saved Posts</h2>
                <Link
                  href="/saved-items"
                  className="text-[#007fff] hover:text-[#0066cc] text-sm font-medium transition-colors"
                >
                  View All
                </Link>
              </div>
              {savedPosts.length > 0 ? (
                <div className="space-y-4">
                  {savedPosts.map((post) => (
                    <div key={post.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-[#007fff]/10 rounded-full flex items-center justify-center">
                            <BookmarkIcon className="w-4 h-4 text-[#007fff]" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatRelativeTime(post.created_at)}</span>
                            <Link
                              href={`/profile/${post.author_id}`}
                              className="text-[#007fff] hover:text-[#0066cc] transition-colors"
                            >
                              View Post
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No saved posts yet</p>
                  <p className="text-sm text-gray-500">Save posts you find interesting to view them here</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/institution/jobs/create"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BriefcaseIcon className="w-5 h-5 text-[#007fff]" />
                  <span className="text-sm font-medium">Post a Job</span>
                </Link>
                <Link
                  href="/institution/events/create"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CalendarIcon className="w-5 h-5 text-[#007fff]" />
                  <span className="text-sm font-medium">Create Event</span>
                </Link>
                <Link
                  href="/institution/profile"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BuildingOfficeIcon className="w-5 h-5 text-[#007fff]" />
                  <span className="text-sm font-medium">Edit Profile</span>
                </Link>
                <Link
                  href="/institution/network"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserGroupIcon className="w-5 h-5 text-[#007fff]" />
                  <span className="text-sm font-medium">Manage Network</span>
                </Link>
              </div>
            </div>

            {/* Institution Info */}
            {institution && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Institution Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{institution.type || 'Healthcare Organization'}</span>
                  </div>
                  {institution.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{institution.location}</span>
                    </div>
                  )}
                  {institution.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GlobeAltIcon className="w-4 h-4" />
                      <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-[#007fff] hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
