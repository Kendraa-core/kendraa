'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function QuickNav() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      icon: MagnifyingGlassIcon,
      label: 'Search',
      href: '/search',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: UserPlusIcon,
      label: 'Network',
      href: '/network',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: ChatBubbleLeftIcon,
      label: 'Messages',
      href: '/messaging',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: BellIcon,
      label: 'Notifications',
      href: '/notifications',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      icon: UserCircleIcon,
      label: 'Profile',
      href: `/profile/${user?.id}`,
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-full text-white shadow-lg transition-all duration-300 ${action.color}`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg transition-colors duration-300 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        } text-white flex items-center justify-center`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <PlusIcon className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
} 