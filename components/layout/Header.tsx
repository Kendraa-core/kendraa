'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  Bars3Icon,
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  PlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '@/contexts/NotificationContext';
import { getProfile, type Profile } from '@/lib/queries';
import React from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const { user, profile, signOut } = useAuth();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  // Load user profile to determine navigation options
  React.useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id && !userProfile) {
        try {
          const profile = await getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.id, userProfile]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push('/');
  }, [signOut, router]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen(prev => !prev);
  }, []);

  // Determine navigation items based on user type - use useMemo to prevent conditional hooks
  const navigationItems = useMemo(() => {
    if (!user) return [];
    
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
      // Individual/Student navigation (default)
      return [
        ...baseItems,
        { href: '/network', icon: UserGroupIcon, label: 'Network' },
        { href: '/jobs', icon: BriefcaseIcon, label: 'Jobs' },
        { href: '/applications', icon: BriefcaseIcon, label: 'Applications' },
        { href: '/events', icon: CalendarDaysIcon, label: 'Events' },
      ];
    }
  }, [user, userProfile?.profile_type]);

  if (!user) return null;

  return (
    <>
      <header className="header-container">
        <div className="header-content">
          <div className="header-inner">
            {/* Logo */}
            <div className="logo-container">
              <Link href="/feed" className="flex-shrink-0">
                <div className="logo-icon">
                  <span>K</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="nav-container">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={isActive ? 'nav-item-active' : 'nav-item'}>
                      <IconComponent className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Right side items */}
            <nav className="flex items-center space-x-1">
              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="nav-item"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span className="hidden sm:block text-sm font-medium">Search</span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="nav-item relative"
              >
                <BellIcon className="h-5 w-5" />
                <span className="hidden sm:block text-sm font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="nav-item"
                >
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.full_name || 'User'}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm font-medium">Profile</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
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
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="nav-item md:hidden"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={isActive ? 'nav-item-mobile-active' : 'nav-item-mobile'}>
                      <IconComponent className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
} 