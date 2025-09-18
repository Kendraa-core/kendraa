'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPostsByAuthor, getProfile } from '@/lib/queries';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { 
  ArrowLeftIcon,
  UserIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { 
  BACKGROUNDS, 
  COMPONENTS 
} from '@/lib/design-system';
import type { PostWithAuthor, Profile } from '@/types/database.types';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function UserPostsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch profile and posts in parallel
        const [profileData, postsData] = await Promise.all([
          getProfile(id as string),
          getPostsByAuthor(id as string)
        ]);

        setProfile(profileData);
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner  text="Loading posts..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#007fff]/5 to-[#007fff]/10 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-24 h-24 text-[#007fff]/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#007fff] mb-3">Profile not found</h2>
          <p className="text-[#007fff]/60 text-lg">The user you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BACKGROUNDS.page.primary}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name || 'User'}
                size="md"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.full_name || 'Anonymous User'}
                </h1>
                <p className="text-sm text-gray-600">
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PostCard post={post} onPostDeleted={() => {}} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
              <FireIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">
                {profile.full_name || 'This user'} hasn&apos;t shared any posts yet.
              </p>
              <Link
                href={`/profile/${profile.id}`}
                className="inline-flex items-center px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
