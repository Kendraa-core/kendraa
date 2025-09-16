'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getPosts, 
  createPost, 
  getPostsByAuthor, 
  getInstitutionByAdminId
} from '@/lib/queries';
import type { Post, PostWithAuthor, Institution } from '@/types/database.types';
import { 
  PlusIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Header from '@/components/layout/Header';
import { 
  BACKGROUNDS, 
  TEXT_COLORS, 
  COMPONENTS, 
  TYPOGRAPHY 
} from '@/lib/design-system';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function InstitutionFeedPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [institutionPosts, setInstitutionPosts] = useState<PostWithAuthor[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'posts'>('feed');
  const [postContent, setPostContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Redirect non-institution users
  useEffect(() => {
    if (profile && profile.user_type !== 'institution') {
      router.push('/feed');
    }
  }, [profile, router]);

  const fetchInstitutionData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const institutionData = await getInstitutionByAdminId(user.id);
      setInstitution(institutionData);
    } catch (error) {
      console.error('Error fetching institution data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchPosts = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [generalPosts, myPosts] = await Promise.all([
        getPosts(10, 0),
        getPostsByAuthor(user.id)
      ]);
      setPosts(generalPosts);
      setInstitutionPosts(myPosts);
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
      const success = await createPost(user.id, content, imageUrl);
      if (success) {
        toast.success('Post created successfully!');
        setPostContent('');
        setShowCreatePost(false);
        fetchPosts();
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  }, [user?.id, fetchPosts]);

  const handlePostInteraction = () => {
    fetchPosts();
  };

  useEffect(() => {
    fetchInstitutionData();
    fetchPosts();
  }, [fetchInstitutionData, fetchPosts]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the institution feed</p>
          <Link
            href="/signin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${BACKGROUNDS.page.primary} min-h-screen`}>
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`${TYPOGRAPHY.heading.h1} mb-2`}>Institution Feed</h1>
            <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary} mb-6`}>
              Share updates, manage content, and engage with your network
            </p>
            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className={`${COMPONENTS.button.primary} flex items-center space-x-2 mx-auto`}
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </div>

          {/* Institution Info Card */}
          {institution && (
            <div className={`${COMPONENTS.card.base} mb-8`}>
              <div className="p-8 text-center">
                <Avatar
                  src={institution.logo_url}
                  name={institution.name}
                  size="xl"
                  className="mx-auto mb-4"
                />
                <h2 className={`${TYPOGRAPHY.heading.h2} mb-2`}>{institution.name}</h2>
                <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary} mb-4`}>
                  {institution.description || 'Healthcare Institution'}
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                  <span className={`${TYPOGRAPHY.body.small} ${TEXT_COLORS.secondary}`}>
                    {institutionPosts.length} Posts
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className={`${COMPONENTS.card.base} mb-8 p-2 flex space-x-2 max-w-md mx-auto`}>
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'bg-[#007fff] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              General Feed
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'bg-[#007fff] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Your Posts ({institutionPosts.length})
            </button>
          </div>

          {/* Create Post Form */}
          {showCreatePost && (
            <div className={`${COMPONENTS.card.base} mb-8`}>
              <div className="p-8">
                <h3 className={`${TYPOGRAPHY.heading.h3} mb-6 text-center`}>Create New Post</h3>
                <div className="space-y-6">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share an update with your network..."
                    className={`w-full h-40 ${COMPONENTS.input.base} resize-none text-center`}
                  />
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowCreatePost(false)}
                      className={`${COMPONENTS.button.secondary} px-8`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCreatePost(postContent)}
                      disabled={!postContent.trim()}
                      className={`${COMPONENTS.button.primary} px-8 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <LoadingSpinner size="lg" text="Loading content..." />
            </div>
          ) : (
            <div className="space-y-8">
              {activeTab === 'feed' && (
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onInteraction={handlePostInteraction}
                      />
                    ))
                  ) : (
                    <div className={`${COMPONENTS.card.base} text-center py-16`}>
                      <UserGroupIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                      <h3 className={`${TYPOGRAPHY.heading.h3} mb-3`}>No posts yet</h3>
                      <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary} mb-6`}>
                        Be the first to share something with the community
                      </p>
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className={`${COMPONENTS.button.primary}`}
                      >
                        Create First Post
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {institutionPosts.length > 0 ? (
                    institutionPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onInteraction={handlePostInteraction}
                      />
                    ))
                  ) : (
                    <div className={`${COMPONENTS.card.base} text-center py-16`}>
                      <PlusIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                      <h3 className={`${TYPOGRAPHY.heading.h3} mb-3`}>No posts yet</h3>
                      <p className={`${TYPOGRAPHY.body.medium} ${TEXT_COLORS.secondary} mb-6`}>
                        Start sharing updates with your network
                      </p>
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className={`${COMPONENTS.button.primary}`}
                      >
                        Create First Post
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
