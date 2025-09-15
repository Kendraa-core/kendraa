'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import { 
  UserGroupIcon,
  SparklesIcon,
  BellIcon,
  PlusIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY, 
  BORDER_COLORS,
  ANIMATIONS
} from '@/lib/design-system';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GroupsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Join the Community</h2>
          <p className="text-gray-600 mb-6">Sign in to access healthcare groups and communities</p>
          <Link
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BACKGROUNDS.page.tertiary}`}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Coming Soon Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <UserGroupIcon className="w-16 h-16 text-white" />
          </motion.div>

          {/* Coming Soon Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className={`${TYPOGRAPHY.heading.h1} mb-4`}>
              Groups Coming Soon
            </h1>
            <p className={`${TYPOGRAPHY.body.large} text-gray-600 max-w-2xl mx-auto`}>
              We&apos;re building an amazing community feature where healthcare professionals can connect, 
              share knowledge, and collaborate in specialized groups.
            </p>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            <div className={`${COMPONENTS.card.base} p-6 text-center`}>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h4} mb-2`}>Specialized Communities</h3>
              <p className={`${TYPOGRAPHY.body.small} text-gray-600`}>
                Join groups based on your medical specialty, interests, and expertise areas.
              </p>
            </div>

            <div className={`${COMPONENTS.card.base} p-6 text-center`}>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h4} mb-2`}>Knowledge Sharing</h3>
              <p className={`${TYPOGRAPHY.body.small} text-gray-600`}>
                Share insights, ask questions, and learn from fellow healthcare professionals.
              </p>
            </div>

            <div className={`${COMPONENTS.card.base} p-6 text-center`}>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CalendarDaysIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h4} mb-2`}>Group Events</h3>
              <p className={`${TYPOGRAPHY.body.small} text-gray-600`}>
                Organize and participate in group-specific events, webinars, and meetups.
              </p>
            </div>

            <div className={`${COMPONENTS.card.base} p-6 text-center`}>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h4} mb-2`}>Resource Sharing</h3>
              <p className={`${TYPOGRAPHY.body.small} text-gray-600`}>
                Share documents, research papers, and valuable resources with your group.
              </p>
            </div>

            <div className={`${COMPONENTS.card.base} p-6 text-center`}>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BellIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h4} mb-2`}>Smart Notifications</h3>
              <p className={`${TYPOGRAPHY.body.small} text-gray-600`}>
                Get notified about relevant discussions and updates in your groups.
              </p>
            </div>

            <div className={`${COMPONENTS.card.base} p-6 text-center`}>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShareIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h4} mb-2`}>Collaboration Tools</h3>
              <p className={`${TYPOGRAPHY.body.small} text-gray-600`}>
                Work together on projects, research, and professional development.
              </p>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm">Be the first to know when Groups launches</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/network"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Explore Network
              </Link>
              
              <Link
                href="/events"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                Browse Events
              </Link>
            </div>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Development Progress</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We&apos;re working hard to bring you the best group experience
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}