'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  UserIcon,
  BuildingOfficeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  BriefcaseIcon as BriefcaseIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  UserIcon as UserIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid
} from '@heroicons/react/24/solid';

interface MobileBottomNavProps {
  isInstitution?: boolean;
}

export default function MobileBottomNav({ isInstitution = false }: MobileBottomNavProps) {
  const pathname = usePathname();
  const baseRoute = isInstitution ? '/mob/institution' : '/mob';

  const navigationItems = isInstitution ? [
    { 
      name: 'Feed', 
      href: `${baseRoute}/feed`, 
      icon: HomeIcon, 
      activeIcon: HomeIconSolid 
    },
    { 
      name: 'Network', 
      href: `${baseRoute}/network`, 
      icon: UserGroupIcon, 
      activeIcon: UserGroupIconSolid 
    },
    { 
      name: 'Create', 
      href: `${baseRoute}/create`, 
      icon: PlusIcon, 
      activeIcon: PlusIcon,
      isCreate: true
    },
    { 
      name: 'Jobs', 
      href: `${baseRoute}/jobs`, 
      icon: BriefcaseIcon, 
      activeIcon: BriefcaseIconSolid 
    },
    { 
      name: 'Profile', 
      href: `${baseRoute}/profile`, 
      icon: BuildingOfficeIcon, 
      activeIcon: BuildingOfficeIconSolid 
    }
  ] : [
    { 
      name: 'Feed', 
      href: `${baseRoute}/feed`, 
      icon: HomeIcon, 
      activeIcon: HomeIconSolid 
    },
    { 
      name: 'Network', 
      href: `${baseRoute}/network`, 
      icon: UserGroupIcon, 
      activeIcon: UserGroupIconSolid 
    },
    { 
      name: 'Jobs', 
      href: `${baseRoute}/jobs`, 
      icon: BriefcaseIcon, 
      activeIcon: BriefcaseIconSolid 
    },
    { 
      name: 'Events', 
      href: `${baseRoute}/events`, 
      icon: CalendarDaysIcon, 
      activeIcon: CalendarDaysIconSolid 
    },
    { 
      name: 'Profile', 
      href: `${baseRoute}/profile`, 
      icon: UserIcon, 
      activeIcon: UserIconSolid 
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                item.isCreate
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-6 h-6 ${item.isCreate ? 'text-white' : ''}`} />
              <span className={`text-xs font-medium ${item.isCreate ? 'text-white' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
