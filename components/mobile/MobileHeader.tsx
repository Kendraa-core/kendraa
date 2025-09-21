'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import Logo from '@/components/common/Logo';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  isInstitution?: boolean;
}

export default function MobileHeader({ 
  title, 
  showSearch = true, 
  isInstitution = false 
}: MobileHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const baseRoute = isInstitution ? '/mob/institution' : '/mob';

  const navigationItems = isInstitution ? [
    { name: 'Feed', href: `${baseRoute}/feed`, icon: HomeIcon },
    { name: 'Network', href: `${baseRoute}/network`, icon: UserGroupIcon },
    { name: 'Jobs', href: `${baseRoute}/jobs`, icon: BriefcaseIcon },
    { name: 'Events', href: `${baseRoute}/events`, icon: CalendarDaysIcon },
    { name: 'Profile', href: `${baseRoute}/profile`, icon: BuildingOfficeIcon },
  ] : [
    { name: 'Feed', href: `${baseRoute}/feed`, icon: HomeIcon },
    { name: 'Network', href: `${baseRoute}/network`, icon: UserGroupIcon },
    { name: 'Jobs', href: `${baseRoute}/jobs`, icon: BriefcaseIcon },
    { name: 'Events', href: `${baseRoute}/events`, icon: CalendarDaysIcon },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    // AuthContext will handle the redirect to landing page
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Menu button and Logo */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              </button>
              
              <Link href={baseRoute} className="flex items-center">
                <Logo size="sm" className="h-3" />
              </Link>
            </div>

            {/* Center - Title */}
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            )}

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
              {showSearch && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MagnifyingGlassIcon className="w-6 h-6 text-gray-700" />
                </button>
              )}
              
              <Link 
                href={`${baseRoute}/notifications`}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              >
                <BellIcon className="w-6 h-6 text-gray-700" />
                {/* Notification badge can be added here */}
              </Link>

              {user && (
                <Link href={`${baseRoute}/profile`}>
                  <Avatar
                    src={user.user_metadata?.avatar_url}
                    alt={user.user_metadata?.full_name || 'User'}
                    size="sm"
                    className="border-2 border-transparent hover:border-blue-200 transition-colors"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="bg-white w-80 h-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={user?.user_metadata?.avatar_url}
                    alt={user?.user_metadata?.full_name || 'User'}
                    size="md"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.user_metadata?.headline || 'Healthcare Professional'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="py-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center px-6 py-3 text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-6 h-6 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Actions */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
                <Link
                  href={`${baseRoute}/settings`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-6 py-4 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Cog6ToothIcon className="w-6 h-6 mr-3" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-6 py-4 text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-700" />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search people, jobs, events..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            
            {/* Search Results */}
            <div className="p-4">
              <p className="text-gray-500 text-center mt-8">
                Start typing to search...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
