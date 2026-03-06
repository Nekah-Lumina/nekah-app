import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface Reaction {
  id: string;
  type: 'like' | 'love' | 'care' | 'laugh' | 'wow' | 'sad' | 'angry';
  emoji: string;
  label: string;
  color: string;
}

const reactionTypes: Reaction[] = [
  { id: 'like', type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-500' },
  { id: 'love', type: 'love', emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { id: 'care', type: 'care', emoji: '🤗', label: 'Care', color: 'text-yellow-500' },
  { id: 'laugh', type: 'laugh', emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
  { id: 'wow', type: 'wow', emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
  { id: 'sad', type: 'sad', emoji: '😢', label: 'Sad', color: 'text-blue-400' },
  { id: 'angry', type: 'angry', emoji: '😡', label: 'Angry', color: 'text-red-600' }
];

interface FacebookReactionsProps {
  reactions: { [key: string]: number };
  userReaction?: string;
  onReact: (reactionType: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FacebookReactions({ 
  reactions, 
  userReaction, 
  onReact, 
  size = 'md' 
}: FacebookReactionsProps) {
  const [showReactions, setShowReactions] = useState(false);
  
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const topReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const buttonSize = size === 'sm' ? 'h-8 px-2 text-xs' : size === 'lg' ? 'h-12 px-4 text-base' : 'h-10 px-3 text-sm';
  const emojiSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';

  const getCurrentReaction = () => {
    if (!userReaction) return null;
    return reactionTypes.find(r => r.id === userReaction);
  };

  const currentReaction = getCurrentReaction();

  return (
    <div className="flex items-center gap-2">
      {/* Reaction Button */}
      <Popover open={showReactions} onOpenChange={setShowReactions}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`${buttonSize} flex items-center gap-2 hover:bg-gray-100 transition-colors ${
              currentReaction ? currentReaction.color : 'text-gray-600'
            }`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
            onClick={() => {
              if (currentReaction) {
                onReact(currentReaction.id);
              } else {
                onReact('like');
              }
            }}
          >
            <span className={emojiSize}>
              {currentReaction ? currentReaction.emoji : '👍'}
            </span>
            <span className="font-medium">
              {currentReaction ? currentReaction.label : 'Like'}
            </span>
            {totalReactions > 0 && (
              <span className="text-gray-500">
                {totalReactions}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="p-2 w-auto"
          side="top"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <div className="flex gap-2">
            {reactionTypes.map((reaction) => (
              <Button
                key={reaction.id}
                variant="ghost"
                className="p-2 h-auto hover:bg-gray-100 hover:scale-125 transition-all duration-200"
                onClick={() => {
                  onReact(reaction.id);
                  setShowReactions(false);
                }}
              >
                <span className="text-2xl">{reaction.emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Reaction Summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 text-gray-600">
          <div className="flex -space-x-1">
            {topReactions.map(([reactionId, count]) => {
              const reaction = reactionTypes.find(r => r.id === reactionId);
              return (
                <span 
                  key={reactionId} 
                  className="text-xs bg-white rounded-full p-1 border border-gray-200"
                  title={`${reaction?.label}: ${count}`}
                >
                  {reaction?.emoji}
                </span>
              );
            })}
          </div>
          <span className="text-xs font-medium ml-1">
            {totalReactions}
          </span>
        </div>
      )}
    </div>
  );
}

export { reactionTypes };