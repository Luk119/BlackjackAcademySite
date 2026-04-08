import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GameModule } from './modules/game/game.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { StatsModule } from './modules/stats/stats.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { PrismaModule } from './common/prisma/prisma.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    GameModule,
    LessonsModule,
    StatsModule,
    LeaderboardModule,
  ],
})
export class AppModule {}
