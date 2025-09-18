'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  HeartIcon,
  HandThumbUpIcon,
  HandRaisedIcon,
  LightBulbIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandRaisedIcon as HandRaisedSolidIcon,
  LightBulbIcon as LightBulbSolidIcon,
  SparklesIcon as SparklesSolidIcon,
  QuestionMarkCircleIcon as QuestionMarkCircleSolidIcon,
} from '@heroicons/react/24/solid';
import { likeComment, unlikeComment, isCommentLiked } from '@/lib/queries';
import toast from 'react-hot-toast';

interface CommentReactionsProps {
  commentId: string;
  likesCount: number;
  onReactionChange?: () => void;
}

const REACTIONS = [
  { type: 'like', label: 'Like', icon: HandThumbUpIcon, solidIcon: HandThumbUpSolidIcon, color: 'text-blue-500' },
  { type: 'love', label: 'Love', icon: HeartIcon, solidIcon: HeartSolidIcon, color: 'text-red-500' },
  { type: 'support', label: 'Support', icon: HandRaisedIcon, solidIcon: HandRaisedSolidIcon, color: 'text-green-500' },
  { type: 'insightful', label: 'Insightful', icon: LightBulbIcon, solidIcon: LightBulbSolidIcon, color: 'text-yellow-500' },
  { type: 'celebrate', label: 'Celebrate', icon: SparklesIcon, solidIcon: SparklesSolidIcon, color: 'text-purple-500' },
  { type: 'curious', label: 'Curious', icon: QuestionMarkCircleIcon, solidIcon: QuestionMarkCircleSolidIcon, color: 'text-orange-500' },
];

export default function CommentReactions({ commentId, likesCount, onReactionChange }: CommentReactionsProps) {
  const { user } = useAuth();
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const loadUserReaction = useCallback(async () => {
    try {
      const reaction = await isCommentLiked(commentId, user!.id);
      setCurrentReaction(reaction);
    } catch (error) {
      // Silent error handling for user reaction
    }
  }, [commentId, user]);

  useEffect(() => {
    if (user?.id && commentId) {
      loadUserReaction();
    }
  }, [user?.id, commentId, loadUserReaction]);

  const handleReaction = async (reactionType: string) => {
    if (!user?.id) {
      toast.error('Please log in to react to comments');
      return;
    }

    if (isReacting) return;

    setIsReacting(true);
    setShowReactions(false);

    try {
      let success = false;
      
      if (currentReaction === reactionType) {
        // Remove reaction
        success = await unlikeComment(commentId, user.id);
        if (success) {
          setCurrentReaction(null);
          toast.success('Reaction removed');
        } else {
          toast.error('Failed to remove reaction');
        }
      } else if (currentReaction) {
        // User already has a different reaction
        toast.error('You can only have one reaction per comment. Remove your current reaction first.');
      } else {
        // Add new reaction
        success = await likeComment(commentId, user.id, reactionType);
        if (success) {
          setCurrentReaction(reactionType);
          toast.success('Reaction added');
        } else {
          toast.error('Failed to add reaction');
        }
      }
      
      onReactionChange?.();
    } catch (error: any) {
      toast.error('Failed to update reaction');
    } finally {
      setIsReacting(false);
    }
  };

  const getCurrentReactionIcon = () => {
    if (!currentReaction) return null;
    const reaction = REACTIONS.find(r => r.type === currentReaction);
    return reaction ? reaction.solidIcon : null;
  };

  const getCurrentReactionColor = () => {
    if (!currentReaction) return 'text-gray-500';
    const reaction = REACTIONS.find(r => r.type === currentReaction);
    return reaction ? reaction.color : 'text-gray-500';
  };

  const CurrentReactionIcon = getCurrentReactionIcon();

  return (
    <div className="relative">
      <button
        onClick={() => setShowReactions(!showReactions)}
        disabled={isReacting}
        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm transition-colors ${
          currentReaction 
            ? `${getCurrentReactionColor()} bg-gray-100 hover:bg-gray-200` 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        {CurrentReactionIcon ? (
          <CurrentReactionIcon className="w-4 h-4" />
        ) : (
          <HandThumbUpIcon className="w-4 h-4" />
        )}
        <span>{likesCount > 0 ? likesCount : ''}</span>
      </button>

      {/* Reactions Popup */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
          <div className="flex space-x-1">
            {REACTIONS.map((reaction) => {
              const Icon = reaction.icon;
              const SolidIcon = reaction.solidIcon;
              const isActive = currentReaction === reaction.type;
              
              return (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  disabled={isReacting}
                  className={`p-2 rounded-full transition-colors ${
                    isActive 
                      ? `${reaction.color} bg-gray-100` 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  title={reaction.label}
                >
                  {isActive ? (
                    <SolidIcon className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop to close reactions */}
      {showReactions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowReactions(false)}
        />
      )}
    </div>
  );
}
