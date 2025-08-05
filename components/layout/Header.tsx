'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import UserSearch from '@/components/search/UserSearch';
import ProfileWizard from '@/components/profile/ProfileWizard';
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
} from '@heroicons/react/24/outline';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

export default function Header() {
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
    { name: 'Network', href: '/network', icon: UserGroupIcon },
    { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
    { name: 'Events', href: '/events', icon: CalendarDaysIcon },
  ], []);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                                            <Image
                              src="/Kendraa Logo.png"
                              alt="Kendraa"
                              width={120}
                              height={40}
                              className="h-8 w-auto"
                              priority
                            />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <UserSearch />

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200 relative"
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
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
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
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <BellIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatRelativeTime(notification.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <Link
                          href="/notifications"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.full_name || 'User'}
                    size="sm"
                  />
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">
                        {profile?.full_name || 'User'}
                      </div>
                      <div className="text-sm text-gray-500">{profile?.headline}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        href={`/profile/${user?.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        View Profile
                      </Link>
                      <Link
                        href="/profile/setup"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Edit Profile
                      </Link>
                      {(!profile?.full_name || !profile?.headline || !profile?.specialization?.length) && (
                        <button
                          onClick={() => {
                            setShowProfileWizard(true);
                            setIsProfileMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                        >
                          <div className="flex items-center space-x-2">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span>Complete Profile</span>
                          </div>
                        </button>
                      )}
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={async () => {
                          await signOut();
                          router.push('/signin');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 py-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </header>
    
      {/* Profile Wizard */}
      <ProfileWizard
        isOpen={showProfileWizard}
        onClose={() => setShowProfileWizard(false)}
        onComplete={() => setShowProfileWizard(false)}
      />
    </>
  );
} 