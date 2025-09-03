'use client';

import { useState } from 'react';
import { 
  HandThumbUpIcon,
  HeartIcon,
  FaceSmileIcon,
  LightBulbIcon,
  StarIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HeartIcon as HeartSolidIcon,
  FaceSmileIcon as FaceSmileSolidIcon,
  LightBulbIcon as LightBulbSolidIcon,
  StarIcon as StarSolidIcon,
  QuestionMarkCircleIcon as QuestionMarkCircleSolidIcon
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';


interface PostReactionsProps {
  postId: string;
  userReaction?: string | null;
  reactionCounts: Record<string, number>;
  onReact: (reactionId: string) => void;
}

const REACTIONS = [
  { id: 'like', icon: HandThumbUpIcon, solidIcon: HandThumbUpSolidIcon, label: 'Like', color: 'text-[#007fff]', bgColor: 'bg-[#007fff]/10' },
  { id: 'love', icon: HeartIcon, solidIcon: HeartSolidIcon, label: 'Love', color: 'text-red-500', bgColor: 'bg-red-50' },
  { id: 'celebrate', icon: StarIcon, solidIcon: StarSolidIcon, label: 'Celebrate', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  { id: 'support', icon: FaceSmileIcon, solidIcon: FaceSmileSolidIcon, label: 'Support', color: 'text-green-500', bgColor: 'bg-green-50' },
  { id: 'insightful', icon: LightBulbIcon, solidIcon: LightBulbSolidIcon, label: 'Insightful', color: 'text-purple-500', bgColor: 'bg-purple-50' },
  { id: 'curious', icon: QuestionMarkCircleIcon, solidIcon: QuestionMarkCircleSolidIcon, label: 'Curious', color: 'text-orange-500', bgColor: 'bg-orange-50' }
];

export default function PostReactions({ postId, userReaction, reactionCounts, onReact }: PostReactionsProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  const currentReaction = REACTIONS.find(r => r.id === userReaction);

  const handleReactionClick = (reactionId: string) => {
    // Only allow clicking if user has no reaction or is clicking their current reaction
    if (!userReaction || userReaction === reactionId) {
      onReact(reactionId);
    }
    setShowReactionPicker(false);
  };

  const handleLongPress = () => {
    setShowReactionPicker(true);
  };

  return (
    <div className="relative">
      {/* Main Reaction Button */}
      <button
        onClick={() => handleReactionClick('like')}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseDown={handleLongPress}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
          userReaction === 'like'
            ? `${currentReaction?.color} ${currentReaction?.bgColor} font-medium`
            : 'text-gray-500 hover:text-[#007fff] hover:bg-[#007fff]/10'
        )}
      >
        {userReaction && currentReaction ? (
          <currentReaction.solidIcon className="w-5 h-5" />
        ) : (
          <HandThumbUpIcon className="w-5 h-5" />
        )}
        <span className="text-sm">
          {userReaction && currentReaction ? currentReaction.label : 'Like'}
        </span>
        {totalReactions > 0 && (
          <span className="text-xs text-gray-500">({totalReactions})</span>
        )}
      </button>

      {/* Reaction Picker Popup */}
      {showReactionPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
          <div className="flex items-center space-x-1">
            {REACTIONS.map((reaction) => {
              const Icon = reaction.icon;
              const SolidIcon = reaction.solidIcon;
              const isActive = userReaction === reaction.id;
              const isDisabled = userReaction && userReaction !== reaction.id;
              const count = reactionCounts[reaction.id] || 0;
              
              return (
                <button
                  key={reaction.id}
                  onClick={() => handleReactionClick(reaction.id)}
                  disabled={!!isDisabled}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isActive 
                      ? `${reaction.color} ${reaction.bgColor}` 
                      : isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-100 hover:scale-110'
                  }`}
                  title={
                    isDisabled 
                      ? 'You can only have one reaction per post' 
                      : `${reaction.label}${count > 0 ? ` (${count})` : ''}`
                  }
                >
                  {isActive ? (
                    <SolidIcon className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop to close picker */}
      {showReactionPicker && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowReactionPicker(false)}
        />
      )}
    </div>
  );
}
