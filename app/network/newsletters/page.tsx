'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import { 
  ArrowLeftIcon,
  NewspaperIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY
} from '@/lib/design-system';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewslettersPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <NewspaperIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your newsletters</p>
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
    <div className={`${BACKGROUNDS.page.primary} min-h-screen`}>
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className={`${TYPOGRAPHY.heading.h1}`}>Newsletters</h1>
                <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                  Subscribe to and manage healthcare newsletters
                </p>
              </div>
            </div>
            <button className={`${COMPONENTS.button.primary} flex items-center space-x-2`}>
              <PlusIcon className="w-4 h-4" />
              <span>Subscribe</span>
            </button>
          </div>

          {/* Coming Soon */}
          <div className={`${COMPONENTS.card.base} text-center py-16`}>
            <div className="w-20 h-20 bg-[#007fff]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <NewspaperIcon className="w-10 h-10 text-[#007fff]" />
            </div>
            <h3 className={`${TYPOGRAPHY.heading.h3} mb-4`}>Newsletters Coming Soon</h3>
            <p className={`${TYPOGRAPHY.body.large} ${TEXT_COLORS.secondary} mb-6 max-w-md mx-auto`}>
              Subscribe to healthcare newsletters and stay updated with the latest medical insights, research, and industry news.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Subscribe to medical journals and publications</p>
              <p>• Get industry updates and research findings</p>
              <p>• Receive personalized healthcare news</p>
              <p>• Stay informed about medical breakthroughs</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
