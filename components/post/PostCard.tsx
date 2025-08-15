'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import ClickableProfileName from '@/components/common/ClickableProfileName';
import ShareButton from '@/components/common/ShareButton';
import PostReactions from '@/components/post/PostReactions';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
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
  addPostReaction,
  removePostReaction,
  getUserPostReaction,
  getPostReactionCounts,
} from '@/lib/queries';
import type { Post, CommentWithAuthor, Profile } from '@/types/database.types';
import { getSupabase } from '@/lib/queries';
import { 
  handleSupabaseError, 
  logError, 
  getErrorMessage, 
  validateStringLength,
  ValidationError 
} from '@/utils/errorHandler';

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
  
  // Initialize state first, before any conditional returns
  const [isLiked, setIsLiked] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null); // Track user's reaction type
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post?.comments_count || 0);
  const [showComments, setShowComments] = useState(true); // Show comments by default
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false); // Control comment textbox visibility
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false); // For showing more than 2 comments

  // Debug logging
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[PostCard] ${message}`, data);
  };

  // Function to refresh post data from database
  const refreshPostData = async () => {
    if (!post?.id) return;
    
    try {
      const { data: postData, error } = await getSupabase()
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

  // Check if current user has reacted to the post
  useEffect(() => {
    if (!user?.id || !post?.id) return;
    
    const checkUserReaction = async () => {
      try {
        const reaction = await getUserPostReaction(post.id, user.id);
        if (reaction) {
          setIsLiked(true);
          setUserReaction(reaction);
        } else {
          setIsLiked(false);
          setUserReaction(null);
        }
        debugLog('User reaction checked', { postId: post.id, reaction });
      } catch (error) {
        debugLog('Error checking user reaction', error);
        setIsLiked(false);
        setUserReaction(null);
      }
    };

    checkUserReaction();
  }, [post?.id, user?.id]);

  // Automatically load comments when component mounts
  useEffect(() => {
    if (post?.id) {
      loadComments();
    }
  }, [post?.id]); // Load comments on mount

  // Validate post data after hooks are declared
  if (!post || !post.id) {
    console.error('[PostCard] Invalid post data:', post);
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-red-500">Error: Invalid post data</p>
      </div>
    );
  }

  const handleReaction = async (reactionId: string) => {
    if (!user?.id) {
      toast.error('Please log in to react to posts');
      return;
    }

    if (!post?.id) {
      toast.error('Invalid post. Cannot react.');
      return;
    }

    debugLog('Handling reaction', { postId: post.id, reactionId, currentReaction: userReaction });

    try {
      // If user already has this reaction, remove it (toggle off)
      if (userReaction === reactionId) {
        const success = await removePostReaction(post.id, user.id);
        if (success) {
          setIsLiked(false);
          setUserReaction(null);
          setLikesCount((prev: number) => Math.max(0, prev - 1));
          debugLog('Reaction removed successfully');
        } else {
          toast.error('Failed to remove reaction. Please try again.');
        }
      } else {
        // Add or update reaction
        const success = await addPostReaction(post.id, user.id, reactionId);
        if (success) {
          setIsLiked(true);
          setUserReaction(reactionId);
          // If this is a new reaction (not updating existing), increment count
          if (!userReaction) {
            setLikesCount((prev: number) => prev + 1);
          }
          debugLog('Reaction added successfully');
        } else {
          toast.error('Failed to add reaction. Please try again.');
        }
      }
      
      // Don't call onInteraction to prevent page reload
    } catch (error: any) {
      logError('PostCard', error, { 
        postId: post.id, 
        action: 'handleReaction',
        userId: user.id,
        reactionId 
      });
      
      // Handle error with proper error handling utility
      const appError = handleSupabaseError(error);
      toast.error(getErrorMessage(appError));
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      loadComments();
    }
  };

  const loadComments = async () => {
    if (!post?.id) {
      logError('PostCard', new Error('Cannot load comments: Invalid post ID'));
      return;
    }

    setIsLoadingComments(true);
    debugLog('Loading comments', { postId: post.id });
    
    try {
      // Load top 5 comments by default
      const fetchedComments = await getPostComments(post.id, 5);
      
      // Validate comments data
      if (Array.isArray(fetchedComments)) {
        setComments(fetchedComments);
        debugLog('Comments loaded', { count: fetchedComments.length });
      } else {
        logError('PostCard', new Error('Invalid comments data received'), { fetchedComments });
        setComments([]);
        toast.error('Invalid comments data received');
      }
    } catch (error: any) {
      logError('PostCard', error, { postId: post.id, action: 'loadComments' });
      
      // Handle error with proper error handling utility
      const appError = handleSupabaseError(error);
      toast.error(getErrorMessage(appError));
      
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async () => {
    // Validate input
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to comment');
      return;
    }

    if (!post?.id) {
      toast.error('Invalid post. Cannot add comment.');
      return;
    }

    // Validate comment length using utility
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
         setShowCommentBox(false); // Hide comment box after posting
         setCommentsCount(prev => prev + 1);
         // Refresh comments
         await loadComments();
         toast.success('Comment added successfully!');
         // Don't call onInteraction to prevent page reload
       } else {
        toast.error('Failed to add comment. Please try again.');
      }
    } catch (error: any) {
      logError('PostCard', error, { 
        postId: post.id, 
        action: 'submitComment',
        commentLength: newComment.length 
      });
      
      // Handle error with proper error handling utility
      const appError = handleSupabaseError(error);
      toast.error(getErrorMessage(appError));
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
              <ClickableProfileName
                userId={post.author_id}
                name={getAuthorName()}
                userType={post.profiles?.user_type}
              />
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
          <span>0 shares</span>
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
            setShowCommentBox(!showCommentBox); // Toggle comment box
            if (!showComments) {
              setShowComments(true);
              loadComments();
            }
          }}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          <span className="text-sm">Comment</span>
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
          <span className="text-sm">Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          {/* Add Comment - Hidden by default, shown only when user clicks "Comment" */}
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
              <>
                {/* Show top 5 comments or all if showAllComments is true */}
                {(showAllComments ? comments : comments.slice(0, 2)).map((comment) => {
                  // Validate comment data
                  if (!comment || !comment.id || !comment.author_id) {
                    console.error('[PostCard] Invalid comment data:', comment);
                    return null;
                  }

                  // Safely extract author data
                  const authorName = comment.author && 'full_name' in comment.author 
                    ? comment.author.full_name || 'Unknown User'
                    : comment.author && 'name' in comment.author
                    ? comment.author.name || 'Unknown User'
                    : 'Unknown User';

                  const authorAvatar = comment.author && 'avatar_url' in comment.author 
                    ? comment.author.avatar_url || ''
                    : comment.author && 'logo_url' in comment.author
                    ? comment.author.logo_url || ''
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
                      <div className="flex-1">
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
                          <p className="text-sm text-gray-700">{comment.content || 'Comment content unavailable'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Show more/less button if there are more than 5 comments */}
                {comments.length > 2 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowAllComments(!showAllComments)}
                      className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                    >
                      {showAllComments ? `Show less` : `Show ${comments.length - 2} more comments`}
                    </button>
                  </div>
                )}
              </>
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