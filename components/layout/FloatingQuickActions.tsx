'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface FloatingQuickActionsProps {
  isInstitution?: boolean;
}

export default function FloatingQuickActions({ isInstitution = false }: FloatingQuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const quickActions = isInstitution ? [
    {
      id: 'create-post',
      label: 'Create Post',
      description: 'Share updates',
      icon: PlusIcon,
      color: 'from-[#007fff] to-[#00a8ff]',
      bgColor: 'from-[#007fff]/10 to-[#00a8ff]/10',
      hoverBgColor: 'hover:from-[#007fff]/20 hover:to-[#00a8ff]/20',
      onClick: () => router.push('/institution/feed?create=post')
    },
    {
      id: 'post-job',
      label: 'Post Job',
      description: 'Hire talent',
      icon: BriefcaseIcon,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      hoverBgColor: 'hover:from-emerald-100 hover:to-green-100',
      onClick: () => router.push('/institution/jobs/create')
    },
    {
      id: 'create-event',
      label: 'Create Event',
      description: 'Organize events',
      icon: CalendarDaysIcon,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      hoverBgColor: 'hover:from-purple-100 hover:to-violet-100',
      onClick: () => router.push('/institution/events/create')
    }
  ] : [
    {
      id: 'create-post',
      label: 'Create Post',
      description: 'Share updates',
      icon: PlusIcon,
      color: 'from-[#007fff] to-[#00a8ff]',
      bgColor: 'from-[#007fff]/10 to-[#00a8ff]/10',
      hoverBgColor: 'hover:from-[#007fff]/20 hover:to-[#00a8ff]/20',
      onClick: () => router.push('/feed?create=post')
    },
    {
      id: 'find-jobs',
      label: 'Find Jobs',
      description: 'Browse opportunities',
      icon: BriefcaseIcon,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      hoverBgColor: 'hover:from-emerald-100 hover:to-green-100',
      onClick: () => router.push('/jobs')
    },
    {
      id: 'find-events',
      label: 'Find Events',
      description: 'Discover events',
      icon: CalendarDaysIcon,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      hoverBgColor: 'hover:from-purple-100 hover:to-violet-100',
      onClick: () => router.push('/events')
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 space-y-3"
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={action.onClick}
                className={`w-full flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r ${action.bgColor} ${action.hoverBgColor} transition-all duration-300 group border border-white/20 shadow-lg hover:shadow-xl backdrop-blur-sm`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-base font-semibold text-gray-800 block">{action.label}</span>
                  <span className="text-sm text-gray-500">{action.description}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isExpanded 
            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
            : 'bg-gradient-to-br from-[#007fff] to-[#00a8ff] hover:from-[#00a8ff] hover:to-[#007fff]'
        }`}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <XMarkIcon className="w-8 h-8 text-white" />
          ) : (
            <PlusIcon className="w-8 h-8 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Pulse Animation */}
      {!isExpanded && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#007fff] to-[#00a8ff] opacity-20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}
