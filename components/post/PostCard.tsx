'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  CheckBadgeIcon,
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
import type { Post, CommentWithAuthor, Profile } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

interface PostCardProps {
  post: Post & {
    profiles?: Profile;
    post_likes?: Array<{ id: string; user_id: string }>;
    post_comments?: Array<{ id: string; content: string; author_id: string; created_at: string }>;
  };
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

  // Function to refresh post data from database
  const refreshPostData = async () => {
    try {
      const { data: postData, error } = await supabase
        .from('posts')
        .select('likes_count, comments_count')
        .eq('id', post.id)
        .single();
      
      if (!error && postData) {
        setLikesCount(postData.likes_count || 0);
        setCommentsCount(postData.comments_count || 0);
        debugLog('Post data refreshed', postData);
      }
    } catch (error) {
      debugLog('Error refreshing post data', error);
    }
  };

  // Check if current user has liked the post
  useEffect(() => {
    if (!user?.id) return;
    
    const checkIfLiked = async () => {
      try {
        const liked = await isPostLiked(user.id, post.id);
        setIsLiked(liked);
        debugLog('Like status checked', { postId: post.id, liked });
      } catch (error) {
        debugLog('Error checking like status', error);
      }
    };

    checkIfLiked();
  }, [post.id, user?.id]);

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
      await refreshPostData(); // Refresh post data after like/unlike
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
        toast.error('Failed to add comment');
      }
    } catch (error) {
      debugLog('Error submitting comment', error);
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    toast('Share functionality coming soon!');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const getAuthorName = () => {
    return post.profiles?.full_name || 'Unknown User';
  };

  const getAuthorAvatar = () => {
    return post.profiles?.avatar_url || '';
  };

  const getAuthorHeadline = () => {
    return post.profiles?.headline || 'Healthcare Professional';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar
            src={getAuthorAvatar()}
            alt={getAuthorName()}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{getAuthorName()}</h3>
              {post.profiles?.user_type === 'institution' && (
                <CheckBadgeIcon className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-sm text-gray-500">{getAuthorHeadline()}</p>
            <p className="text-xs text-gray-400">
              {formatRelativeTime(post.created_at)} • Public
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <div className="mt-3">
            <img
              src={post.image_url}
              alt="Post media"
              className="w-full rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <span>{likesCount} likes</span>
          <span>{commentsCount} comments</span>
          <span>0 shares</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isLiked
              ? 'text-red-600 hover:bg-red-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isLiked ? (
            <HeartSolidIcon className="w-5 h-5" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span className="text-sm">Like</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          <span className="text-sm">Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ShareIcon className="w-5 h-5" />
          <span className="text-sm">Share</span>
        </button>

        <button
          onClick={handleBookmark}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isBookmarked
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isBookmarked ? (
            <BookmarkSolidIcon className="w-5 h-5" />
          ) : (
            <BookmarkIcon className="w-5 h-5" />
          )}
          <span className="text-sm">Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          {/* Add Comment */}
          <div className="flex items-start space-x-3 mb-4">
            <Avatar
              src={user?.user_metadata?.avatar_url}
              alt={user?.email || 'User'}
              size="sm"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={submitComment}
                  disabled={isCommenting || !newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCommenting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {isLoadingComments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar
                    src={'avatar_url' in comment.author ? comment.author.avatar_url || '' : comment.author.logo_url || ''}
                    alt={'full_name' in comment.author ? comment.author.full_name || 'User' : comment.author.name || 'User'}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {'full_name' in comment.author ? comment.author.full_name || 'Unknown User' : comment.author.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 