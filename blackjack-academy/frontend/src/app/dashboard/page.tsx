'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { statsApi } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';

function StatCard({ label, value, sub, color = 'text-white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gray-900/60 border border-gray-800 rounded-xl p-5"
    >
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { isAuthenticated, user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?from=/dashboard');
  }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-stats'],
    queryFn: statsApi.getMyStats,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400">Ładowanie panelu...</div>
      </div>
    );
  }

  const stats = data?.stats;
  const userInfo = data?.user || user;
  const recentSessions = data?.recentSessions || [];
  const achievements = data?.achievements || [];

  const xpPercent = userInfo ? ((userInfo.xp % 100) / 100) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Witaj, <span className="text-gold">{userInfo?.username}</span>
          </h1>
          <p className="text-gray-400 mt-1">Śledź swoje postępy i ciągle się poprawiaj</p>
        </div>
        <Link href="/game">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2.5 bg-gradient-to-r from-gold-dark to-gold text-black font-bold rounded-xl"
          >
            Zagraj teraz
          </motion.button>
        </Link>
      </div>

      {/* Level & XP */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-gold">Level {userInfo?.level}</span>
            <span className="text-gray-500 ml-3 text-sm">{userInfo?.xp} XP total</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">{userInfo?.chips?.toLocaleString()} chips</div>
          </div>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full"
          />
        </div>
        <div className="text-xs text-gray-600 mt-1">{userInfo?.xpToNextLevel} XP to next level</div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Współczynnik wygranych" value={`${stats.winRate}%`} color={stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'} />
          <StatCard label="Rozegranych rąk" value={stats.totalHandsPlayed?.toLocaleString() || 0} />
          <StatCard label="Dokładność strategii" value={`${stats.decisionAccuracy}%`} color="text-blue-400" sub="vs podstawowa strategia" />
          <StatCard label="Blackjacki" value={stats.blackjacksHit || 0} color="text-yellow-400" />
        </div>
      )}

      {/* Recent sessions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Ostatnie sesje</h2>
        {recentSessions.length === 0 ? (
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
            Brak sesji — <Link href="/game" className="text-gold hover:underline">zagraj swoją pierwszą rękę!</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s: any) => (
              <div key={s.id} className="bg-gray-900/60 border border-gray-800 rounded-xl px-5 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-300">{new Date(s.date).toLocaleDateString()}</div>
                <div className="text-sm text-gray-400">{s.handsPlayed} hands · {s.variant}</div>
                <div className={`text-sm font-bold ${s.chipsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {s.chipsChange >= 0 ? '+' : ''}{s.chipsChange} chips
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Ostatnie osiągnięcia</h2>
          <div className="flex flex-wrap gap-3">
            {achievements.slice(0, 6).map((a: any) => (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/60 border border-gold/30 rounded-xl px-4 py-3 flex items-center gap-2"
              >
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{a.name}</div>
                  <div className="text-xs text-gray-500">{a.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
