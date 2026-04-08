'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Panel' },
  { href: '/game', label: 'Graj' },
  { href: '/lessons', label: 'Nauka' },
  { href: '/leaderboard', label: 'Ranking' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useUserStore();

  const handleLogout = async () => {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
    clearAuth();
    router.push('/login');
    toast.success('Logged out');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">♠</span>
          <span className="font-bold text-gold text-sm hidden sm:block font-casino">
            Blackjack Academy
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link key={href} href={href}>
                <motion.span
                  whileHover={{ y: -1 }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative',
                    active ? 'text-gold' : 'text-gray-400 hover:text-gray-200',
                  )}
                >
                  {label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full"
                    />
                  )}
                </motion.span>
              </Link>
            );
          })}
        </div>

        {/* User area */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* XP / Level */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-400">Lv.{user.level}</span>
              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full"
                  style={{ width: `${(user.xp % 100)}%` }}
                />
              </div>
            </div>

            {/* Chips */}
            <div className="hidden sm:flex items-center gap-1 text-sm text-gold font-semibold">
              <span>💰</span>
              <span>${user.chips.toLocaleString()}</span>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-2">
              <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center text-black font-bold text-sm">
                {user.username[0].toUpperCase()}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Wyloguj
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-200 px-3 py-1.5">
              Logowanie
            </Link>
            <Link href="/register" className="text-sm bg-gold text-black font-bold px-4 py-1.5 rounded-lg hover:bg-gold-light transition-colors">
              Rejestracja
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
