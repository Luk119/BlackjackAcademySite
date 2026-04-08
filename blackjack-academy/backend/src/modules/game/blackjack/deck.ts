import { Card, Suit, Rank, createCard } from './card';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class Shoe {
  private cards: Card[] = [];
  private dealtCount = 0;
  readonly deckCount: number;
  private cutCard: number;

  constructor(deckCount = 6) {
    this.deckCount = deckCount;
    this.shuffle();
  }

  shuffle() {
    this.cards = [];
    this.dealtCount = 0;

    // Build shoe
    for (let d = 0; d < this.deckCount; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          this.cards.push(createCard(suit, rank));
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }

    // Place cut card at 60-75% of the shoe
    const cutPercent = 0.6 + Math.random() * 0.15;
    this.cutCard = Math.floor(this.cards.length * cutPercent);
  }

  deal(faceDown = false): Card {
    if (this.cards.length === 0) this.shuffle();
    const card = { ...this.cards.pop()!, faceDown };
    this.dealtCount++;
    return card;
  }

  get remainingCards(): number {
    return this.cards.length;
  }

  get totalCards(): number {
    return this.deckCount * 52;
  }

  get penetration(): number {
    return this.dealtCount / this.totalCards;
  }

  get needsReshuffle(): boolean {
    return this.cards.length <= (this.totalCards - this.cutCard);
  }

  get decksRemaining(): number {
    return this.cards.length / 52;
  }
}
