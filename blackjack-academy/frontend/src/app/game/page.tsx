'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameTable } from '@/components/game/GameTable';
import { useUserStore } from '@/stores/userStore';

export default function GamePage() {
  const { isAuthenticated } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?from=/game');
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return <GameTable />;
}
