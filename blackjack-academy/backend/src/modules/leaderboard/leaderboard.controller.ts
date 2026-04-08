import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('global')
  getGlobal(@Query('limit') limit = 50) {
    return this.leaderboardService.getGlobalLeaderboard(+limit);
  }

  @Get('weekly')
  getWeekly(@Query('limit') limit = 50) {
    return this.leaderboardService.getWeeklyLeaderboard(+limit);
  }

  @Get('my-rank')
  getMyRank(@CurrentUser('id') userId: string) {
    return this.leaderboardService.getUserRank(userId);
  }
}
