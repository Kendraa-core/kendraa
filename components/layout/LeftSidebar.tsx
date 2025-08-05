'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getConnectionCount, getProfileViewsCount } from '@/lib/queries';
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  BellIcon,
  BriefcaseIcon,
  ChatBubbleLeftIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  StarIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  UserIcon as UserSolidIcon,
  BellIcon as BellSolidIcon,
  BriefcaseIcon as BriefcaseSolidIcon,
  ChatBubbleLeftIcon as ChatBubbleLeftSolidIcon,
  BuildingOfficeIcon as BuildingOfficeSolidIcon,
  CalendarIcon as CalendarSolidIcon,
  StarIcon as StarSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  AcademicCapIcon as AcademicCapSolidIcon,
} from '@heroicons/react/24/solid';

const navigationItems = [
  {
    name: 'Home',
    href: '/feed',
    icon: HomeIcon,
    iconActive: HomeSolidIcon,
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
    name: 'Messaging',
    href: '/messaging',
    icon: ChatBubbleLeftIcon,
    iconActive: ChatBubbleLeftSolidIcon,
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
    href: '/saved',
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

export default function LeftSidebar() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [profileViewsCount, setProfileViewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const [connections, views] = await Promise.all([
          getConnectionCount(user.id),
          getProfileViewsCount(user.id)
        ]);
        
        setConnectionCount(connections);
        setProfileViewsCount(views);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  if (!user) return null;

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:bg-white lg:border-r lg:border-slate-200">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* User Profile Section */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-primary-50 to-accent-50">
          <Link href={`/profile/${user.id}`} className="group block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {profile?.headline || 'Add your professional headline'}
                </p>
              </div>
            </motion.div>
          </Link>
          
          {/* Profile Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="bg-white/50 rounded-lg p-2">
              <p className="text-xs text-slate-600">Profile views</p>
              <p className="text-sm font-semibold text-slate-900">
                {loading ? '...' : profileViewsCount}
              </p>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <p className="text-xs text-slate-600">Connections</p>
              <p className="text-sm font-semibold text-slate-900">
                {loading ? '...' : connectionCount}
              </p>
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
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive
                        ? 'modern-gradient text-white shadow-glow'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <Icon 
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'
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
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
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
                    <Link key={item.name} href={item.href}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        className={cn(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <Icon 
                          className={cn(
                            'mr-3 h-4 w-4 flex-shrink-0',
                            isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
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
          <div className="mt-auto p-3 border-t border-slate-200">
            <Link href="/settings">
              <motion.div
                whileHover={{ x: 2 }}
                className="group flex items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
              >
                <Cog6ToothIcon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-slate-500" />
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