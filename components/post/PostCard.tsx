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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-premium hover:glow-effect transition-all duration-500 group"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar
              src={getAuthorAvatar()}
              alt={getAuthorName()}
              size="lg"
              className="ring-2 ring-white/20 group-hover:ring-indigo-400/50 transition-all duration-300"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 premium-gradient rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 text-lg truncate hover:text-indigo-600 transition-colors duration-300">
                {getAuthorName()}
              </h3>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse-slow"></div>
            </div>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              {getAuthorHeadline()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatRelativeTime(post.created_at)} • 🌍 Public
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="glass-effect rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 hover:text-indigo-500 transition-colors duration-300" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed text-base text-gray-900 font-medium">
            {post.content}
          </p>
        </div>
        
        {post.image_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
          >
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        )}

        {post.images && post.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid grid-cols-2 gap-3"
          >
            {post.images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-32 object-cover hover:scale-110 transition-transform duration-500"
                />
                {index === 3 && post.images!.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-bold text-lg">
                      +{post.images!.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {likesCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 hover:text-indigo-500 transition-colors duration-300"
              >
                <div className="w-5 h-5 premium-gradient rounded-full flex items-center justify-center">
                  <HeartSolidIcon className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium text-gray-700">{likesCount}</span>
              </motion.span>
            )}
            {commentsCount > 0 && (
              <span className="hover:text-indigo-500 transition-colors duration-300 font-medium text-gray-700">
                {commentsCount} comments
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-gray-500">{post.shares_count || 0} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={cn(
              "flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300",
              isLiked
                ? "text-red-500 bg-red-50 hover:bg-red-100"
                : "text-gray-700 hover:text-red-500 hover:bg-red-50"
            )}
          >
            {isLiked ? (
              <HeartSolidIcon className="h-5 w-5 animate-pulse-slow" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span className="text-sm">Like</span>
          </motion.button>

          {/* Comment Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleComments}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-gray-700 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300"
          >
            <ChatBubbleOvalLeftIcon className="h-5 w-5" />
            <span className="text-sm">Comment</span>
          </motion.button>

          {/* Share Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-gray-700 hover:text-green-500 hover:bg-green-50 transition-all duration-300"
          >
            <ShareIcon className="h-5 w-5" />
            <span className="text-sm">Share</span>
          </motion.button>

          {/* Bookmark Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBookmark}
            className={cn(
              "flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300",
              isBookmarked
                ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                : "text-gray-700 hover:text-yellow-500 hover:bg-yellow-50"
            )}
          >
            {isBookmarked ? (
              <BookmarkSolidIcon className="h-5 w-5" />
            ) : (
              <BookmarkIcon className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100"
          >
            {/* Comment Input */}
            {user && (
              <div className="p-6 pb-4 border-b border-slate-100">
                <div className="flex items-start space-x-3">
                  <Avatar
                    src={user.user_metadata?.avatar_url}
                    alt={user.user_metadata?.full_name || user.email || 'You'}
                    size="md"
                  />
                  <div className="flex-1">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          submitComment();
                        }
                      }}
                      className="border-slate-200 focus:border-primary-500"
                    />
                    {newComment.trim() && (
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={submitComment}
                          disabled={isCommenting}
                          className="modern-button-primary"
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
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoadingComments ? (
                <div className="p-6 text-center">
                  <div className="loading-dots text-slate-500">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p className="text-slate-500 mt-2">Loading comments...</p>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4 p-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <Avatar
                        src={('avatar_url' in comment.author ? comment.author.avatar_url : comment.author.logo_url) || undefined}
                        alt={('full_name' in comment.author ? comment.author.full_name : comment.author.name) || 'User'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm text-slate-900">
                              {('full_name' in comment.author ? comment.author.full_name : comment.author.name) || 'User'}
                            </h4>
                            <span className="text-xs text-slate-500">
                              {formatRelativeTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                        
                        {comment.likes_count > 0 && (
                          <div className="mt-1 ml-3">
                            <span className="text-xs text-slate-500">
                              {comment.likes_count} {comment.likes_count === 1 ? 'like' : 'likes'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500">
                  <ChatBubbleOvalLeftIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No comments yet. Be the first to comment!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Comments feature may need setup. Check COMMENTS_SETUP.md for details.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 