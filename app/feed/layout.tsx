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
import { formatNumber } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading: authLoading, updateProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [dataLoading, setDataLoading] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [newslettersCount, setNewslettersCount] = useState(0);

  // This custom hook cleanly handles the logic for protecting routes
  const { isProtected, isLoading: isOnboardingLoading } = useOnboardingProtection();

  // Redirect institution users to institution pages (but respect onboarding status)
  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.user_type === 'institution' || profile.profile_type === 'institution') {
        // Let the onboarding protection hook handle the redirect
        // It will redirect to /institution/onboarding if not completed
        // or to /institution/feed if completed
        return;
      }
    }
  }, [profile, authLoading, router, user]);

  // Fetch all necessary data for the sidebars in one place
  useEffect(() => {
    const loadSidebarData = async () => {
      if (!user?.id) {
        if (!authLoading) { // If auth check is done and there's no user, redirect
          router.push('/signin');
        }
        return;
      }

      setDataLoading(true);
      try {
        // Fetch all data in parallel for performance
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
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading && user) {
      loadSidebarData();
    }
  }, [user, authLoading, router]);

  const isNetworkPage = pathname === '/network';
  const isLoading = authLoading || isOnboardingLoading || dataLoading;

  // Render a full-page loader while checking auth and onboarding status
  if (isLoading) {
    // Use the new LoadingSpinner everywhere for full-page loads.
    // size controls the spinner's visual size; adjust if you want a bigger/smaller loader.
    return <LoadingSpinner text="Loading your dashboard..." size={120} />;
  }
  
  // The hook handles the redirect, so we render null to prevent a flash of content
  if (!isProtected || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* This robust CSS Grid is the core of the new layout.
            - It adapts from 1 to 3 columns based on screen size.
            - It uses flexible units to handle different content sizes gracefully.
            - `gap-8` provides consistent spacing between columns.
          */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr] lg:grid-cols-[1fr_3fr_1.2fr] gap-8">
            
            {/* Left Sidebar Column */}
            <aside className="hidden md:block">
              {/* The sidebar content is now "sticky" within its grid column */}
              <div className="sticky top-24 space-y-8">
                {isNetworkPage ? (
                  // "Manage my network" panel shown only on the network page
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-black mb-4">Manage my network</h2>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <UserGroupIcon className="w-5 h-5 text-[#007fff]" />
                          <span className="text-sm text-gray-700">Connections</span>
                        </div>
                        <span className="text-sm font-medium text-black">{formatNumber(connectionCount)}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <UserIcon className="w-5 h-5 text-[#007fff]" />
                          <span className="text-sm text-gray-700">Following & followers</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <BuildingOfficeIcon className="w-5 h-5 text-[#007fff]" />
                          <span className="text-sm text-gray-700">Groups</span>
                        </div>
                        <span className="text-sm font-medium text-black">{formatNumber(groupsCount)}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <CalendarDaysIcon className="w-5 h-5 text-[#007fff]" />
                          <span className="text-sm text-gray-700">Events</span>
                        </div>
                        <span className="text-sm font-medium text-black">{formatNumber(eventsCount)}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="w-5 h-5 text-[#007fff]" />
                          <span className="text-sm text-gray-700">Pages</span>
                        </div>
                        <span className="text-sm font-medium text-black">{formatNumber(pagesCount)}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <NewspaperIcon className="w-5 h-5 text-[#007fff]" />
                          <span className="text-sm text-gray-700">Newsletters</span>
                        </div>
                        <span className="text-sm font-medium text-black">{formatNumber(newslettersCount)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Standard LeftSidebar shown on all other pages
                  <LeftSidebar 
                    connectionCount={connectionCount}
                    groupsCount={groupsCount}
                    eventsCount={eventsCount}
                    pagesCount={pagesCount}
                    newslettersCount={newslettersCount}
                  />
                )}
              </div>
            </aside>

            {/* Center Content Column: This spans the full width on mobile */}
            <div className="min-w-0">
              {children}
            </div>

            {/* Right Sidebar Column: Hidden on mobile and tablet */}
            {!isNetworkPage && (
              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-8">
                  <RightSidebar />
                </div>
              </aside>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
