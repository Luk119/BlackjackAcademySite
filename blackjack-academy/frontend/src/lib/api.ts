import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
        Cookies.set('accessToken', data.accessToken, { expires: 7, sameSite: 'lax' });
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// Auth endpoints
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }).then(r => r.data),
};

// User endpoints
export const usersApi = {
  getMe: () => api.get('/users/me').then(r => r.data),
  updateProfile: (data: any) => api.patch('/users/me', data).then(r => r.data),
};

// Lessons endpoints
export const lessonsApi = {
  getAll: () => api.get('/lessons').then(r => r.data),
  getOne: (id: string) => api.get(`/lessons/${id}`).then(r => r.data),
  getBySlug: (slug: string) => api.get(`/lessons/slug/${slug}`).then(r => r.data),
  complete: (id: string) => api.post(`/lessons/${id}/complete`).then(r => r.data),
  submitQuiz: (quizId: string, answers: number[]) =>
    api.post(`/lessons/quiz/${quizId}/submit`, { answers }).then(r => r.data),
};

// Stats endpoints
export const statsApi = {
  getMyStats: () => api.get('/stats/me').then(r => r.data),
  getSessionHistory: (page = 1, limit = 20) =>
    api.get(`/stats/sessions?page=${page}&limit=${limit}`).then(r => r.data),
};

// Leaderboard endpoints
export const leaderboardApi = {
  getGlobal: (limit = 50) => api.get(`/leaderboard/global?limit=${limit}`).then(r => r.data),
  getWeekly: (limit = 50) => api.get(`/leaderboard/weekly?limit=${limit}`).then(r => r.data),
  getMyRank: () => api.get('/leaderboard/my-rank').then(r => r.data),
};
