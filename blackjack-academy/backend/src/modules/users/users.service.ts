import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() @IsIn(['dark', 'light']) theme?: string;
  @IsOptional() @IsBoolean() soundEnabled?: boolean;
  @IsOptional() @IsBoolean() hintsEnabled?: boolean;
  @IsOptional() @IsString() @IsIn(['hi-lo', 'hi-opt-i', 'ko', 'omega-ii']) countingSystem?: string;
  @IsOptional() @IsString() @IsIn(['classic', 'european', 'atlantic-city']) preferredVariant?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        stats: true,
        achievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' }, take: 5 },
        lessonProgress: { where: { completed: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { bio, avatarUrl, theme, soundEnabled, hintsEnabled, countingSystem, preferredVariant } = dto;

    await Promise.all([
      avatarUrl
        ? this.prisma.user.update({ where: { id: userId }, data: { avatarUrl } })
        : Promise.resolve(null),
      (bio !== undefined || theme !== undefined || soundEnabled !== undefined || hintsEnabled !== undefined || countingSystem || preferredVariant)
        ? this.prisma.userProfile.upsert({
            where: { userId },
            create: { userId, bio, theme, soundEnabled, hintsEnabled, countingSystem, preferredVariant },
            update: {
              ...(bio !== undefined && { bio }),
              ...(theme !== undefined && { theme }),
              ...(soundEnabled !== undefined && { soundEnabled }),
              ...(hintsEnabled !== undefined && { hintsEnabled }),
              ...(countingSystem && { countingSystem }),
              ...(preferredVariant && { preferredVariant }),
            },
          })
        : Promise.resolve(null),
    ]);

    return this.getProfile(userId);
  }
}
