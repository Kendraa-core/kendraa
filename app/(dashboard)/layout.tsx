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
  getExperiences,
  getEducation
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
  const { user, profile, updateProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [connectionCount, setConnectionCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [newslettersCount, setNewslettersCount] = useState(0);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) {
        router.push('/signin');
        return;
      }

      try {
        const userProfile = await getProfile(user.id);
        
        // Update profile in context if it's different
        if (userProfile && (!profile || profile.id !== userProfile.id)) {
          await updateProfile(userProfile);
        }

        // Calculate profile completion percentage
        const calculateProfileCompletion = () => {
          if (!userProfile) return 0;
          
          const fields = [
            userProfile.full_name,
            userProfile.headline,
            userProfile.bio,
            userProfile.location,
            userProfile.avatar_url
          ];
          
          const completedFields = fields.filter(field => {
            if (typeof field === 'string') {
              return field && field.trim() !== '';
            }
            return field;
          }).length;
          return Math.round((completedFields / fields.length) * 100);
        };

        const completionPercentage = calculateProfileCompletion();
        
        // Check if user has completed onboarding before
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
        
        // Redirect to onboarding if completion is below 50% and onboarding hasn't been completed
        if (completionPercentage < 50 && hasCompletedOnboarding !== 'true') {
          router.push('/onboarding');
          return;
        }

        // Load all network data for sidebar
        const [
          connectionsCount,
          groupsCount,
          eventsCount,
          pagesCount,
          newslettersCount
        ] = await Promise.all([
          getConnectionCount(user.id),
          getUserGroupsCount(user.id),
          getUserEventsCount(user.id),
          getUserPagesCount(user.id),
          getUserNewslettersCount(user.id)
        ]);
        
        setConnectionCount(connectionsCount);
        setGroupsCount(groupsCount);
        setEventsCount(eventsCount);
        setPagesCount(pagesCount);
        setNewslettersCount(newslettersCount);
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Redirect to onboarding on error for new users
        router.push('/onboarding');
        return;
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user?.id, router, updateProfile, profile]);

  // Check if we're on the network page
  const isNetworkPage = pathname === '/network';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex pt-16">
        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block lg:w-80 lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:overflow-y-auto lg:bg-gray-50">
          <div className="p-6 h-full">
            {isNetworkPage ? (
              // Network-specific sidebar
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
                
                {/* Footer Links */}
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
                  <p className="text-xs text-gray-400 mt-4">Kendraa Corporation © 2025</p>
                </div>
              </div>
            ) : (
              // Regular sidebar for other pages
              <LeftSidebar />
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-80 xl:mr-80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              {/* Center Content */}
              <div className="flex-1 min-w-0 max-w-2xl mx-auto">
                <main className="py-8">
                  {children}
                </main>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop */}
        <div className="hidden xl:block xl:w-80 xl:fixed xl:right-0 xl:top-16 xl:bottom-0 xl:overflow-y-auto xl:bg-gray-50">
          <div className="p-6 h-full">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
} 