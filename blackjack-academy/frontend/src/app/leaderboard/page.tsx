'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { leaderboardApi } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/utils/cn';
import type { LeaderboardEntry } from '@/types/user.types';

type Tab = 'global' | 'weekly';

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-400 text-xl',
  2: 'text-gray-300 text-lg',
  3: 'text-amber-600 text-lg',
};

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('global');
  const { user } = useUserStore();

  const { data: globalData = [], isLoading: globalLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'global'],
    queryFn: () => leaderboardApi.getGlobal(100),
  });

  const { data: weeklyData = [], isLoading: weeklyLoading } = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: () => leaderboardApi.getWeekly(100),
    enabled: tab === 'weekly',
  });

  const { data: myRank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: leaderboardApi.getMyRank,
    enabled: !!user,
  });

  const isLoading = tab === 'global' ? globalLoading : weeklyLoading;
  const entries = tab === 'global' ? globalData : weeklyData;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Ranking</h1>
          <p className="text-gray-400 mt-1">Najlepsi gracze na świecie</p>
        </div>
        {myRank && (
          <div className="text-right bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2">
            <div className="text-xs text-gray-500">Twój ranking</div>
            <div className="text-gold font-bold text-xl">#{myRank.rank}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['global', 'weekly'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2 rounded-lg font-semibold text-sm capitalize transition-colors',
              tab === t ? 'bg-gold text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
            )}
          >
            {t === 'global' ? '🌍 Globalny' : '📅 Ten tydzień'}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {!isLoading && entries.length >= 3 && tab === 'global' && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[1, 0, 2].map(i => {
            const entry = entries[i] as LeaderboardEntry;
            const pos = i + 1;
            const heights = ['h-20', 'h-28', 'h-16'];
            const medals = ['🥈', '🥇', '🥉'];
            return (
              <motion.div
                key={entry.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: [0.1, 0, 0.2][i] }}
                className={cn(
                  'flex flex-col items-center',
                  i === 1 ? 'order-2' : i === 0 ? 'order-1' : 'order-3',
                )}
              >
                <div className="text-2xl mb-1">{medals[i]}</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center text-black font-bold text-sm mb-1">
                  {entry.username[0].toUpperCase()}
                </div>
                <div className="text-xs text-white font-semibold text-center">{entry.username}</div>
                <div className="text-xs text-gray-500">Lv.{entry.level}</div>
                <div className={cn('w-16 rounded-t-lg mt-2 bg-gradient-to-t', heights[i],
                  i === 1 ? 'from-yellow-700 to-yellow-500' : i === 0 ? 'from-gray-700 to-gray-500' : 'from-amber-900 to-amber-700'
                )} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Ładowanie...</div>
        ) : (
          entries.map((entry: any, i: number) => {
            const isMe = user && entry.id === user.id;
            return (
              <motion.div
                key={entry.id || i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-xl border transition-all',
                  isMe ? 'bg-gold/10 border-gold/40' : 'bg-gray-900/50 border-gray-800 hover:border-gray-700',
                )}
              >
                <div className={cn('w-8 text-center font-bold', RANK_STYLES[entry.rank] || 'text-gray-500')}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </div>

                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                  {(entry.username || entry.user?.username || '?')[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white flex items-center gap-2">
                    {entry.username || entry.user?.username}
                    {isMe && <span className="text-xs text-gold">(ty)</span>}
                  </div>
                  {tab === 'global' && (
                    <div className="text-xs text-gray-500">Poz.{entry.level} · Wygrane: {entry.winRate}%</div>
                  )}
                  {tab === 'weekly' && (
                    <div className="text-xs text-gray-500">{entry.handsThisWeek} rąk w tym tygodniu</div>
                  )}
                </div>

                <div className="text-right">
                  {tab === 'global' ? (
                    <div className="text-gold font-semibold text-sm">{entry.xp?.toLocaleString()} XP</div>
                  ) : (
                    <div className="text-gold font-semibold text-sm">{entry.sessionsThisWeek} sessions</div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
