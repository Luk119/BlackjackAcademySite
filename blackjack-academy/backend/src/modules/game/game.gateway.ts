import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly gameService: GameService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });

      client.data.userId = payload.sub;
      client.data.username = payload.username;
      this.userSockets.set(payload.sub, client.id);

      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected: ${payload.username} (${client.id})`);

      client.emit('connected', { message: 'Connected to Blackjack Academy', userId: payload.sub });
    } catch (err) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSockets.delete(client.data.userId);
      this.logger.log(`Client disconnected: ${client.data.username}`);
      // Auto-save chips when disconnecting mid-session
      if (client.data.sessionId) {
        try {
          await this.gameService.saveChipsOnDisconnect(client.data.userId, client.data.sessionId);
        } catch {}
      }
    }
  }

  @SubscribeMessage('game:start')
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deckCount?: number; variant?: string; countingSystem?: string },
  ) {
    try {
      const session = await this.gameService.startSession(client.data.userId, {
        deckCount: data.deckCount || 6,
        variant: data.variant as any || 'classic',
        countingSystem: data.countingSystem as any || 'hi-lo',
      });
      client.data.sessionId = session.sessionId;
      client.emit('game:started', session.snapshot);
    } catch (err) {
      client.emit('game:error', { message: err.message });
    }
  }

  @SubscribeMessage('game:bet')
  async handleBet(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { amount: number },
  ) {
    try {
      const snapshot = await this.gameService.placeBet(
        client.data.userId,
        client.data.sessionId,
        data.amount,
      );
      client.emit('game:update', snapshot);
    } catch (err) {
      client.emit('game:error', { message: err.message });
    }
  }

  @SubscribeMessage('game:action')
  async handleAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { action: string },
  ) {
    try {
      const result = await this.gameService.performAction(
        client.data.userId,
        client.data.sessionId,
        data.action as any,
      );
      client.emit('game:update', result.snapshot);

      if (result.achievementsUnlocked?.length) {
        client.emit('achievements:unlocked', result.achievementsUnlocked);
      }
    } catch (err) {
      client.emit('game:error', { message: err.message });
    }
  }

  @SubscribeMessage('game:new-round')
  async handleNewRound(@ConnectedSocket() client: Socket) {
    try {
      const snapshot = await this.gameService.newRound(
        client.data.userId,
        client.data.sessionId,
      );
      client.emit('game:update', snapshot);
    } catch (err) {
      client.emit('game:error', { message: err.message });
    }
  }

  @SubscribeMessage('game:end')
  async handleEndGame(@ConnectedSocket() client: Socket) {
    try {
      const summary = await this.gameService.endSession(
        client.data.userId,
        client.data.sessionId,
      );
      client.emit('game:ended', summary);
    } catch (err) {
      client.emit('game:error', { message: err.message });
    }
  }

  // Broadcast leaderboard update to all connected clients
  broadcastLeaderboardUpdate(data: any) {
    this.server.emit('leaderboard:update', data);
  }

  // Send achievement notification to specific user
  notifyAchievement(userId: string, achievement: any) {
    this.server.to(`user:${userId}`).emit('achievement:unlocked', achievement);
  }
}
