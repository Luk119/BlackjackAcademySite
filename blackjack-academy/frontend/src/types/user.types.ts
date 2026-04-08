export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  chips: number;
  createdAt: string;
}

export interface UserProfile {
  bio?: string;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  hintsEnabled: boolean;
  countingSystem: string;
  preferredVariant: string;
}

export interface UserStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  gamesPushed: number;
  totalHandsPlayed: number;
  correctDecisions: number;
  incorrectDecisions: number;
  blackjacksHit: number;
  cardCountingAccuracy: number;
  winRate: number;
  decisionAccuracy: number;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: any;
  order: number;
  level: number;
  category: string;
  xpReward: number;
  duration: number;
  prerequisites: string[];
  progress?: LessonProgress;
  isUnlocked: boolean;
}

export interface LessonProgress {
  completed: boolean;
  completedAt?: string;
  attempts: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  level: number;
  xp: number;
  chips: number;
  avatarUrl?: string;
  winRate: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
