'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { lessonsApi } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { BasicStrategyTable } from '@/components/lessons/BasicStrategyTable';
import { Quiz } from '@/components/lessons/Quiz';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

function renderBlock(block: any, index: number) {
  switch (block.type) {
    case 'heading':
      return <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3">{block.text}</h2>;
    case 'paragraph':
      return <p key={index} className="text-gray-300 leading-relaxed">{block.text}</p>;
    case 'list':
      return (
        <ul key={index} className="space-y-1.5 my-3">
          {block.items.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-gray-300">
              <span className="text-gold mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'tip':
      return (
        <div key={index} className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 my-4">
          <div className="flex items-center gap-2 mb-1">
            <span>💡</span>
            <span className="text-yellow-400 font-semibold text-sm">Pro Tip</span>
          </div>
          <p className="text-yellow-100/80 text-sm">{block.text}</p>
        </div>
      );
    case 'action':
      return (
        <div key={index} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 my-3 flex items-start gap-3">
          <span className="text-2xl">{block.icon}</span>
          <div>
            <div className="font-bold text-white">{block.name}</div>
            <p className="text-gray-400 text-sm mt-0.5">{block.description}</p>
          </div>
        </div>
      );
    case 'strategy-table':
      return <div key={index} className="my-6"><BasicStrategyTable /></div>;
    case 'count-values':
      return (
        <div key={index} className="space-y-2 my-4">
          {block.values.map((v: any, i: number) => (
            <div key={i} className="flex items-center gap-4 bg-gray-800/50 rounded-lg px-4 py-2.5">
              <span className="text-gray-300 font-mono w-28">{v.cards}</span>
              <span className={cn(
                'font-bold text-lg w-10',
                v.count === '+1' && 'text-green-400',
                v.count === '-1' && 'text-red-400',
                v.count === '0' && 'text-gray-500',
              )}>{v.count}</span>
              <span className="text-gray-400 text-sm">{v.reason}</span>
            </div>
          ))}
        </div>
      );
    case 'bet-ramp':
      return (
        <div key={index} className="overflow-x-auto my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase">
                <th className="text-left pb-2">True Count</th>
                <th className="text-left pb-2">Bet Size</th>
                <th className="text-left pb-2">Note</th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              {block.values.map((v: any, i: number) => (
                <tr key={i} className="border-t border-gray-800">
                  <td className="py-2 text-gold font-mono font-bold">{v.trueCount}</td>
                  <td className="py-2 text-white font-semibold">{v.bet}</td>
                  <td className="py-2 text-gray-400">{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, updateUser } = useUserStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => lessonsApi.getOne(id),
    enabled: isAuthenticated && !!id,
  });

  const completeMutation = useMutation({
    mutationFn: () => lessonsApi.complete(id),
    onSuccess: (result) => {
      toast.success(`+${result.xpEarned} XP earned!`, { icon: '⭐' });
      updateUser({ xp: (data?.progress?.xp || 0) + result.xpEarned, level: result.newLevel });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', id] });
    },
  });

  if (!isAuthenticated) return null;
  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading lesson...</div>;
  if (!data) return <div className="text-center py-12 text-gray-500">Lesson not found</div>;

  const isCompleted = data.progress?.completed;
  const blocks = data.content?.blocks || [];
  const quizzes = data.quizzes || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/lessons" className="hover:text-gray-300">Lessons</Link>
        <span>›</span>
        <span className="text-gray-300">{data.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-semibold capitalize',
            data.level === 1 && 'bg-green-900/50 text-green-400',
            data.level === 2 && 'bg-yellow-900/50 text-yellow-400',
            data.level === 3 && 'bg-red-900/50 text-red-400',
          )}>
            {data.category}
          </span>
          <span className="text-xs text-gray-500">{data.duration} min · +{data.xpReward} XP</span>
          {isCompleted && <span className="text-xs text-green-400 font-semibold">✓ Completed</span>}
        </div>
        <h1 className="text-3xl font-bold text-white">{data.title}</h1>
        <p className="text-gray-400 mt-2">{data.description}</p>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="prose-invert space-y-2"
      >
        {blocks.map((block: any, i: number) => renderBlock(block, i))}
      </motion.div>

      {/* Complete button */}
      {!isCompleted && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
          className="mt-8 w-full py-3 bg-gradient-to-r from-gold-dark to-gold text-black font-bold rounded-xl shadow-lg"
        >
          {completeMutation.isPending ? 'Saving...' : 'Mark as Complete & Earn XP'}
        </motion.button>
      )}

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">Test Your Knowledge</h2>
          {quizzes.map((quiz: any) => (
            <Quiz
              key={quiz.id}
              quizId={quiz.id}
              title={quiz.title}
              questions={quiz.questions}
              onComplete={(score, max) => {
                if (score === max && !isCompleted) completeMutation.mutate();
              }}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Link href="/lessons">
          <button className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1">
            ← Back to lessons
          </button>
        </Link>
        <Link href="/game">
          <button className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
            Practice in game →
          </button>
        </Link>
      </div>
    </div>
  );
}
