'use client';

import { useState, useRef } from 'react';
import { motion,  } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { createPost } from '@/lib/queries';
import Avatar from '@/components/common/Avatar';
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  FaceSmileIcon,
  XMarkIcon,
  GlobeAltIcon,
  UserGroupIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Anyone', icon: GlobeAltIcon, description: 'Anyone on or off the platform' },
  { value: 'connections', label: 'Connections only', icon: UserGroupIcon, description: 'Only your connections' },
  { value: 'private', label: 'Only me', icon: LockClosedIcon, description: 'Only visible to you' },
];

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'connections' | 'private'>('public');
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debug logging
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[CreatePost] ${message}`, data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    debugLog('Uploading images', { count: files.length });

    // Limit to 10 images
    const totalImages = images.length + files.length;
    if (totalImages > 10) {
      toast.error('You can only upload up to 10 images per post');
      return;
    }

    // Check file sizes (5MB limit per image)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    // Add new images
    setImages(prev => [...prev, ...files]);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke the preview URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    debugLog('Processing image uploads', { count: images.length });

    // For demo purposes, we'll use the blob URLs
    // In production, you'd upload to your storage service (Supabase Storage, AWS S3, etc.)
    return imagePreviewUrls;
  };

  const handleSubmit = async () => {
    debugLog('Starting post submission', { 
      content: content.trim(), 
      imagesCount: images.length, 
      user: user?.id,
      visibility 
    });

    if (!content.trim() && images.length === 0) {
      toast.error('Please add some content or images to your post');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to post');
      debugLog('No user found', { user });
      return;
    }

    setIsPosting(true);

    try {
      // Upload images if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        debugLog('Uploading images...');
        imageUrls = await uploadImages();
        debugLog('Images uploaded', { urls: imageUrls });
      }

      // Create the post
      const postData = {
        content: content.trim(),
        author_id: user.id,
        visibility,
        image_url: imageUrls[0] || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      debugLog('Creating post with data', postData);

      const post = await createPost(postData);

      debugLog('Post creation result', { post });

      if (post) {
        // Reset form
        setContent('');
        setImages([]);
        setImagePreviewUrls([]);
        setIsExpanded(false);
        setVisibility('public');
        setShowVisibilityDropdown(false);

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        toast.success('Post created successfully!');
        onPostCreated?.();
        debugLog('Post created successfully', { postId: post.id });
      } else {
        debugLog('Post creation failed - no post returned');
        toast.error('Failed to create post. Please try again.');
      }
    } catch (error) {
      debugLog('Error creating post', error);
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const selectedVisibility = VISIBILITY_OPTIONS.find(option => option.value === visibility);

  if (!user) {
    debugLog('User not authenticated - hiding create post');
    return null;
  }

  return (
    <Card className="mb-6 bg-white border border-gray-200 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <Avatar
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.full_name || user.email || 'User'}
              size="lg"
              className="ring-2 ring-gray-100"
            />
          </div>

          {/* Post Content */}
          <div className="flex-1">
            <div
              layout
              className="space-y-4"
            >
              {/* Text Area */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onFocus={() => setIsExpanded(true)}
                  placeholder="What's on your mind?"
                  className={cn(
                    "w-full resize-none border-none outline-none text-gray-900 placeholder-gray-500",
                    "text-lg leading-relaxed overflow-hidden bg-transparent",
                    isExpanded ? "min-h-[120px]" : "min-h-[60px]"
                  )}
                  style={{ maxHeight: '200px' }}
                  maxLength={3000}
                />
                
                {/* Character Counter */}
                {isExpanded && (
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {content.length}/3000
                  </div>
                )}
              </div>

              {/* Image Previews */}
              <>
                {imagePreviewUrls.length > 0 && (
                  <div
                    
                    
                    
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {imagePreviewUrls.map((url, index) => (
                      <div
                        key={index}
                        
                        
                        
                        className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100"
                      >
                        <Image
                          src={url}
                          alt={`Upload preview ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>

              {/* Action Buttons */}
              <>
                {isExpanded && (
                  <div
                    
                    
                    
                    className="flex items-center justify-between pt-4 border-t border-gray-200"
                  >
                    {/* Media Buttons */}
                    <div className="flex items-center space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                      >
                        <PhotoIcon className="w-5 h-5 mr-2" />
                        Photo
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                        disabled
                      >
                        <VideoCameraIcon className="w-5 h-5 mr-2" />
                        Video
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                        disabled
                      >
                        <DocumentIcon className="w-5 h-5 mr-2" />
                        Document
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                        disabled
                      >
                        <FaceSmileIcon className="w-5 h-5 mr-2" />
                        Feeling
                      </Button>
                    </div>

                    {/* Visibility and Post Button */}
                    <div className="flex items-center space-x-3">
                      {/* Visibility Dropdown */}
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                          className="flex items-center space-x-2 border-gray-200 rounded-xl"
                        >
                          {selectedVisibility && (
                            <selectedVisibility.icon className="w-4 h-4" />
                          )}
                          <span>{selectedVisibility?.label}</span>
                        </Button>

                        <>
                          {showVisibilityDropdown && (
                            <div
                              
                              
                              
                              className="absolute bottom-full mb-2 right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50"
                            >
                              {VISIBILITY_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setVisibility(option.value as 'public' | 'connections' | 'private');
                                    setShowVisibilityDropdown(false);
                                  }}
                                  className={cn(
                                    "w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors",
                                    visibility === option.value && "bg-indigo-50 text-indigo-700"
                                  )}
                                >
                                  <div className="flex items-center space-x-3">
                                    <option.icon className="w-5 h-5 text-gray-600" />
                                    <div>
                                      <div className="font-medium text-gray-900">{option.label}</div>
                                      <div className="text-sm text-gray-500">{option.description}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      </div>

                      {/* Post Button */}
                      <Button
                        onClick={handleSubmit}
                        disabled={!content.trim() || isPosting}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
                      >
                        {isPosting ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 