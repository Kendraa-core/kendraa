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
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import UserSearch from '@/components/search/UserSearch';
import NotificationList from '@/components/notifications/NotificationList';
import { useNotifications } from '@/contexts/NotificationContext';
import { getProfile, type Profile } from '@/lib/queries';

export default function DashboardLayout({
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
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
        { href: '/followers', icon: UsersIcon, label: 'Followers' },
        { href: '/institutions', icon: BuildingOffice2Icon, label: 'Institutions' },
      ];
    } else {
      // Individual/Student navigation
      return [
        ...baseItems,
        { href: '/network', icon: UserGroupIcon, label: 'Network' },
        { href: '/jobs', icon: BriefcaseIcon, label: 'Jobs' },
        { href: '/institutions', icon: BuildingOffice2Icon, label: 'Institutions' },
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
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
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
                    className="relative group flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-white/10"
                  >
                    <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-300" />
                    <span className="hidden sm:block text-xs mt-1 font-medium">{item.label}</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                );
              })}
            </nav>

            {/* Right side items */}
            <nav className="flex items-center space-x-1">
              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="relative group flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-white/10"
              >
                <MagnifyingGlassIcon className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:block text-xs mt-1 font-medium">Search</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative group flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-white/10"
              >
                <BellIcon className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:block text-xs mt-1 font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {unreadCount}
                  </motion.div>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <div className="h-6 sm:h-8 border-l border-white/20 mx-2 sm:mx-3"></div>
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setShowProfileDropdown(prev => !prev)}
                  className={`flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-white/10 ${
                    showProfileDropdown ? 'bg-indigo-50 text-indigo-600' : ''
                  }`}
                >
                  <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:block text-xs mt-1 font-medium">
                    Profile {showProfileDropdown ? '▴' : '▾'}
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 w-56 sm:w-64 mt-2 py-3 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm sm:text-base">
                              {userProfile?.full_name || user.email?.split('@')[0]}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {userProfile?.profile_type || 'Individual'} Profile
                            </div>
                            <Link 
                              href={`/profile/${user.id}`}
                              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-300"
                            >
                              View Profile →
                            </Link>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-b-2xl font-medium"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-4"
            >
              <UserSearch onClose={() => setShowSearch(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4"
            >
              <NotificationList 
                notifications={[]} 
                onMarkAsRead={() => {}} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
      
      {/* No bottom navigation - removed as requested */}
    </div>
  );
} 