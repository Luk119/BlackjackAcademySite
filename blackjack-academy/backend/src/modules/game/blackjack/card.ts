export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  faceDown?: boolean;
}

export function getCardValue(rank: Rank): number {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank, 10);
}

export function createCard(suit: Suit, rank: Rank, faceDown = false): Card {
  return { suit, rank, value: getCardValue(rank), faceDown };
}

export function cardToString(card: Card): string {
  return card.faceDown ? '??' : `${card.rank}${suit_symbol(card.suit)}`;
}

function suit_symbol(suit: Suit): string {
  const map = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
  return map[suit];
}
