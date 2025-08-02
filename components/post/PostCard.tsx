'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  PaperAirplaneIcon,
  CheckBadgeIcon,
  ChatBubbleLeftIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
} from '@heroicons/react/24/solid';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  likePost,
  unlikePost,
  isPostLiked,
  getPostComments,
  createComment,
} from '@/lib/queries';
import type { PostWithAuthor, CommentWithAuthor, Profile } from '@/types/database.types';

interface PostCardProps {
  post: PostWithAuthor;
  onInteraction?: () => void;
}

export default function PostCard({ post, onInteraction }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Debug logging
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[PostCard] ${message}`, data);
  };

  // Type guard to check if author is a Profile
  const isProfile = (author: typeof post.author): author is Profile => {
    return author && 'full_name' in author;
  };

  // Helper function to get author display name
  const getAuthorName = () => {
    if (!post.author) return 'Unknown User';
    return isProfile(post.author) ? (post.author.full_name || 'Unknown User') : (post.author.name || 'Unknown Institution');
  };

  // Helper function to get author avatar
  const getAuthorAvatar = () => {
    if (!post.author) return '';
    return isProfile(post.author) ? (post.author.avatar_url || '') : (post.author.logo_url || '');
  };

  // Helper function to get author headline
  const getAuthorHeadline = () => {
    if (!post.author) return 'Healthcare Professional';
    return isProfile(post.author) ? (post.author.headline || 'Healthcare Professional') : (post.author.type || 'Institution');
  };

  useEffect(() => {
    checkIfLiked();
  }, [post.id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkIfLiked = async () => {
    if (!user?.id) return;
    
    try {
      const liked = await isPostLiked(post.id, user.id);
      setIsLiked(liked);
      debugLog('Like status checked', { postId: post.id, liked });
    } catch (error) {
      debugLog('Error checking like status', error);
    }
  };

  const handleLike = async () => {
    if (!user?.id) {
      toast.error('Please log in to like posts');
      return;
    }

    debugLog('Toggling like', { postId: post.id, currentlyLiked: isLiked });

    try {
      if (isLiked) {
        const success = await unlikePost(post.id, user.id);
        if (success) {
          setIsLiked(false);
                     setLikesCount((prev: number) => Math.max(0, prev - 1));
          debugLog('Post unliked successfully');
        } else {
          debugLog('Failed to unlike post');
        }
      } else {
        const success = await likePost(post.id, user.id);
        if (success) {
          setIsLiked(true);
                     setLikesCount((prev: number) => prev + 1);
          debugLog('Post liked successfully');
        } else {
          debugLog('Failed to like post');
        }
      }
      
      onInteraction?.();
    } catch (error) {
      debugLog('Error toggling like', error);
      toast.error('Failed to update like');
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      loadComments();
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    debugLog('Loading comments', { postId: post.id });
    
    try {
      const fetchedComments = await getPostComments(post.id);
      setComments(fetchedComments);
      debugLog('Comments loaded', { count: fetchedComments.length });
    } catch (error) {
      debugLog('Error loading comments', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    setIsCommenting(true);
    debugLog('Submitting comment', { postId: post.id, comment: newComment });

    try {
      const commentData = {
        content: newComment.trim(),
        post_id: post.id,
        author_id: user.id,
      };

      const result = await createComment(commentData);
      
      if (result) {
        debugLog('Comment created successfully', result);
        setNewComment('');
        setCommentsCount(prev => prev + 1);
        // Refresh comments
        await loadComments();
        toast.success('Comment added successfully!');
        onInteraction?.();
      } else {
        debugLog('Failed to create comment');
        toast.error('Failed to add comment. Please try again.');
      }
    } catch (error) {
      debugLog('Error creating comment', error);
      toast.error('Failed to add comment. Please try again.');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
                 title: `Post by ${getAuthorName()}`,
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const userProfile = user?.user_metadata;

  return (
    <div className="professional-card">
      <div className="card-spacing">
        {/* Post Header */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {('full_name' in post.author ? post.author.full_name : post.author.name)?.charAt(0) || post.author?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {('full_name' in post.author ? post.author.full_name : post.author.name) || post.author?.email?.split('@')[0] || 'User'}
              </h3>
              {('verified' in post.author && post.author.verified) && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckBadgeIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="capitalize">
                {('profile_type' in post.author ? post.author.profile_type : 'institution') === 'institution' ? 'Healthcare Institution' : 'Healthcare Professional'}
              </span>
              <span>•</span>
              <span>{formatRelativeTime(post.created_at)}</span>
              <span>•</span>
              <span className="capitalize">{post.visibility}</span>
            </div>
          </div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Post Media */}
        {post.image_url && (
          <div className="mb-4">
            <img
              src={post.image_url}
              alt="Post media"
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span>{post.likes_count || 0} likes</span>
            <span>{post.comments_count || 0} comments</span>
            <span>{post.shares_count || 0} shares</span>
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              isLiked
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <HeartIcon className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              isBookmarked
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookmarkIcon className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Save</span>
          </button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                      {('full_name' in comment.author ? comment.author.full_name : comment.author.name)?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {('full_name' in comment.author ? comment.author.full_name : comment.author.name) || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="mt-4 flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                  {userProfile?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 elegant-input text-sm"
                    />
                    <button
                      onClick={submitComment}
                      disabled={!newComment.trim() || isCommenting}
                      className="elegant-button-primary text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCommenting ? (
                        <div className="loading-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                          Post
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 