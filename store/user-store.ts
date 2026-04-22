import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

interface UserState {
  _id: string | null
  username: string
  role: 'player' | 'admin' | null
  token: string | null
  isAuthenticated: boolean
  
  totalGamesPlayed: number
  totalCorrectAnswers: number
  totalWrongAnswers: number
  averageAnswerTime: number
  currentStreak: number
  activityCalendar: string[],
  createdAt: string | null,
  
  login: (username: string, password: string) => Promise<void>
  fetchProfile: () => Promise<void>
  logout: () => void
}

const initialState = {
  _id: null,
  username: 'Guest',
  role: null,
  token: null,
  isAuthenticated: false,
  totalGamesPlayed: 0,
  totalCorrectAnswers: 0,
  totalWrongAnswers: 0,
  averageAnswerTime: 0,
  currentStreak: 0,
  activityCalendar: [],
  createdAt: null,
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (username, password) => {
        try {
          const res = await api.post('/api/auth/login', { username, password });
          if (res.data.success) {
            set({
              _id: res.data.user._id,
              username: res.data.user.username,
              role: res.data.user.role,
              token: res.data.token,
              isAuthenticated: true,
            });
            await get().fetchProfile();
          }
        } catch (error) {
          console.error('Login failed', error);
          throw error;
        }
      },
      
      fetchProfile: async () => {
        try {
          const res = await api.get('/api/user/me');
          if (res.data.success) {
            const u = res.data.data;
            set({
              totalGamesPlayed: u.totalGamesPlayed,
              totalCorrectAnswers: u.totalCorrectAnswers,
              totalWrongAnswers: u.totalWrongAnswers,
              averageAnswerTime: u.averageAnswerTime,
              currentStreak: u.currentStreak,
              activityCalendar: u.activityCalendar,
              createdAt: u.createdAt,
            });
          }
        } catch (error) {
          console.error('Fetch profile failed', error);
        }
      },
      
      logout: () => set(initialState),
    }),
    {
      name: 'user-storage',
    }
  )
)
