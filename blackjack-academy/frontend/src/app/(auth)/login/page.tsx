'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useUserStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authApi.login(form);
      setAuth(data);
      toast.success(`Witaj z powrotem, ${data.user.username}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Logowanie nie powiodło się');
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
          <div className="text-5xl mb-3">♠</div>
          <h1 className="text-3xl font-bold text-white">Witaj ponownie</h1>
          <p className="text-gray-400 mt-2">Zaloguj się do swojego konta Blackjack Academy</p>
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
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Hasło</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                  focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                placeholder="••••••••"
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
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Nie masz konta?{' '}
          <Link href="/register" className="text-gold hover:text-gold-light font-semibold">
            Zarejestruj się
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
