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
import { getProfile, getPosts, getConnections } from '@/lib/queries';
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

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [profileData, connectionsData] = await Promise.all([
        getProfile(user.id),
        getConnections(user.id)
      ]);

      if (profileData) {
        setProfile({
          ...profileData,
          connections_count: connectionsData.length
        });
      }
      setConnections(connectionsData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user?.id]);

  const fetchInitialPosts = useCallback(async () => {
    setLoading(true);
    try {
      const postsData = await getPosts(10);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMorePosts = async (offset: number): Promise<PostWithAuthor[]> => {
    try {
      return await getPosts(5, offset);
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
                  initialPosts={posts}
                  fetchMorePosts={fetchMorePosts}
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
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            {profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden">
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
                      <div>
                        <Link href={`/profile/${profile.id}`} className="font-semibold text-gray-900 hover:text-linkedin-primary transition-colors">
                          {profile.full_name || 'Add your name'}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">{profile.headline || 'Add a headline'}</p>
                      </div>
                      
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Profile views</span>
                          <span className="text-linkedin-primary font-medium">{profile.profile_views || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Connections</span>
                          <span className="text-linkedin-primary font-medium">{profile.connections_count || 0}</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3">
                        <Link href="/premium" className="text-sm text-gray-600 hover:text-linkedin-primary transition-colors flex items-center">
                          <span className="mr-2">🎯</span>
                          Try Premium for free
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Access */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Link href="/network" className="flex items-center text-sm text-gray-700 hover:text-linkedin-primary transition-colors">
                      <UserGroupIcon className="w-4 h-4 mr-3 text-gray-500" />
                      My network
                    </Link>
                    <Link href="/saved" className="flex items-center text-sm text-gray-700 hover:text-linkedin-primary transition-colors">
                      <BookmarkSolidIcon className="w-4 h-4 mr-3 text-gray-500" />
                      Saved items
                    </Link>
                    <Link href="/learning" className="flex items-center text-sm text-gray-700 hover:text-linkedin-primary transition-colors">
                      <AcademicCapIcon className="w-4 h-4 mr-3 text-gray-500" />
                      Learning
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CreatePost onPostCreated={handlePostCreated} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
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
                  initialPosts={posts}
                  fetchMorePosts={fetchMorePosts}
                />
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-linkedin-primary" />
                    LinkedIn News
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm space-y-3">
                      <div className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <p className="font-medium text-gray-900">Remote work trends in 2024</p>
                        <p className="text-xs text-gray-500">2 hours ago • 1,234 readers</p>
                      </div>
                      <div className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <p className="font-medium text-gray-900">AI transforming healthcare</p>
                        <p className="text-xs text-gray-500">4 hours ago • 856 readers</p>
                      </div>
                      <div className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <p className="font-medium text-gray-900">Startup funding reaches new high</p>
                        <p className="text-xs text-gray-500">6 hours ago • 2,891 readers</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* People You May Know */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">People you may know</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {connections.slice(0, 3).map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={connection.avatar_url}
                            alt={connection.full_name || 'User'}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{connection.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{connection.headline}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          <PlusIcon className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* LinkedIn Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-linkedin-primary to-linkedin-secondary text-white">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <AcademicCapIcon className="w-8 h-8" />
                      <div>
                        <h3 className="font-semibold">Level up your skills</h3>
                        <p className="text-sm opacity-90">Explore courses on LinkedIn Learning</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full">
                      Start learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 