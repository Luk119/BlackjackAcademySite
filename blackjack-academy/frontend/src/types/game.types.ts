export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type GameState = 'idle' | 'betting' | 'player-turn' | 'dealer-turn' | 'complete';
export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';
export type HandResult = 'win' | 'loss' | 'push' | 'blackjack' | 'surrender' | 'bust';
export type GameVariant = 'classic' | 'european' | 'atlantic-city' | 'double-exposure';
export type CountingSystem = 'hi-lo' | 'hi-opt-i' | 'ko' | 'omega-ii';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  faceDown?: boolean;
}

export interface Hand {
  cards: Card[];
  bet: number;
  result?: HandResult;
  payout?: number;
  isDoubled?: boolean;
  isSplit?: boolean;
}

export interface GameSnapshot {
  state: GameState;
  playerHands: Hand[];
  activeHandIndex: number;
  dealerHand: Hand;
  bet: number;
  chips: number;
  runningCount: number;
  trueCount: number;
  decksRemaining: number;
  optimalAction?: PlayerAction;
  message: string;
  variant: GameVariant;
}

export interface GameSession {
  sessionId: string;
  snapshot: GameSnapshot;
}

export interface BetOption {
  value: number;
  color: string;
  label: string;
}

export const BET_OPTIONS: BetOption[] = [
  { value: 5, color: 'chip-red', label: '$5' },
  { value: 25, color: 'chip-green', label: '$25' },
  { value: 100, color: 'chip-black', label: '$100' },
  { value: 500, color: 'chip-blue', label: '$500' },
  { value: 1000, color: 'chip-red', label: '$1K' },
];
