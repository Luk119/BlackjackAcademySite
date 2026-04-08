'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { CountingSystem } from '@/types/game.types';

interface CardCounterProps {
  runningCount: number;
  trueCount: number;
  decksRemaining: number;
  system: CountingSystem;
  lastDelta?: number;
  betAdvice?: string;
  className?: string;
}

const SYSTEM_LABELS: Record<CountingSystem, string> = {
  'hi-lo': 'Hi-Lo',
  'hi-opt-i': 'Hi-Opt I',
  'ko': 'KO',
  'omega-ii': 'Omega II',
};

export function CardCounterDisplay({
  runningCount,
  trueCount,
  decksRemaining,
  system,
  lastDelta,
  betAdvice,
  className,
}: CardCounterProps) {
  const countColor =
    trueCount >= 4 ? 'text-green-400' :
    trueCount >= 2 ? 'text-yellow-400' :
    trueCount <= -2 ? 'text-red-400' :
    'text-gray-300';

  const bgColor =
    trueCount >= 4 ? 'bg-green-900/30 border-green-700/50' :
    trueCount >= 2 ? 'bg-yellow-900/30 border-yellow-700/50' :
    trueCount <= -2 ? 'bg-red-900/30 border-red-700/50' :
    'bg-gray-800/50 border-gray-700/50';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'rounded-xl border p-4 font-mono backdrop-blur-sm',
        bgColor,
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Licznik kart
        </span>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
          {SYSTEM_LABELS[system]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Running Count */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Bieżące liczenie</div>
          <motion.div
            key={runningCount}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className={cn('text-3xl font-bold', countColor)}
          >
            {runningCount > 0 ? `+${runningCount}` : runningCount}
          </motion.div>
        </div>

        {/* True Count */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Prawdziwe liczenie</div>
          <motion.div
            key={trueCount}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className={cn('text-3xl font-bold', countColor)}
          >
            {trueCount > 0 ? `+${trueCount}` : trueCount}
          </motion.div>
        </div>
      </div>

      {/* Decks remaining */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-500">Pozostałe talie:</span>
        <span className="text-gray-300 font-semibold">{decksRemaining.toFixed(1)}</span>
      </div>

      {/* Last card delta */}
      <AnimatePresence>
        {lastDelta !== 0 && (
          <motion.div
            key={Date.now()}
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'text-center text-sm font-bold mt-2',
              (lastDelta ?? 0) > 0 ? 'text-green-400' : 'text-red-400',
            )}
          >
            {(lastDelta ?? 0) > 0 ? `+${lastDelta}` : lastDelta}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bet advice */}
      {betAdvice && (
        <div className="mt-3 text-center text-xs text-gray-400 bg-gray-900/50 rounded-lg py-1.5 px-2">
          {betAdvice}
        </div>
      )}

      {/* Visual count bar */}
      <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full',
            trueCount >= 2 ? 'bg-green-500' : 'bg-red-500',
          )}
          animate={{ width: `${Math.min(100, Math.max(0, (trueCount + 5) / 10 * 100))}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
