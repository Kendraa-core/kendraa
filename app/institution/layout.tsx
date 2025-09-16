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
  getInstitutionByAdminId
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
  NewspaperIcon
} from '@heroicons/react/24/outline';
import Avatar from '@/components/common/Avatar';
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
  const shouldShowSidebars = !isNetworkPage;
  // Show profile card sidebar on the feed page
  const shouldShowProfileCardSidebar = pathname === '/institution/feed';

  // Show a loading screen while the hook is checking the user's status
  if (isOnboardingLoading || loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-[#007fff]">Loading your institution dashboard...</p>
        </div>
      </div>
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
        <main className={`flex-1 ${shouldShowSidebars ? 'lg:ml-64' : ''} ${shouldShowProfileCardSidebar ? 'lg:mr-80' : ''}`}>
          <div className="min-h-screen">
            {children}
          </div>
        </main>
        
        {/* Profile Card Sidebar for Feed Page */}
        {shouldShowProfileCardSidebar && (
          <div className="hidden lg:block fixed right-0 top-16 w-80 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <Avatar 
                    src={profile?.avatar_url} 
                    name={profile?.full_name || 'Institution'} 
                    size="xl" 
                    className="mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {profile?.full_name || 'Institution Name'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {profile?.headline || 'Healthcare Institution'}
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#007fff]">-</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#007fff]">{connectionCount}</div>
                      <div className="text-xs text-gray-500">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#007fff]">-</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <button className="w-full bg-[#007fff] text-white py-2 px-4 rounded-lg hover:bg-[#007fff]/90 transition-colors font-medium">
                      View Profile
                    </button>
                    <button className="w-full border border-[#007fff] text-[#007fff] py-2 px-4 rounded-lg hover:bg-[#007fff]/5 transition-colors font-medium">
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
