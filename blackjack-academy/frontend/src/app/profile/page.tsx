'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { usersApi } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import toast from 'react-hot-toast';

const COUNTING_SYSTEMS = ['hi-lo', 'hi-opt-i', 'ko', 'omega-ii'];
const VARIANTS = ['classic', 'european', 'atlantic-city'];

export default function ProfilePage() {
  const { isAuthenticated, setUser } = useUserStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getMe,
    enabled: isAuthenticated,
  });

  const [form, setForm] = useState({
    theme: 'dark',
    soundEnabled: true,
    hintsEnabled: true,
    countingSystem: 'hi-lo',
    preferredVariant: 'classic',
    bio: '',
  });

  useEffect(() => {
    if (profile?.profile) {
      setForm({
        theme: profile.profile.theme || 'dark',
        soundEnabled: profile.profile.soundEnabled ?? true,
        hintsEnabled: profile.profile.hintsEnabled ?? true,
        countingSystem: profile.profile.countingSystem || 'hi-lo',
        preferredVariant: profile.profile.preferredVariant || 'classic',
        bio: profile.profile.bio || '',
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  if (!isAuthenticated) return null;
  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

      <div className="space-y-6">
        {/* User info */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center text-black font-bold text-2xl">
              {profile?.username[0].toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-bold text-white">{profile?.username}</div>
              <div className="text-gray-400 text-sm">{profile?.email}</div>
              <div className="text-gold text-sm">Level {profile?.level} · {profile?.xp} XP</div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-white text-lg">Preferences</h2>

          {/* Counting system */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Preferred Counting System</label>
            <div className="flex flex-wrap gap-2">
              {COUNTING_SYSTEMS.map(sys => (
                <button
                  key={sys}
                  onClick={() => setForm(f => ({ ...f, countingSystem: sys }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold uppercase transition-colors ${
                    form.countingSystem === sys ? 'bg-gold text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>

          {/* Variant */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Preferred Variant</label>
            <div className="flex flex-wrap gap-2">
              {VARIANTS.map(v => (
                <button
                  key={v}
                  onClick={() => setForm(f => ({ ...f, preferredVariant: v }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                    form.preferredVariant === v ? 'bg-gold text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          {[
            { key: 'soundEnabled', label: 'Sound effects' },
            { key: 'hintsEnabled', label: 'Basic strategy hints during play' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-300">{label}</span>
              <button
                onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  form[key as keyof typeof form] ? 'bg-gold' : 'bg-gray-700'
                }`}
              >
                <motion.div
                  animate={{ x: form[key as keyof typeof form] ? 26 : 2 }}
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow"
                />
              </button>
            </label>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="w-full py-3 bg-gradient-to-r from-gold-dark to-gold text-black font-bold rounded-xl"
        >
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>
    </div>
  );
}
