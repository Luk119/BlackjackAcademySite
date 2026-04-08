'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useUserStore();
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authApi.register(form);
      setAuth(data);
      toast.success(`Witaj w Blackjack Academy, ${data.user.username}!`, { icon: '🃏' });
      router.push('/lessons');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Rejestracja nie powiodła się');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">♠ ♥</div>
          <h1 className="text-3xl font-bold text-white">Dołącz do Blackjack Academy</h1>
          <p className="text-gray-400 mt-2">Rozpocznij swoją podróż do pokonania kasyna</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                  focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="gracz@przykład.pl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nazwa gracza</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                  focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="As21"
              />
              <p className="text-xs text-gray-600 mt-1">3-20 znaków, litery, cyfry, podkreślniki</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Hasło</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                  focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="Min. 8 znaków, wielka litera + cyfra"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-gold-dark to-gold text-black font-bold text-lg rounded-xl
                shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Tworzenie konta...' : 'Utwórz darmowe konto'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Masz już konto?{' '}
          <Link href="/login" className="text-gold hover:text-gold-light font-semibold">
            Zaloguj się
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
