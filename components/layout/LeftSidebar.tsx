'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getConnectionCount } from '@/lib/queries';
import {
  UserIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  XMarkIcon,
  PlusIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
  BellIcon,
  HomeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  UserIcon as UserSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  Cog6ToothIcon as Cog6ToothSolidIcon,
  PlusIcon as PlusSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  BriefcaseIcon as BriefcaseSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
  BellIcon as BellSolidIcon,
  HomeIcon as HomeSolidIcon,
  CalendarDaysIcon as CalendarDaysSolidIcon,
} from '@heroicons/react/24/solid';

// Essential navigation items
const navigationItems = [
  {
    name: 'Home',
    href: '/feed',
    icon: HomeIcon,
    iconActive: HomeSolidIcon,
  },
  {
    name: 'Network',
    href: '/network',
    icon: UserGroupIcon,
    iconActive: UserGroupSolidIcon,
  },
  {
    name: 'Jobs',
    href: '/jobs',
    icon: BriefcaseIcon,
    iconActive: BriefcaseSolidIcon,
  },
  {
    name: 'Events',
    href: '/events',
    icon: CalendarDaysIcon,
    iconActive: CalendarDaysSolidIcon,
  },
];

// Quick actions
const quickActions = [
  {
    name: 'Post Job',
    href: '/jobs/create',
    icon: PlusIcon,
    iconActive: PlusSolidIcon,
  },
  {
    name: 'Create Event',
    href: '/events/create',
    icon: DocumentTextIcon,
    iconActive: DocumentTextSolidIcon,
  },
];

// Personal items
const personalItems = [
  {
    name: 'Applications',
    href: '/applications',
    icon: BriefcaseIcon,
    iconActive: BriefcaseSolidIcon,
  },
  {
    name: 'Saved',
    href: '/saved-items',
    icon: BookmarkIcon,
    iconActive: BookmarkSolidIcon,
  },
  {
    name: 'Analytics',
    href: '/dashboard',
    icon: ChartBarIcon,
    iconActive: ChartBarSolidIcon,
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: BellIcon,
    iconActive: BellSolidIcon,
  },
];

interface LeftSidebarProps {
  onClose?: () => void;
}

export default function LeftSidebar({ onClose }: LeftSidebarProps) {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [connectionCount, setConnectionCount] = useState(0);

  // Fetch connection count
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const connections = await getConnectionCount(user.id);
        setConnectionCount(connections);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user?.id]);

  if (!user) return null;

  const isMobile = onClose !== undefined;

  const renderNavItem = (item: any, isActive: boolean) => {
    const Icon = isActive ? item.iconActive : item.icon;
    
    return (
      <Link key={item.name} href={item.href} onClick={onClose}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 mb-2',
            isActive
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
          title={item.name}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      </Link>
    );
  };

  const renderSection = (items: any[], title?: string) => (
    <div className="mb-6">
      {title && (
        <div className="px-3 mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
        </div>
      )}
      <div className="flex flex-col items-center">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return renderNavItem(item, isActive);
        })}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "flex flex-col h-full bg-white/95 backdrop-blur-sm border-r border-gray-200/50",
      isMobile 
        ? "w-full" 
        : "hidden lg:flex lg:w-20 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:z-40"
    )}>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Menu</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        )}

        {/* Desktop: Compact Profile */}
        {!isMobile && (
          <div className="p-4 border-b border-gray-200/50">
            <Link href={`/profile/${user.id}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white shadow-md">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-900 truncate w-12">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {connectionCount} connections
                  </p>
                </div>
              </motion.div>
            </Link>
          </div>
        )}

        {/* Mobile: Full Profile Section */}
        {isMobile && (
          <div className="p-4 border-b border-gray-200">
            <Link href={`/profile/${user.id}`} onClick={onClose}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile?.headline || 'Add a headline'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {connectionCount} connections
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-2">
            {/* Main Navigation */}
            {renderSection(navigationItems)}
            
            {/* Quick Actions */}
            {renderSection(quickActions, 'Quick')}
            
            {/* Personal Items */}
            {renderSection(personalItems, 'Personal')}
          </div>

          {/* Settings - Bottom */}
          <div className="mt-auto p-2 border-t border-gray-200/50">
            <Link href="/settings" onClick={onClose}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center justify-center w-12 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                title="Settings"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </motion.div>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
} 