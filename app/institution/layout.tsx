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
  getInstitutionByUserId,
  getUserAnalytics,
  getRecentActivity,
  getPostStats
} from '@/lib/queries';
import { useOnboardingProtection } from '@/hooks/useOnboardingProtection';
import Header from '@/components/layout/Header';
import RightSidebar from '@/components/layout/RightSidebar';
import LeftSidebar from '@/components/layout/LeftSidebar';
import FloatingQuickActions from '@/components/layout/FloatingQuickActions';
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
  // But only apply it for non-public pages
  const isPublicProfilePage = pathname.startsWith('/institution/profile/') && pathname !== '/institution/profile';
  const { isProtected, isLoading: isOnboardingLoading } = useOnboardingProtection();

  // Redirect non-institution users (but allow public access to institution profile pages)
  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.user_type !== 'institution' && profile.profile_type !== 'institution') {
        // Allow public access to institution profile pages (viewing other institutions)
        if (pathname.startsWith('/institution/profile/') && pathname !== '/institution/profile') {
          // This is a public institution profile page - allow access
          return;
        }
        
        // Allow access to onboarding page for all users
        if (pathname === '/institution/onboarding') {
          // This is the onboarding page - allow access
          return;
        }
        
        // Redirect to appropriate page based on current path for other institution pages
        if (pathname.startsWith('/institution/jobs')) {
          router.push('/jobs');
        } else if (pathname.startsWith('/institution/events')) {
          router.push('/events');
        } else if (pathname.startsWith('/institution/network')) {
          router.push('/network');
        } else if (pathname.startsWith('/institution/notifications')) {
          router.push('/notifications');
        } else if (pathname.startsWith('/institution/feed')) {
          router.push('/feed');
        } else if (pathname === '/institution/profile') {
          // Redirect to individual profile if trying to access own institution profile
          router.push(`/profile/${user.id}`);
        } else {
          router.push('/feed');
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

        // Only load institution data if user is an institution user
        // For public institution profile pages, we don't need to load this data
        if (userProfile && (userProfile.user_type === 'institution' || userProfile.profile_type === 'institution')) {
          // Load institution data
          const institutionData = await getInstitutionByUserId(user.id);
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
            const [analyticsData, activity, stats] = await Promise.all([
              getUserAnalytics(user.id),
              getRecentActivity(user.id, 5),
              getPostStats(user.id)
            ]);
            
            setAnalytics(analyticsData);
            setRecentActivity(activity);
            setPostStats(stats);
          }
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
  }, [user, profile, authLoading, router, updateProfile, isLoadingProfile, pathname]);

  const isNetworkPage = pathname === '/institution/network';
  const isFeedPage = pathname === '/institution/feed';
  const isJobsPage = pathname === '/institution/jobs';
  const isProfilePage = pathname === '/institution/profile';
  const isEventsPage = pathname === '/institution/events';
  const isOnboardingPage = pathname === '/institution/onboarding';
  const shouldShowSidebars = !isNetworkPage && !isFeedPage && !isJobsPage && !isProfilePage && !isEventsPage && !isPublicProfilePage && !isOnboardingPage;
  // Show floating quick actions on the feed page instead of sidebar
  const shouldShowFloatingActions = pathname === '/institution/feed';
  // Show profile card right sidebar on the feed page
  const shouldShowProfileCardSidebar = pathname === '/institution/feed';

  // Show a loading screen while the hook is checking the user's status
  // But skip this for public profile pages and onboarding page
  if (!isPublicProfilePage && !isOnboardingPage && (isOnboardingLoading || loading || authLoading)) {
    return (
      <LoadingSpinner 
        variant="fullscreen" 
        text="Loading your institution dashboard..." 
      />
    );
  }
  
  // The hook handles the redirect, so we just return null to prevent rendering the dashboard
  // But skip this for public profile pages and onboarding page
  if (!isPublicProfilePage && !isOnboardingPage && !isProtected) {
    return null;
  }
  
  // For public profile pages and onboarding page, we don't need a user to be logged in
  if (!isPublicProfilePage && !isOnboardingPage && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isOnboardingPage && <Header />}
      
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
        <main className={`flex-1 ${shouldShowSidebars ? 'lg:ml-64' : ''} ${shouldShowProfileCardSidebar ? 'lg:mr-80' : ''}`}>
          <div className="min-h-screen">
            {children}
          </div>
        </main>
        
        
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
      
      {/* Floating Quick Actions for Feed Page */}
      {shouldShowFloatingActions && (
        <FloatingQuickActions isInstitution={true} />
      )}
    </div>
  );
}
