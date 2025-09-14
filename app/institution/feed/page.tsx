'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatNumber, getSupabaseStorageUrl } from '@/lib/utils';
import { getInstitutionPosts, createInstitutionPost, getGlobalFeed } from '@/lib/queries';
import { PostWithAuthor } from '@/types/database.types';
import {
  PencilIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  MapPinIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  PlusIcon as PlusSolidIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

export default function InstitutionFeedPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Load institution posts
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        // Load global feed to show posts from all users
        const globalPosts = await getGlobalFeed(20, 0);
        setPosts(globalPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.trim() || !profile?.id) return;
    
    setPosting(true);
    try {
      const newPostData = await createInstitutionPost(profile.id, newPost);
      if (newPostData) {
        // Refresh posts with global feed
        const updatedPosts = await getGlobalFeed(20, 0);
        setPosts(updatedPosts);
        setNewPost('');
        setShowCreatePost(false);
        toast.success('Post created successfully!');
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = (postId: string) => {
    // Here you would typically update the like count in your database
    toast.success('Post liked!');
  };

  const handleShare = (postId: string) => {
    // Here you would typically implement sharing functionality
    toast.success('Post shared!');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Global Feed</h1>
              <p className="text-sm text-gray-600">Posts from all users in the platform</p>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Create Post
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Posts Feed */}
          <div className="space-y-6">
            {/* Create Post Modal */}
            {showCreatePost && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Create Post</h2>
                    <button
                      onClick={() => setShowCreatePost(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <EllipsisHorizontalIcon className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What's happening in your institution?"
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#007fff] focus:ring-1 focus:ring-[#007fff] resize-none"
                      rows={4}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                          <PhotoIcon className="w-5 h-5" />
                          Photo
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                          <VideoCameraIcon className="w-5 h-5" />
                          Video
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                          <DocumentTextIcon className="w-5 h-5" />
                          Document
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowCreatePost(false)}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreatePost}
                          disabled={!newPost.trim() || posting}
                          className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {posting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Posting...
                            </>
                          ) : (
                            'Post'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {loading ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fff] mx-auto mb-3"></div>
                  <p className="text-sm text-[#007fff]">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                  <MegaphoneIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Posts Yet</h2>
                  <p className="text-gray-600 mb-4">Share your first update with your followers.</p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="px-6 py-3 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
                  >
                    <PlusIcon className="w-5 h-5" /> Create Your First Post
                  </button>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Post Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(post.author as any).avatar_url ? (
                        <Image
                          src={(post.author as any).avatar_url.startsWith('http') ? (post.author as any).avatar_url : getSupabaseStorageUrl('avatars', (post.author as any).avatar_url)}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BuildingOfficeIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{(post.author as any).full_name || 'Unknown User'}</h3>
                        {/* Verified badge - not available in current schema */}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {(post.author as any).location && (
                          <>
                            <MapPinIcon className="w-3 h-3" />
                            <span>{(post.author as any).location}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatTimeAgo(post.created_at)}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{post.content}</p>
                    {post.image_url && (
                      <div className="mt-4 rounded-lg overflow-hidden">
                        <Image
                          src={post.image_url.startsWith('http') ? post.image_url : getSupabaseStorageUrl('posts', post.image_url)}
                          alt="Post image"
                          width={600}
                          height={300}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <HeartIcon className="w-5 h-5" />
                        <span>{formatNumber(post.likes_count)}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        <span>{formatNumber(post.comments_count)}</span>
                      </button>
                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
                      >
                        <ShareIcon className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>


      </div>
    </div>
  );
}
