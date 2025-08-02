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
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: UserPlusIcon,
      label: 'Network',
      href: '/network',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: ChatBubbleLeftIcon,
      label: 'Messages',
      href: '/messaging',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      icon: BellIcon,
      label: 'Notifications',
      href: '/notifications',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      icon: UserCircleIcon,
      label: 'Profile',
      href: `/profile/${user?.id}`,
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  return (
    <div className="relative">
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 ${action.color}`}
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
          isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
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