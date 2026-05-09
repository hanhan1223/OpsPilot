import { create } from 'zustand';
import { login as loginApi, getMe } from '@/api/auth';
import type { User } from '@/api/types';

interface AuthState {
  user: User | null;
  token: string;
  loading: boolean;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('opspilot_token') || '',
  loading: false,

  login: async (username, password) => {
    set({ loading: true });
    try {
      const data = await loginApi(username, password);
      localStorage.setItem('opspilot_token', data.access_token);
      set({ token: data.access_token });
      await get().fetchUser();
    } finally {
      set({ loading: false });
    }
  },

  fetchUser: async () => {
    try {
      const user = await getMe();
      set({ user });
    } catch {
      get().logout();
    }
  },

  logout: () => {
    localStorage.removeItem('opspilot_token');
    set({ user: null, token: '' });
    window.location.href = '/login';
  },
}));

// Hydrate user on load if a token already exists
const existingToken = localStorage.getItem('opspilot_token');
if (existingToken) {
  useAuthStore.getState().fetchUser();
}
