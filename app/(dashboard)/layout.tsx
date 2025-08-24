'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import UserSearch from '@/components/search/UserSearch';
import NotificationList from '@/components/notifications/NotificationList';
import QuickNav from '@/components/common/QuickNav';
import OnboardingModal from '@/components/profile/OnboardingModal';
import { useNotifications } from '@/contexts/NotificationContext';
import { getProfile, type Profile } from '@/lib/queries';
import Header from '@/components/layout/Header';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import MobileNavigation from '@/components/layout/MobileNavigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Load user profile to determine navigation options - but don't block the UI
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id && !userProfile) {
        setProfileLoading(true);
        try {
          const profile = await getProfile(user.id);
          setUserProfile(profile);
          
          // Check if profile is incomplete and show onboarding
          const isIncomplete = !profile?.full_name || !profile?.headline || !profile?.specialization?.length;
          if (isIncomplete) {
            // Delay showing onboarding to avoid immediate popup
            setTimeout(() => {
              setShowOnboarding(true);
            }, 2000);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    // Load profile in background without blocking UI
    loadUserProfile();
  }, [user?.id, userProfile]);

  // Close sidebars when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
        setIsRightSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Main spinner */}
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            
            {/* Pulse effect */}
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-400 rounded-full animate-ping opacity-20"></div>
          </div>
          
          <p className="text-gray-600 mt-4 text-sm font-medium">Loading Kendraa...</p>
          
          {/* Progress dots */}
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      {/* Header - Fixed at top */}
      <Header 
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onRightSidebarToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
      />

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNavigation />
      </div>

      {/* Main Layout Container */}
      <div className="flex pt-16">
        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block">
          <LeftSidebar />
        </div>

        {/* Left Sidebar - Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50">
              <LeftSidebar onClose={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Mobile Content Layout */}
            <div className="lg:hidden">
              {children}
            </div>

            {/* Desktop Content Layout */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-8 xl:col-span-9">
                {children}
              </div>

              {/* Right Sidebar - Desktop */}
              <div className="lg:col-span-4 xl:col-span-3">
                <div className="sticky top-24 space-y-6">
                  <RightSidebar />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Mobile Overlay */}
        {isRightSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsRightSidebarOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Access</h3>
                  <button
                    onClick={() => setIsRightSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <RightSidebar />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Navigation - Responsive positioning */}
      <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-40">
        <QuickNav />
      </div>
      
      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-md">
            <UserSearch />
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-md">
            <NotificationList 
              notifications={[]} 
              onMarkAsRead={async () => {}} 
            />
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </div>
  );
} 