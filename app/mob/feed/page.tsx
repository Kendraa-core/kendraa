'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import MedicalFeed from '@/components/feed/MedicalFeed';
import PostCard from '@/components/post/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { getPostsByAuthor, type PostWithAuthor } from '@/lib/queries';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MobileFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // This would be replaced with a proper feed API
      const userPosts = await getPostsByAuthor(user.id);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handlePostInteraction = () => {
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.id, fetchPosts]);

  return (
    <MobileLayout title="Feed">
      <div className="relative">
        {/* Create Post Button */}
        <Link
          href="/mob/create"
          className="fixed bottom-20 right-4 z-30 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-6 h-6" />
        </Link>

        {/* Pull to Refresh */}
        <div className="min-h-screen">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="md" text="Loading feed..." />
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {/* Medical Feed Component */}
              <MedicalFeed />
              
              {/* Posts */}
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
                      <PostCard
                        post={post}
                        onInteraction={handlePostInteraction}
                        onPostDeleted={() => {}}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No posts in your feed yet.</p>
                  <Link
                    href="/mob/network"
                    className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                  >
                    Connect with people to see their posts
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
