'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import { getPosts, type PostWithAuthor } from '@/lib/queries';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

// Memoized loading skeleton component
const PostSkeleton = React.memo(() => (
  <Card className="modern-card mb-6">
    <CardContent className="p-6">
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
        <div className="flex space-x-4">
          <div className="h-8 bg-slate-200 rounded w-16"></div>
          <div className="h-8 bg-slate-200 rounded w-20"></div>
          <div className="h-8 bg-slate-200 rounded w-16"></div>
        </div>
      </div>
    </CardContent>
  </Card>
));

// Memoized empty state component
const EmptyState = React.memo(() => (
  <Card className="modern-card">
    <CardContent className="p-12 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">No posts yet</h3>
      <p className="text-slate-500">Be the first to share something with the community!</p>
    </CardContent>
  </Card>
));

// Memoized error state component
const ErrorState = React.memo(({ onRetry }: { onRetry: () => void }) => (
  <Card className="modern-card">
    <CardContent className="p-12 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load posts</h3>
      <p className="text-slate-500 mb-4">Something went wrong while loading the posts.</p>
             <Button onClick={onRetry} variant="outline" size="sm">
         <ArrowPathIcon className="w-4 h-4 mr-2" />
         Try Again
       </Button>
    </CardContent>
  </Card>
));

interface PostListProps {
  refreshTrigger?: number;
}

const PostList = React.memo(({ refreshTrigger = 0 }: PostListProps) => {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const POSTS_PER_PAGE = 10;

  // Debug logging
  const debugLog = useCallback((message: string, data?: unknown) => {
    console.log(`[PostList] ${message}`, data);
  }, []);

  // Memoized fetch function
  const fetchPosts = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
        setError(false);
      } else {
        setLoadingMore(true);
      }

      debugLog('Fetching posts', { page: pageNum, append });

      const newPosts = await getPosts(POSTS_PER_PAGE, pageNum * POSTS_PER_PAGE);
      
      if (newPosts.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }

      if (append) {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
      } else {
        setPosts(newPosts);
      }

      debugLog('Posts fetched successfully', { 
        count: newPosts.length, 
        total: append ? posts.length + newPosts.length : newPosts.length 
      });
    } catch (err) {
      debugLog('Error fetching posts', err);
      setError(true);
      if (!append) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [posts.length, debugLog]);

  // Initial load and refresh trigger effect
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0, false);
  }, [refreshTrigger]); // Only depend on refreshTrigger

  // Load more posts
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  }, [page, loadingMore, hasMore, fetchPosts]);

  // Handle post interaction (refresh single post or refetch if needed)
  const handlePostInteraction = useCallback(() => {
    // For now, just log the interaction
    debugLog('Post interaction detected');
    // Could implement more sophisticated updates here
  }, [debugLog]);

  // Retry function for error state
  const handleRetry = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0, false);
  }, [fetchPosts]);

  // Memoized post components to prevent unnecessary re-renders
  const postComponents = useMemo(() => 
    posts.map((post) => (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PostCard 
          post={post} 
          onInteraction={handlePostInteraction}
        />
      </motion.div>
    )), 
    [posts, handlePostInteraction]
  );

  // Show loading skeleton on initial load
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show error state
  if (error && posts.length === 0) {
    return <ErrorState onRetry={handleRetry} />;
  }

  // Show empty state
  if (!loading && posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Posts */}
      {postComponents}

      {/* Load More / Loading More */}
      {hasMore && (
        <div className="text-center py-6">
          {loadingMore ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-primary-600 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-primary-600 rounded-full animate-pulse delay-75"></div>
              <div className="w-4 h-4 bg-primary-600 rounded-full animate-pulse delay-150"></div>
              <span className="ml-3 text-slate-600">Loading more posts...</span>
            </div>
          ) : (
            <Button
              onClick={loadMore}
              variant="outline"
              className="modern-button-secondary"
            >
              Load More Posts
            </Button>
          )}
        </div>
      )}

      {/* End of posts indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-slate-500">
          <p>You've reached the end! 🎉</p>
        </div>
      )}
    </div>
  );
});

PostList.displayName = 'PostList';

export default PostList; 