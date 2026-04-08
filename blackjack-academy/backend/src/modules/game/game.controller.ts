import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('game')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('game')
export class GameController {
  @Get('active-session')
  @ApiOperation({ summary: 'Get current active session info' })
  getActiveSession(@CurrentUser('id') userId: string) {
    return { userId, message: 'Connect via WebSocket /game namespace' };
  }
}
