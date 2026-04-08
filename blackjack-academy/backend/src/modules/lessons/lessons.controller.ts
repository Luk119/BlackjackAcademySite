import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LessonsService } from './lessons.service';
import { IsArray, IsNumber } from 'class-validator';

class SubmitQuizDto {
  @IsArray()
  @IsNumber({}, { each: true })
  answers: number[];
}

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lessons with user progress' })
  getAll(@CurrentUser('id') userId: string) {
    return this.lessonsService.getAllLessons(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  getOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.lessonsService.getLesson(userId, id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get lesson by slug' })
  getBySlug(@CurrentUser('id') userId: string, @Param('slug') slug: string) {
    return this.lessonsService.getLessonBySlug(userId, slug);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark lesson as completed' })
  complete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.lessonsService.completeLesson(userId, id);
  }

  @Post('quiz/:quizId/submit')
  @ApiOperation({ summary: 'Submit quiz answers' })
  submitQuiz(
    @CurrentUser('id') userId: string,
    @Param('quizId') quizId: string,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.lessonsService.submitQuiz(userId, quizId, dto.answers);
  }
}
