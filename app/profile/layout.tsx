'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  PlusIcon,
  UsersIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import UserSearch from '@/components/search/UserSearch';
import NotificationList from '@/components/notifications/NotificationList';
import MobileNavigation from '@/components/layout/MobileNavigation';
import QuickNav from '@/components/common/QuickNav';
import { useNotifications } from '@/contexts/NotificationContext';
import { getProfile, type Profile } from '@/lib/queries';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Load user profile to determine navigation options
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          const profile = await getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setProfileLoading(false);
      }
    };

    loadUserProfile();
  }, [user?.id]);

  // Click outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Determine navigation items based on user type
  const getNavigationItems = () => {
    const isInstitution = userProfile?.profile_type === 'institution';
    
    const baseItems = [
      { href: '/feed', icon: HomeIcon, label: 'Home' },
    ];

    if (isInstitution) {
      // Institution navigation
      return [
        ...baseItems,
        { href: '/jobs', icon: BriefcaseIcon, label: 'Jobs' },
        { href: '/jobs/create', icon: PlusIcon, label: 'Post Job' },
        { href: '/events', icon: CalendarDaysIcon, label: 'Events' },
        { href: '/followers', icon: UsersIcon, label: 'Followers' },
      ];
    } else {
      // Individual/Student navigation
      return [
        ...baseItems,
        { href: '/network', icon: UserGroupIcon, label: 'Network' },
        { href: '/jobs', icon: BriefcaseIcon, label: 'Jobs' },
        { href: '/events', icon: CalendarDaysIcon, label: 'Events' },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/feed" className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  K
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative group flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-white/10"
                  >
                    <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-300" />
                    <span className="hidden sm:block text-xs mt-1 font-medium">{item.label}</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                );
              })}
            </nav>

            {/* Right side items */}
            <nav className="flex items-center space-x-1">
              {/* Mobile Navigation */}
              <MobileNavigation />

              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="relative group flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-white/10"
              >
                <MagnifyingGlassIcon className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:block text-xs mt-1 font-medium">Search</span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative group flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-white/10"
              >
                <BellIcon className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:block text-xs mt-1 font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="relative group flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-white/10"
                >
                  <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:block text-xs mt-1 font-medium">Profile</span>
                </button>

                <>
                  {showProfileDropdown && (
                    <div
                      
                      
                      
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <Link href={`/profile/${user.id}`}>
                        <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                          View Profile
                        </div>
                      </Link>
                      <Link href="/profile/setup">
                        <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                          Edit Profile
                        </div>
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={signOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Quick Navigation */}
      <QuickNav />

      {/* Search Modal */}
      <>
        {showSearch && (
          <div
            
            
            
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => setShowSearch(false)}
          >
            <div
              
              
              
              onClick={(e) => e.stopPropagation()}
            >
              <UserSearch onClose={() => setShowSearch(false)} />
            </div>
          </div>
        )}
      </>

      {/* Notifications Modal */}
      <>
        {showNotifications && (
          <div
            
            
            
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => setShowNotifications(false)}
          >
            <div
              
              
              
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <NotificationList 
                notifications={[]} 
                onMarkAsRead={() => {}} 
              />
            </div>
          </div>
        )}
      </>
    </div>
  );
} 