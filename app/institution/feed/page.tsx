'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingProtection } from '@/hooks/useOnboardingProtection';
import { 
  getPosts, 
  createPost, 
  getPostsByAuthor, 
  getInstitutionByUserId
} from '@/lib/queries';
import { uploadToSupabaseStorage } from '@/lib/utils';
import type { Post, PostWithAuthor, Institution } from '@/types/database.types';
import { 
  UserGroupIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link';

export default function InstitutionFeedPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { isProtected, isLoading } = useOnboardingProtection();
  
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [institutionPosts, setInstitutionPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch general posts
      const generalPosts = await getPosts();
      setPosts(generalPosts);

      // Fetch institution-specific posts
      const institutionPosts = await getPostsByAuthor(user.id);
      setInstitutionPosts(institutionPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleCreatePost = useCallback(async () => {
    if (!user?.id || !postContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsPosting(true);
    try {
      let imageUrl = '';
      
      if (selectedImage) {
        setIsUploadingImage(true);
        try {
          const fileName = `post_${user?.id}_${Date.now()}.jpg`;
          const filePath = `posts/${user?.id}/${fileName}`;
          const { url, error } = await uploadToSupabaseStorage('post-images', filePath, selectedImage);
          
          if (error) {
            throw new Error(error);
          }
          
          imageUrl = url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.error('Failed to upload image');
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      await createPost(postContent, user?.id!, imageUrl);
      
      setPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreatePost(false);
      
      toast.success('Post created successfully!');
      
      // Refresh posts
      await fetchPosts();
      
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  }, [postContent, selectedImage, user?.id, fetchPosts]);

  // Redirect if not an institution user
  useEffect(() => {
    if (!user || (profile && profile.user_type !== 'institution' && profile.profile_type !== 'institution')) {
      router.push('/feed');
    }
  }, [user, profile, router]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);


  // Show loading while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isProtected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Access Required</h2>
          <p className="text-gray-600 mb-6">Please sign in and complete onboarding to access the institution feed</p>
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMediaButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreatePost = useCallback(async () => {
    if (!user?.id || !postContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsPosting(true);
    try {
      let finalImageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `post_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const result = await uploadToSupabaseStorage('avatars', filePath, selectedImage);
        
        if (result.error) {
          throw new Error('Failed to upload image');
        }
        
        finalImageUrl = result.url;
        setIsUploadingImage(false);
      }

      const post = await createPost(user.id, postContent.trim(), finalImageUrl);
      if (post) {
        setPosts(prev => [post, ...prev]);
        setPostContent('');
        setSelectedImage(null);
        setImagePreview(null);
        setShowCreatePost(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success('Post created successfully!');
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
      setIsUploadingImage(false);
    }
  }, [user?.id, postContent, selectedImage]);

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(currentPosts => 
      currentPosts.filter(post => post.id !== deletedPostId)
    );
    setInstitutionPosts(currentPosts => 
      currentPosts.filter(post => post.id !== deletedPostId)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Institution Feed</h1>
          <p className="text-gray-600">Share updates and connect with your network</p>
        </div>

        {/* Create Post Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {!showCreatePost ? (
            <div className="flex items-center space-x-4">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name || user?.email || 'User'}
                size="md"
              />
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors text-gray-500"
              >
                Share your thoughts...
              </button>
              <button
                onClick={handleMediaButtonClick}
                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                title="Add media"
              >
                <PhotoIcon className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name || user?.email || 'User'}
                  size="md"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{profile?.full_name || 'Institution'}</h4>
                </div>
              </div>
              
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's happening in your institution?"
                className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md rounded-xl"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMediaButtonClick}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Add media"
                  >
                    <PhotoIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      setPostContent('');
                      setSelectedImage(null);
                      setImagePreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!postContent.trim() || isPosting || isUploadingImage}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isPosting || isUploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{isUploadingImage ? 'Uploading...' : 'Posting...'}</span>
                      </>
                    ) : (
                      <span>Post</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="lg" text="Loading content..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Show all posts (both general and institution posts) */}
            {posts.length > 0 || institutionPosts.length > 0 ? (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}
                {institutionPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <UserGroupIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share something with your network</p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create First Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}