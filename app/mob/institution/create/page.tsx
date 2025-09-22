'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/lib/queries';
import { uploadPostImage } from '@/lib/vercel-blob';
import { 
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import MobileLayout from '@/components/mobile/MobileLayout';
import Avatar from '@/components/common/Avatar';

export default function MobileInstitutionCreatePostPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleCreatePost = async (content: string) => {
    if (!user?.id || !content.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }

    try {
      setIsPosting(true);
      
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await uploadPostImage(selectedImage, user.id);
          if (uploadResult.error) {
            throw new Error(uploadResult.error);
          }
          imageUrl = uploadResult.url;
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image');
          setIsUploadingImage(false);
          return;
        }
        setIsUploadingImage(false);
      }

      // Create post
      await createPost(user.id, content, imageUrl || undefined);
      
      toast.success('Post created successfully!');
      router.push('/mob/institution/feed');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <MobileLayout title="Create Post" isInstitution={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Create Post</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Create Post Form */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-start space-x-3">
            <Avatar
              src={profile?.avatar_url}
              name={profile?.full_name || user?.email || 'User'}
              size="md"
            />
            <div className="flex-1">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share updates about your institution..."
                className="w-full min-h-[120px] p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {postContent.length}/2000
                </span>
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Media Button */}
          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={handleMediaButtonClick}
              disabled={isPosting || isUploadingImage}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PhotoIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Photo</span>
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
        </div>

        {/* Post Button */}
        <div className="p-4">
          <button
            onClick={() => handleCreatePost(postContent)}
            disabled={isPosting || isUploadingImage || (!postContent.trim() && !selectedImage)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isPosting ? (isUploadingImage ? 'Uploading...' : 'Posting...') : 'Post'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
