import { create } from 'zustand';
import { triggerDeploy } from '@/api/deploy';
import type { DeployRequest } from '@/api/types';

interface DeployState {
  currentDeployId: number | null;
  deployStatus: string;
  loading: boolean;

  deploy: (data: DeployRequest) => Promise<{ project_id: number; deploy_id: number }>;
  reset: () => void;
}

export const useDeployStore = create<DeployState>((set) => ({
  currentDeployId: null,
  deployStatus: 'idle',
  loading: false,

  deploy: async (data) => {
    set({ loading: true });
    try {
      const result = await triggerDeploy(data);
      set({
        currentDeployId: result.deploy_id,
        deployStatus: 'pending',
      });
      return { project_id: result.project_id, deploy_id: result.deploy_id };
    } finally {
      set({ loading: false });
    }
  },

  reset: () => {
    set({ currentDeployId: null, deployStatus: 'idle' });
  },
}));
