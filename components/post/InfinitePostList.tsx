'use client';

import { useState, useCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import PostCard from './PostCard';
import { Button } from '@/components/ui/Button';
import type { Post, Profile } from '@/types/database.types';

interface InfinitePostListProps {
  initialPosts: (Post & { author: Profile })[];
  fetchMorePosts: (page: number) => Promise<(Post & { author: Profile })[]>;
}

export default function InfinitePostList({ initialPosts, fetchMorePosts }: InfinitePostListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newPosts = await fetchMorePosts(page + 1);
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      setError('Failed to load more posts. Please try again.');
      console.error('Error loading more posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchMorePosts]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMorePosts();
    }
  }, [inView, hasMore, loading, loadMorePosts]);

  return (
    <div className="space-y-6">
      {/* Posts List */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </motion.div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-linkedin-primary">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-linkedin-primary"></div>
            <span className="text-sm font-medium">Loading more posts...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center py-8 space-y-4">
          <p className="text-red-600 text-sm">{error}</p>
          <Button 
            onClick={loadMorePosts} 
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && !loading && !error && (
        <div ref={ref} className="h-20 flex justify-center items-center">
          <Button 
            onClick={loadMorePosts}
            variant="ghost"
            className="text-linkedin-primary hover:text-linkedin-dark"
          >
            Load More Posts
          </Button>
        </div>
      )}

      {/* End of Posts */}
      {!hasMore && posts.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">🎉 You&apos;re all caught up!</p>
            <p className="text-xs text-muted-foreground">Check back later for more posts</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-16 h-16 bg-linkedin-light rounded-full flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">No posts yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Be the first to share something with your network!
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 