'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'medical'>('posts');
  const [postContent, setPostContent] = useState('');

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start space-x-4">
          <Avatar
            src={user?.user_metadata?.avatar_url}
            alt={user?.email || 'User'}
            size="md"
          />
          <div className="flex-1">
            <textarea
              placeholder="Share your thoughts, insights, or professional updates..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500 text-base"
              rows={3}
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                  <PhotoIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Media</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                  <DocumentIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Article</span>
                </button>
              </div>
              <button 
                onClick={() => handleCreatePost(postContent)}
                disabled={!postContent.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex bg-gray-50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 px-6 text-center font-medium transition-all duration-200 rounded-lg ${
              activeTab === 'posts'
                ? 'text-blue-700 bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Community Posts
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`flex-1 py-3 px-6 text-center font-medium transition-all duration-200 rounded-lg ${
              activeTab === 'medical'
                ? 'text-blue-700 bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Medical Hub
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' ? (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post as any}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to share something with your community!</p>
            </div>
          )}
        </div>
      ) : (
        <MedicalFeed />
      )}
    </div>
  );
} 