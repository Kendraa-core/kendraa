'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import ClickableProfileName from '@/components/common/ClickableProfileName';
import ShareButton from '@/components/common/ShareButton';
import PostReactions from '@/components/post/PostReactions';
import {
  ChatBubbleOvalLeftIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
} from '@heroicons/react/24/solid';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  getPostComments,
  createComment,
  savePost,
  unsavePost,
  isPostSaved,
  likePost,
  unlikePost,
  isPostLiked,
} from '@/lib/queries';
import type { Post, CommentWithAuthor, Profile } from '@/types/database.types';
import { 
  handleSupabaseError, 
  logError, 
  getErrorMessage, 
  validateStringLength
} from '@/utils/errorHandler';

interface PostCardProps {
  post: Post & {
    profiles?: Profile;
  };
  onInteraction?: () => void;
}

export default function PostCard({ post, onInteraction }: PostCardProps) {
  const { user } = useAuth();
  
  // State management
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post?.comments_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);

  // Debug logging
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[PostCard] ${message}`, data);
  };

  // Initialize post state on mount
  useEffect(() => {
    if (!post?.id || !user?.id) return;

    const initializePostState = async () => {
      try {
        const [saved, reactionType] = await Promise.all([
          isPostSaved(post.id, user.id),
          isPostLiked(user.id, post.id)
        ]);
        setIsBookmarked(saved);
        setUserReaction(reactionType);
        debugLog('Post state initialized', { postId: post.id, saved, reactionType });
      } catch (error) {
        debugLog('Error initializing post state', error);
        setIsBookmarked(false);
        setUserReaction(null);
      }
    };

    initializePostState();
  }, [post?.id, user?.id]);

  // Refresh post data when post changes
  useEffect(() => {
    if (post?.id) {
      setLikesCount(post.likes_count || 0);
      setCommentsCount(post.comments_count || 0);
    }
  }, [post?.id, post?.likes_count, post?.comments_count]);

  // Validate post data
  if (!post || !post.id) {
    console.error('[PostCard] Invalid post data:', post);
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-red-500">Error: Invalid post data</p>
      </div>
    );
  }

  const handleReaction = async (reactionType: string) => {
    if (!user?.id) {
      toast.error('Please log in to react to posts');
      return;
    }

    if (isReacting) return;

    setIsReacting(true);
    debugLog('Handling reaction', { postId: post.id, reactionType, currentReaction: userReaction });

    try {
      let success = false;
      
      if (userReaction === reactionType) {
        // Remove reaction
        success = await unlikePost(post.id, user.id);
        if (success) {
          setUserReaction(null);
          setLikesCount(prev => Math.max(0, prev - 1));
          toast.success('Reaction removed');
        } else {
          toast.error('Failed to remove reaction');
        }
      } else if (userReaction) {
        // User already has a different reaction
        toast.error('You can only have one reaction per post. Remove your current reaction first.');
      } else {
        // Add new reaction
        success = await likePost(post.id, user.id, reactionType);
        if (success) {
          setUserReaction(reactionType);
          setLikesCount(prev => prev + 1);
          toast.success('Reaction added');
        } else {
          toast.error('Failed to add reaction');
        }
      }
      
      onInteraction?.();
    } catch (error: any) {
      logError('PostCard', error, { 
        postId: post.id, 
        action: 'handleReaction',
        reactionType,
        userId: user.id
      });
      
      const appError = handleSupabaseError(error);
      toast.error(getErrorMessage(appError));
    } finally {
      setIsReacting(false);
    }
  };

  const handleBookmark = async () => {
    if (!user?.id) {
      toast.error('Please log in to save posts');
      return;
    }

    debugLog('Handling bookmark', { postId: post.id, currentBookmarked: isBookmarked });

    try {
      if (isBookmarked) {
        const success = await unsavePost(post.id, user.id);
        if (success) {
          setIsBookmarked(false);
          toast.success('Post removed from saved items');
        } else {
          toast.error('Failed to remove post from saved items');
        }
      } else {
        const success = await savePost(post.id, user.id);
        if (success) {
          setIsBookmarked(true);
          toast.success('Post saved to your collection');
        } else {
          toast.error('Failed to save post');
        }
      }
      
      onInteraction?.();
    } catch (error: any) {
      logError('PostCard', error, { 
        postId: post.id, 
        action: 'handleBookmark',
        userId: user.id
      });
      
      const appError = handleSupabaseError(error);
      toast.error(getErrorMessage(appError));
    }
  };

  const loadComments = async () => {
    if (!post?.id) return;

    setIsLoadingComments(true);
    debugLog('Loading comments', { postId: post.id });
    
    try {
      const fetchedComments = await getPostComments(post.id, 5);
      
      if (Array.isArray(fetchedComments)) {
        setComments(fetchedComments);
        debugLog('Comments loaded', { count: fetchedComments.length });
      } else {
        setComments([]);
        toast.error('Invalid comments data received');
      }
    } catch (error: any) {
      logError('PostCard', error, { postId: post.id, action: 'loadComments' });
      const appError = handleSupabaseError(error);
      toast.error(getErrorMessage(appError));
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to comment');
      return;
    }

    const lengthError = validateStringLength(newComment.trim(), 'Comment', 1, 1000);
    if (lengthError) {
      toast.error(lengthError.message);
      return;
    }

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
        setShowCommentBox(false);
        setCommentsCount(prev => prev + 1);
        await loadComments();
        toast.success('Comment added successfully!');
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error: any) {
      logError('PostCard', error, { 
        postId: post.id, 
        action: 'submitComment',
        commentLength: newComment.length 
      });
      
      const appError = handleSupabaseError(error);
      toast.error(getErrorMessage(appError));
    } finally {
      setIsCommenting(false);
    }
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
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Avatar
            src={getAuthorAvatar()}
            alt={getAuthorName()}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <ClickableProfileName
                userId={post.author_id}
                name={getAuthorName()}
                userType={post.profiles?.user_type}
              />
            </div>
            <p className="text-sm text-gray-500 truncate">{getAuthorHeadline()}</p>
            <p className="text-xs text-gray-400">
              {formatRelativeTime(post.created_at)} • Public
            </p>
          </div>
        </div>
        <button
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap break-words">{post.content}</p>
        
        {post.image_url && (
          <div className="mt-3">
            <Image
              src={post.image_url}
              alt="Post media"
              width={600}
              height={400}
              className="w-full rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          {likesCount > 0 && (
            <span className="text-gray-500">
              {likesCount} {likesCount === 1 ? 'reaction' : 'reactions'}
            </span>
          )}
          {commentsCount > 0 && (
            <span className="text-gray-500">
              {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <PostReactions
          postId={post.id}
          userReaction={userReaction}
          reactionCounts={{ like: likesCount }}
          onReact={handleReaction}
        />

        <button
          onClick={() => {
            setShowCommentBox(!showCommentBox);
            if (!showComments) {
              setShowComments(true);
              loadComments();
            }
          }}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Comment</span>
        </button>

        <ShareButton 
          title={`Post by ${post.profiles?.full_name || 'User'}`}
          description={post.content}
          url={`${window.location.origin}/post/${post.id}`}
        />

        <button
          onClick={handleBookmark}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isBookmarked
              ? 'text-primary-600 hover:bg-primary-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isBookmarked ? (
            <BookmarkSolidIcon className="w-5 h-5" />
          ) : (
            <BookmarkIcon className="w-5 h-5" />
          )}
          <span className="text-sm hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          {/* Add Comment */}
          {showCommentBox && (
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
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={submitComment}
                    disabled={isCommenting || !newComment.trim()}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCommenting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {isLoadingComments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => {
                if (!comment || !comment.id || !comment.author_id) {
                  return null;
                }

                const authorName = comment.author && 'full_name' in comment.author 
                  ? comment.author.full_name || 'Unknown User'
                  : 'Unknown User';

                const authorAvatar = comment.author && 'avatar_url' in comment.author 
                  ? comment.author.avatar_url || ''
                  : '';

                const authorType = comment.author && 'user_type' in comment.author 
                  ? comment.author.user_type 
                  : 'individual';

                return (
                  <div key={comment.id} className="flex items-start space-x-3">
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
                            className="text-sm"
                          />
                          <span className="text-xs text-gray-500">
                            {comment.created_at ? formatRelativeTime(comment.created_at) : 'Just now'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 break-words">{comment.content || 'Comment content unavailable'}</p>
                      </div>
                    </div>
                  </div>
                );
              })
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