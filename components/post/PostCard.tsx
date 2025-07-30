'use client';

import { useState, useEffect } from 'react';
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
  type PostWithAuthor,
  type CommentWithAuthor,
} from '@/lib/queries';

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

  const handleComment = () => {
    if (!user?.id) {
      toast.error('Please log in to comment');
      return;
    }
    
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

  const handleSubmitComment = async () => {
    if (!user?.id || !newComment.trim()) return;

    setIsCommenting(true);
    debugLog('Submitting comment', { postId: post.id, content: newComment.trim() });

    try {
      const comment = await createComment({
        post_id: post.id,
        author_id: user.id,
        author_type: 'individual',
        content: newComment.trim(),
      });

      if (comment) {
        // Add the new comment to the local state
        const commentWithAuthor: CommentWithAuthor = {
          ...comment,
          author: {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email || 'Anonymous',
            avatar_url: user.user_metadata?.avatar_url,
            email: user.email || '',
            created_at: '',
            updated_at: '',
            headline: null,
            bio: null,
            location: null,
            website: null,
            phone: null,
            specialization: null,
            is_premium: false,
            profile_views: 0,
            user_type: 'individual',
            banner_url: null,
          }
        };

                 setComments((prev: CommentWithAuthor[]) => [commentWithAuthor, ...prev]);
         setCommentsCount((prev: number) => prev + 1);
        setNewComment('');
        toast.success('Comment added!');
        debugLog('Comment submitted successfully');
        onInteraction?.();
      } else {
        debugLog('Failed to submit comment');
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
    if (navigator.share) {
      navigator.share({
                 title: `Post by ${(post.author as any).full_name || (post.author as any).name}`,
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
      className="modern-card mb-6"
    >
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src={(post.author as any).avatar_url || (post.author as any).logo_url}
              alt={(post.author as any).full_name || (post.author as any).name || 'User'}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">
                {(post.author as any).full_name || (post.author as any).name}
              </h3>
              <p className="text-sm text-slate-600 truncate">
                {(post.author as any).headline || (post.author as any).type}
              </p>
              <p className="text-xs text-slate-500">
                {formatRelativeTime(post.created_at)}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <p className="text-slate-900 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
        
        {post.image_url && (
          <div className="mt-4 rounded-xl overflow-hidden">
            <img
              src={post.image_url}
              alt="Post content"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        {post.images && post.images.length > 1 && (
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                         {post.images.slice(0, 4).map((image: string, index: number) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && post.images!.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{post.images!.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      {(likesCount > 0 || commentsCount > 0) && (
        <div className="px-6 py-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center space-x-4">
              {likesCount > 0 && (
                <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
              )}
              {commentsCount > 0 && (
                <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
              )}
            </div>
            {post.shares_count > 0 && (
              <span>{post.shares_count} {post.shares_count === 1 ? 'share' : 'shares'}</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 py-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                'flex items-center space-x-2 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors',
                isLiked && 'text-red-600 bg-red-50'
              )}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span className="text-sm">Like</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center space-x-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <ChatBubbleOvalLeftIcon className="w-5 h-5" />
              <span className="text-sm">Comment</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2 text-slate-600 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              <ShareIcon className="w-5 h-5" />
              <span className="text-sm">Share</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={cn(
              'text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors',
              isBookmarked && 'text-amber-600 bg-amber-50'
            )}
          >
            {isBookmarked ? (
              <BookmarkSolidIcon className="w-5 h-5" />
            ) : (
              <BookmarkIcon className="w-5 h-5" />
            )}
          </Button>
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
                          handleSubmitComment();
                        }
                      }}
                      className="border-slate-200 focus:border-primary-500"
                    />
                    {newComment.trim() && (
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={handleSubmitComment}
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
                         src={(comment.author as any).avatar_url || (comment.author as any).logo_url}
                         alt={(comment.author as any).full_name || (comment.author as any).name || 'User'}
                         size="sm"
                       />
                       <div className="flex-1 min-w-0">
                         <div className="bg-slate-50 rounded-xl p-3">
                           <div className="flex items-center space-x-2 mb-1">
                             <h4 className="font-medium text-sm text-slate-900">
                               {(comment.author as any).full_name || (comment.author as any).name}
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
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 