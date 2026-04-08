'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand } from './Hand';
import { Controls } from './Controls';
import { CardCounterDisplay } from './CardCounter';
import { BasicStrategyHint } from './BasicStrategyHint';
import { useGame } from '@/hooks/useGame';
import { useCardCounting } from '@/hooks/useCardCounting';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/utils/cn';

export function GameTable() {
  const { snapshot, isConnected, isLoading, startGame, placeBet, performAction, newRound, settings, updateSettings } = useGame();
  const { setBetAmount, settings: storeSettings } = useGameStore();
  const { runningCount, trueCount, countCard, reset, lastDelta, getBetAdvice } = useCardCounting(settings.countingSystem);
  const [betAmount, setBetAmountLocal] = useState(0);
  const [lastActionCorrect, setLastActionCorrect] = useState<boolean | undefined>(undefined);

  // Auto-start game on mount
  useEffect(() => {
    if (isConnected && !snapshot) {
      startGame();
    }
  }, [isConnected]);

  // Count newly dealt cards
  useEffect(() => {
    if (!snapshot) return;
    // Counting is handled server-side, just sync the display
  }, [snapshot?.playerHands, snapshot?.dealerHand]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Łączenie z serwerem gry...</p>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => startGame()}
          className="px-8 py-4 bg-gradient-to-r from-gold-dark to-gold text-black font-bold text-xl rounded-xl shadow-xl"
        >
          Rozpocznij grę
        </motion.button>
      </div>
    );
  }

  const trueCountDisplay = snapshot.trueCount;
  const betAdvice = getBetAdvice(trueCountDisplay);

  return (
    <div className="relative min-h-screen bg-felt-dark">
      {/* Felt table background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(ellipse at center, #1a4731 0%, #0f2d1e 70%)`,
          backgroundSize: 'cover',
        }}
      />

      <div className="relative z-10 flex gap-4 p-4 max-w-6xl mx-auto">
        {/* Main game area */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Message bar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={snapshot.message}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-300 text-sm font-medium bg-black/30 rounded-lg py-2 px-4"
            >
              {snapshot.message}
            </motion.div>
          </AnimatePresence>

          {/* Dealer area */}
          <div className="flex justify-center">
            <Hand
              hand={snapshot.dealerHand}
              isDealer
              label="KRUPIER"
              showTotal
            />
          </div>

          {/* Separator */}
          <div className="border-t border-gold/20 mx-8" />

          {/* Player area */}
          <div className="flex justify-center gap-4 flex-wrap">
            {snapshot.playerHands.map((hand, index) => (
              <Hand
                key={index}
                hand={hand}
                isActive={snapshot.state === 'player-turn' && index === snapshot.activeHandIndex}
                label={snapshot.playerHands.length > 1 ? `RĘKA ${index + 1}` : 'TWOJA RĘKA'}
                showTotal
              />
            ))}
          </div>

          {/* Basic strategy hint */}
          {settings.showHints && snapshot.state === 'player-turn' && (
            <div className="flex justify-center">
              <BasicStrategyHint
                optimalAction={snapshot.optimalAction}
                wasCorrect={lastActionCorrect}
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center">
            <Controls
              snapshot={snapshot}
              onAction={performAction}
              onBet={placeBet}
              onNewRound={() => { setBetAmountLocal(0); newRound(); }}
              betAmount={betAmount}
              setBetAmount={setBetAmountLocal}
              showHints={settings.showHints}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Side panel */}
        <div className="w-64 flex flex-col gap-4">
          {/* Card counter */}
          {settings.showCount && (
            <CardCounterDisplay
              runningCount={snapshot.runningCount}
              trueCount={snapshot.trueCount}
              decksRemaining={snapshot.decksRemaining}
              system={settings.countingSystem}
              lastDelta={lastDelta}
              betAdvice={betAdvice}
            />
          )}

          {/* Settings toggles */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ustawienia</h3>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-300">Podpowiedzi strategii</span>
              <button
                onClick={() => updateSettings({ showHints: !settings.showHints })}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative',
                  settings.showHints ? 'bg-gold' : 'bg-gray-700',
                )}
              >
                <motion.div
                  animate={{ x: settings.showHints ? 20 : 2 }}
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-300">Licznik kart</span>
              <button
                onClick={() => updateSettings({ showCount: !settings.showCount })}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative',
                  settings.showCount ? 'bg-gold' : 'bg-gray-700',
                )}
              >
                <motion.div
                  animate={{ x: settings.showCount ? 20 : 2 }}
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                />
              </button>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
