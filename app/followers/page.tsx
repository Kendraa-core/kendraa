'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserIcon } from '@heroicons/react/24/outline';

export default function FollowersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    // Simulate loading followers
    setTimeout(() => {
      setFollowers([]);
      setLoading(false);
    }, 1000);
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Followers
          </h1>
          <p className="text-gray-600">
            People who are following you
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : followers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No followers yet
            </h3>
            <p className="text-gray-600">
              When people follow you, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                {followers.length} Follower{followers.length !== 1 ? 's' : ''}
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {followers.map((follower: any) => (
                <div key={follower.id} className="px-6 py-4 flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {follower.full_name || follower.email}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {follower.headline || 'No headline'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 