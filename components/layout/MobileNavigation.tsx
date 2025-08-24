'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  PlusIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { getProfile, type Profile } from '@/lib/queries';

export default function MobileNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();
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
    
    if (isInstitution) {
      // Institution navigation
      return [
        { href: '/feed', icon: HomeIcon, label: 'Home' },
        { href: '/jobs', icon: BriefcaseIcon, label: 'Jobs' },
        { href: '/jobs/create', icon: PlusIcon, label: 'Post' },
        { href: '/events', icon: CalendarDaysIcon, label: 'Events' },
        { href: `/profile/${user?.id}`, icon: UserCircleIcon, label: 'Profile' },
      ];
    } else {
      // Individual/Student navigation
      return [
        { href: '/feed', icon: HomeIcon, label: 'Home' },
        { href: '/network', icon: UserGroupIcon, label: 'Network' },
        { href: '/jobs', icon: BriefcaseIcon, label: 'Jobs' },
        { href: '/events', icon: CalendarDaysIcon, label: 'Events' },
        { href: `/profile/${user?.id}`, icon: UserCircleIcon, label: 'Profile' },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="flex items-center justify-around px-2 py-2 bg-white border-t border-gray-200">
      {navigationItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-lg transition-colors ${
              isActive
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <IconComponent className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
} 