'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserIcon,
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
  UserPlusIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { formatRelativeTime } from '@/lib/utils';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS,
  ANIMATIONS,
  NOTIFICATION_TYPE_COLORS,
  getNotificationTypeColor
} from '@/lib/design-system';
import { getConnectionStats, getPostStats, getNotifications } from '@/lib/queries';
import ShareButton from '@/components/common/ShareButton';
import ProfileCompletionPrompt from '@/components/profile/ProfileCompletionPrompt';
import Link from 'next/link';


interface DashboardStats {
  connections: number;
  posts: number;
  comments: number;
  likes: number;
}

interface RecentActivity {
  id: string;
  type: 'connection_request' | 'post_like' | 'comment' | 'job_application' | 'connection_accepted' | 'post_comment' | 'event_reminder' | 'mention';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<any>;
}

export default function UserDashboard() {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [signOutLoading, setSignOutLoading] = useState(false);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      window.location.href = '/onboarding';
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
      profile.headline,
      profile.bio,
      profile.location,
      profile.avatar_url
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
      
      // Load connection stats
      const connectionStats = await getConnectionStats(user!.id);
      
      // Load post stats
      const postStats = await getPostStats(user!.id);

      setStats({
        connections: connectionStats.connections || 0,
        posts: postStats.posts || 0,
        comments: postStats.comments || 0,
        likes: postStats.likes || 0,
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
    { id: 'profile', name: 'Profile Settings', icon: UserIcon },
    { id: 'privacy', name: 'Privacy & Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'account', name: 'Account Settings', icon: CogIcon },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'connection_request': return UserGroupIcon;
      case 'post_like': return HeartIcon;
      case 'comment': return ChatBubbleLeftIcon;
      case 'job_application': return BriefcaseIcon;
      default: return BellIcon;
    }
  };

  // Activity color function is now imported from design system

  // Status color function is now imported from design system

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'connection_request': return UserPlusIcon;
      case 'post_like': return HeartIcon;
      case 'comment': return ChatBubbleLeftIcon;
      case 'job_application': return BriefcaseIcon;
      default: return BellIcon;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Profile Completion Prompt */}
      <ProfileCompletionPrompt />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Elegant Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-black">Dashboard & Settings</h1>
            <p className="text-gray-600 text-sm">Welcome back, {profile?.full_name || 'User'}</p>
          </div>
          <ShareButton 
            title={`${profile?.full_name || 'User'}'s Dashboard`}
                            description="Check out my professional dashboard on <span className='mulish-semibold'>kendraa</span>"
            variant="button"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#007fff] text-[#007fff] bg-[#007fff]/5'
                    : 'border-transparent text-gray-600 hover:text-black hover:bg-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-black">
                      Welcome back, {profile?.full_name || user?.email}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Here&apos;s what&apos;s happening in your professional network today.
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Today</p>
                      <p className="text-lg font-semibold text-black">
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Profile Completion Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#007fff]/10 text-sm">Profile</p>
                      <p className="text-2xl font-bold text-black">{getProfileCompletionPercentage()}%</p>
                      <p className="text-[#007fff]/10 text-sm mt-1">Complete</p>
                    </div>
                    <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-[#007fff]" />
                    </div>
                  </div>
                  {getProfileCompletionPercentage() < 50 && !localStorage.getItem(`onboarding_completed_${user?.id}`) && (
                    <button
                      onClick={() => window.location.href = '/onboarding'}
                      className="w-full mt-3 px-3 py-2 bg-[#007fff] text-white text-sm rounded-lg hover:bg-[#007fff]/90 transition-colors"
                    >
                      Complete Profile
                    </button>
                  )}

                </div>
                {/* Connections Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#007fff]/10 text-sm">Connections</p>
                      <p className="text-2xl font-bold text-black">{stats?.connections || 0}</p>
                      <p className="text-[#007fff]/10 text-sm mt-1">Professional network</p>
                    </div>
                    <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-8 h-8 text-[#007fff]" />
                    </div>
                  </div>
                </div>

                {/* Posts Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#007fff]/10 text-sm">Posts</p>
                      <p className="text-2xl font-bold text-black">{stats?.posts || 0}</p>
                      <p className="text-[#007fff]/10 text-sm mt-1">Published content</p>
                    </div>
                    <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-8 h-8 text-[#007fff]" />
                    </div>
                  </div>
                </div>

                {/* Events Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#007fff]/10 text-sm">Events</p>
                      <p className="text-2xl font-bold text-black">0</p>
                      <p className="text-[#007fff]/10 text-sm mt-1">Upcoming events</p>
                    </div>
                    <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                      <CalendarDaysIcon className="w-8 h-8 text-[#007fff]" />
                    </div>
                  </div>
                </div>

                {/* Applications Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#007fff]/10 text-sm">Applications</p>
                      <p className="text-2xl font-bold text-black">0</p>
                      <p className="text-[#007fff]/10 text-sm mt-1">Job applications</p>
                    </div>
                    <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
                      <BriefcaseIcon className="w-8 h-8 text-[#007fff]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button className="flex items-center space-x-3 p-4 bg-[#007fff]/5 rounded-lg hover:bg-[#007fff]/10 transition-colors">
                  <DocumentTextIcon className="w-6 h-6 text-[#007fff]" />
                  <span className="font-medium text-black">Create Post</span>
                </button>
                
                <button className="flex items-center space-x-3 p-4 bg-[#007fff]/5 rounded-lg hover:bg-[#007fff]/10 transition-colors">
                  <UserGroupIcon className="w-6 h-6 text-[#007fff]" />
                  <span className="font-medium text-black">Find Connections</span>
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-black">Recent Activity</h2>
                  <Link href="/notifications" className="text-[#007fff] hover:text-[#007fff]/90 text-sm font-medium">
                    View all
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const IconComponent = getActivityIcon(activity.type);
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationTypeColor(activity.type)}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-black">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-sm text-gray-500 mt-1">Start connecting and posting to see activity here</p>
                  </div>
                )}
              </div>

              {/* Delete Account Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-black">Account Management</h3>
                    <p className="text-gray-600 mt-1">Manage your account settings and data</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Profile Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Visibility
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50">
                      <option>Public - Anyone can view</option>
                      <option>Connections only</option>
                      <option>Private - Only you</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Information
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50">
                      <option>Show to connections</option>
                      <option>Show to everyone</option>
                      <option>Hide contact info</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Status
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50">
                      <option>Show when active</option>
                      <option>Hide activity status</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Language
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Privacy & Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <h4 className="font-medium text-black">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <button className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90">
                    Enable
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <h4 className="font-medium text-black">Login Notifications</h4>
                    <p className="text-sm text-gray-600">Get notified of new logins</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Configure
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <h4 className="font-medium text-black">Data Export</h4>
                    <p className="text-sm text-gray-600">Download your data</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Export
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <h4 className="font-medium text-black">Account Deletion</h4>
                    <p className="text-sm text-gray-600">Permanently delete your account</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Notification Settings</h3>
              <div className="space-y-4">
                {[
                  { title: 'Connection Requests', description: 'New connection requests' },
                  { title: 'Post Interactions', description: 'Likes and comments on your posts' },
                  { title: 'Job Opportunities', description: 'New job postings in your field' },
                  { title: 'CME Updates', description: 'New courses and certifications' },
                  { title: 'Event Reminders', description: 'Upcoming events and webinars' },
                  { title: 'Research Updates', description: 'New research in your field' },
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div>
                      <h4 className="font-medium text-black">{setting.title}</h4>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#007fff]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007fff]"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Account Settings</h3>
              
              {/* Profile Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-black">Profile Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={profile?.full_name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue={profile?.phone || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      defaultValue={profile?.location || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="space-y-4">
                <h4 className="font-medium text-black">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007fff]/50 focus:border-[#007fff]/50"
                    />
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90">
                  Update Password
                </button>
              </div>

              {/* Account Actions */}
              <div className="space-y-4">
                <h4 className="font-medium text-black">Account Actions</h4>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div>
                    <h5 className="font-medium text-black">Sign Out</h5>
                    <p className="text-sm text-gray-600">Sign out of your account</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signOutLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    {signOutLoading ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
