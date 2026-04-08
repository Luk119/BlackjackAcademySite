import { PrismaClient } from '@prisma/client';
import { LESSONS_SEED, QUIZZES_SEED } from '../src/modules/lessons/lessons.data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed achievements
  const achievements = [
    { slug: 'first-win', name: 'First Win', description: 'Win your first hand', icon: '🃏', xpReward: 50, condition: { type: 'wins', threshold: 1, metric: 'gamesWon' } },
    { slug: 'ten-wins', name: 'Getting Good', description: 'Win 10 hands', icon: '⭐', xpReward: 100, condition: { type: 'wins', threshold: 10, metric: 'gamesWon' } },
    { slug: 'blackjack-master', name: 'Blackjack!', description: 'Hit 5 natural blackjacks', icon: '♠', xpReward: 200, condition: { type: 'blackjacks', threshold: 5, metric: 'blackjacksHit' } },
    { slug: 'strategy-student', name: 'Strategy Student', description: 'Play 20 hands using perfect basic strategy', icon: '📚', xpReward: 150, condition: { type: 'strategy', threshold: 20, metric: 'correctDecisions' } },
    { slug: 'counter-initiate', name: 'Counter Initiate', description: 'Complete the Hi-Lo lesson', icon: '🔢', xpReward: 200, condition: { type: 'lesson', threshold: 1, metric: 'cardCountingLesson' } },
    { slug: 'level-5', name: 'Level 5', description: 'Reach level 5', icon: '🏆', xpReward: 500, condition: { type: 'level', threshold: 5, metric: 'level' } },
    { slug: 'high-roller', name: 'High Roller', description: 'Accumulate 5000 chips', icon: '💰', xpReward: 300, condition: { type: 'chips', threshold: 5000, metric: 'chips' } },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      create: achievement,
      update: achievement,
    });
  }

  // Seed lessons
  for (const lesson of LESSONS_SEED) {
    const created = await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      create: lesson,
      update: lesson,
    });

    // Seed corresponding quizzes
    const quizData = QUIZZES_SEED.find(q => q.lessonSlug === lesson.slug);
    if (quizData) {
      await prisma.quiz.upsert({
        where: { id: `quiz-${lesson.slug}` },
        create: { id: `quiz-${lesson.slug}`, lessonId: created.id, title: quizData.title, questions: quizData.questions },
        update: { title: quizData.title, questions: quizData.questions },
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
