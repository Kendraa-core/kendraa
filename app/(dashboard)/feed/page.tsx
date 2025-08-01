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
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { getProfile, getPosts, getConnections, getSuggestedConnections } from '@/lib/queries';
import type { PostWithAuthor, Profile } from '@/types/database.types';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            {profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden bg-white shadow-lg">
                  <div className="relative h-16 bg-gradient-to-r from-linkedin-primary to-linkedin-secondary">
                    <div className="absolute -bottom-6 left-4">
                      <Avatar
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        size="lg"
                        className="border-4 border-white"
                      />
                    </div>
                  </div>
                  
                  <CardContent className="pt-8 pb-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {profile.full_name || 'User'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {profile.headline || 'Add a headline'}
                      </p>
                      <div className="space-y-2 pt-3 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          Profile views <span className="font-semibold text-gray-900">0</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Connections <span className="font-semibold text-gray-900">{profile.connections_count || 0}</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="#"
                          className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          <span className="mr-1">Try Premium for free</span>
                          <span className="text-xs">🔥</span>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Navigation Links */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Link
                    href="/network"
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                  >
                    <UserGroupIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">My network</span>
                  </Link>
                  <Link
                    href="/saved"
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                  >
                    <BookmarkSolidIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Saved items</span>
                  </Link>
                  <Link
                    href="/learning"
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                  >
                    <AcademicCapIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Learning</span>
                  </Link>
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
                  <Card key={i} className="animate-pulse bg-white shadow-lg">
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

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* LinkedIn News */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <ArrowTrendingUpIcon className="h-5 w-5" />
                  <span>LinkedIn News</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Remote work trends in 2024</h4>
                    <p className="text-xs text-gray-500">2 hours ago • 1,234 readers</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">AI transforming healthcare</h4>
                    <p className="text-xs text-gray-500">4 hours ago • 856 readers</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Startup funding reaches new high</h4>
                    <p className="text-xs text-gray-500">6 hours ago • 2,891 readers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* People You May Know */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900">People you may know</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestedConnections.length > 0 ? (
                    suggestedConnections.map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={connection.avatar_url || undefined}
                            alt={connection.full_name || 'User'}
                            size="sm"
                            className="bg-blue-500 text-white"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {connection.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {connection.headline || connection.profile_type === 'institution' ? 'Healthcare Institution' : 'Healthcare Professional'}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          + Connect
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No suggestions available</p>
                    </div>
                  )}
                  {suggestedConnections.length > 0 && (
                    <Link 
                      href="/network" 
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center mt-2"
                    >
                      See all
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Level Up Your Skills */}
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <AcademicCapIcon className="h-6 w-6" />
                  <h3 className="font-semibold">Level up your skills</h3>
                </div>
                <p className="text-sm mb-4 opacity-90">
                  Explore courses on LinkedIn Learning
                </p>
                <Button size="sm" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 