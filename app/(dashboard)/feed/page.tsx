'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPosts, createPost, likePost, unlikePost, isPostLiked } from '@/lib/queries';
import type { PostWithAuthor } from '@/types/database.types';
import { 
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  BookmarkIcon,
  PhotoIcon,
  XMarkIcon,
  VideoCameraIcon,
  DocumentIcon,
  FaceSmileIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';

interface ProfileData {
  id: string;
  full_name: string;
  headline: string;
  profile_views: number;
  connections_count: number;
}

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
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
      const postsData = await getPosts();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="professional-card">
              <div className="relative h-16 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="absolute -bottom-6 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                </div>
              </div>
              <div className="pt-8 pb-4 px-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {profile?.headline || 'Add a headline to your profile'}
                  </p>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Profile views</span>
                      <span className="font-semibold text-gray-900">{profile?.profile_views || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Connections</span>
                      <span className="font-semibold text-gray-900">{connections.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Connections */}
            {suggestedConnections.length > 0 && (
              <div className="professional-card">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Suggested Connections</h3>
                  <div className="space-y-3">
                    {suggestedConnections.map((connection) => (
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
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post */}
            <div className="professional-card">
              <div className="p-4">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <textarea
                      placeholder="What's on your mind?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none mb-3 text-sm"
                      rows={2}
                    />
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex space-x-1">
                        <button className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-xs">
                          <PhotoIcon className="w-4 h-4" />
                          <span>Photo</span>
                        </button>
                        <button className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-xs">
                          <VideoCameraIcon className="w-4 h-4" />
                          <span>Video</span>
                        </button>
                        <button className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-xs">
                          <DocumentIcon className="w-4 h-4" />
                          <span>Document</span>
                        </button>
                        <button className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-xs">
                          <FaceSmileIcon className="w-4 h-4" />
                          <span>Feeling</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-xs">
                          <span>Anyone</span>
                          <ChevronDownIcon className="w-3 h-3" />
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm">
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Posts */}
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto text-gray-300 mb-4">
                  <ChatBubbleOvalLeftIcon className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to share something!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="animate-fade-in"
                  >
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="professional-card">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Trending Topics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">#Healthcare</span>
                    <span className="text-xs text-gray-400">2.5k posts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">#MedicalResearch</span>
                    <span className="text-xs text-gray-400">1.8k posts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">#Telemedicine</span>
                    <span className="text-xs text-gray-400">1.2k posts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 