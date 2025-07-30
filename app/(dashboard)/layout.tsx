'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-1 gap-8">
              <Link href="/feed" className="flex-shrink-0">
                <div className="w-9 h-9 bg-[#0a66c2] rounded-md flex items-center justify-center text-white font-bold text-2xl">
                  in
                </div>
              </Link>
              <button
                onClick={() => setShowSearch(true)}
                className="max-w-md w-full relative group"
              >
                <div className="w-full pl-12 pr-4 py-2 bg-[#EEF3F8] rounded-md text-sm text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                  Search
                </div>
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>

            <nav className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative inline-flex flex-col items-center justify-center px-4 py-1.5 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs mt-0.5 font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative inline-flex flex-col items-center justify-center px-4 py-1.5 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <BellIcon className="h-6 w-6" />
                <span className="text-xs mt-0.5 font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-2 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
                  >
                    {unreadCount}
                  </motion.div>
                )}
              </button>

              <div className="h-8 border-l border-gray-200 mx-2"></div>
              <div className="relative group">
                <button className="flex flex-col items-center justify-center px-4 py-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="text-xs mt-0.5 font-medium">Me ▾</span>
                </button>
                <div className="hidden group-hover:block absolute right-0 w-64 mt-1 py-2 bg-white rounded-lg shadow-lg border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <UserCircleIcon className="h-12 w-12 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.email?.split('@')[0]}
                        </div>
                        <Link 
                          href={`/profile/${user.id}`}
                          className="text-sm text-gray-500 hover:text-blue-600"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
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
              <NotificationList />
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