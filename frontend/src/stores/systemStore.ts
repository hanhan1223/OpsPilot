import { create } from 'zustand';
import { getSystemStatus } from '@/api/system';
import type { SystemStatus } from '@/api/types';

interface SystemState {
  status: SystemStatus | null;
  loading: boolean;

  fetchStatus: () => Promise<void>;
}

export const useSystemStore = create<SystemState>((set) => ({
  status: null,
  loading: false,

  fetchStatus: async () => {
    set({ loading: true });
    try {
      const status = await getSystemStatus();
      set({ status });
    } finally {
      set({ loading: false });
    }
  },
}));
