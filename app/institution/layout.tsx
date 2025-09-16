'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getProfile, 
  getConnectionCount,
  getUserGroupsCount,
  getUserPagesCount,
  getUserNewslettersCount,
  getUserEventsCount,
  getInstitutionByAdminId,
  getUserAnalytics,
  getTrendingTopics,
  getRecentActivity,
  getPostStats
} from '@/lib/queries';
import { useOnboardingProtection } from '@/hooks/useOnboardingProtection';
import Header from '@/components/layout/Header';
import RightSidebar from '@/components/layout/RightSidebar';
import LeftSidebar from '@/components/layout/LeftSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { 
  UserGroupIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  NewspaperIcon,
  PlusIcon,
  BriefcaseIcon,
  HeartIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { formatNumber } from '@/lib/utils';
import type { Institution } from '@/types/database.types';

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [newslettersCount, setNewslettersCount] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    totalEngagement: 0,
    engagementRate: 0,
    totalReach: 0
  });
  const [trendingTopics, setTrendingTopics] = useState<Array<{topic: string, count: number}>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string,
    type: string,
    message: string,
    time: string,
    icon: string,
    color: string
  }>>([]);
  const [postStats, setPostStats] = useState({ posts: 0, comments: 0, likes: 0 });

  // Use the new, cleaner onboarding protection hook
  const { isProtected, isLoading: isOnboardingLoading } = useOnboardingProtection();

  // Redirect non-institution users
  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.user_type !== 'institution' && profile.profile_type !== 'institution') {
        // Redirect to appropriate page based on current path
        if (pathname.startsWith('/institution/dashboard')) {
          router.push('/dashboard');
        } else if (pathname.startsWith('/institution/jobs')) {
          router.push('/jobs');
        } else if (pathname.startsWith('/institution/events')) {
          router.push('/events');
        } else if (pathname.startsWith('/institution/network')) {
          router.push('/network');
        } else if (pathname.startsWith('/institution/notifications')) {
          router.push('/notifications');
        } else if (pathname.startsWith('/institution/feed')) {
          router.push('/feed');
        } else {
          router.push('/dashboard');
        }
        return;
      }
    }
  }, [user, profile, authLoading, pathname, router]);

  useEffect(() => {
    const loadData = async () => {
      // Allow public access to institution profile pages - only redirect for non-profile pages
      if (!user?.id) {
        if (!authLoading && !pathname.includes('/profile/')) {
          router.push('/signin');
        }
        return;
      }

      if (isLoadingProfile) return;

      setIsLoadingProfile(true);

      try {
        const userProfile = profile || await getProfile(user.id);
        if (userProfile && (!profile || profile.id !== userProfile.id)) {
          updateProfile(userProfile);
        }

        // Load institution data
        const institutionData = await getInstitutionByAdminId(user.id);
        setInstitution(institutionData);
        
        const [
          connections, groups, events, pages, newsletters
        ] = await Promise.all([
          getConnectionCount(user.id),
          getUserGroupsCount(user.id),
          getUserEventsCount(user.id),
          getUserPagesCount(user.id),
          getUserNewslettersCount(user.id)
        ]);
        
        setConnectionCount(connections);
        setGroupsCount(groups);
        setEventsCount(events);
        setPagesCount(pages);
        setNewslettersCount(newsletters);
        
        // Load analytics and feed data (only for feed page)
        if (pathname === '/institution/feed') {
          const [analyticsData, topics, activity, stats] = await Promise.all([
            getUserAnalytics(user.id),
            getTrendingTopics(5),
            getRecentActivity(user.id, 5),
            getPostStats(user.id)
          ]);
          
          setAnalytics(analyticsData);
          setTrendingTopics(topics);
          setRecentActivity(activity);
          setPostStats(stats);
        }
      } catch (error) {
        console.error('Error loading institution layout data:', error);
      } finally {
        setLoading(false);
        setIsLoadingProfile(false);
      }
    };

    if (!authLoading) {
        loadData();
    }
  }, [user, profile, authLoading, router, updateProfile, isLoadingProfile]);

  const isNetworkPage = pathname === '/institution/network';
  const isFeedPage = pathname === '/institution/feed';
  const isJobsPage = pathname === '/institution/jobs';
  const isProfilePage = pathname === '/institution/profile';
  const shouldShowSidebars = !isNetworkPage && !isFeedPage && !isJobsPage && !isProfilePage;
  // Show innovative left sidebar on the feed page
  const shouldShowInnovativeSidebar = pathname === '/institution/feed';
  // Show profile card right sidebar on the feed page
  const shouldShowProfileCardSidebar = pathname === '/institution/feed';

  // Show a loading screen while the hook is checking the user's status
  if (isOnboardingLoading || loading || authLoading) {
    return (
      <LoadingSpinner 
        variant="fullscreen" 
        text="Loading your institution dashboard..." 
      />
    );
  }
  
  // The hook handles the redirect, so we just return null to prevent rendering the dashboard
  if (!isProtected) {
    return null;
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Left Sidebar */}
        {shouldShowSidebars && (
          <LeftSidebar 
            connectionCount={connectionCount}
            groupsCount={groupsCount}
            eventsCount={eventsCount}
            pagesCount={pagesCount}
            newslettersCount={newslettersCount}
            isInstitution={true}
          />
        )}
        
        {/* Main Content */}
        <main className={`flex-1 ${shouldShowSidebars ? 'lg:ml-64' : ''} ${shouldShowInnovativeSidebar ? 'lg:ml-80' : ''} ${shouldShowProfileCardSidebar ? 'lg:mr-80' : ''}`}>
          <div className="min-h-screen">
            {children}
          </div>
        </main>
        
        {/* Innovative Left Sidebar for Feed Page */}
        {shouldShowInnovativeSidebar && (
          <div className="hidden lg:block fixed left-0 top-16 w-80 h-[calc(100vh-4rem)] bg-gradient-to-b from-[#007fff]/5 to-[#007fff]/10 border-r border-[#007fff]/20 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-[#007fff] rounded-full mr-3"></div>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/institution/feed?create=post')}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-[#007fff]/10 rounded-lg flex items-center justify-center group-hover:bg-[#007fff]/20 transition-colors">
                      <PlusIcon className="w-5 h-5 text-[#007fff]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Create Post</span>
                  </button>
                  <button 
                    onClick={() => router.push('/institution/jobs/create')}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <BriefcaseIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Post Job</span>
                  </button>
                  <button 
                    onClick={() => router.push('/institution/events/create')}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Create Event</span>
                  </button>
                </div>
              </div>

              {/* Analytics Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Posts</span>
                    <span className="text-lg font-bold text-gray-900">{analytics.totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Engagement</span>
                    <span className="text-lg font-bold text-green-600">{analytics.engagementRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reach</span>
                    <span className="text-lg font-bold text-blue-600">{analytics.totalReach}</span>
                  </div>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={topic.topic} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm text-gray-700">#{topic.topic}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {topic.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const IconComponent = activity.icon === 'UserGroupIcon' ? UserGroupIcon :
                                        activity.icon === 'HeartIcon' ? HeartIcon :
                                        activity.icon === 'ChatBubbleLeftIcon' ? ChatBubbleLeftIcon :
                                        UserGroupIcon;
                    
                    const colorClasses = {
                      blue: 'bg-blue-100 text-blue-600',
                      green: 'bg-green-100 text-green-600',
                      purple: 'bg-purple-100 text-purple-600',
                      gray: 'bg-gray-100 text-gray-600'
                    };
                    
                    const timeAgo = new Date(activity.time).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-8 h-8 ${colorClasses[activity.color as keyof typeof colorClasses]} rounded-full flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{activity.message}</p>
                          <p className="text-xs text-gray-500">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Profile Card Right Sidebar for Feed Page */}
        {shouldShowProfileCardSidebar && (
          <div className="hidden lg:block fixed right-0 top-16 w-80 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#007fff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-[#007fff]">
                      {profile?.full_name?.charAt(0) || 'I'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {profile?.full_name || 'Institution Name'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {profile?.headline || 'Healthcare Institution'}
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#007fff]">{postStats.posts}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#007fff]">{connectionCount}</div>
                      <div className="text-xs text-gray-500">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#007fff]">{analytics.totalReach}</div>
                      <div className="text-xs text-gray-500">Reach</div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => router.push('/institution/profile')}
                      className="w-full bg-[#007fff] text-white py-2 px-4 rounded-lg hover:bg-[#007fff]/90 transition-colors font-medium"
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => router.push('/institution/profile')}
                      className="w-full border border-[#007fff] text-[#007fff] py-2 px-4 rounded-lg hover:bg-[#007fff]/5 transition-colors font-medium"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Right Sidebar */}
        {shouldShowSidebars && (
          <RightSidebar 
            connectionCount={connectionCount}
            isInstitution={true}
          />
        )}
      </div>
    </div>
  );
}
