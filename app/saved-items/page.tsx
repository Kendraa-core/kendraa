'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSavedPosts } from '@/lib/queries';
import type { Post } from '@/types/database.types';
import PostCard from '@/components/post/PostCard';
import { BookmarkIcon } from '@heroicons/react/24/outline';

export default function SavedItemsPage() {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const posts = await getSavedPosts(user.id);
        setSavedPosts(posts || []);
      } catch (error) {
        setSavedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <BookmarkIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Items</h1>
              <p className="text-gray-600">Your bookmarked posts and content</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative">
                {/* Main spinner */}
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                
                {/* Pulse effect */}
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-400 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <p className="text-gray-600 mt-4 text-sm font-medium">Loading saved posts...</p>
              
              {/* Progress dots */}
              <div className="flex justify-center mt-2 space-x-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        ) : savedPosts.length > 0 ? (
          <div className="space-y-6">
            {savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post as any}
                onInteraction={() => {
                  // Refresh saved posts when interaction occurs
                  window.location.reload();
                }}
                onPostDeleted={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookmarkIcon className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved items yet</h3>
            <p className="text-gray-600 mb-6">
              When you save posts, they&apos;ll appear here for easy access.
            </p>
            <a
              href="/feed"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Explore Feed
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
