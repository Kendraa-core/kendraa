'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPosts, createPost, getConnections, getSuggestedConnections, getProfile, getInstitutionByAdminId } from '@/lib/queries';
import type { Post, Profile, Institution } from '@/types/database.types';
import { 
  PhotoIcon,
  DocumentIcon,
  PlusIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import MedicalFeed from '@/components/feed/MedicalFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function InstitutionFeedPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'medical'>('posts');
  const [postContent, setPostContent] = useState('');

  // Redirect individual users to their dedicated feed
  useEffect(() => {
    if (profile && profile.user_type !== 'institution' && profile.profile_type !== 'institution') {
      router.push('/feed');
    }
  }, [profile, router]);

  const fetchInstitution = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const institutionData = await getInstitutionByAdminId(user.id);
      setInstitution(institutionData);
    } catch (error) {
      console.error('Error fetching institution:', error);
    }
  }, [user?.id]);

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
    fetchInstitution();
  }, [fetchInstitution]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007fff] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-[#007fff]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Institution Feed</h1>
              <p className="text-gray-600 mt-2">
                Stay connected with the healthcare community
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-[#007fff]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/institution/jobs/create">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                      <BriefcaseIcon className="w-6 h-6 text-[#007fff]" />
                      <span className="text-sm font-medium">Post Job</span>
                    </Button>
                  </Link>
                  
                  <Link href="/institution/events/create">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                      <CalendarIcon className="w-6 h-6 text-[#007fff]" />
                      <span className="text-sm font-medium">Create Event</span>
                    </Button>
                  </Link>
                  
                  <Link href="/institution/network">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                      <UserGroupIcon className="w-6 h-6 text-[#007fff]" />
                      <span className="text-sm font-medium">Network</span>
                    </Button>
                  </Link>
                  
                  <Link href="/institution/dashboard">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                      <ChartBarIcon className="w-6 h-6 text-[#007fff]" />
                      <span className="text-sm font-medium">Analytics</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Feed Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'posts'
                        ? 'border-[#007fff] text-[#007fff]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    General Feed
                  </button>
                  <button
                    onClick={() => setActiveTab('medical')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'medical'
                        ? 'border-[#007fff] text-[#007fff]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Medical Feed
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'posts' ? (
                  <div className="space-y-6">
                    {/* Create Post */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={profile?.avatar_url}
                          name={profile?.full_name || 'User'}
                          size="md"
                        />
                        <div className="flex-1">
                          <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="Share updates about your institution..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent resize-none"
                            rows={3}
                          />
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200">
                                <PhotoIcon className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200">
                                <DocumentIcon className="w-5 h-5" />
                              </button>
                            </div>
                            <Button
                              onClick={() => handleCreatePost(postContent)}
                              disabled={!postContent.trim()}
                              className="bg-[#007fff] hover:bg-[#007fff]/90 text-white"
                            >
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Posts */}
                    {posts.length > 0 ? (
                      <div className="space-y-6">
                        {posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <MedicalFeed />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Institution Info */}
            {institution && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-[#007fff]" />
                    Institution Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{institution.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {institution.type?.replace('_', ' ')} Organization
                      </p>
                    </div>
                    
                    {institution.location && (
                      <div className="text-sm text-gray-600">
                        📍 {institution.location}
                      </div>
                    )}
                    
                    {institution.description && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {institution.description}
                      </p>
                    )}
                    
                    <Link href="/institution/profile">
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-[#007fff]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>• Posted a new job opening</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>• Created a new event</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>• Updated institution profile</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-[#007fff]" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Jobs</span>
                    <span className="font-semibold text-[#007fff]">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Upcoming Events</span>
                    <span className="font-semibold text-[#007fff]">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profile Views</span>
                    <span className="font-semibold text-[#007fff]">127</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
