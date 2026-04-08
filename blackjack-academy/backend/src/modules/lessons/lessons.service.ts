import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllLessons(userId: string) {
    const [lessons, progress] = await Promise.all([
      this.prisma.lesson.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.lessonProgress.findMany({ where: { userId } }),
    ]);

    const progressMap = new Map(progress.map(p => [p.lessonId, p]));

    return lessons.map(lesson => ({
      ...lesson,
      progress: progressMap.get(lesson.id) || null,
      isUnlocked: this.isLessonUnlocked(lesson, progress.filter(p => p.completed).map(p => p.lessonId), lessons),
    }));
  }

  async getLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { quizzes: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const progress = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    return { ...lesson, progress };
  }

  async getLessonBySlug(userId: string, slug: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { slug },
      include: { quizzes: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return this.getLesson(userId, lesson.id);
  }

  async completeLesson(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const progress = await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, completed: true, completedAt: new Date(), attempts: 1 },
      update: { completed: true, completedAt: new Date(), attempts: { increment: 1 } },
    });

    // Award XP
    await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: lesson.xpReward } },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const newLevel = this.calculateLevel(user!.xp);
    if (newLevel > user!.level) {
      await this.prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
    }

    return { progress, xpEarned: lesson.xpReward, newLevel };
  }

  async submitQuiz(userId: string, quizId: string, answers: number[]) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const questions = (quiz.questions as any[]);
    let score = 0;
    const results = questions.map((q, i) => {
      const correct = answers[i] === q.correct;
      if (correct) score++;
      return { questionId: q.id, correct, explanation: q.explanation };
    });

    await this.prisma.quizResult.create({
      data: { userId, quizId, score, maxScore: questions.length, answers },
    });

    return { score, maxScore: questions.length, passed: score >= Math.ceil(questions.length * 0.7), results };
  }

  private isLessonUnlocked(lesson: any, completedIds: string[], allLessons: any[]): boolean {
    if (!lesson.prerequisites?.length) return true;
    return lesson.prerequisites.every((prereqSlug: string) => {
      const prereqLesson = allLessons.find(l => l.slug === prereqSlug);
      return prereqLesson && completedIds.includes(prereqLesson.id);
    });
  }

  private calculateLevel(xp: number): number {
    // Level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }
}
