'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement reviews functionality
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingSpinner variant="fullscreen" text="Loading reviews..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Reviews
          </h1>
          <p className="text-gray-600">
            Reviews and ratings you&apos;ve received from other professionals
          </p>
        </div>

        {reviews.length === 0 ? (
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-600 mb-6">
                As you collaborate with other professionals, you&apos;ll receive reviews here.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Collaborating
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <Card key={review.id} className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
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
                        <span className="text-sm text-gray-500">
                          {review.rating}/5
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {review.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
