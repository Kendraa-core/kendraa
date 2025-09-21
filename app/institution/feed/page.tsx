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
  DocumentTextIcon,
  CalendarIcon,
  MegaphoneIcon,
  LightBulbIcon,
  ChartBarIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PostCard from '@/components/post/PostCard';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
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
  const { isProtected, isLoading } = useOnboardingProtection();
  const [posts, setPosts] = useState<Post[]>([]);
  const [institutionPosts, setInstitutionPosts] = useState<PostWithAuthor[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Post templates for institutions
  const postTemplates = [
    {
      id: 'announcement',
      title: 'Announcement',
      icon: MegaphoneIcon,
      placeholder: 'Share important updates, news, or announcements with your network...',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'research',
      title: 'Research Update',
      icon: AcademicCapIcon,
      placeholder: 'Share your latest research findings, studies, or academic insights...',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'event',
      title: 'Event',
      icon: CalendarIcon,
      placeholder: 'Promote upcoming events, conferences, or educational sessions...',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'insight',
      title: 'Industry Insight',
      icon: LightBulbIcon,
      placeholder: 'Share valuable insights, trends, or analysis in your field...',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'achievement',
      title: 'Achievement',
      icon: ChartBarIcon,
      placeholder: 'Celebrate milestones, awards, or significant accomplishments...',
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'community',
      title: 'Community',
      icon: HeartIcon,
      placeholder: 'Engage with your community, share stories, or highlight partnerships...',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  // Check URL params for create post trigger
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('create') === 'post') {
      setShowCreatePost(true);
    }
  }, []);

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
      const institutionData = await getInstitutionByUserId(user.id);
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

    if (!content.trim() && !selectedImage) {
      toast.error('Please add some content or an image to your post');
      return;
    }

    setIsPosting(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload image if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `post_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `posts/${user.id}/${fileName}`;

        const result = await uploadToSupabaseStorage('post-images', filePath, selectedImage);
        
        if (result.error) {
          throw new Error('Failed to upload image');
        }
        
        finalImageUrl = result.url;
        setIsUploadingImage(false);
      }

      const post = await createPost(user.id, content.trim(), finalImageUrl);
      if (post) {
        setPosts(prev => [post, ...prev]);
        resetPostForm();
        toast.success('Post created successfully!');
        fetchPosts();
      } else {
        toast.error('Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
      setIsUploadingImage(false);
    }
  }, [user?.id, selectedImage, fetchPosts]);

  const handlePostInteraction = () => {
    fetchPosts();
  };

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
      
      // Create preview
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

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplates(false);
    setShowCreatePost(true);
    
    // Set placeholder text based on template
    const template = postTemplates.find(t => t.id === templateId);
    if (template) {
      // We'll use the placeholder in the UI
    }
  };

  const getCurrentTemplate = () => {
    return postTemplates.find(t => t.id === selectedTemplate) || postTemplates[0];
  };

  const resetPostForm = () => {
    setPostContent('');
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedTemplate(null);
    setShowCreatePost(false);
    setShowTemplates(false);
  };

  useEffect(() => {
    fetchInstitutionData();
    fetchPosts();
  }, [fetchInstitutionData, fetchPosts]);

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Innovative Create Post Interface */}
          {!showCreatePost && !showTemplates && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name || user?.email || 'User'}
                  size="md"
                />
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex-1 text-left p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
                >
                  Share your thoughts, insights, or professional updates...
                </button>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMediaButtonClick}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-[#007fff] hover:bg-[#007fff]/5 rounded-lg transition-colors"
                  >
                    <PhotoIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Media</span>
                  </button>
                  
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-[#007fff] hover:bg-[#007fff]/5 rounded-lg transition-colors"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Templates</span>
                  </button>
                </div>
                
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Create Post</span>
                </button>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Post Templates Selection */}
          {showTemplates && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Choose a Post Template</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {postTemplates.map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-4 rounded-xl border-2 border-gray-200 hover:border-[#007fff] transition-all duration-200 text-left group ${template.bgColor}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${template.color} text-white`}>
                        {(() => {
                          const IconComponent = template.icon;
                          return <IconComponent className="w-5 h-5" />;
                        })()}
                      </div>
                      <span className={`font-medium ${template.textColor}`}>{template.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700">
                      {template.placeholder.substring(0, 60)}...
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Create Post Form */}
          {showCreatePost && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={profile?.avatar_url}
                    name={profile?.full_name || user?.email || 'User'}
                    size="md"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{profile?.full_name || 'Institution'}</h4>
                    {selectedTemplate && (
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${getCurrentTemplate().color} text-white`}>
                          {(() => {
                            const IconComponent = getCurrentTemplate().icon;
                            return <IconComponent className="w-3 h-3" />;
                          })()}
                        </div>
                        <span className="text-sm text-gray-600">{getCurrentTemplate().title}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={resetPostForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1">
                <textarea
                  placeholder={getCurrentTemplate().placeholder}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent text-gray-700 placeholder-gray-500 text-base"
                  rows={4}
                  disabled={isPosting}
                />

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-4 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleMediaButtonClick}
                      disabled={isPosting || isUploadingImage}
                      className="flex items-center space-x-2 text-gray-500 hover:text-[#007fff] transition-colors p-2 rounded-lg hover:bg-[#007fff]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PhotoIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Media</span>
                    </button>
                    
                    <button
                      onClick={() => setShowTemplates(true)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-[#007fff] transition-colors p-2 rounded-lg hover:bg-[#007fff]/5"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Templates</span>
                    </button>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={resetPostForm}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleCreatePost(postContent)}
                      disabled={isPosting || isUploadingImage || (!postContent.trim() && !selectedImage)}
                      className="bg-[#007fff] text-white px-6 py-3 rounded-xl hover:bg-[#007fff]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                    >
                      {isPosting ? (
                        <>
                          {isUploadingImage ? 'Uploading...' : 'Posting...'}
                        </>
                      ) : (
                        <>
                          <span>Post</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </>
                      )}
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
            <div className="space-y-6">
              {/* Show all posts (both general and institution posts) */}
              {posts.length > 0 || institutionPosts.length > 0 ? (
                <div className="space-y-6">
                  {/* Institution's own posts first */}
                  {institutionPosts.map((post) => (
                    <PostCard
                      key={`institution-${post.id}`}
                      post={post}
                      onInteraction={handlePostInteraction}
                      onPostDeleted={() => {}}
                    />
                  ))}
                  
                  {/* General feed posts */}
                  {posts.map((post) => (
                    <PostCard
                      key={`general-${post.id}`}
                      post={post}
                      onInteraction={handlePostInteraction}
                      onPostDeleted={() => {}}
                    />
                  ))}
                </div>
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
        </motion.div>
      </div>
  );
}
