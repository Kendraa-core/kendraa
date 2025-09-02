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
  getUserEventsCount
} from '@/lib/queries';
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
import { formatNumber } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("%c--- DASHBOARD LAYOUT IS RUNNING (Correct Version) ---", "color: #00FFFF; font-weight: bold; font-size: 14px;");
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [newslettersCount, setNewslettersCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        if (!authLoading) {
          router.push('/signin');
        }
        return;
      }

      try {
        const userProfile = profile || await getProfile(user.id);
        if (userProfile && (!profile || profile.id !== userProfile.id)) {
          updateProfile(userProfile);
        }

        const completionPercentage = userProfile ? (
          Object.values({
            full_name: userProfile.full_name,
            headline: userProfile.headline,
            bio: userProfile.bio,
            location: userProfile.location,
            avatar_url: userProfile.avatar_url,
          }).filter(Boolean).length / 5
        ) * 100 : 0;
        
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
        
        // This is the crucial fix: it prevents the onboarding redirect
        // if the user is on the reset password page.
        if (
          completionPercentage < 50 &&
          hasCompletedOnboarding !== 'true' &&
          pathname !== '/reset-password'
        ) {
          router.push('/onboarding');
          return;
        }

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
        console.error('Error loading dashboard layout data:', error);
        if (pathname !== '/reset-password') {
          router.push('/onboarding');
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
        loadData();
    }
  }, [user, profile, authLoading, router, updateProfile, pathname]);

  const isNetworkPage = pathname === '/network';

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16">
        <div className="hidden lg:block lg:w-80 lg:fixed lg:left-0 lg:top-16 lg:bottom-0">
          <div className="p-6 h-full">
            {isNetworkPage ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full overflow-y-auto">
                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage my network</h2>
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Connections</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatNumber(connectionCount)}</span>
                  </div>
                   <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Following & followers</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Groups</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatNumber(groupsCount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Events</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatNumber(eventsCount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Pages</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatNumber(pagesCount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <NewspaperIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Newsletters</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatNumber(newslettersCount)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <LeftSidebar />
            )}
          </div>
        </div>
        <div className="flex-1 lg:ml-80 xl:mr-80">
            <main className="py-8 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
        </div>
        <div className="hidden xl:block xl:w-80 xl:fixed xl:right-0 xl:top-16 xl:bottom-0">
          <div className="p-6 h-full">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}