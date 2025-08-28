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
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);

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

  const navigationItems = useMemo(() => [
    { name: 'Home', href: '/feed', icon: HomeIcon },
    { name: 'My Network', href: '/network', icon: UserGroupIcon },
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
    { name: 'Events', href: '/events', icon: CalendarDaysIcon },
  ], []);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Logo at corner */}
            <div className="flex items-center space-x-4 pr-16">
              <Link href="/feed" className="flex items-center">
                <Logo size="lg" />
              </Link>
              
              {/* Search Bar */}
              <div className="hidden sm:block">
                <UserSearch />
              </div>
            </div>

            {/* Center - Navigation with padding */}
            <div className="flex-1 flex justify-center px-16">
              <nav className="hidden md:flex items-center space-x-12">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'hidden lg:inline-flex items-center px-4 py-2 text-base font-medium rounded-lg transition-colors',
                        pathname === item.href
                          ? 'text-azure-500 bg-azure-50 border-b-2 border-azure-500'
                          : 'text-gray-600 hover:text-azure-500 hover:bg-gray-50'
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-2" />
                      <span className="hidden lg:inline">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side - User controls */}
            <div className="flex items-center space-x-4 pl-16">
              {/* Notifications */}
              <div className="relative" ref={notificationsDropdownRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-gray-600 hover:text-azure-500 hover:bg-gray-50 rounded-lg transition-all duration-200 relative"
                >
                  <BellIcon className="w-6 h-6" />
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
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
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
                              !notification.read ? 'bg-azure-50' : ''
                            }`}
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-azure-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <BellIcon className="w-4 h-4 text-azure-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatRelativeTime(notification.created_at)}
                                </p>
                                {!notification.read && (
                                  <div className="mt-1">
                                    <span className="inline-block w-2 h-2 bg-azure-500 rounded-full"></span>
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
                          className="text-sm text-azure-500 hover:text-azure-600 font-medium"
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
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.full_name || user?.email || 'User'}
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
                          alt={profile?.full_name || user?.email || 'User'}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            {profile?.full_name || user?.email || 'User'}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {profile?.headline || 'Professional Headline'}
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
                            className="bg-azure-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${profileCompletion}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-2 py-1">
                      <Link
                        href={`/profile/${user?.id}`}
                        className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>View Profile</span>
                      </Link>
                      <button
                        onClick={() => setShowProfileWizard(true)}
                        className="flex items-center space-x-3 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
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