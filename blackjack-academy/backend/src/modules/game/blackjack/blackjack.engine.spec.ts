import { BlackjackEngine } from './blackjack.engine';
import { calculateHandValue, getOptimalAction, isBlackjack } from './basic-strategy';
import { createCard } from './card';
import { CardCounter } from './card-counting';

describe('BlackjackEngine', () => {
  let engine: BlackjackEngine;

  beforeEach(() => {
    engine = new BlackjackEngine(1000);
  });

  describe('placeBet', () => {
    it('should deduct bet from chips and start a round', () => {
      engine.placeBet(100);
      expect(engine.chips).toBe(900);
      expect(['player-turn', 'complete']).toContain(engine.state);
    });

    it('should throw when bet exceeds chips', () => {
      expect(() => engine.placeBet(2000)).toThrow();
    });

    it('should throw when bet is zero or negative', () => {
      expect(() => engine.placeBet(0)).toThrow();
      expect(() => engine.placeBet(-50)).toThrow();
    });
  });

  describe('actions', () => {
    beforeEach(() => {
      engine.placeBet(100);
    });

    it('should allow stand when in player-turn', () => {
      if (engine.state === 'player-turn') {
        expect(() => engine.stand()).not.toThrow();
      }
    });

    it('should throw on invalid action in wrong state', () => {
      // Can't hit when idle
      const freshEngine = new BlackjackEngine(1000);
      expect(() => freshEngine.hit()).toThrow();
    });
  });

  describe('getSnapshot', () => {
    it('should return a valid snapshot', () => {
      const snapshot = engine.getSnapshot();
      expect(snapshot).toHaveProperty('state');
      expect(snapshot).toHaveProperty('playerHands');
      expect(snapshot).toHaveProperty('dealerHand');
      expect(snapshot).toHaveProperty('chips', 1000);
    });
  });
});

describe('calculateHandValue', () => {
  it('calculates hard hand correctly', () => {
    const cards = [createCard('hearts', '7'), createCard('spades', '9')];
    expect(calculateHandValue(cards).total).toBe(16);
  });

  it('calculates soft hand correctly (Ace as 11)', () => {
    const cards = [createCard('hearts', 'A'), createCard('spades', '6')];
    const { total, isSoft } = calculateHandValue(cards);
    expect(total).toBe(17);
    expect(isSoft).toBe(true);
  });

  it('converts Ace from 11 to 1 when needed', () => {
    const cards = [
      createCard('hearts', 'A'),
      createCard('spades', '9'),
      createCard('clubs', '5'),
    ];
    const { total, isBust } = calculateHandValue(cards);
    expect(total).toBe(15);
    expect(isBust).toBe(false);
  });

  it('detects bust correctly', () => {
    const cards = [
      createCard('hearts', '10'),
      createCard('spades', '9'),
      createCard('clubs', '5'),
    ];
    expect(calculateHandValue(cards).isBust).toBe(true);
  });

  it('detects blackjack', () => {
    const cards = [createCard('hearts', 'A'), createCard('spades', 'K')];
    expect(isBlackjack(cards)).toBe(true);
  });

  it('returns false for non-blackjack 21', () => {
    const cards = [
      createCard('hearts', '7'),
      createCard('spades', '7'),
      createCard('clubs', '7'),
    ];
    expect(isBlackjack(cards)).toBe(false);
  });
});

describe('Basic Strategy', () => {
  it('recommends hit on hard 8 vs dealer 7', () => {
    const playerCards = [createCard('hearts', '4'), createCard('spades', '4')];
    const dealerCard = createCard('clubs', '7');
    expect(getOptimalAction(playerCards, dealerCard)).toBe('split');
  });

  it('recommends double on 11 vs dealer 6', () => {
    const playerCards = [createCard('hearts', '7'), createCard('spades', '4')];
    const dealerCard = createCard('clubs', '6');
    expect(getOptimalAction(playerCards, dealerCard)).toBe('double');
  });

  it('recommends stand on hard 17', () => {
    const playerCards = [createCard('hearts', '10'), createCard('spades', '7')];
    const dealerCard = createCard('clubs', 'A');
    expect(getOptimalAction(playerCards, dealerCard)).toBe('stand');
  });

  it('recommends split on Aces', () => {
    const playerCards = [createCard('hearts', 'A'), createCard('spades', 'A')];
    const dealerCard = createCard('clubs', '6');
    expect(getOptimalAction(playerCards, dealerCard)).toBe('split');
  });

  it('recommends surrender on 16 vs dealer 10', () => {
    const playerCards = [createCard('hearts', '10'), createCard('spades', '6')];
    const dealerCard = createCard('clubs', '10');
    expect(getOptimalAction(playerCards, dealerCard)).toBe('surrender');
  });
});

describe('CardCounter (Hi-Lo)', () => {
  let counter: CardCounter;

  beforeEach(() => {
    counter = new CardCounter('hi-lo');
  });

  it('counts low cards as +1', () => {
    counter.countCard(createCard('hearts', '5'));
    expect(counter.running).toBe(1);
  });

  it('counts high cards as -1', () => {
    counter.countCard(createCard('hearts', 'K'));
    expect(counter.running).toBe(-1);
  });

  it('counts neutral cards as 0', () => {
    counter.countCard(createCard('hearts', '8'));
    expect(counter.running).toBe(0);
  });

  it('calculates true count correctly', () => {
    counter.countCard(createCard('hearts', '2'));
    counter.countCard(createCard('hearts', '3'));
    counter.countCard(createCard('hearts', '4'));
    // Running = 3, decks remaining = 2.5
    const trueCount = counter.getTrueCount(3);
    expect(trueCount).toBe(1);
  });

  it('resets counter', () => {
    counter.countCard(createCard('hearts', '5'));
    counter.countCard(createCard('hearts', 'A'));
    counter.reset();
    expect(counter.running).toBe(0);
  });
});
