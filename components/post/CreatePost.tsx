'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/lib/queries';
import { uploadToSupabaseStorage } from '@/lib/utils';
import Avatar from '@/components/common/Avatar';
import {
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage) {
      toast.error('Please add some content or an image to your post');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }

    setIsPosting(true);

    try {
      let imageUrl: string | undefined;

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
        
        imageUrl = result.url;
        setIsUploadingImage(false);
      }

      const post = await createPost(user.id, content.trim(), imageUrl);

      if (post) {
        // Reset form
        setContent('');
        setSelectedImage(null);
        setImagePreview(null);
        setIsExpanded(false);
        toast.success('Post created successfully!');
        onPostCreated?.();
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
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustTextareaHeight();
    
    // Expand the component when user starts typing
    if (!isExpanded && e.target.value.length > 0) {
      setIsExpanded(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
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

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={user.user_metadata?.avatar_url}
            alt={user.user_metadata?.full_name || user.email || 'User'}
            size="md"
          />
        </div>

        {/* Post Content */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Share your thoughts, insights, or professional updates..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[60px] max-h-[200px]"
            rows={1}
            disabled={isPosting}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          {isExpanded && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                {/* Image Upload Button */}
                <button
                  onClick={handleImageButtonClick}
                  disabled={isPosting || isUploadingImage}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-[#007fff] rounded-lg hover:bg-[#007fff]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span className="text-sm">Image</span>
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

              {/* Post Button */}
              <button
                onClick={handleSubmit}
                disabled={isPosting || isUploadingImage || (!content.trim() && !selectedImage)}
                className="bg-[#007fff] text-white px-6 py-2 rounded-lg hover:bg-[#007fff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isPosting ? (isUploadingImage ? 'Uploading...' : 'Posting...') : 'Post'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}