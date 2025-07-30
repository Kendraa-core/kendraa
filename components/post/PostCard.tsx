'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon, 
  BookmarkIcon as BookmarkSolidIcon 
} from '@heroicons/react/24/solid';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Post, Profile } from '@/types/database.types';

interface PostCardProps {
  post: Post & { author: Profile };
}

export default function PostCard({ post }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 1);

  const shouldTruncate = post.content.length > 280;
  const displayContent = shouldTruncate && !isExpanded
    ? post.content.slice(0, 280) + '...'
    : post.content;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="bg-white hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href={`/profile/${post.author.id}`} className="flex-shrink-0 group">
                <div className="relative">
                  {post.author.avatar_url ? (
                    <Image
                      src={post.author.avatar_url}
                      alt={post.author.full_name || ''}
                      width={48}
                      height={48}
                      className="rounded-full object-cover ring-2 ring-transparent group-hover:ring-linkedin-primary transition-all duration-200"
                    />
                  ) : (
                    <UserCircleIcon className="w-12 h-12 text-gray-400 group-hover:text-linkedin-primary transition-colors duration-200" />
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/profile/${post.author.id}`}
                  className="font-semibold text-gray-900 hover:text-linkedin-primary transition-colors duration-200 block truncate"
                >
                  {post.author.full_name || 'Anonymous'}
                </Link>
                <p className="text-sm text-muted-foreground truncate">{post.author.headline}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  {formatRelativeTime(post.created_at)}
                  <span className="mx-1">•</span>
                  <span className="text-linkedin-primary">🌐</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="text-lg">⋯</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="mb-4">
            <p className={cn(
              "text-gray-900 leading-relaxed whitespace-pre-wrap",
              "text-sm md:text-base"
            )}>
              {displayContent}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-linkedin-primary hover:text-linkedin-dark text-sm font-medium mt-2 transition-colors duration-200"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {post.image_url && (
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={post.image_url}
                alt="Post image"
                width={600}
                height={400}
                className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between py-2 mb-3 text-sm text-muted-foreground border-b">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <HeartSolidIcon className="w-4 h-4 text-red-500" />
                <span>{likeCount} likes</span>
              </span>
              <span>{Math.floor(Math.random() * 20) + 1} comments</span>
            </div>
            <span>{Math.floor(Math.random() * 50) + 1} shares</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={cn(
                    "flex items-center space-x-2 hover:bg-red-50 transition-colors duration-200",
                    isLiked && "text-red-600"
                  )}
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-600" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span>Like</span>
                </Button>
              </motion.div>

              <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-blue-50">
                <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                <span>Comment</span>
              </Button>

              <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-green-50">
                <ShareIcon className="w-5 h-5" />
                <span>Share</span>
              </Button>
            </div>

            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmark}
                className={cn(
                  "hover:bg-yellow-50 transition-colors duration-200",
                  isBookmarked && "text-yellow-600"
                )}
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="w-5 h-5 text-yellow-600" />
                ) : (
                  <BookmarkIcon className="w-5 h-5" />
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 