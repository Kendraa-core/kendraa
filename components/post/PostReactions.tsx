'use client';

import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface PostReactionsProps {
  postId: string;
  userReaction?: string | null;
  reactionCounts: Record<string, number>;
  onReact: (reactionId: string) => void;
}

export default function PostReactions({ postId, userReaction, reactionCounts, onReact }: PostReactionsProps) {
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  const isLiked = userReaction === 'like';

  return (
    <button
      onClick={() => onReact('like')}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        isLiked
          ? 'text-red-600 bg-red-50 font-medium'
          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
      }`}
    >
      {isLiked ? (
        <HeartSolidIcon className="w-5 h-5" />
      ) : (
        <HeartIcon className="w-5 h-5" />
      )}
      <span className="text-sm">Like</span>
      {totalReactions > 0 && (
        <span className="text-xs text-gray-500">({totalReactions})</span>
      )}
    </button>
  );
}
