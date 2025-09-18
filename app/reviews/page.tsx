'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import Avatar from '@/components/common/Avatar';
import { 
  StarIcon, 
  ArrowLeftIcon,
  HeartIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY
} from '@/lib/design-system';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Reviews() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement reviews functionality
    setLoading(false);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HeartIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your reviews</p>
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

  if (loading) {
    return <LoadingSpinner  text="Loading reviews..." />;
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
                <h1 className={`${TYPOGRAPHY.heading.h1}`}>Reviews & Feedback</h1>
                <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary}`}>
                  Reviews and ratings you&apos;ve received from other professionals
                </p>
              </div>
            </div>
            <button className={`${COMPONENTS.button.primary} flex items-center space-x-2`}>
              <PlusIcon className="w-4 h-4" />
              <span>Request Review</span>
            </button>
          </div>

          {/* Stats Overview */}
          <div className={`${COMPONENTS.card.base} mb-6`}>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <StarIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className={`${TYPOGRAPHY.body.large} font-semibold`}>4.8</h3>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <HeartIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className={`${TYPOGRAPHY.body.large} font-semibold`}>{reviews.length}</h3>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Total Reviews</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UserGroupIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className={`${TYPOGRAPHY.body.large} font-semibold`}>95%</h3>
                  <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>Positive Reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className={`${COMPONENTS.card.base} text-center py-16`}>
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <StarIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className={`${TYPOGRAPHY.heading.h3} mb-4`}>No reviews yet</h3>
              <p className={`${TYPOGRAPHY.body.large} ${TEXT_COLORS.secondary} mb-6 max-w-md mx-auto`}>
                As you collaborate with other professionals, you&apos;ll receive reviews here.
              </p>
              <div className="space-y-3">
                <button className={`${COMPONENTS.button.primary} px-6 py-3`}>
                  Start Collaborating
                </button>
                <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                  Connect with colleagues • Share your expertise • Build your reputation
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${COMPONENTS.card.base}`}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar
                        src={review.reviewer_avatar}
                        alt={review.reviewer}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <StarSolidIcon
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                            {review.rating}/5
                          </span>
                        </div>
                        <h3 className={`${TYPOGRAPHY.body.medium} font-semibold mb-2`}>
                          {review.title}
                        </h3>
                        <p className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary} mb-3`}>
                          {review.comment}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>By {review.reviewer}</span>
                          <span>•</span>
                          <span>{review.date}</span>
                          <span>•</span>
                          <span>{review.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
