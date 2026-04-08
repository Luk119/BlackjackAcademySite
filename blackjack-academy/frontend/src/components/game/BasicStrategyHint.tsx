'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerAction } from '@/types/game.types';
import { cn } from '@/utils/cn';

interface BasicStrategyHintProps {
  optimalAction?: PlayerAction;
  lastAction?: string;
  wasCorrect?: boolean;
}

const ACTION_DESCRIPTIONS: Record<PlayerAction, { label: string; reason: string; color: string }> = {
  hit: { label: 'DOBIERZ', reason: 'Twój wynik jest na tyle niski, że warto wziąć kolejną kartę', color: 'text-blue-400' },
  stand: { label: 'STÓJ', reason: 'Twój wynik jest mocny względem karty odkrytej krupiera', color: 'text-green-400' },
  double: { label: 'PODWÓJ ZAKŁAD', reason: 'Korzystna pozycja — podwój swój zysk', color: 'text-yellow-400' },
  split: { label: 'PODZIEL', reason: 'Podziel, aby uzyskać dwie mocne ręce startowe', color: 'text-purple-400' },
  surrender: { label: 'PODDAJ SIĘ', reason: 'Szanse zdecydowanie faworyzują krupiera', color: 'text-gray-400' },
};

export function BasicStrategyHint({ optimalAction, lastAction, wasCorrect }: BasicStrategyHintProps) {
  if (!optimalAction) return null;
  const info = ACTION_DESCRIPTIONS[optimalAction];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-gray-900/80 border border-gray-700 rounded-xl p-3 backdrop-blur-sm max-w-xs"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500">Podstawowa strategia:</span>
          <span className={cn('text-sm font-bold', info.color)}>{info.label}</span>
        </div>
        <p className="text-xs text-gray-400">{info.reason}</p>

        {wasCorrect !== undefined && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'mt-2 text-xs font-semibold text-center py-1 rounded',
              wasCorrect ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400',
            )}
          >
            {wasCorrect ? '✓ Dobra decyzja!' : `✗ Optymalne było: ${optimalAction}`}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
