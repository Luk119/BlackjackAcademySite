'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard } from './Card';
import { Hand as HandType } from '@/types/game.types';
import { cn } from '@/utils/cn';

interface HandProps {
  hand: HandType;
  isActive?: boolean;
  isDealer?: boolean;
  label?: string;
  showTotal?: boolean;
}

function calcTotal(cards: HandType['cards']): { total: number; isSoft: boolean } {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.faceDown) continue;
    if (card.rank === 'A') { aces++; total += 11; }
    else total += card.value;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return { total, isSoft: aces > 0 };
}

const RESULT_STYLES: Record<string, string> = {
  win: 'border-green-400 shadow-green-400/40',
  blackjack: 'border-yellow-400 shadow-yellow-400/60',
  loss: 'border-red-500 shadow-red-400/30',
  bust: 'border-red-600 shadow-red-600/30',
  push: 'border-blue-400 shadow-blue-400/30',
  surrender: 'border-gray-500',
};

const RESULT_LABELS: Record<string, string> = {
  win: 'WYGRANA',
  blackjack: 'BLACKJACK!',
  loss: 'PRZEGRANA',
  bust: 'PRZEKROCZONO',
  push: 'REMIS',
  surrender: 'PODDANO',
};

export function Hand({ hand, isActive = false, isDealer = false, label, showTotal = true }: HandProps) {
  const { total, isSoft } = calcTotal(hand.cards);
  const resultStyle = hand.result ? RESULT_STYLES[hand.result] : '';

  return (
    <div className={cn(
      'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300',
      isActive ? 'border-yellow-400 shadow-lg shadow-yellow-400/30 animate-pulse-gold' : 'border-transparent',
      hand.result ? resultStyle : '',
    )}>
      {/* Label */}
      {label && (
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      )}

      {/* Result badge */}
      {hand.result && (
        <motion.div
          initial={{ scale: 0, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-bold shadow-lg',
            hand.result === 'blackjack' && 'bg-yellow-400 text-black',
            hand.result === 'win' && 'bg-green-500 text-white',
            ['loss', 'bust'].includes(hand.result) && 'bg-red-500 text-white',
            hand.result === 'push' && 'bg-blue-500 text-white',
            hand.result === 'surrender' && 'bg-gray-500 text-white',
          )}
        >
          {RESULT_LABELS[hand.result]}
          {hand.payout !== undefined && hand.payout > 0 && (
            <span className="ml-1">+{hand.payout}</span>
          )}
        </motion.div>
      )}

      {/* Cards */}
      <div className="flex gap-1">
        <AnimatePresence>
          {hand.cards.map((card, i) => (
            <PlayingCard
              key={`${card.rank}-${card.suit}-${i}`}
              card={card}
              index={i}
              isDealing
              size={isDealer ? 'md' : 'md'}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Total */}
      {showTotal && !isDealer && hand.cards.some(c => !c.faceDown) && (
        <motion.div
          key={total}
          initial={{ scale: 1.3, color: '#fbbf24' }}
          animate={{ scale: 1, color: '#ffffff' }}
          className={cn(
            'font-bold text-lg',
            total > 21 && 'text-red-400',
            total === 21 && 'text-yellow-400',
          )}
        >
          {isSoft && total <= 21 && total !== 21 ? `${total - 10}/${total}` : total}
          {hand.isDoubled && <span className="ml-1 text-xs text-blue-300">2x</span>}
        </motion.div>
      )}

      {/* Dealer partial total (only visible card) */}
      {showTotal && isDealer && hand.cards.filter(c => !c.faceDown).length > 0 && (
        <div className="font-bold text-lg text-gray-300">
          {calcTotal(hand.cards.filter(c => !c.faceDown)).total}
          {hand.cards.some(c => c.faceDown) && ' + ?'}
        </div>
      )}

      {/* Bet */}
      {hand.bet > 0 && (
        <div className="text-xs text-gold-light font-semibold">
          Zakład: ${hand.bet}
        </div>
      )}
    </div>
  );
}
