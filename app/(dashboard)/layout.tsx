'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import UserSearch from '@/components/search/UserSearch';
import NotificationList from '@/components/notifications/NotificationList';
import { useNotifications } from '@/contexts/NotificationContext';

const navItems = [
  { icon: HomeIcon, label: 'Home', href: '/feed' },
  { icon: UserGroupIcon, label: 'Network', href: '/network' },
  { icon: BriefcaseIcon, label: 'Jobs', href: '/jobs' },
  { icon: ChatBubbleLeftRightIcon, label: 'Messages', href: '/messages' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Click outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full glass-morphism backdrop-blur-xl border-b border-white/10 z-50">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-1 gap-2 sm:gap-8">
              <Link href="/feed" className="flex-shrink-0 group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 premium-gradient rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-white">K</span>
                </div>
              </Link>
              <button
                onClick={() => setShowSearch(true)}
                className="hidden sm:block max-w-md w-full relative group"
              >
                <div className="w-full pl-12 pr-4 py-3 glass-effect rounded-xl text-sm text-gray-700 cursor-pointer hover:bg-white/20 transition-all duration-300 hover:shadow-md">
                  Search professionals, jobs, events...
                </div>
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-hover:text-indigo-500 transition-colors duration-300" />
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="sm:hidden p-3 glass-effect rounded-xl text-gray-600 hover:text-indigo-500 transition-all duration-300 hover:shadow-md hover:scale-110"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex items-center space-x-1 sm:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative inline-flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-white/10 group"
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:block text-xs mt-1 font-medium">{item.label}</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ))}

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative inline-flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-white/10 group"
              >
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:block text-xs mt-1 font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 sm:top-0 sm:right-1 w-5 h-5 sm:w-6 sm:h-6 premium-gradient text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse-slow"
                  >
                    {unreadCount}
                  </motion.div>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <div className="h-6 sm:h-8 border-l border-white/20 mx-2 sm:mx-3"></div>
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setShowProfileDropdown(prev => !prev)}
                  className={`flex flex-col items-center justify-center px-3 sm:px-4 py-2 text-gray-700 hover:text-indigo-600 transition-all duration-300 rounded-xl hover:bg-white/10 ${
                    showProfileDropdown ? 'bg-indigo-50 text-indigo-600' : ''
                  }`}
                >
                  <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:block text-xs mt-1 font-medium">
                    Profile {showProfileDropdown ? '▴' : '▾'}
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 w-56 sm:w-64 mt-2 py-3 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm sm:text-base">
                              {user.email?.split('@')[0]}
                            </div>
                            <Link 
                              href={`/profile/${user.id}`}
                              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-300"
                            >
                              View Profile →
                            </Link>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-b-2xl font-medium"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-4"
            >
              <UserSearch onClose={() => setShowSearch(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4"
            >
              <NotificationList 
                notifications={[]} 
                onMarkAsRead={() => {}} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 