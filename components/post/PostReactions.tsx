'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reaction {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

const REACTIONS: Reaction[] = [
  { id: 'like', emoji: '👍', label: 'Like', color: 'text-blue-600' },
  { id: 'support', emoji: '🙌', label: 'Support', color: 'text-green-600' },
  { id: 'love', emoji: '❤️', label: 'Love', color: 'text-red-600' },
  { id: 'insightful', emoji: '💡', label: 'Insightful', color: 'text-yellow-600' },
  { id: 'celebrate', emoji: '🎉', label: 'Celebrate', color: 'text-purple-600' },
  { id: 'curious', emoji: '🤔', label: 'Curious', color: 'text-orange-600' },
];

interface PostReactionsProps {
  postId: string;
  userReaction?: string | null;
  reactionCounts: Record<string, number>;
  onReact: (reactionId: string) => void;
}

export default function PostReactions({ postId, userReaction, reactionCounts, onReact }: PostReactionsProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  const userReactionData = REACTIONS.find(r => r.id === userReaction);

  const handleLongPress = () => {
    setShowReactions(true);
  };

  const handleReaction = (reactionId: string) => {
    onReact(reactionId);
    setShowReactions(false);
  };

  const clearHoverTimeout = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleMouseEnter = () => {
    clearHoverTimeout();
    setIsHovering(true);
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    const timeout = setTimeout(() => {
      if (!isHovering) {
        setShowReactions(false);
      }
    }, 500);
    setHoverTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearHoverTimeout();
    };
  }, []);

  return (
    <div className="relative">
      {/* Main Like Button */}
      <button
        onClick={() => onReact('like')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleLongPress}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          userReaction
            ? `${userReactionData?.color} bg-blue-50 font-medium`
            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        {userReaction && userReactionData ? (
          <>
            <span className="text-lg">{userReactionData.emoji}</span>
            <span className="text-sm">{userReactionData.label}</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="text-sm">Like</span>
          </>
        )}
        {totalReactions > 0 && (
          <span className="text-xs text-gray-500">({totalReactions})</span>
        )}
      </button>

      {/* Reactions Popup */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 z-50 transform -translate-x-1/2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="bg-white rounded-full shadow-lg border border-gray-200 px-2 py-2 flex space-x-1">
              {REACTIONS.map((reaction) => (
                <motion.button
                  key={reaction.id}
                  onClick={() => handleReaction(reaction.id)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title={reaction.label}
                >
                  <span className="text-xl">{reaction.emoji}</span>
                </motion.button>
              ))}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
