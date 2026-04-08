import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalLeaderboard(limit = 50) {
    const users = await this.prisma.user.findMany({
      orderBy: [{ level: 'desc' }, { xp: 'desc' }],
      take: limit,
      select: {
        id: true,
        username: true,
        level: true,
        xp: true,
        chips: true,
        avatarUrl: true,
        stats: {
          select: {
            totalHandsPlayed: true,
            gamesWon: true,
            blackjacksHit: true,
          },
        },
      },
    });

    return users.map((user, index) => ({
      rank: index + 1,
      ...user,
      winRate:
        user.stats && user.stats.totalHandsPlayed > 0
          ? Math.round((user.stats.gamesWon / user.stats.totalHandsPlayed) * 100)
          : 0,
    }));
  }

  async getWeeklyLeaderboard(limit = 50) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const results = await this.prisma.gameSession.groupBy({
      by: ['userId'],
      where: { startedAt: { gte: oneWeekAgo } },
      _sum: { handsPlayed: true },
      _count: true,
      orderBy: { _sum: { handsPlayed: 'desc' } },
      take: limit,
    });

    const userIds = results.map(r => r.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, level: true, avatarUrl: true },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    return results.map((result, index) => ({
      rank: index + 1,
      user: userMap.get(result.userId),
      handsThisWeek: result._sum.handsPlayed || 0,
      sessionsThisWeek: result._count,
    }));
  }

  async getUserRank(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, xp: true },
    });
    if (!user) return null;

    const rank = await this.prisma.user.count({
      where: {
        OR: [
          { level: { gt: user.level } },
          { level: user.level, xp: { gt: user.xp } },
        ],
      },
    });

    return { rank: rank + 1, level: user.level, xp: user.xp };
  }
}
