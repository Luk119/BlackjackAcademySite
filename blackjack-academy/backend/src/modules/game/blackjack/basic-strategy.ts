import { Card, Rank } from './card';

export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

/**
 * Basic Strategy engine — mathematically optimal play for standard blackjack.
 * Based on standard multi-deck (4-8) strategy charts with S17 (dealer stands on soft 17).
 */

// Hard totals strategy: [playerTotal][dealerUpcard] -> action
// Dealer upcards indexed 2-A (0=2, 1=3, ..., 8=10/J/Q/K, 9=A)
const HARD_STRATEGY: Record<number, string[]> = {
  //              2     3     4     5     6     7     8     9    10     A
  8:  ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  9:  ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  10: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  11: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H'],
  12: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  13: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  14: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  15: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'R', 'H'],
  16: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'R', 'R', 'R'],
  17: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
};

// Soft totals strategy (Ace + X): [otherCard][dealerUpcard]
const SOFT_STRATEGY: Record<number, string[]> = {
  //           2     3     4     5     6     7     8     9    10     A
  2: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,2
  3: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,3
  4: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,4
  5: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,5
  6: ['D', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,6
  7: ['S', 'D', 'D', 'D', 'D', 'S', 'S', 'H', 'H', 'H'], // A,7
  8: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], // A,8
  9: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], // A,9
};

// Pairs strategy: [pairRank][dealerUpcard]
const PAIRS_STRATEGY: Record<string, string[]> = {
  //              2     3     4     5     6     7     8     9    10     A
  '2': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '3': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '4': ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  '5': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  '6': ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  '7': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '8': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  '9': ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'],
  '10': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  'A': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
};

const DEALER_INDEX: Record<string, number> = {
  '2': 0, '3': 1, '4': 2, '5': 3, '6': 4,
  '7': 5, '8': 6, '9': 7, '10': 8, 'J': 8, 'Q': 8, 'K': 8, 'A': 9,
};

const ACTION_MAP: Record<string, PlayerAction> = {
  H: 'hit', S: 'stand', D: 'double', P: 'split', R: 'surrender',
};

export function getOptimalAction(
  playerCards: Card[],
  dealerUpcard: Card,
  canDouble = true,
  canSplit = true,
  canSurrender = true,
): PlayerAction {
  const dealerIdx = DEALER_INDEX[dealerUpcard.rank] ?? 8;
  const { total, isSoft } = calculateHandValue(playerCards);

  // Check for pair
  if (canSplit && playerCards.length === 2) {
    const rank0 = playerCards[0].rank;
    const rank1 = playerCards[1].rank;
    const isValuePair =
      (rank0 === rank1) ||
      (['10', 'J', 'Q', 'K'].includes(rank0) && ['10', 'J', 'Q', 'K'].includes(rank1));

    if (isValuePair) {
      const pairKey = ['J', 'Q', 'K'].includes(rank0) ? '10' : rank0;
      const action = PAIRS_STRATEGY[pairKey]?.[dealerIdx];
      if (action) {
        const resolved = resolveAction(ACTION_MAP[action], canDouble, canSplit, canSurrender);
        if (resolved !== null) return resolved;
      }
    }
  }

  // Soft hand (contains Ace counted as 11)
  if (isSoft && playerCards.length === 2) {
    const nonAce = playerCards.find(c => c.rank !== 'A');
    if (nonAce) {
      const key = getCardValue_forStrategy(nonAce.rank);
      const action = SOFT_STRATEGY[key]?.[dealerIdx];
      if (action) {
        const resolved = resolveAction(ACTION_MAP[action], canDouble, canSplit, canSurrender);
        if (resolved !== null) return resolved;
      }
    }
  }

  // Hard total
  if (total <= 8) return 'hit';
  if (total >= 17) return 'stand';

  const action = HARD_STRATEGY[total]?.[dealerIdx];
  if (!action) return total >= 17 ? 'stand' : 'hit';

  return resolveAction(ACTION_MAP[action], canDouble, canSplit, canSurrender) ?? 'hit';
}

function resolveAction(
  action: PlayerAction,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean,
): PlayerAction | null {
  if (action === 'double' && !canDouble) return 'hit';
  if (action === 'split' && !canSplit) return null;
  if (action === 'surrender' && !canSurrender) return 'stand';
  return action;
}

function getCardValue_forStrategy(rank: Rank): number {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank, 10);
}

export function calculateHandValue(cards: Card[]): { total: number; isSoft: boolean; isBust: boolean } {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.faceDown) continue;
    if (card.rank === 'A') {
      aces++;
      total += 11;
    } else {
      total += card.value;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return {
    total,
    isSoft: aces > 0 && total <= 21,
    isBust: total > 21,
  };
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && calculateHandValue(cards).total === 21;
}
