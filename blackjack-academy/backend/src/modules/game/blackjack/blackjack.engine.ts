import { Card } from './card';
import { Shoe } from './deck';
import { calculateHandValue, getOptimalAction, isBlackjack, PlayerAction } from './basic-strategy';
import { CardCounter, CountingSystem } from './card-counting';

export type GameVariant = 'classic' | 'european' | 'atlantic-city' | 'double-exposure';
export type GameState = 'idle' | 'betting' | 'player-turn' | 'dealer-turn' | 'complete';
export type HandResult = 'win' | 'loss' | 'push' | 'blackjack' | 'surrender' | 'bust';

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

export interface GameOptions {
  deckCount?: number;
  variant?: GameVariant;
  countingSystem?: CountingSystem;
  softSeventeen?: boolean; // dealer stands on soft 17 (S17) vs hits (H17)
  doubleAfterSplit?: boolean;
  surrenderAllowed?: boolean;
  blackjackPayout?: number; // 1.5 = 3:2, 1.2 = 6:5
}

const DEFAULTS: Required<GameOptions> = {
  deckCount: 6,
  variant: 'classic',
  countingSystem: 'hi-lo',
  softSeventeen: true,
  doubleAfterSplit: true,
  surrenderAllowed: true,
  blackjackPayout: 1.5,
};

export class BlackjackEngine {
  private shoe: Shoe;
  private counter: CardCounter;
  private opts: Required<GameOptions>;

  public state: GameState = 'idle';
  public playerHands: Hand[] = [];
  public activeHandIndex = 0;
  public dealerHand: Hand = { cards: [], bet: 0 };
  public chips: number;
  public currentBet = 0;
  public message = 'Place your bet to start';

  constructor(startingChips = 1000, options: GameOptions = {}) {
    this.opts = { ...DEFAULTS, ...options };
    this.shoe = new Shoe(this.opts.deckCount);
    this.counter = new CardCounter(this.opts.countingSystem);
    this.chips = startingChips;
  }

  placeBet(amount: number): void {
    if (this.state !== 'idle' && this.state !== 'complete') {
      throw new Error('Cannot place bet now');
    }
    if (amount <= 0 || amount > this.chips) {
      throw new Error(`Invalid bet: ${amount}. Available chips: ${this.chips}`);
    }
    this.currentBet = amount;
    this.chips -= amount;
    this.deal();
  }

  private deal(): void {
    if (this.shoe.needsReshuffle) {
      this.shoe.shuffle();
      this.counter.reset();
    }

    this.playerHands = [{ cards: [], bet: this.currentBet }];
    this.activeHandIndex = 0;
    this.dealerHand = { cards: [], bet: 0 };
    this.state = 'player-turn';

    // Classic deal order: P, D, P, D(faceDown for European)
    const europeanNoHole = this.opts.variant === 'european';

    this.playerHands[0].cards.push(this.shoe.deal());
    this.dealerHand.cards.push(this.shoe.deal());
    this.playerHands[0].cards.push(this.shoe.deal());
    this.dealerHand.cards.push(this.shoe.deal(!europeanNoHole ? true : false)); // hole card face down

    // Count visible cards
    this.counter.countCards(this.playerHands[0].cards);
    this.counter.countCard(this.dealerHand.cards[0]); // only upcard

    // Check player blackjack
    if (isBlackjack(this.playerHands[0].cards)) {
      if (!isBlackjack(this.getRevealedDealerHand())) {
        this.settleBlackjack();
      } else {
        // Both blackjack = push
        this.revealDealerHole();
        this.playerHands[0].result = 'push';
        this.chips += this.currentBet;
        this.state = 'complete';
        this.message = 'Push — both have Blackjack!';
      }
      return;
    }

    this.message = 'Your turn — choose an action';
  }

  hit(): void {
    this.assertState('player-turn');
    const hand = this.activeHand;
    const card = this.shoe.deal();
    hand.cards.push(card);
    this.counter.countCard(card);

    const { total, isBust } = calculateHandValue(hand.cards);

    if (isBust) {
      hand.result = 'bust';
      this.message = `Bust! Total: ${total}`;
      this.advanceHand();
    } else if (total === 21) {
      this.message = `21! Standing automatically.`;
      this.advanceHand();
    } else {
      this.message = `Total: ${total}`;
    }
  }

  stand(): void {
    this.assertState('player-turn');
    this.activeHand.result = undefined; // will be set in settlement
    this.message = 'Standing...';
    this.advanceHand();
  }

  double(): void {
    this.assertState('player-turn');
    const hand = this.activeHand;

    if (hand.cards.length !== 2) throw new Error('Can only double on first two cards');
    if (hand.bet > this.chips) throw new Error('Not enough chips to double');
    if (hand.isSplit && !this.opts.doubleAfterSplit) throw new Error('Double after split not allowed');

    this.chips -= hand.bet;
    hand.bet *= 2;
    hand.isDoubled = true;

    const card = this.shoe.deal();
    hand.cards.push(card);
    this.counter.countCard(card);

    const { isBust, total } = calculateHandValue(hand.cards);
    if (isBust) {
      hand.result = 'bust';
      this.message = `Doubled — Bust! Total: ${total}`;
    } else {
      this.message = `Doubled — Total: ${total}`;
    }
    this.advanceHand();
  }

  split(): void {
    this.assertState('player-turn');
    const hand = this.activeHand;

    if (hand.cards.length !== 2) throw new Error('Can only split two cards');
    const v1 = hand.cards[0].value;
    const v2 = hand.cards[1].value;
    const isTenPair =
      ['10', 'J', 'Q', 'K'].includes(hand.cards[0].rank) &&
      ['10', 'J', 'Q', 'K'].includes(hand.cards[1].rank);
    if (v1 !== v2 && !isTenPair) throw new Error('Cards must be equal value to split');
    if (hand.bet > this.chips) throw new Error('Not enough chips to split');

    this.chips -= hand.bet;

    const newHand: Hand = {
      cards: [hand.cards.splice(1, 1)[0]],
      bet: hand.bet,
      isSplit: true,
    };
    hand.isSplit = true;

    // Deal one card to each hand
    const card1 = this.shoe.deal();
    const card2 = this.shoe.deal();
    hand.cards.push(card1);
    newHand.cards.push(card2);
    this.counter.countCard(card1);
    this.counter.countCard(card2);

    this.playerHands.splice(this.activeHandIndex + 1, 0, newHand);
    this.message = `Split! Playing hand 1 of ${this.playerHands.length}`;
  }

  surrender(): void {
    this.assertState('player-turn');
    if (!this.opts.surrenderAllowed) throw new Error('Surrender not allowed');
    if (this.activeHand.cards.length !== 2) throw new Error('Can only surrender on first two cards');

    this.activeHand.result = 'surrender';
    const returnAmount = Math.floor(this.activeHand.bet / 2);
    this.chips += returnAmount;
    this.message = `Surrendered — returned ${returnAmount} chips`;
    this.advanceHand();
  }

  private advanceHand(): void {
    this.activeHandIndex++;

    if (this.activeHandIndex >= this.playerHands.length) {
      this.dealerTurn();
    } else {
      const { total } = calculateHandValue(this.activeHand.cards);
      this.message = `Hand ${this.activeHandIndex + 1}: Total ${total}`;
    }
  }

  private dealerTurn(): void {
    this.state = 'dealer-turn';
    this.revealDealerHole();

    while (this.shouldDealerHit()) {
      const card = this.shoe.deal();
      this.dealerHand.cards.push(card);
      this.counter.countCard(card);
    }

    this.settle();
  }

  private shouldDealerHit(): boolean {
    const { total, isSoft } = calculateHandValue(this.dealerHand.cards);
    if (total < 17) return true;
    if (total === 17 && isSoft && !this.opts.softSeventeen) return true; // H17
    return false;
  }

  private settle(): void {
    const { total: dealerTotal, isBust: dealerBust } = calculateHandValue(this.dealerHand.cards);
    const dealerBJ = isBlackjack(this.dealerHand.cards);

    let messages: string[] = [];

    for (const hand of this.playerHands) {
      if (hand.result === 'surrender' || hand.result === 'bust') continue;

      const { total: playerTotal } = calculateHandValue(hand.cards);
      const playerBJ = isBlackjack(hand.cards) && !hand.isSplit;

      if (playerBJ) {
        hand.result = 'blackjack';
        const payout = Math.floor(hand.bet * this.opts.blackjackPayout) + hand.bet;
        this.chips += payout;
        hand.payout = payout;
        messages.push(`Blackjack! Won ${payout - hand.bet}`);
      } else if (dealerBust) {
        hand.result = 'win';
        this.chips += hand.bet * 2;
        hand.payout = hand.bet;
        messages.push(`Dealer bust — won ${hand.bet}`);
      } else if (playerTotal > dealerTotal) {
        hand.result = 'win';
        this.chips += hand.bet * 2;
        hand.payout = hand.bet;
        messages.push(`Won ${hand.bet}`);
      } else if (playerTotal === dealerTotal) {
        hand.result = 'push';
        this.chips += hand.bet;
        hand.payout = 0;
        messages.push('Push');
      } else {
        hand.result = 'loss';
        hand.payout = -hand.bet;
        messages.push(`Lost ${hand.bet}`);
      }
    }

    this.state = 'complete';
    this.message = messages.join(' | ') || `Dealer: ${dealerTotal}`;
  }

  private settleBlackjack(): void {
    this.revealDealerHole();
    this.playerHands[0].result = 'blackjack';
    const payout = Math.floor(this.currentBet * this.opts.blackjackPayout) + this.currentBet;
    this.chips += payout;
    this.playerHands[0].payout = payout - this.currentBet;
    this.state = 'complete';
    this.message = `Blackjack! Won ${payout - this.currentBet} chips!`;
  }

  private revealDealerHole(): void {
    if (this.dealerHand.cards[1]?.faceDown) {
      this.dealerHand.cards[1].faceDown = false;
      this.counter.countCard(this.dealerHand.cards[1]);
    }
  }

  newRound(): void {
    this.playerHands = [];
    this.dealerHand = { cards: [], bet: 0 };
    this.activeHandIndex = 0;
    this.currentBet = 0;
    this.state = 'idle';
    this.message = 'Place your bet';
  }

  getSnapshot(): GameSnapshot {
    const decksRemaining = this.shoe.decksRemaining;
    const trueCount = this.counter.getTrueCount(decksRemaining);
    const optimalAction = this.state === 'player-turn' && this.activeHand?.cards.length
      ? getOptimalAction(
          this.activeHand.cards,
          this.dealerHand.cards[0],
          this.activeHand.cards.length === 2 && this.activeHand.bet <= this.chips,
          this.activeHand.cards.length === 2 && !this.activeHand.isSplit && this.activeHand.bet <= this.chips,
          this.opts.surrenderAllowed && this.activeHand.cards.length === 2,
        )
      : undefined;

    // Mask face-down cards so frontend never receives their values
    const maskedDealerHand = {
      ...this.dealerHand,
      cards: this.dealerHand.cards.map(c =>
        c.faceDown ? { suit: 'spades' as const, rank: '?' as any, value: 0, faceDown: true } : c
      ),
    };

    return {
      state: this.state,
      playerHands: this.playerHands,
      activeHandIndex: this.activeHandIndex,
      dealerHand: maskedDealerHand,
      bet: this.currentBet,
      chips: this.chips,
      runningCount: this.counter.running,
      trueCount,
      decksRemaining,
      optimalAction,
      message: this.message,
      variant: this.opts.variant,
    };
  }

  private get activeHand(): Hand {
    const hand = this.playerHands[this.activeHandIndex];
    if (!hand) throw new Error(`No active hand at index ${this.activeHandIndex}`);
    return hand;
  }

  private getRevealedDealerHand(): Card[] {
    return this.dealerHand.cards.map(c => ({ ...c, faceDown: false }));
  }

  private assertState(expected: GameState): void {
    if (this.state !== expected) {
      throw new Error(`Invalid action in state: ${this.state}`);
    }
  }
}
