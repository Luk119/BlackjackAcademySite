import { Card, Rank } from './card';

export type CountingSystem = 'hi-lo' | 'hi-opt-i' | 'ko' | 'omega-ii';

interface CountingSystemConfig {
  name: string;
  description: string;
  values: Record<Rank, number>;
  isBalanced: boolean;
}

export const COUNTING_SYSTEMS: Record<CountingSystem, CountingSystemConfig> = {
  'hi-lo': {
    name: 'Hi-Lo',
    description: 'Most popular balanced system. Low cards (2-6) = +1, high cards (10-A) = -1.',
    isBalanced: true,
    values: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 0, '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
    },
  },
  'hi-opt-i': {
    name: 'Hi-Opt I',
    description: 'Level 1 balanced system. More accurate than Hi-Lo for strategy decisions.',
    isBalanced: true,
    values: {
      '2': 0, '3': 1, '4': 1, '5': 1, '6': 1,
      '7': 0, '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': 0,
    },
  },
  'ko': {
    name: 'KO (Knock-Out)',
    description: 'Unbalanced system — no true count conversion needed. Good for beginners.',
    isBalanced: false,
    values: {
      '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1,
      '8': 0, '9': 0,
      '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
    },
  },
  'omega-ii': {
    name: 'Omega II',
    description: 'Level 2 balanced system. High accuracy, more complex to learn.',
    isBalanced: true,
    values: {
      '2': 1, '3': 1, '4': 2, '5': 2, '6': 2, '7': 1,
      '8': 0, '9': -1,
      '10': -2, 'J': -2, 'Q': -2, 'K': -2, 'A': 0,
    },
  },
};

export class CardCounter {
  private runningCount = 0;
  private cardsDealt = 0;
  readonly system: CountingSystem;
  private config: CountingSystemConfig;

  constructor(system: CountingSystem = 'hi-lo') {
    this.system = system;
    this.config = COUNTING_SYSTEMS[system];
  }

  countCard(card: Card): number {
    if (card.faceDown) return 0;
    const delta = this.config.values[card.rank] ?? 0;
    this.runningCount += delta;
    this.cardsDealt++;
    return delta;
  }

  countCards(cards: Card[]): void {
    for (const card of cards) this.countCard(card);
  }

  /**
   * True count = running count / decks remaining.
   * Only meaningful for balanced systems.
   */
  getTrueCount(decksRemaining: number): number {
    if (!this.config.isBalanced) return this.runningCount;
    if (decksRemaining <= 0) return this.runningCount;
    return Math.round((this.runningCount / decksRemaining) * 10) / 10;
  }

  get running(): number {
    return this.runningCount;
  }

  reset(): void {
    this.runningCount = 0;
    this.cardsDealt = 0;
  }

  /**
   * Recommend bet multiplier based on true count.
   * Standard Hi-Lo betting ramp.
   */
  getBetRecommendation(trueCount: number): { multiplier: number; advice: string } {
    if (trueCount <= 1) return { multiplier: 1, advice: 'Minimum bet — shoe unfavorable' };
    if (trueCount <= 2) return { multiplier: 2, advice: 'Slight edge — 2x base bet' };
    if (trueCount <= 3) return { multiplier: 4, advice: 'Good advantage — 4x base bet' };
    if (trueCount <= 4) return { multiplier: 8, advice: 'Strong advantage — 8x base bet' };
    return { multiplier: 16, advice: 'Very strong edge — max bet' };
  }

  /**
   * Insurance deviation: take insurance when true count >= 3.
   */
  shouldTakeInsurance(trueCount: number): boolean {
    return trueCount >= 3;
  }
}
