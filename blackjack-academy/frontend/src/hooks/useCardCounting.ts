'use client';
import { useState, useCallback } from 'react';
import { Card, CountingSystem } from '@/types/game.types';

const HI_LO_VALUES: Record<string, number> = {
  '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
};

const HI_OPT_I_VALUES: Record<string, number> = {
  '2': 0, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': 0,
};

const KO_VALUES: Record<string, number> = {
  '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1,
  '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
};

const SYSTEM_VALUES: Record<CountingSystem, Record<string, number>> = {
  'hi-lo': HI_LO_VALUES,
  'hi-opt-i': HI_OPT_I_VALUES,
  'ko': KO_VALUES,
  'omega-ii': { '2': 1, '3': 1, '4': 2, '5': 2, '6': 2, '7': 1, '8': 0, '9': -1, '10': -2, 'J': -2, 'Q': -2, 'K': -2, 'A': 0 },
};

export function useCardCounting(system: CountingSystem = 'hi-lo') {
  const [runningCount, setRunningCount] = useState(0);
  const [cardsDealt, setCardsDealt] = useState(0);
  const [lastDelta, setLastDelta] = useState(0);

  const values = SYSTEM_VALUES[system] || HI_LO_VALUES;

  const countCard = useCallback((card: Card) => {
    if (card.faceDown) return;
    const delta = values[card.rank] ?? 0;
    setRunningCount(prev => prev + delta);
    setCardsDealt(prev => prev + 1);
    setLastDelta(delta);
  }, [values]);

  const getTrueCount = useCallback((decksRemaining: number) => {
    if (decksRemaining <= 0) return runningCount;
    return Math.round((runningCount / decksRemaining) * 10) / 10;
  }, [runningCount]);

  const reset = useCallback(() => {
    setRunningCount(0);
    setCardsDealt(0);
    setLastDelta(0);
  }, []);

  const getCountColor = (count: number) => {
    if (count >= 4) return 'text-green-400';
    if (count >= 2) return 'text-yellow-400';
    if (count <= -2) return 'text-red-400';
    return 'text-gray-300';
  };

  const getBetAdvice = (trueCount: number): string => {
    if (trueCount <= 1) return 'Minimum bet';
    if (trueCount <= 2) return '2x bet';
    if (trueCount <= 3) return '4x bet';
    if (trueCount <= 4) return '8x bet';
    return 'Maximum bet!';
  };

  return {
    runningCount,
    cardsDealt,
    lastDelta,
    countCard,
    getTrueCount,
    trueCount: getTrueCount(1),
    reset,
    getCountColor,
    getBetAdvice,
    cardValues: values,
  };
}
