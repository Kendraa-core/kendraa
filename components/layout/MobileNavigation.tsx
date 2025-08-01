'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  PlusIcon,
  UsersIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getProfile, type Profile } from '@/lib/queries';

export default function MobileNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Load user profile to determine navigation options
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          const profile = await getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);

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
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Menu</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Link
                    href="/search"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    <span className="font-medium">Search</span>
                  </Link>
                  
                  <Link
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <BellIcon className="w-5 h-5" />
                    <span className="font-medium">Notifications</span>
                  </Link>
                  
                  <Link
                    href={`/profile/${user?.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 