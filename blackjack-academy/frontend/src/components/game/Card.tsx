'use client';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/types/game.types';
import { cn } from '@/utils/cn';

interface CardProps {
  card: CardType;
  index?: number;
  isDealing?: boolean;
  isFlipping?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-10 h-14 text-sm',
  md: 'w-14 h-20 text-base',
  lg: 'w-20 h-28 text-xl',
};

const SUIT_COLORS = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export function PlayingCard({ card, index = 0, isDealing = false, isFlipping = false, size = 'md', className }: CardProps) {
  const dealVariants = {
    initial: { y: -120, x: -20, rotate: -8, opacity: 0, scale: 0.8 },
    animate: {
      y: 0, x: 0, rotate: 0, opacity: 1, scale: 1,
      transition: { delay: index * 0.12, type: 'spring', stiffness: 200, damping: 20 },
    },
  };

  const flipVariants = {
    initial: { rotateY: 180 },
    animate: { rotateY: 0, transition: { duration: 0.4 } },
  };

  if (card.faceDown) {
    return (
      <motion.div
        className={cn(
          SIZE_CLASSES[size],
          'rounded-lg border-2 border-yellow-600/50 shadow-lg flex items-center justify-center',
          'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900',
          className,
        )}
        variants={isDealing ? dealVariants : undefined}
        initial={isDealing ? 'initial' : undefined}
        animate={isDealing ? 'animate' : undefined}
        style={{ perspective: '1000px' }}
      >
        <div className="w-full h-full rounded-lg border border-blue-600/30 m-1 flex items-center justify-center">
          <span className="text-blue-400/60 text-lg select-none">🂠</span>
        </div>
      </motion.div>
    );
  }

  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitColor = SUIT_COLORS[card.suit];

  return (
    <motion.div
      className={cn(
        SIZE_CLASSES[size],
        'rounded-lg border border-gray-300 shadow-xl bg-white',
        'flex flex-col justify-between p-1 select-none relative overflow-hidden',
        className,
      )}
      variants={isDealing ? dealVariants : isFlipping ? flipVariants : undefined}
      initial={isDealing ? 'initial' : isFlipping ? 'initial' : undefined}
      animate={isDealing ? 'animate' : isFlipping ? 'animate' : undefined}
      whileHover={{ y: -3, scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
      style={{ perspective: '1000px' }}
    >
      {/* Top-left rank + suit */}
      <div className={cn('leading-tight', suitColor)}>
        <div className="font-bold leading-none">{card.rank}</div>
        <div className="leading-none text-xs">{suitSymbol}</div>
      </div>

      {/* Center suit */}
      <div className={cn('absolute inset-0 flex items-center justify-center text-2xl', suitColor, size === 'sm' && 'text-lg')}>
        {suitSymbol}
      </div>

      {/* Bottom-right (rotated) */}
      <div className={cn('leading-tight self-end rotate-180', suitColor)}>
        <div className="font-bold leading-none">{card.rank}</div>
        <div className="leading-none text-xs">{suitSymbol}</div>
      </div>
    </motion.div>
  );
}
