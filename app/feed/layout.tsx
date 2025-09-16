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
  const [loading, setLoading] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [newslettersCount, setNewslettersCount] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Use the new, cleaner onboarding protection hook
  const { isProtected, isLoading: isOnboardingLoading } = useOnboardingProtection();

  // Redirect institution users to institution pages
  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.user_type === 'institution' || profile.profile_type === 'institution') {
        router.push('/institution/dashboard');
        return;
      }
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        if (!authLoading) {
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

        // The onboarding check is now handled by the useOnboardingProtection hook.
        // This useEffect is now only responsible for fetching sidebar data.
        
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
        setLoading(false);
        setIsLoadingProfile(false);
      }
    };

    if (!authLoading) {
        loadData();
    }
  }, [user, profile, authLoading, router, updateProfile, isLoadingProfile]);

  const isNetworkPage = pathname === '/network';

  // Show a loading screen while the hook is checking the user's status
  if (isOnboardingLoading || loading || authLoading) {
    return (
      <LoadingSpinner variant="fullscreen" text="Loading your dashboard..." />
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
    <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10 flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16 relative">
        {/* Floating Left Island */}
        <div className="hidden lg:block fixed left-6 top-24 w-80 z-10">
          {isNetworkPage ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
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
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <a href="#" className="hover:text-gray-700">About</a>
                  <a href="#" className="hover:text-gray-700">Accessibility</a>
                  <a href="#" className="hover:text-gray-700">Help Center</a>
                  <a href="#" className="hover:text-gray-700">Privacy & Terms</a>
                  <a href="#" className="hover:text-gray-700">Ad Choices</a>
                  <a href="#" className="hover:text-gray-700">Advertising</a>
                  <a href="#" className="hover:text-gray-700">Business Services</a>
                  <a href="#" className="hover:text-gray-700">Get the App</a>
                  <a href="#" className="hover:text-gray-700">More</a>
                </div>
                <p className="text-xs text-gray-400 mt-4"><span className="mulish-semibold">kendraa</span> Corporation © 2025</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <LeftSidebar 
                connectionCount={connectionCount}
                groupsCount={groupsCount}
                eventsCount={eventsCount}
                pagesCount={pagesCount}
                newslettersCount={newslettersCount}
                isInstitution={false}
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="overflow-y-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className={`w-full ${isNetworkPage ? '' : 'max-w-2xl lg:ml-96'}`}>
                <main className="py-8">
                  {children}
                </main>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Right Island */}
        {!isNetworkPage && (
          <div className="hidden xl:block fixed right-6 top-24 w-80 z-10">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <RightSidebar connectionCount={connectionCount} isInstitution={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
