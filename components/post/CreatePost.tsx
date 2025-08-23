'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/lib/queries';
import Avatar from '@/components/common/Avatar';
import {
  PhotoIcon,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please add some content to your post');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }

    setIsPosting(true);

    try {
      const post = await createPost(user.id, content.trim());

      if (post) {
        // Reset form
        setContent('');
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

          {/* Action Buttons */}
          {isExpanded && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                {/* Media Upload Button - Disabled for now */}
                <button
                  disabled
                  className="flex items-center space-x-2 px-3 py-2 text-gray-400 rounded-lg cursor-not-allowed"
                  title="Media upload coming soon"
                >
                  <PhotoIcon className="w-5 h-5" />
                  <span className="text-sm">Media</span>
                </button>
              </div>

              {/* Post Button */}
              <button
                onClick={handleSubmit}
                disabled={isPosting || !content.trim()}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}