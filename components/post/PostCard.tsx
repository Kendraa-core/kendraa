'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import ClickableProfileName from '@/components/common/ClickableProfileName';
import ShareButton from '@/components/common/ShareButton';
import PostReactions from '@/components/post/PostReactions';
import Comment from '@/components/post/Comment';
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
import { cn } from '@/lib/utils';

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
  const [showAllComments, setShowAllComments] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);

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
      } catch (error) {
        // Silently fail, UI will just show default state
      }
    };

    initializePostState();
  }, [post?.id, user?.id]);

  // Load comments by default if post has comments
  useEffect(() => {
    if (post?.id && post.comments_count && post.comments_count > 0) {
      setShowComments(true);
      loadComments();
    }
  }, [post?.id, post?.comments_count]);

  // Refresh post data when post changes
  useEffect(() => {
    if (post?.id) {
      setLikesCount(post.likes_count || 0);
      setCommentsCount(post.comments_count || 0);
    }
  }, [post?.id, post?.likes_count, post?.comments_count]);

  // Validate post data
  if (!post || !post.id) {
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

    const originalReaction = userReaction;
    const originalLikesCount = likesCount;

    try {
      if (userReaction === reactionType) {
        setUserReaction(null);
        setLikesCount(prev => Math.max(0, prev - 1));
        await unlikePost(post.id, user.id);
      } else {
        setUserReaction(reactionType);
        setLikesCount(prev => (originalReaction ? prev : prev + 1));
        await likePost(post.id, user.id, reactionType);
      }
      onInteraction?.();
    } catch (error) {
      setUserReaction(originalReaction);
      setLikesCount(originalLikesCount);
      toast.error("Failed to update reaction.");
    } finally {
      setIsReacting(false);
    }
  };

  const handleBookmark = async () => {
    if (!user?.id) {
      toast.error('Please log in to save posts');
      return;
    }
    const originalBookmarkState = isBookmarked;
    setIsBookmarked(!originalBookmarkState);

    try {
      if (originalBookmarkState) {
        await unsavePost(post.id, user.id);
      } else {
        await savePost(post.id, user.id);
      }
      onInteraction?.();
    } catch (error) {
      setIsBookmarked(originalBookmarkState);
      toast.error('Failed to update bookmark.');
    }
  };

  const loadComments = async () => {
    if (!post?.id) return;
    setIsLoadingComments(true);
    try {
      const fetchedComments = await getPostComments(post.id);
      const topLevelComments = fetchedComments.filter(comment => !comment.parent_id);
      setComments(topLevelComments);
    } catch (error: any) {
      toast.error("Failed to load comments.");
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

    try {
      // THE FIX: Call the updated `createComment` function with the new, simpler signature.
      // We no longer pass the author_id because the function gets it securely itself.
      const result = await createComment(post.id, newComment.trim());
      
      if (result) {
        setNewComment('');
        setShowCommentBox(false);
        setCommentsCount(prev => prev + 1);
        await loadComments();
        toast.success('Comment added successfully!');
        onInteraction?.();
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
        <p className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed">{post.content}</p>
        
        {post.image_url && (
          <div className="mt-3 relative aspect-video">
            <Image
              src={post.image_url}
              alt="Post media"
              layout="fill"
              className="rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{likesCount} {likesCount === 1 ? 'reaction' : 'reactions'}</span>
        <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
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
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Comment</span>
        </button>
        <ShareButton title={`Post by ${getAuthorName()}`} url={`${window.location.origin}/post/${post.id}`} />
        <button
          onClick={handleBookmark}
          className={cn("flex items-center space-x-2 px-3 py-2 rounded-lg", isBookmarked ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-100")}
        >
          {isBookmarked ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
          <span className="text-sm font-medium">Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 pt-4 mt-4">
          {/* Add Comment */}
          {showCommentBox && (
            <div className="flex items-start space-x-3">
              <Avatar src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || 'User'} size="sm" />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                  rows={1}
                  autoFocus
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={submitComment}
                    disabled={isCommenting || !newComment.trim()}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold disabled:opacity-50"
                  >
                    {isCommenting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {isLoadingComments && <p>Loading comments...</p>}
          {!isLoadingComments && comments.length > 0 && (
            <div className="space-y-4">
                {(showAllComments ? comments : comments.slice(0, 2)).map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    onReplyAdded={loadComments}
                    onReactionChange={loadComments}
                  />
                ))}
                
                {comments.length > 2 && (
                  <button
                    onClick={() => setShowAllComments(!showAllComments)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAllComments 
                      ? `Show less` 
                      : `Show ${comments.length - 2} more ${comments.length - 2 === 1 ? 'comment' : 'comments'}`
                    }
                  </button>
                )}
            </div>
          )}
          {!isLoadingComments && comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
        </div>
      )}
    </div>
  );
}

