import { create } from 'zustand';
import { GameSnapshot, CountingSystem, GameVariant } from '@/types/game.types';

interface GameSettings {
  deckCount: number;
  variant: GameVariant;
  countingSystem: CountingSystem;
  showHints: boolean;
  showCount: boolean;
  soundEnabled: boolean;
  betAmount: number;
}

interface GameStore {
  sessionId: string | null;
  snapshot: GameSnapshot | null;
  settings: GameSettings;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastAction: string | null;

  setSession: (sessionId: string, snapshot: GameSnapshot) => void;
  updateSnapshot: (snapshot: GameSnapshot) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastAction: (action: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setBetAmount: (amount: number) => void;
  clearSession: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  sessionId: null,
  snapshot: null,
  settings: {
    deckCount: 6,
    variant: 'classic',
    countingSystem: 'hi-lo',
    showHints: true,
    showCount: false,
    soundEnabled: true,
    betAmount: 25,
  },
  isConnected: false,
  isLoading: false,
  error: null,
  lastAction: null,

  setSession: (sessionId, snapshot) => set({ sessionId, snapshot, error: null }),
  updateSnapshot: (snapshot) => set({ snapshot }),
  setConnected: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setLastAction: (lastAction) => set({ lastAction }),
  updateSettings: (settings) =>
    set((state) => ({ settings: { ...state.settings, ...settings } })),
  setBetAmount: (betAmount) =>
    set((state) => ({ settings: { ...state.settings, betAmount } })),
  clearSession: () => set({ sessionId: null, snapshot: null, lastAction: null }),
}));
