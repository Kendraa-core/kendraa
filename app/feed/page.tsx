'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PhotoIcon,
  DocumentIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// --- Helper Functions and Types (Stubs for demonstration) ---

// This hook simulates the useAuth hook to provide user and profile data.
const useAuth = () => ({
  user: { id: '12345', email: 'test.user@example.com' },
  profile: {
    user_type: 'individual',
    profile_type: 'individual',
    avatar_url: 'https://placehold.co/100x100/007FFF/FFFFFF?text=AU',
    full_name: 'Amogh User'
  }
});

// This simulates your database query functions.
const getPosts = async (limit: number, offset: number): Promise<Post[]> => {
  console.log("Fetching posts...");
  // Returning an empty array to simulate the initial "No posts yet" state.
  return []; 
};

const createPost = async (userId: string, content: string, imageUrl?: string): Promise<Post> => {
  console.log("Creating post:", { userId, content, imageUrl });
  // This simulates a successful post creation.
  const newPost: Post = {
    id: Math.random().toString(36).substring(2, 9),
    user_id: userId,
    content,
    image_url: imageUrl,
    created_at: new Date().toISOString(),
    profiles: {
      avatar_url: 'https://placehold.co/100x100/007FFF/FFFFFF?text=AU',
      full_name: 'Amogh User',
      headline: 'Cardiologist'
    },
    likes: [],
    comments: [],
  };
  return newPost;
};

// This simulates your file utility functions.
const validateFile = (file: File, maxSizeMB: number = 5) => ({ valid: true });
const generateFilePath = (userId: string, fileName: string) => `${userId}/${Date.now()}_${fileName}`;
const uploadToSupabaseStorage = async (bucket: string, path: string, file: File) => {
    console.log(`Simulating upload for ${file.name} to ${bucket}/${path}`);
    // In a real app, this returns a public URL from Supabase.
    return { url: URL.createObjectURL(file), error: null };
};

// Define the structure of your Post type
type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  profiles: {
    avatar_url: string | null;
    full_name: string | null;
    headline: string | null;
  };
  likes: any[];
  comments: any[];
};

// --- Placeholder Components (Stubs for demonstration) ---

const Avatar = ({ src, name, size }: { src: string | null | undefined, name: string, size: string }) => (
  <img src={src || `https://placehold.co/48x48/EFEFEF/31343C?text=${name.charAt(0)}`} alt={name} className="w-12 h-12 rounded-full flex-shrink-0" />
);

const PostCard = ({ post }: { post: Post }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center space-x-3 mb-4">
      <Avatar src={post.profiles.avatar_url} name={post.profiles.full_name || 'User'} size="md" />
      <div>
        <p className="font-bold text-gray-900">{post.profiles.full_name}</p>
        <p className="text-sm text-gray-500">{post.profiles.headline}</p>
      </div>
    </div>
    <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>
    {post.image_url && <img src={post.image_url} alt="Post content" className="rounded-lg w-full h-auto object-cover mt-4" />}
  </div>
);

const MedicalFeed = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
    <h3 className="text-lg font-semibold">Medical Feed</h3>
    <p className="text-gray-600">This is where the medical feed content would appear.</p>
  </div>
);

// --- Main Feed Page Component ---

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'medical'>('posts');
  
  const [postContent, setPostContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, 10);
    if (!validation.valid) {
      toast.error('Invalid file');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(imageInputRef.current) {
        imageInputRef.current.value = '';
    }
  };

  const handleCreatePost = useCallback(async () => {
    if (!user || !profile) {
      toast.error("You must be logged in to create a post.");
      return;
    }

    if (!postContent.trim() && !imageFile) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = undefined;

      if (imageFile) {
        const filePath = generateFilePath(user.id, imageFile.name);
        const { url, error } = await uploadToSupabaseStorage('post-images', filePath, imageFile);
        
        if (error) {
          throw new Error(error.message || 'Image upload failed');
        }
        imageUrl = url;
      }

      const post = await createPost(user.id, postContent, imageUrl);
      
      if (post) {
        setPosts(prev => [post, ...prev]);
        setPostContent('');
        handleRemoveImage();
        toast.success('Post created successfully!');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred while creating the post. Please check the database permissions.';
      console.error('Error creating post:', error);
      toast.error(`Failed to create post: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, profile, postContent, imageFile]);

  return (
    <div className="space-y-8">
      {/* Create Post */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <Avatar
            src={profile?.avatar_url}
            name={profile?.full_name || user?.email || 'User'}
            size="md"
          />
          <div className="flex-1">
            <textarea
              placeholder="Share your thoughts, insights, or professional updates..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#007fff] focus:border-transparent text-gray-700 placeholder-gray-500 text-base"
              rows={3}
            />

            {imagePreview && (
              <div className="mt-4 relative w-full sm:w-1/2">
                <img src={imagePreview} alt="Selected preview" className="rounded-lg w-full h-auto object-cover" />
                <button 
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  ref={imageInputRef}
                  className="hidden"
                />
                <button 
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center space-x-2 text-gray-500 hover:text-[#007fff] transition-colors p-2 rounded-lg hover:bg-[#007fff]/5"
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Media</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-[#007fff] transition-colors p-2 rounded-lg hover:bg-[#007fff]/5">
                  <DocumentIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Article</span>
                </button>
              </div>
              <button 
                onClick={handleCreatePost}
                disabled={(!postContent.trim() && !imageFile) || isSubmitting}
                className="w-full sm:w-auto bg-[#007fff] text-white px-6 py-3 rounded-xl hover:bg-[#007fff]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation and Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'posts'
                ? 'bg-[#007fff] text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'medical'
                ? 'bg-[#007fff] text-white shadow-sm'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            Medical Feed
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'posts' ? (
          <div className="space-y-8">
            {loading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to share your thoughts and insights with the community.
                  </p>
                  <button
                    onClick={() => document.querySelector('textarea')?.focus()}
                    className="bg-[#007fff] text-white px-6 py-3 rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium"
                  >
                    Create your first post
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <MedicalFeed />
        )}
      </div>
    </div>
  );
}

