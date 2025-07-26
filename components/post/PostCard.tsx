'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import type { Post, Profile } from '@/types/database.types';

interface PostCardProps {
  post: Post & { author: Profile };
}

export default function PostCard({ post }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = post.content.length > 280;
  const displayContent = shouldTruncate && !isExpanded
    ? post.content.slice(0, 280) + '...'
    : post.content;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/profile/${post.author.id}`} className="flex-shrink-0">
              {post.author.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.full_name || ''}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              )}
            </Link>
            <div>
              <Link
                href={`/profile/${post.author.id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
              >
                {post.author.full_name || 'Anonymous'}
              </Link>
              <p className="text-sm text-gray-500">{post.author.headline}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-900 whitespace-pre-wrap">
            {displayContent}
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-blue-600 hover:text-blue-700"
              >
                {isExpanded ? 'See less' : 'See more'}
              </button>
            )}
          </p>

          {post.image_url && (
            <div className="mt-4 relative aspect-video">
              <Image
                src={post.image_url}
                alt="Post"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t">
          <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span className="text-sm font-medium">Like</span>
          </button>

          <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm font-medium">Repost</span>
          </button>

          <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
} 