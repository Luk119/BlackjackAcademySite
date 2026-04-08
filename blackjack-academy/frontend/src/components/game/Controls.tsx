'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerAction, GameSnapshot, BET_OPTIONS } from '@/types/game.types';
import { cn } from '@/utils/cn';

interface ControlsProps {
  snapshot: GameSnapshot;
  onAction: (action: PlayerAction) => void;
  onBet: (amount: number) => void;
  onNewRound: () => void;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  showHints: boolean;
  isLoading: boolean;
}

const ACTION_BUTTONS: { action: PlayerAction; label: string; color: string; icon: string }[] = [
  { action: 'hit', label: 'DOBIERZ', color: 'bg-blue-600 hover:bg-blue-500', icon: '👊' },
  { action: 'stand', label: 'STÓJ', color: 'bg-red-700 hover:bg-red-600', icon: '✋' },
  { action: 'double', label: 'PODWÓJ', color: 'bg-yellow-600 hover:bg-yellow-500', icon: '2️⃣' },
  { action: 'split', label: 'PODZIEL', color: 'bg-purple-600 hover:bg-purple-500', icon: '✂️' },
  { action: 'surrender', label: 'PODDAJ', color: 'bg-gray-600 hover:bg-gray-500', icon: '🏳️' },
];

export function Controls({
  snapshot,
  onAction,
  onBet,
  onNewRound,
  betAmount,
  setBetAmount,
  showHints,
  isLoading,
}: ControlsProps) {
  const { state, chips, optimalAction, playerHands, activeHandIndex } = snapshot;

  const activeHand = playerHands[activeHandIndex] ?? null;
  const canDouble = state === 'player-turn' && activeHand !== null && activeHand.cards.length === 2 && activeHand.bet <= chips;
  const canSplit = state === 'player-turn' && activeHand !== null && activeHand.cards.length === 2 && activeHand.bet <= chips
    && activeHand.cards.length === 2
    && (activeHand.cards[0]?.value === activeHand.cards[1]?.value
      || (['10','J','Q','K'].includes(activeHand.cards[0]?.rank) && ['10','J','Q','K'].includes(activeHand.cards[1]?.rank)));
  const canSurrender = state === 'player-turn' && activeHand !== null && activeHand.cards.length === 2;

  const isActionDisabled = (action: PlayerAction) => {
    if (isLoading || state !== 'player-turn') return true;
    if (action === 'double' && !canDouble) return true;
    if (action === 'split' && !canSplit) return true;
    if (action === 'surrender' && !canSurrender) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Betting phase */}
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="betting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            {/* Chip selector */}
            <div className="flex gap-2 flex-wrap justify-center">
              {BET_OPTIONS.map(opt => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBetAmount(betAmount + opt.value)}
                  disabled={betAmount + opt.value > chips}
                  className={cn(
                    'w-14 h-14 rounded-full font-bold text-white shadow-lg border-4',
                    'transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                    opt.value === 5 && 'bg-red-600 border-red-400',
                    opt.value === 25 && 'bg-green-600 border-green-400',
                    opt.value === 100 && 'bg-gray-800 border-gray-500',
                    opt.value === 500 && 'bg-blue-600 border-blue-400',
                    opt.value === 1000 && 'bg-purple-600 border-purple-400',
                  )}
                >
                  <span className="text-xs">{opt.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Bet display + clear */}
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Zakład:</span>
              <span className="text-gold font-bold text-2xl">${betAmount}</span>
              <button
                onClick={() => setBetAmount(0)}
                className="text-xs text-gray-500 hover:text-gray-300 underline"
              >
                Wyczyść
              </button>
            </div>

            {/* Deal button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onBet(betAmount)}
              disabled={betAmount === 0 || betAmount > chips || isLoading}
              className="px-10 py-3 bg-gradient-to-r from-gold-dark to-gold text-black font-bold text-lg rounded-xl
                shadow-lg shadow-gold/30 disabled:opacity-40 disabled:cursor-not-allowed
                hover:shadow-xl hover:shadow-gold/50 transition-shadow"
            >
              ROZDAJ
            </motion.button>
          </motion.div>
        )}

        {/* Action phase */}
        {state === 'player-turn' && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex gap-2 flex-wrap justify-center"
          >
            {ACTION_BUTTONS.map(({ action, label, color, icon }) => {
              const disabled = isActionDisabled(action);
              const isOptimal = showHints && optimalAction === action;
              return (
                <motion.button
                  key={action}
                  whileHover={!disabled ? { scale: 1.05, y: -2 } : undefined}
                  whileTap={!disabled ? { scale: 0.95 } : undefined}
                  onClick={() => !disabled && onAction(action)}
                  disabled={disabled}
                  className={cn(
                    'px-4 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg',
                    'min-w-[80px]',
                    color,
                    disabled && 'opacity-30 cursor-not-allowed',
                    isOptimal && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-felt-dark shadow-yellow-400/50',
                  )}
                >
                  <div className="text-lg mb-0.5">{icon}</div>
                  <div>{label}</div>
                  {isOptimal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-yellow-300 mt-0.5"
                    >
                      ★ Najlepsza
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Complete phase */}
        {state === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewRound}
              className="px-8 py-3 bg-gradient-to-r from-gold-dark to-gold text-black font-bold rounded-xl shadow-lg"
            >
              NOWA RUNDA
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chips display */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Żetony:</span>
        <motion.span
          key={chips}
          initial={{ scale: 1.2, color: chips > 0 ? '#4ade80' : '#f87171' }}
          animate={{ scale: 1, color: '#d4af37' }}
          className="font-bold text-gold text-lg"
        >
          ${chips.toLocaleString()}
        </motion.span>
      </div>
    </div>
  );
}
