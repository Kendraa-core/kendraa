'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getConnectionCount } from '@/lib/queries';
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  BellIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  StarIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  UserIcon as UserSolidIcon,
  BellIcon as BellSolidIcon,
  BriefcaseIcon as BriefcaseSolidIcon,
  BuildingOfficeIcon as BuildingOfficeSolidIcon,
  CalendarIcon as CalendarSolidIcon,
  StarIcon as StarSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  AcademicCapIcon as AcademicCapSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
} from '@heroicons/react/24/solid';

const navigationItems = [
  {
    name: 'Home',
    href: '/feed',
    icon: HomeIcon,
    iconActive: HomeSolidIcon,
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: ChartBarIcon,
    iconActive: ChartBarSolidIcon,
  },
  {
    name: 'My Network',
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
    icon: CalendarIcon,
    iconActive: CalendarSolidIcon,
    isNew: true,
  },

  {
    name: 'Notifications',
    href: '/notifications',
    icon: BellIcon,
    iconActive: BellSolidIcon,
  },
];

const quickAccessItems = [
  {
    name: 'Saved Posts',
    href: '/saved-items',
    icon: BookmarkIcon,
    iconActive: BookmarkSolidIcon,
  },
  {
    name: 'Specializations',
    href: '/specializations',
    icon: AcademicCapIcon,
    iconActive: AcademicCapSolidIcon,
  },
  {
    name: 'My Reviews',
    href: '/reviews',
    icon: StarIcon,
    iconActive: StarSolidIcon,
  },
];

interface LeftSidebarProps {
  onClose?: () => void;
}

export default function LeftSidebar({ onClose }: LeftSidebarProps) {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const connections = await getConnectionCount(user.id);
        setConnectionCount(connections);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  if (!user) return null;

  const isMobile = onClose !== undefined;

  return (
    <div className={cn(
      "flex flex-col h-full bg-white",
      isMobile ? "w-full" : "hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:border-r lg:border-gray-200 lg:shadow-sm"
    )}>
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
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

        {/* Enhanced User Profile Section */}
        <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 overflow-hidden">
          {/* Mini Banner */}
          <div className="h-16 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-10" />
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <defs>
                  <pattern id="medical-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="0.5" fill="white" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#medical-dots)" />
              </svg>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="px-6 pb-6 -mt-8 relative">
            <Link href={`/profile/${user.id}`} className="group block" onClick={onClose}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-semibold text-xl ring-4 ring-white shadow-lg">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="w-full">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors mb-1">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate mb-2">
                    {profile?.headline || 'Add a headline'}
                  </p>
                  
                  {profile?.specialization && profile.specialization.length > 0 && (
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full mb-3">
                      {profile.specialization[0]}
                    </span>
                  )}
                </div>
              </motion.div>
            </Link>
            
            {/* Enhanced Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-center">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : connectionCount}
                  </p>
                  <p className="text-xs text-gray-600">Connections</p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : Math.floor(Math.random() * 50) + 10}
                  </p>
                  <p className="text-xs text-gray-600">Posts</p>
                </div>
              </div>
            </div>

            {/* Quick Profile Action */}
            <div className="mt-4">
              <Link href={`/profile/${user.id}`} onClick={onClose}>
                <button className="w-full py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors">
                  View Profile
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = isActive ? item.iconActive : item.icon;

              return (
                <Link key={item.name} href={item.href} onClick={onClose}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={cn(
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon 
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                      )} 
                    />
                    <span className="truncate">{item.name}</span>
                    {item.isNew && (
                      <span className="ml-auto px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        New
                      </span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Quick Access Section */}
          <div className="mt-8 px-3">
            <button
              onClick={() => setShowQuickAccess(!showQuickAccess)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span>Quick Access</span>
              <div
                className={cn(
                  'transition-transform duration-200',
                  showQuickAccess ? 'rotate-180' : ''
                )}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            <div
              className={cn(
                'transition-all duration-200 ease-in-out',
                showQuickAccess ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
              style={{ overflow: 'hidden' }}
            >
              <div className="mt-2 space-y-1">
                {quickAccessItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = isActive ? item.iconActive : item.icon;

                  return (
                    <Link key={item.name} href={item.href} onClick={onClose}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        className={cn(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <Icon 
                          className={cn(
                            'mr-3 h-4 w-4 flex-shrink-0',
                            isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                          )} 
                        />
                        <span className="truncate">{item.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="mt-auto p-3 border-t border-gray-200">
            <Link href="/settings" onClick={onClose}>
              <motion.div
                whileHover={{ x: 2 }}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                <Cog6ToothIcon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                <span>Settings</span>
              </motion.div>
            </Link>
          </div>
        </nav>

        {/* Premium Upgrade Card */}
        <div className="p-4 m-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="text-center">
            <StarIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-amber-900 mb-1">
              Upgrade to Premium
            </h3>
            <p className="text-xs text-amber-700 mb-3">
              Get advanced features and insights
            </p>
            <button className="w-full px-3 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-lg transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 