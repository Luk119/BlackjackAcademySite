import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BlackjackEngine, GameOptions, GameVariant } from './blackjack/blackjack.engine';
import { PlayerAction } from './blackjack/basic-strategy';
import { CountingSystem } from './blackjack/card-counting';

// In-memory game sessions (production: use Redis)
const activeSessions = new Map<string, BlackjackEngine>();

interface StartSessionOptions {
  deckCount: number;
  variant: GameVariant;
  countingSystem: CountingSystem;
}

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async startSession(userId: string, options: StartSessionOptions) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const session = await this.prisma.gameSession.create({
      data: {
        userId,
        variant: options.variant,
        deckCount: options.deckCount,
        chipsStart: user.chips,
        mode: 'practice',
      },
    });

    const engine = new BlackjackEngine(user.chips, {
      deckCount: options.deckCount,
      variant: options.variant,
      countingSystem: options.countingSystem,
    });

    activeSessions.set(session.id, engine);

    return { sessionId: session.id, snapshot: engine.getSnapshot() };
  }

  async placeBet(userId: string, sessionId: string, amount: number) {
    const engine = this.getEngine(sessionId);
    engine.placeBet(amount);
    return engine.getSnapshot();
  }

  async performAction(userId: string, sessionId: string, action: PlayerAction) {
    const engine = this.getEngine(sessionId);
    const snapshotBefore = engine.getSnapshot();
    const wasOptimal = !!snapshotBefore.optimalAction && snapshotBefore.optimalAction === action;

    switch (action) {
      case 'hit': engine.hit(); break;
      case 'stand': engine.stand(); break;
      case 'double': engine.double(); break;
      case 'split': engine.split(); break;
      case 'surrender': engine.surrender(); break;
      default: throw new BadRequestException(`Unknown action: ${action}`);
    }

    const snapshot = engine.getSnapshot();

    // Record hand when round is complete
    if (snapshot.state === 'complete') {
      await this.recordHands(userId, sessionId, snapshot, snapshotBefore.optimalAction, wasOptimal, action);
      await this.updateUserStats(userId, snapshot, wasOptimal, action);
      // Save chips to DB after every completed round
      await this.prisma.user.update({
        where: { id: userId },
        data: { chips: snapshot.chips },
      });
    }

    const achievementsUnlocked = await this.checkAchievements(userId);

    return { snapshot, achievementsUnlocked };
  }

  async newRound(userId: string, sessionId: string) {
    const engine = this.getEngine(sessionId);
    engine.newRound();
    return engine.getSnapshot();
  }

  async endSession(userId: string, sessionId: string) {
    const engine = this.getEngine(sessionId);
    const snapshot = engine.getSnapshot();

    const session = await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        chipsEnd: snapshot.chips,
      },
    });

    // Update user chips
    await this.prisma.user.update({
      where: { id: userId },
      data: { chips: snapshot.chips },
    });

    activeSessions.delete(sessionId);

    const hands = await this.prisma.gameHand.count({ where: { sessionId } });
    const wins = await this.prisma.gameHand.count({ where: { sessionId, result: { in: ['win', 'blackjack'] } } });

    return {
      sessionId,
      handsPlayed: hands,
      winRate: hands > 0 ? Math.round((wins / hands) * 100) : 0,
      chipsChange: snapshot.chips - session.chipsStart,
      finalChips: snapshot.chips,
    };
  }

  private async recordHands(
    userId: string,
    sessionId: string,
    snapshot: any,
    optimalAction: string | undefined,
    wasOptimal: boolean,
    lastAction: string,
  ) {
    for (const hand of snapshot.playerHands) {
      if (!hand.result) continue;

      const { total: playerTotal } = this.calcTotal(hand.cards);
      const { total: dealerTotal } = this.calcTotal(snapshot.dealerHand.cards);

      await this.prisma.gameHand.create({
        data: {
          sessionId,
          playerCards: hand.cards,
          dealerCards: snapshot.dealerHand.cards,
          playerTotal,
          dealerTotal,
          result: hand.result,
          betAmount: hand.bet,
          playerAction: lastAction,
          optimalAction: optimalAction || null,
          wasOptimal,
          runningCount: snapshot.runningCount,
          trueCount: snapshot.trueCount,
        },
      });
    }

    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { handsPlayed: { increment: 1 } },
    });
  }

  private async updateUserStats(userId: string, snapshot: any, wasOptimal: boolean, lastAction: string) {
    const wins = snapshot.playerHands.filter((h: any) => ['win', 'blackjack'].includes(h.result)).length;
    const losses = snapshot.playerHands.filter((h: any) => ['loss', 'bust'].includes(h.result)).length;
    const pushes = snapshot.playerHands.filter((h: any) => h.result === 'push').length;
    const blackjacks = snapshot.playerHands.filter((h: any) => h.result === 'blackjack').length;

    // Calculate chips won/lost this round
    const chipsWon = snapshot.playerHands.reduce((sum: number, h: any) => {
      if (['win', 'blackjack'].includes(h.result) && h.payout > 0) return sum + h.payout;
      return sum;
    }, 0);
    const chipsLost = snapshot.playerHands.reduce((sum: number, h: any) => {
      if (['loss', 'bust'].includes(h.result)) return sum + h.bet;
      return sum;
    }, 0);

    const doublesWon = lastAction === 'double'
      ? snapshot.playerHands.filter((h: any) => ['win', 'blackjack'].includes(h.result) && h.isDoubled).length
      : 0;
    const splitsPlayed = lastAction === 'split' ? 1 : 0;

    await this.prisma.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalGames: 1,
        gamesWon: wins,
        gamesLost: losses,
        gamesPushed: pushes,
        totalHandsPlayed: snapshot.playerHands.length,
        correctDecisions: wasOptimal ? 1 : 0,
        incorrectDecisions: wasOptimal ? 0 : 1,
        blackjacksHit: blackjacks,
        doublesWon,
        splitsPlayed,
        totalChipsWon: chipsWon,
        totalChipsLost: chipsLost,
        biggestWin: chipsWon,
      },
      update: {
        totalGames: { increment: 1 },
        gamesWon: { increment: wins },
        gamesLost: { increment: losses },
        gamesPushed: { increment: pushes },
        totalHandsPlayed: { increment: snapshot.playerHands.length },
        correctDecisions: wasOptimal ? { increment: 1 } : undefined,
        incorrectDecisions: !wasOptimal ? { increment: 1 } : undefined,
        blackjacksHit: blackjacks > 0 ? { increment: blackjacks } : undefined,
        doublesWon: doublesWon > 0 ? { increment: doublesWon } : undefined,
        splitsPlayed: splitsPlayed > 0 ? { increment: splitsPlayed } : undefined,
        totalChipsWon: chipsWon > 0 ? { increment: chipsWon } : undefined,
        totalChipsLost: chipsLost > 0 ? { increment: chipsLost } : undefined,
      },
    });

    // Update biggestWin separately if needed
    if (chipsWon > 0) {
      const stats = await this.prisma.userStats.findUnique({ where: { userId } });
      if (stats && chipsWon > stats.biggestWin) {
        await this.prisma.userStats.update({
          where: { userId },
          data: { biggestWin: chipsWon },
        });
      }
    }

    // Award XP for playing
    const xpGained = wins > 0 ? 10 * wins : 2;
    await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xpGained } },
    });

    // Level up check
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
      if (newLevel > user.level) {
        await this.prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
      }
    }
  }

  private async checkAchievements(userId: string): Promise<any[]> {
    const [stats, user, allAchievements, unlockedIds] = await Promise.all([
      this.prisma.userStats.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.achievement.findMany(),
      this.prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
    ]);

    if (!stats || !user || allAchievements.length === 0) return [];

    const unlockedSet = new Set(unlockedIds.map(u => u.achievementId));
    const newlyUnlocked: any[] = [];

    for (const achievement of allAchievements) {
      if (unlockedSet.has(achievement.id)) continue;

      const condition = achievement.condition as any;
      let unlocked = false;

      switch (condition.type) {
        case 'hands_played':
          unlocked = stats.totalHandsPlayed >= condition.threshold;
          break;
        case 'blackjacks_hit':
          unlocked = stats.blackjacksHit >= condition.threshold;
          break;
        case 'games_won':
          unlocked = stats.gamesWon >= condition.threshold;
          break;
        case 'correct_decisions':
          unlocked = stats.correctDecisions >= condition.threshold;
          break;
        case 'chips_won':
          unlocked = stats.totalChipsWon >= condition.threshold;
          break;
        case 'level_reached':
          unlocked = user.level >= condition.threshold;
          break;
        case 'biggest_win':
          unlocked = stats.biggestWin >= condition.threshold;
          break;
      }

      if (unlocked) {
        await this.prisma.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        });
        await this.prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: achievement.xpReward } },
        });
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  async saveChipsOnDisconnect(userId: string, sessionId: string) {
    const engine = activeSessions.get(sessionId);
    if (!engine) return;
    const snapshot = engine.getSnapshot();
    await this.prisma.user.update({
      where: { id: userId },
      data: { chips: snapshot.chips },
    });
    activeSessions.delete(sessionId);
  }

  private getEngine(sessionId: string): BlackjackEngine {
    const engine = activeSessions.get(sessionId);
    if (!engine) throw new NotFoundException('Game session not found');
    return engine;
  }

  private calcTotal(cards: any[]): { total: number } {
    let total = 0;
    let aces = 0;
    for (const card of cards) {
      if (card.faceDown) continue;
      if (card.rank === 'A') { aces++; total += 11; }
      else total += card.value;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return { total };
  }
}
