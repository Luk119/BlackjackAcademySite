export const LESSONS_SEED = [
  {
    slug: 'blackjack-basics',
    title: 'Blackjack Basics',
    description: 'Learn the fundamental rules of blackjack',
    order: 1,
    level: 1,
    category: 'basics',
    xpReward: 50,
    duration: 10,
    prerequisites: [],
    content: {
      blocks: [
        {
          type: 'heading',
          text: 'What is Blackjack?',
        },
        {
          type: 'paragraph',
          text: 'Blackjack, also known as 21, is a card game where the goal is to beat the dealer by getting a hand value as close to 21 as possible without going over.',
        },
        {
          type: 'heading',
          text: 'Card Values',
        },
        {
          type: 'list',
          items: [
            'Number cards (2-10): Face value',
            'Face cards (J, Q, K): Worth 10',
            'Ace: Worth 1 or 11 (whichever benefits you most)',
          ],
        },
        {
          type: 'heading',
          text: 'The Goal',
        },
        {
          type: 'paragraph',
          text: 'Beat the dealer\'s hand without exceeding 21. If you go over 21, you "bust" and lose.',
        },
        {
          type: 'tip',
          text: 'A "Blackjack" is an Ace plus any 10-value card. It typically pays 3:2 and beats a regular 21.',
        },
      ],
    },
  },
  {
    slug: 'player-actions',
    title: 'Player Actions',
    description: 'Hit, Stand, Double Down, Split, and Surrender',
    order: 2,
    level: 1,
    category: 'basics',
    xpReward: 75,
    duration: 15,
    prerequisites: ['blackjack-basics'],
    content: {
      blocks: [
        {
          type: 'heading',
          text: 'Your Options at the Table',
        },
        {
          type: 'action',
          name: 'Hit',
          description: 'Draw another card. Use this when your total is low and you want more.',
          icon: '👊',
        },
        {
          type: 'action',
          name: 'Stand',
          description: 'Keep your current hand and end your turn.',
          icon: '✋',
        },
        {
          type: 'action',
          name: 'Double Down',
          description: 'Double your bet and receive exactly one more card. Only available on your first two cards.',
          icon: '2️⃣',
        },
        {
          type: 'action',
          name: 'Split',
          description: 'If you have two cards of the same value, split them into two separate hands.',
          icon: '✂️',
        },
        {
          type: 'action',
          name: 'Surrender',
          description: 'Fold your hand and recover half your bet. Best when the odds are strongly against you.',
          icon: '🏳️',
        },
      ],
    },
  },
  {
    slug: 'basic-strategy-intro',
    title: 'Introduction to Basic Strategy',
    description: 'The mathematically optimal way to play every hand',
    order: 3,
    level: 2,
    category: 'strategy',
    xpReward: 100,
    duration: 20,
    prerequisites: ['player-actions'],
    content: {
      blocks: [
        {
          type: 'heading',
          text: 'What is Basic Strategy?',
        },
        {
          type: 'paragraph',
          text: 'Basic strategy is a set of rules that tells you the mathematically optimal action for every possible player hand vs. every dealer upcard. By following basic strategy, you reduce the house edge to under 0.5%.',
        },
        {
          type: 'heading',
          text: 'Key Principles',
        },
        {
          type: 'list',
          items: [
            'Always split Aces and 8s',
            'Never split 10s, 5s, or 4s',
            'Double down on 11 (almost always)',
            'Stand on hard 17+',
            'Hit soft 17 or less',
          ],
        },
        {
          type: 'strategy-table',
          description: 'The full basic strategy chart is your roadmap to perfect play.',
        },
      ],
    },
  },
  {
    slug: 'card-counting-hilo',
    title: 'Hi-Lo Card Counting System',
    description: 'Learn the most popular card counting method',
    order: 4,
    level: 3,
    category: 'counting',
    xpReward: 150,
    duration: 30,
    prerequisites: ['basic-strategy-intro'],
    content: {
      blocks: [
        {
          type: 'heading',
          text: 'How Card Counting Works',
        },
        {
          type: 'paragraph',
          text: 'Card counting is a legal technique that tracks the ratio of high to low cards remaining in the shoe. When the count is high (many 10s and Aces remain), the player has an edge — bet more!',
        },
        {
          type: 'heading',
          text: 'The Hi-Lo System',
        },
        {
          type: 'count-values',
          values: [
            { cards: '2, 3, 4, 5, 6', count: '+1', reason: 'Low cards favor the dealer' },
            { cards: '7, 8, 9', count: '0', reason: 'Neutral cards' },
            { cards: '10, J, Q, K, A', count: '-1', reason: 'High cards favor the player' },
          ],
        },
        {
          type: 'heading',
          text: 'Running Count vs True Count',
        },
        {
          type: 'paragraph',
          text: 'The running count is the raw sum. The true count normalizes it per deck remaining: True Count = Running Count ÷ Decks Remaining.',
        },
        {
          type: 'tip',
          text: 'A true count of +2 or higher is generally when you should increase your bets.',
        },
      ],
    },
  },
  {
    slug: 'betting-strategy',
    title: 'Betting Strategy & Bankroll Management',
    description: 'How to bet based on the count and protect your bankroll',
    order: 5,
    level: 3,
    category: 'advanced',
    xpReward: 200,
    duration: 25,
    prerequisites: ['card-counting-hilo'],
    content: {
      blocks: [
        {
          type: 'heading',
          text: 'The Bet Spread',
        },
        {
          type: 'paragraph',
          text: 'A bet spread is the ratio between your minimum and maximum bets. A wider spread increases profit but also casino scrutiny. A typical spread is 1:8 or 1:12.',
        },
        {
          type: 'heading',
          text: 'Recommended Betting Ramp (Hi-Lo)',
        },
        {
          type: 'bet-ramp',
          values: [
            { trueCount: '≤ 1', bet: '1 unit', note: 'Minimum — no edge' },
            { trueCount: '2', bet: '2 units', note: 'Slight edge' },
            { trueCount: '3', bet: '4 units', note: 'Good advantage' },
            { trueCount: '4', bet: '8 units', note: 'Strong advantage' },
            { trueCount: '5+', bet: '12 units', note: 'Maximum edge' },
          ],
        },
        {
          type: 'heading',
          text: 'Bankroll Management',
        },
        {
          type: 'list',
          items: [
            'Your bankroll should be 200-300 units minimum',
            'Never risk more than 2% of bankroll in one hand',
            'Set a session loss limit (e.g., 50 units)',
            'Take breaks to avoid fatigue errors',
          ],
        },
      ],
    },
  },
];

export const QUIZZES_SEED = [
  {
    lessonSlug: 'blackjack-basics',
    title: 'Blackjack Basics Quiz',
    questions: [
      {
        id: 'q1',
        text: 'What is the value of a face card (J, Q, K)?',
        options: ['5', '10', '11', '15'],
        correct: 1,
        explanation: 'Face cards (Jack, Queen, King) are all worth 10 points.',
      },
      {
        id: 'q2',
        text: 'What is a "Blackjack"?',
        options: [
          'Any hand totaling 21',
          'An Ace plus any 10-value card on first deal',
          'Three cards totaling 21',
          'Two identical cards',
        ],
        correct: 1,
        explanation: 'A Blackjack is specifically an Ace combined with a 10-value card on the initial two-card deal.',
      },
      {
        id: 'q3',
        text: 'What happens when you "bust"?',
        options: [
          'You win double your bet',
          'The round is a push',
          'Your hand exceeds 21 and you lose',
          'You get to draw again',
        ],
        correct: 2,
        explanation: 'Busting means your hand value exceeds 21, which means an automatic loss.',
      },
    ],
  },
  {
    lessonSlug: 'card-counting-hilo',
    title: 'Hi-Lo Card Counting Quiz',
    questions: [
      {
        id: 'q1',
        text: 'In Hi-Lo, what value do you assign to a 5?',
        options: ['-1', '0', '+1', '+2'],
        correct: 2,
        explanation: 'In Hi-Lo, low cards (2-6) are assigned +1 because their removal benefits the dealer.',
      },
      {
        id: 'q2',
        text: 'The running count is +10 with 2.5 decks remaining. What is the true count?',
        options: ['2', '4', '5', '10'],
        correct: 1,
        explanation: 'True count = running count ÷ decks remaining = 10 ÷ 2.5 = 4',
      },
      {
        id: 'q3',
        text: 'At what true count should you generally start increasing your bet?',
        options: ['-1', '0', '+1', '+2'],
        correct: 3,
        explanation: 'A true count of +2 or higher generally indicates a player advantage, warranting larger bets.',
      },
    ],
  },
];
