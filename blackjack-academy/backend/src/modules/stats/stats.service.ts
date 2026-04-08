import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(userId: string) {
    const [stats, user, recentSessions] = await Promise.all([
      this.prisma.userStats.findUnique({ where: { userId } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          achievements: { include: { achievement: true } },
          lessonProgress: { where: { completed: true } },
        },
      }),
      this.prisma.gameSession.findMany({
        where: { userId, endedAt: { not: null } },
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
    ]);

    if (!user) throw new NotFoundException('User not found');

    const winRate = stats && stats.totalHandsPlayed > 0
      ? Math.round((stats.gamesWon / stats.totalHandsPlayed) * 100)
      : 0;

    const decisionAccuracy = stats && (stats.correctDecisions + stats.incorrectDecisions) > 0
      ? Math.round((stats.correctDecisions / (stats.correctDecisions + stats.incorrectDecisions)) * 100)
      : 0;

    return {
      user: {
        id: user.id,
        username: user.username,
        level: user.level,
        xp: user.xp,
        chips: user.chips,
        xpToNextLevel: this.xpForNextLevel(user.level) - user.xp,
        achievementCount: user.achievements.length,
        completedLessons: user.lessonProgress.length,
      },
      stats: {
        ...stats,
        winRate,
        decisionAccuracy,
      },
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        date: s.startedAt,
        handsPlayed: s.handsPlayed,
        chipsChange: (s.chipsEnd || s.chipsStart) - s.chipsStart,
        variant: s.variant,
      })),
      achievements: user.achievements.map(ua => ({
        ...ua.achievement,
        unlockedAt: ua.unlockedAt,
      })),
    };
  }

  async getSessionHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      this.prisma.gameSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
        include: { hands: { select: { result: true } } },
      }),
      this.prisma.gameSession.count({ where: { userId } }),
    ]);

    return {
      data: sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  private xpForNextLevel(level: number): number {
    return (level * level) * 100;
  }
}
