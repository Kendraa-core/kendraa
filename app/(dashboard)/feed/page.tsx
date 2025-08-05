'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPosts } from '@/lib/queries';
import type { Post } from '@/types/database.types';
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
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import TrendingTopics from '@/components/feed/TrendingTopics';
import ProfileCompletionPrompt from '@/components/profile/ProfileCompletionPrompt';

interface ProfileData {
  id: string;
  full_name: string;
  headline: string;
  profile_views: number;
  connections_count: number;
}

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<ProfileData[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<ProfileData[]>([]);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [profileData, connectionsData, suggestedData] = await Promise.all([
        Promise.resolve({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          headline: 'Add a headline',
          profile_views: 0,
          connections_count: 0,
        }),
        Promise.resolve([]), // getConnections
        Promise.resolve([]) // getSuggestedConnections
      ]);

      setConnections(connectionsData);
      setSuggestedConnections(suggestedData);
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
  }, [fetchPosts]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.full_name || 'User'}
                  size="lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {profile?.full_name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {profile?.headline || 'Add a headline'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile views</span>
                  <span className="font-medium">{profile?.profile_views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connections</span>
                  <span className="font-medium">{connections.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Suggested Connections</h3>
              <div className="space-y-3">
                {suggestedConnections.slice(0, 3).map((connection) => (
                  <div key={connection.id} className="flex items-center space-x-3">
                    <Avatar
                      src=""
                      alt={connection.full_name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {connection.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {connection.headline}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Profile Completion Prompt */}
            <ProfileCompletionPrompt />
            
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-start space-x-3">
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.full_name || 'User'}
                  size="md"
                />
                <div className="flex-1">
                  <textarea
                    placeholder="What's on your mind?"
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <PhotoIcon className="w-5 h-5" />
                        <span className="text-sm">Photo</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <VideoCameraIcon className="w-5 h-5" />
                        <span className="text-sm">Video</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <DocumentIcon className="w-5 h-5" />
                        <span className="text-sm">Document</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <FaceSmileIcon className="w-5 h-5" />
                        <span className="text-sm">Feeling</span>
                      </button>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {loading ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
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
                    onInteraction={handlePostCreated}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <TrendingTopics />
          </div>
        </div>
      </div>
    </div>
  );
} 