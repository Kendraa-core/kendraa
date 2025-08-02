'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import CreatePost from '@/components/post/CreatePost';
import InfinitePostList from '@/components/post/InfinitePostList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/common/Avatar';
import {
  UserGroupIcon,
  AcademicCapIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  HashtagIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  FaceSmileIcon,
  ChevronDownIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { getProfile, getPosts, getConnections, getSuggestedConnections } from '@/lib/queries';
import type { PostWithAuthor, Profile } from '@/types/database.types';
import toast from 'react-hot-toast';
import PostCard from '@/components/post/PostCard';

interface ProfileData extends Profile {
  connections_count?: number;
}

export default function FeedPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for faster perceived loading
  const [connections, setConnections] = useState<Profile[]>([]);
  const [suggestedConnections, setSuggestedConnections] = useState<Profile[]>([]);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [profileData, connectionsData, suggestedData] = await Promise.all([
        getProfile(user.id),
        getConnections(user.id),
        getSuggestedConnections(user.id, 3) // Get 3 suggested connections
      ]);

      if (profileData) {
        setProfile({
          ...profileData,
          connections_count: connectionsData.length
        });
      }
      setConnections(connectionsData);
      setSuggestedConnections(suggestedData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user?.id]);

  const fetchInitialPosts = useCallback(async () => {
    setLoading(true);
    try {
      const postsData = await getPosts(0, 10); // Start from page 0, limit 10
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMorePosts = async (page: number): Promise<PostWithAuthor[]> => {
    try {
      return await getPosts(page, 5); // Use page number, limit 5
    } catch (error) {
      console.error('Error fetching more posts:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Start fetching immediately without showing loading state initially
      fetchProfile();
      fetchInitialPosts();
    }
  }, [user?.id, fetchProfile, fetchInitialPosts]);

  const handlePostCreated = () => {
    fetchInitialPosts();
  };

  // Show skeleton for profile while it's loading
  if (!profile && user?.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="animate-pulse">
                <div className="relative h-16 bg-gray-200">
                  <div className="absolute -bottom-6 left-4 w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
                <CardContent className="pt-8 pb-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2 pt-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6 space-y-6">
              <CreatePost onPostCreated={handlePostCreated} />
              
              {loading ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                                  <InfinitePostList
                    initialPosts={posts as unknown as (PostWithAuthor & { author: Profile })[] }
                    fetchMorePosts={fetchMorePosts as unknown as (page: number) => Promise<(PostWithAuthor & { author: Profile })[]>}
                  />
              )}
            </div>

            {/* Right Sidebar Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-3 w-6 bg-gray-200 rounded"></div>
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                            <div className="h-2 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="professional-card"
            >
              <div className="p-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <h3 className="elegant-subheading mb-1">
                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="elegant-text text-sm mb-3">
                    {profile?.headline || 'Add a headline'}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>Profile views</span>
                      <span className="font-medium">{profile?.profile_views || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connections</span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <Link href="/profile/setup" className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors">
                      Try Premium for free
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="professional-card"
            >
              <div className="p-4">
                <div className="space-y-2">
                  <Link href="/network" className="nav-item">
                    <UserGroupIcon className="w-5 h-5" />
                    <span>My network</span>
                  </Link>
                  <Link href="/saved" className="nav-item">
                    <BookmarkSolidIcon className="w-5 h-5" />
                    <span>Saved items</span>
                  </Link>
                  <Link href="/learning" className="nav-item">
                    <AcademicCapIcon className="w-5 h-5" />
                    <span>Learning</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-4">
            {/* Create Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="professional-card"
            >
              <div className="p-4">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="What's on your mind?"
                      className="elegant-input resize-none mb-3"
                      rows={2}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button className="nav-item text-sm">
                          <PhotoIcon className="w-4 h-4" />
                          <span className="text-xs">Photo</span>
                        </button>
                        <button className="nav-item text-sm">
                          <VideoCameraIcon className="w-4 h-4" />
                          <span className="text-xs">Video</span>
                        </button>
                        <button className="nav-item text-sm">
                          <DocumentIcon className="w-4 h-4" />
                          <span className="text-xs">Document</span>
                        </button>
                        <button className="nav-item text-sm">
                          <FaceSmileIcon className="w-4 h-4" />
                          <span className="text-xs">Feeling</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="nav-item text-sm">
                          <span className="text-xs">Anyone</span>
                          <ChevronDownIcon className="w-3 h-3" />
                        </button>
                        <Button className="elegant-button-primary text-sm px-3 py-1.5">
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Posts */}
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="professional-card"
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* LinkedIn News */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="professional-card"
            >
              <div className="p-4">
                <h3 className="elegant-subheading mb-3 flex items-center">
                  <FireIcon className="w-5 h-5 text-orange-500 mr-2" />
                  LinkedIn News
                </h3>
                <div className="space-y-3">
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-900">Remote work trends in 2024</p>
                    <p className="text-xs text-gray-500">2 hours ago • 1,234 readers</p>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <p className="text-sm font-medium text-gray-900">AI transforming healthcare</p>
                    <p className="text-xs text-gray-500">4 hours ago • 856 readers</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Startup funding reaches new high</p>
                    <p className="text-xs text-gray-500">6 hours ago • 2,891 readers</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* People You May Know */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="professional-card"
            >
              <div className="p-4">
                <h3 className="elegant-subheading mb-3">People you may know</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      K
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Kendraa</p>
                      <p className="text-xs text-gray-500">Healthcare Institution</p>
                    </div>
                    <Button className="elegant-button-primary text-xs px-2 py-1">
                      + Connect
                    </Button>
                  </div>
                  <Link href="/network" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    See all
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Level Up Your Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-600 rounded-xl p-4 text-white"
            >
              <div className="flex items-center mb-2">
                <AcademicCapIcon className="w-5 h-5 mr-2" />
                <h3 className="text-base font-semibold">Level up your skills</h3>
              </div>
              <p className="text-sm mb-3 opacity-90">
                Explore courses on LinkedIn Learning.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm">
                Start learning
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 