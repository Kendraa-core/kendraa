'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import ClickableProfileName from '@/components/common/ClickableProfileName';
import CommentReactions from './CommentReactions';
import { formatRelativeTime } from '@/lib/utils';
import { createReply, getCommentReplies } from '@/lib/queries';
import { ChatBubbleLeftIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { CommentWithAuthor } from '@/types/database.types';

interface CommentProps {
  comment: CommentWithAuthor;
  onReplyAdded?: () => void;
  onReactionChange?: () => void;
}

export default function Comment({ comment, onReplyAdded, onReactionChange }: CommentProps) {
  const { user } = useAuth();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentWithAuthor[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [repliesCount, setRepliesCount] = useState(0);

  const authorName = comment.author && 'full_name' in comment.author 
    ? comment.author.full_name || 'Unknown User'
    : 'Unknown User';

  const authorAvatar = comment.author && 'avatar_url' in comment.author 
    ? comment.author.avatar_url || ''
    : '';

  const authorType = comment.author && 'user_type' in comment.author 
    ? comment.author.user_type 
    : 'individual';

  // Load replies count when component mounts (only for top-level comments)
  useEffect(() => {
    if (comment.parent_id === null) {
      loadRepliesCount();
    }
  }, [comment.id]);

  const loadRepliesCount = async () => {
    try {
      const fetchedReplies = await getCommentReplies(comment.id);
      setRepliesCount(fetchedReplies.length);
    } catch (error) {
      // Silent error handling for replies count
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to reply');
      return;
    }

    setIsSubmittingReply(true);

    try {
      const result = await createReply(comment.id, replyContent.trim(), user.id);
      
      if (result) {
        setReplyContent('');
        setShowReplyBox(false);
        toast.success('Reply added successfully!');
        onReplyAdded?.();
        
        // Refresh replies count and list if they're currently shown
        await loadRepliesCount();
        if (showReplies) {
          await loadReplies();
        }
      } else {
        toast.error('Failed to add reply');
      }
    } catch (error: any) {
      toast.error('Failed to add reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const loadReplies = async () => {
    if (isLoadingReplies) return;
    
    setIsLoadingReplies(true);
    try {
      const fetchedReplies = await getCommentReplies(comment.id);
      setReplies(fetchedReplies);
      setRepliesCount(fetchedReplies.length);
    } catch (error) {
      toast.error('Failed to load replies');
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const toggleReplies = async () => {
    if (!showReplies) {
      // If opening replies, load them first
      await loadReplies();
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="flex items-start space-x-3">
        <Avatar
          src={authorAvatar}
          alt={authorName}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <ClickableProfileName
                userId={comment.author_id}
                name={authorName}
                userType={authorType}
                className="text-sm font-medium"
              />
              <span className="text-xs text-gray-500">
                {comment.created_at ? formatRelativeTime(comment.created_at) : 'Just now'}
              </span>
            </div>
            <p className="text-sm text-gray-700 break-words mb-2">
              {comment.content || 'Comment content unavailable'}
            </p>
            
            {/* Comment Actions */}
            <div className="flex items-center space-x-4 text-xs">
              <CommentReactions
                commentId={comment.id}
                likesCount={comment.likes_count || 0}
                onReactionChange={onReactionChange}
              />
              
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowUturnLeftIcon className="w-3 h-3" />
                <span>Reply</span>
              </button>

              {/* Show Replies Button - Moved inline with actions */}
              {comment.parent_id === null && repliesCount > 0 && (
                <button
                  onClick={toggleReplies}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChatBubbleLeftIcon className="w-3 h-3" />
                  <span>
                    {showReplies ? 'Hide' : 'Show'} {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Reply Box */}
          {showReplyBox && (
            <div className="mt-3 flex items-start space-x-3">
              <Avatar
                src={user?.user_metadata?.avatar_url}
                alt={user?.email || 'User'}
                size="sm"
              />
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-azure-500 focus:border-transparent text-sm"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => setShowReplyBox(false)}
                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={isSubmittingReply || !replyContent.trim()}
                    className="px-3 py-1 text-sm bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmittingReply ? 'Posting...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies Section - Now inline with actions above */}
      {comment.parent_id === null && showReplies && (
        <div className="ml-8 mt-3">
          {/* Replies List */}
          <div className="space-y-3">
            {isLoadingReplies ? (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#007fff] mx-auto"></div>
              </div>
            ) : replies.length > 0 ? (
              replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onReplyAdded={onReplyAdded}
                  onReactionChange={onReactionChange}
                />
              ))
            ) : (
              <div className="text-center py-2 text-sm text-gray-500">
                No replies yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
