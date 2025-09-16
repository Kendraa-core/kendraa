'use client';

import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/mobile/MobileLayout';
import PostCard from '@/components/post/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { getPostsByAuthor, type PostWithAuthor } from '@/lib/queries';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MobileInstitutionFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userPosts = await getPostsByAuthor(user.id);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostInteraction = () => {
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.id]);

  return (
    <MobileLayout title="Institution Feed" isInstitution={true}>
      <div className="relative">
        {/* Create Post Button */}
        <Link
          href="/mob/institution/create"
          className="fixed bottom-20 right-4 z-30 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-6 h-6" />
        </Link>

        <div className="min-h-screen">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="md" text="Loading feed..." />
            </div>
          ) : (
            <div className="space-y-4 p-4">
              
              {/* Posts */}
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
                      <PostCard
                        post={post}
                        onInteraction={handlePostInteraction}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No posts yet. Start sharing updates with your network!</p>
                  <Link
                    href="/mob/institution/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create First Post
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
