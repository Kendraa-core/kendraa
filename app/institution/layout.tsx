'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseStorageUrl, formatRelativeTime } from '@/lib/utils';
import Logo from '@/components/common/Logo';
import Avatar from '@/components/common/Avatar';
import UserSearch from '@/components/search/UserSearch';
import {
  HomeIcon,
  PencilIcon,
  BriefcaseIcon,
  CalendarIcon,
  UserGroupIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  BookmarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  PencilIcon as PencilSolidIcon,
  BriefcaseIcon as BriefcaseSolidIcon,
  CalendarIcon as CalendarSolidIcon
} from '@heroicons/react/24/solid';

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle role-based redirects
  useEffect(() => {
    if (!user) {
      // User not logged in, redirect to signin
      router.push('/signin');
      return;
    }

    if (profile) {
      // Check if user is an institution
      const isInstitution = profile.user_type === 'institution' || profile.profile_type === 'institution';
      
      if (!isInstitution) {
        // User is not an institution, redirect to regular feed
        router.push('/feed');
        return;
      }
      
      // User is an institution, allow access
      setIsLoading(false);
    }
  }, [user, profile, router]);

  // Show loading while checking authentication and role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
          <p className="text-sm text-[#007fff]">Loading...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: 'Home',
      href: '/institution/feed',
      icon: HomeIcon,
      iconSolid: HomeSolidIcon,
      current: pathname === '/institution/feed'
    },
    {
      name: 'Edit Profile',
      href: '/institution/profile',
      icon: PencilIcon,
      iconSolid: PencilSolidIcon,
      current: pathname === '/institution/profile'
    },
    {
      name: 'Jobs',
      href: '/institution/jobs',
      icon: BriefcaseIcon,
      iconSolid: BriefcaseSolidIcon,
      current: pathname.startsWith('/institution/jobs')
    },
    {
      name: 'Events',
      href: '/institution/events',
      icon: CalendarIcon,
      iconSolid: CalendarSolidIcon,
      current: pathname.startsWith('/institution/events')
    }
  ];

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.full_name,
      profile.headline,
      profile.bio,
      profile.location,
      profile.avatar_url,
      profile.specialization && profile.specialization.length > 0,
    ];
    
    const completed = fields.filter(field => field).length;
    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = getProfileCompletion();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      router.push('/signin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <Link href="/institution/feed" className="flex items-center">
              <Logo size="sm" className="h-8" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.current ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-[#007fff]/10 text-[#007fff]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <Link href="/institution/feed" className="flex items-center">
              <Logo size="sm" className="h-8" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.current ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-[#007fff]/10 text-[#007fff]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url.startsWith('http') ? profile.avatar_url : getSupabaseStorageUrl('avatars', profile.avatar_url)}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || 'Institution'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              {/* Search */}
              <div className="hidden sm:block flex-1 max-w-md">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setIsSearchFocused(false);
                    }
                  }}
                  className="relative group"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search people, jobs, events..."
                    className="w-full pl-10 pr-16 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-[#007fff] focus:border-[#007fff] outline-none text-sm transition-all duration-200 hover:border-gray-300 shadow-sm"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#007fff] transition-colors duration-200" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">⌘K</kbd>
                  </div>
                  
                  {/* Search suggestions dropdown */}
                  {isSearchFocused && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 px-2 py-1">Quick Search</div>
                        <button 
                          type="button"
                          onClick={() => router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
                          className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
                        >
                          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                          <span>Search for &quot;{searchQuery}&quot;</span>
                        </button>
                        <div className="text-xs font-medium text-gray-500 px-2 py-1 mt-2">Popular Searches</div>
                        {['Healthcare Jobs', 'Medical Events', 'Doctors', 'Nurses'].map((suggestion) => (
                          <button 
                            key={suggestion}
                            type="button"
                            onClick={() => setSearchQuery(suggestion)}
                            className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsDropdownRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-[#007fff] rounded-full flex items-center justify-center transition-all duration-200 relative"
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-black">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`w-full p-3 hover:bg-gray-50 transition-colors duration-200 ${
                              !notification.read ? 'bg-[#007fff]/10' : ''
                            }`}
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-[#007fff]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <BellIcon className="w-4 h-4 text-[#007fff]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-black">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatRelativeTime(notification.created_at)}
                                </p>
                                {!notification.read && (
                                  <div className="mt-1">
                                    <span className="inline-block w-2 h-2 bg-[#007fff] rounded-full"></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-gray-100">
                        <Link
                          href="/notifications"
                          className="text-sm text-[#007fff] hover:text-[#007fff]/90 font-medium"
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.full_name || user?.email || 'Institution'}
                    size="sm"
                  />
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={profile?.avatar_url}
                          alt={profile?.full_name || user?.email || 'Institution'}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-black truncate">
                            {profile?.full_name || user?.email || 'Institution'}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {profile?.headline || 'Healthcare Institution'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Profile Completion Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Profile completion</span>
                          <span>{profileCompletion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#007fff] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${profileCompletion}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-2 py-1">
                      <Link
                        href="/institution/profile"
                        className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>View Profile</span>
                      </Link>
                      <Link
                        href="/institution/profile"
                        className="flex items-center space-x-3 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </div>

                    {/* Account Management */}
                    <div className="px-2 py-1 border-t border-gray-100">
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        href="/saved-items"
                        className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <BookmarkIcon className="w-4 h-4" />
                        <span>Saved Items</span>
                      </Link>
                    </div>

                    {/* Help & Support */}
                    <div className="px-2 py-1 border-t border-gray-100">
                      <Link
                        href="/help"
                        className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <QuestionMarkCircleIcon className="w-4 h-4" />
                        <span>Help & Support</span>
                      </Link>
                      <Link
                        href="/privacy"
                        className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>Privacy Policy</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="px-2 py-1 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
