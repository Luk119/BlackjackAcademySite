'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { lessonsApi } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/utils/cn';
import type { Lesson } from '@/types/user.types';

const CATEGORY_ICONS: Record<string, string> = {
  basics: '🃏',
  strategy: '♟️',
  counting: '🔢',
  advanced: '🎓',
};

const LEVEL_LABELS: Record<number, string> = {
  1: 'Początkujący',
  2: 'Średniozaawansowany',
  3: 'Zaawansowany',
};

export default function LessonsPage() {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?from=/lessons');
  }, [isAuthenticated]);

  const { data: lessons = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ['lessons'],
    queryFn: lessonsApi.getAll,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  const grouped = lessons.reduce((acc: Record<string, Lesson[]>, l) => {
    if (!acc[l.category]) acc[l.category] = [];
    acc[l.category].push(l);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Nauka Blackjacka</h1>
        <p className="text-gray-400 mt-2">Ukończ lekcje, aby odblokować zaawansowane treści i zdobyć XP</p>
      </div>

      {isLoading && (
        <div className="text-center text-gray-400 py-12">Ładowanie lekcji...</div>
      )}

      {Object.entries(grouped).map(([category, categoryLessons]) => (
        <div key={category} className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white capitalize mb-4">
            <span>{CATEGORY_ICONS[category] || '📖'}</span>
            {category}
          </h2>

          <div className="space-y-3">
            {categoryLessons.map((lesson, i) => {
              const isCompleted = lesson.progress?.completed;
              const isLocked = !lesson.isUnlocked;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={isLocked ? '#' : `/lessons/${lesson.id}`}>
                    <motion.div
                      whileHover={!isLocked ? { x: 4 } : undefined}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border transition-colors',
                        isLocked
                          ? 'bg-gray-900/30 border-gray-800/50 cursor-not-allowed opacity-50'
                          : isCompleted
                          ? 'bg-green-900/20 border-green-800/50 hover:border-green-700'
                          : 'bg-gray-900/60 border-gray-800 hover:border-gold/40 cursor-pointer',
                      )}
                    >
                      {/* Status icon */}
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0',
                        isLocked ? 'bg-gray-800 text-gray-600' :
                        isCompleted ? 'bg-green-700 text-white' :
                        'bg-gray-800 text-gray-300',
                      )}>
                        {isLocked ? '🔒' : isCompleted ? '✓' : lesson.order}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-white">{lesson.title}</span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            lesson.level === 1 && 'bg-green-900/50 text-green-400',
                            lesson.level === 2 && 'bg-yellow-900/50 text-yellow-400',
                            lesson.level === 3 && 'bg-red-900/50 text-red-400',
                          )}>
                            {LEVEL_LABELS[lesson.level]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{lesson.description}</p>
                      </div>

                      {/* Meta */}
                      <div className="text-right text-xs text-gray-500 flex-shrink-0 space-y-1">
                        <div>+{lesson.xpReward} XP</div>
                        <div>{lesson.duration} min</div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
