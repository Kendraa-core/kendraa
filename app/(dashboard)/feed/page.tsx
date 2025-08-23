'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPosts, createPost, getConnections, getSuggestedConnections, getProfile } from '@/lib/queries';
import type { Post, Profile } from '@/types/database.types';
import { 
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  FaceSmileIcon,
  ChevronDownIcon,
  UserGroupIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  BellIcon,
  CogIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import TrendingTopics from '@/components/feed/TrendingTopics';
import MedicalFeed from '@/components/feed/MedicalFeed';
import ProfileCompletionPrompt from '@/components/profile/ProfileCompletionPrompt';
import VerificationBadge from '@/components/common/VerificationBadge';
import ShareButton from '@/components/common/ShareButton';

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<Profile[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'medical'>('posts');
  const [postContent, setPostContent] = useState('');
  const [profileStats, setProfileStats] = useState({
    connectionsCount: 0
  });

  const fetchProfileData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [connectionsData, suggestedData, profileData] = await Promise.all([
        getConnections(user.id),
        getSuggestedConnections(user.id, 3),
        getProfile(user.id)
      ]);

      setConnections(connectionsData);
      setSuggestedConnections(suggestedData);
      
      // Set real profile stats
      setProfileStats({
        connectionsCount: connectionsData.length
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  }, [user?.id]);

  const fetchPosts = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const postsData = await getPosts(10, 0);
      console.log('Fetched posts:', postsData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handlePostCreated = useCallback(async () => {
    await fetchPosts();
    await fetchProfileData(); // Refresh profile stats after new post
  }, [fetchPosts, fetchProfileData]);

  const handleCreatePost = useCallback(async (content: string, imageUrl?: string) => {
    if (!user?.id) return;

    try {
      const post = await createPost(user.id, content, imageUrl);
      if (post) {
        setPosts(prev => [post, ...prev]);
        setPostContent('');
        toast.success('Post created successfully!');
        await fetchProfileData(); // Refresh profile stats
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  }, [user?.id, fetchProfileData]);

  useEffect(() => {
    fetchProfileData();
    fetchPosts();
  }, [fetchProfileData, fetchPosts]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
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
              className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700 placeholder-gray-500 text-sm sm:text-base"
              rows={3}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50">
                  <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Media</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-secondary-600 transition-colors p-2 rounded-lg hover:bg-secondary-50">
                  <DocumentIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Job</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-accent-50">
                  <DocumentIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Write article</span>
                </button>
              </div>
              <button 
                onClick={() => handleCreatePost(postContent)}
                disabled={!postContent.trim()}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg border border-gray-200 p-2 sm:p-2">
        <div className="flex bg-gray-50 rounded-lg sm:rounded-xl p-1">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 text-center font-semibold transition-all duration-200 rounded-lg sm:rounded-xl text-sm sm:text-base ${
              activeTab === 'posts'
                ? 'text-primary-700 bg-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Community Posts
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 text-center font-semibold transition-all duration-200 rounded-lg sm:rounded-xl text-sm sm:text-base ${
              activeTab === 'medical'
                ? 'text-secondary-700 bg-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Medical Hub
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' ? (
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              <p className="text-gray-500 text-sm sm:text-base">No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>
      ) : (
        <MedicalFeed />
      )}
    </div>
  );
} 