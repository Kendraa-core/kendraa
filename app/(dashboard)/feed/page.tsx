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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6 sticky top-24 h-fit">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Banner */}
              <div className="h-24 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20"></div>
              </div>
              
              {/* Profile Info */}
              <div className="px-6 pb-6 relative">
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="relative">
                    <Avatar
                      src={profile?.avatar_url}
                      alt={profile?.full_name || 'User'}
                      size="xl"
                      className="border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary-500 border-2 border-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <h3 className="font-bold text-gray-900 text-xl mb-2">
                    {profile?.full_name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 font-medium">
                    {profile?.headline || 'Add a headline'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    {profile?.location || 'Add location'}
                  </p>
                </div>
              </div>
            </div>



            {/* My Pages - Only show if user has pages */}
            {profile?.user_type === 'institution' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
                <h4 className="font-bold text-gray-900 mb-4 text-lg">My pages</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md">
                        <BuildingOfficeIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{profile.full_name}</span>
                    </div>
                    <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded-full">Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Quick Links</h4>
              <div className="space-y-3">
                <a href="/saved-items" className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <BookmarkIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Saved items</span>
                </a>
                <a href="/groups" className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:text-secondary-600 hover:bg-secondary-50 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                    <UserGroupIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Groups</span>
                </a>
                <a href="/newsletters" className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:text-accent-600 hover:bg-accent-50 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                    <DocumentIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Newsletters</span>
                </a>
                <a href="/events" className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Events</span>
                </a>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start space-x-4">
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.full_name || 'User'}
                  size="md"
                />
                <div className="flex-1">
                  <textarea
                    placeholder="Share your thoughts, insights, or professional updates..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700 placeholder-gray-500"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50">
                        <PhotoIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Media</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-secondary-600 transition-colors p-2 rounded-lg hover:bg-secondary-50">
                        <DocumentIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Job</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-accent-50">
                        <DocumentIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Write article</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => handleCreatePost(postContent)}
                      disabled={!postContent.trim()}
                      className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
              <div className="flex bg-gray-50 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-3 px-6 text-center font-semibold transition-all duration-200 rounded-lg ${
                    activeTab === 'posts'
                      ? 'text-primary-700 bg-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Community Posts
                </button>
                <button
                  onClick={() => setActiveTab('medical')}
                  className={`flex-1 py-3 px-6 text-center font-semibold transition-all duration-200 rounded-lg ${
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
              <div className="space-y-6">
                {loading ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                  </div>
                )}
              </div>
            ) : (
              <MedicalFeed />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6 sticky top-24 h-fit">
            {/* Trending Topics */}
            <TrendingTopics />
          </div>
        </div>
      </div>
    </div>
  );
} 