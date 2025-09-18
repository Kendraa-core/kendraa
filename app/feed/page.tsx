'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPosts, createPost, getConnections, getSuggestedConnections, getProfile } from '@/lib/queries';
import type { Post, Profile } from '@/types/database.types';
import { 
  PhotoIcon,
  DocumentIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import MedicalFeed from '@/components/feed/MedicalFeed';

export default function FeedPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'medical'>('posts');
  const [postContent, setPostContent] = useState('');

  // Redirect institution users to their dedicated feed
  useEffect(() => {
    if (profile && (profile.user_type === 'institution' || profile.profile_type === 'institution')) {
      router.push('/institution/feed');
    }
  }, [profile, router]);

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(currentPosts => 
      currentPosts.filter(post => post.id !== deletedPostId)
    );
  };

  const fetchPosts = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const postsData = await getPosts(10, 0);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleCreatePost = useCallback(async (content: string, imageUrl?: string) => {
    if (!user?.id) return;

    try {
      const post = await createPost(user.id, content, imageUrl);
      if (post) {
        setPosts(prev => [post, ...prev]);
        setPostContent('');
        toast.success('Post created successfully!');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="space-y-8">
      {/* Create Post */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <Avatar
            src={profile?.avatar_url}
            name={profile?.full_name || user?.email || 'User'}
            size="md"
          />
          <div className="flex-1">
            <textarea
              placeholder="Share your thoughts, insights, or professional updates..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent text-gray-700 placeholder-gray-500 text-base"
              rows={3}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-[#007fff] transition-colors p-2 rounded-lg hover:bg-[#007fff]/5">
                  <PhotoIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Media</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-[#007fff] transition-colors p-2 rounded-lg hover:bg-[#007fff]/5">
                  <DocumentIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Article</span>
                </button>
              </div>
              <button 
                onClick={() => handleCreatePost(postContent)}
                disabled={!postContent.trim()}
                className="w-full sm:w-auto bg-[#007fff] text-white px-6 py-3 rounded-xl hover:bg-[#007fff]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'posts'
                ? 'bg-[#007fff] text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'medical'
                ? 'bg-[#007fff] text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            Medical Feed
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div>
        {activeTab === 'posts' ? (
          <div className="space-y-8">
            {loading ? (
              <div className="space-y-8">
                {/* Loading skeleton */}
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-8">
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onPostDeleted={handlePostDeleted} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to share something with your network!
                </p>
                <button 
                  onClick={() => document.querySelector('textarea')?.focus()}
                  className="bg-[#007fff] text-white px-6 py-2 rounded-xl hover:bg-[#007fff]/90 transition-colors"
                >
                  Create your first post
                </button>
              </div>
            )}
          </div>
        ) : (
          <MedicalFeed />
        )}
      </div>
    </div>
  );
}