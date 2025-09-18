'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import UserSearch from '@/components/search/UserSearch';
import ProfileWizard from '@/components/profile/ProfileWizard';
import Logo from '@/components/common/Logo';
import {
  BellIcon,
  ChevronDownIcon,
  Bars3Icon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  BookmarkIcon,
  HeartIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onRightSidebarToggle?: () => void;
}

export default function Header({ onRightSidebarToggle }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileWizard, setShowProfileWizard] = useState(false);
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

  const navigationItems = useMemo(() => {
    const isInstitution = profile?.user_type === 'institution' || profile?.profile_type === 'institution';
    
    if (isInstitution) {
      return [
        { name: 'Home', href: '/institution/feed', icon: HomeIcon },
        { name: 'Jobs', href: '/institution/jobs', icon: BriefcaseIcon },
        { name: 'Events', href: '/institution/events', icon: CalendarDaysIcon },
      ];
    } else {
      return [
        { name: 'Home', href: '/feed', icon: HomeIcon },
        { name: 'My Network', href: '/network', icon: UserGroupIcon },
        { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
        { name: 'Events', href: '/events', icon: CalendarDaysIcon },
      ];
    }
  }, [profile]);

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

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo and Search */}
            <div className="flex items-center space-x-4 w-[450px] justify-start">
              <Link 
                href={profile?.user_type === 'institution' || profile?.profile_type === 'institution' ? '/institution/feed' : '/feed'} 
                className="flex items-center"
              >
                <Logo size="lg" />
              </Link>
              
              {/* Search Bar */}
              <div className="hidden sm:block flex-1 max-w-md ml-2">
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

            {/* Center Section - Navigation */}
            <div className="flex-1 flex justify-center px-8">
              <nav className="hidden md:flex items-center space-x-16">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex flex-col items-center justify-center w-24 h-16 rounded-lg transition-colors relative',
                        pathname === item.href
                          ? 'text-[#007fff]'
                          : 'text-gray-600 hover:text-[#007fff]'
                      )}
                    >
                      <item.icon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">{item.name}</span>
                      {pathname === item.href && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#007fff] rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Section - User controls */}
            <div className="flex items-center justify-end space-x-4 w-[450px]">
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
                          href={profile?.user_type === 'institution' || profile?.profile_type === 'institution' ? '/institution/notifications' : '/notifications'}
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
                    name={profile?.full_name || user?.email || 'User'}
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
                          name={profile?.full_name || user?.email || 'User'}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-black truncate">
                            {profile?.full_name || user?.email || 'User'}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {profile?.headline || 'Professional Headline'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Profile Completion Bar - Hide if 100% complete or for institution users */}
                      {profileCompletion < 100 && profile?.user_type !== 'institution' && profile?.profile_type !== 'institution' && (
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
                      )}
                    </div>

                    {/* View Profile */}
                    <div className="px-2 py-1 border-t border-gray-100">
                      <Link
                        href={profile?.user_type === 'institution' || profile?.profile_type === 'institution' ? '/institution/profile' : `/profile/${user?.id}`}
                        className="flex items-center space-x-3 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>View Profile</span>
                      </Link>
                    </div>

                    {/* Settings */}
                    <div className="px-2 py-1">
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="px-2 py-1 border-t border-gray-100">
                      <button
                        onClick={signOut}
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
      </header>

      {/* Profile Wizard Modal */}
      {showProfileWizard && (
        <ProfileWizard
          isOpen={showProfileWizard}
          onClose={() => setShowProfileWizard(false)}
          onComplete={() => {
            setShowProfileWizard(false);
            // Refresh the page to update profile data
            window.location.reload();
          }}
        />
      )}
    </>
  );
} 