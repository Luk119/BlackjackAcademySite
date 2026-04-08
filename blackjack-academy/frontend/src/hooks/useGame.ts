'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { getSocket } from '@/lib/socket';
import { PlayerAction } from '@/types/game.types';
import toast from 'react-hot-toast';

export function useGame() {
  const store = useGameStore();
  const { updateUser } = useUserStore();
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const socket = socketRef.current;

    socket.on('connect', () => {
      store.setConnected(true);
      store.setError(null);
      // Reset snapshot so a new game session is created on the server
      store.clearSession();
    });

    socket.on('disconnect', () => {
      store.setConnected(false);
    });

    socket.on('game:started', (snapshot) => {
      store.updateSnapshot(snapshot);
      store.setLoading(false);
    });

    socket.on('game:update', (snapshot) => {
      store.updateSnapshot(snapshot);
      store.setLoading(false);

      if (snapshot.state === 'complete') {
        const results = snapshot.playerHands.map((h: any) => h.result);
        if (results.includes('blackjack')) toast.success('Blackjack!', { icon: '🃏' });
        else if (results.every((r: string) => ['win', 'blackjack'].includes(r))) toast.success('You win!');
        else if (results.every((r: string) => ['loss', 'bust'].includes(r))) toast.error('Dealer wins');
        else if (results.every((r: string) => r === 'push')) toast('Push!', { icon: '🤝' });
      }
    });

    socket.on('game:ended', (summary) => {
      if (summary.chipsChange > 0) {
        toast.success(`Session ended: +${summary.chipsChange} chips!`);
      } else if (summary.chipsChange < 0) {
        toast.error(`Session ended: ${summary.chipsChange} chips`);
      }
      store.clearSession();
    });

    socket.on('game:error', ({ message }: { message: string }) => {
      store.setError(message);
      store.setLoading(false);
      toast.error(message);
    });

    socket.on('achievements:unlocked', (achievements: any[]) => {
      achievements.forEach(a => {
        toast.success(`Achievement unlocked: ${a.name}!`, { icon: a.icon, duration: 5000 });
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('game:started');
      socket.off('game:update');
      socket.off('game:ended');
      socket.off('game:error');
      socket.off('achievements:unlocked');
    };
  }, []);

  const startGame = useCallback((options?: { deckCount?: number; variant?: string; countingSystem?: string }) => {
    store.setLoading(true);
    socketRef.current?.emit('game:start', {
      deckCount: store.settings.deckCount,
      variant: store.settings.variant,
      countingSystem: store.settings.countingSystem,
      ...options,
    });
  }, [store.settings]);

  const placeBet = useCallback((amount: number) => {
    store.setLoading(true);
    store.setBetAmount(amount);
    socketRef.current?.emit('game:bet', { amount });
  }, []);

  const performAction = useCallback((action: PlayerAction) => {
    store.setLoading(true);
    store.setLastAction(action);
    socketRef.current?.emit('game:action', { action });
  }, []);

  const newRound = useCallback(() => {
    socketRef.current?.emit('game:new-round');
  }, []);

  const endGame = useCallback(() => {
    socketRef.current?.emit('game:end');
  }, []);

  return {
    snapshot: store.snapshot,
    sessionId: store.sessionId,
    settings: store.settings,
    isConnected: store.isConnected,
    isLoading: store.isLoading,
    error: store.error,
    lastAction: store.lastAction,
    startGame,
    placeBet,
    performAction,
    newRound,
    endGame,
    updateSettings: store.updateSettings,
  };
}
