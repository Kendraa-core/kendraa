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
        <LeftSidebar 
          connectionCount={connectionCount}
          groupsCount={groupsCount}
          eventsCount={eventsCount}
          pagesCount={pagesCount}
          newslettersCount={newslettersCount}
          isInstitution={true}
        />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
        
        {/* Right Sidebar */}
        {!isNetworkPage && (
          <RightSidebar 
            connectionCount={connectionCount}
            isInstitution={true}
          />
        )}
      </div>
    </div>
  );
}
