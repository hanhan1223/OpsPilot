import { create } from 'zustand';
import {
  getProjectList,
  getProjectDetail,
  deleteProject,
} from '@/api/project';
import type { Project, ProjectListParams } from '@/api/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  total: number;

  fetchProjects: (params?: ProjectListParams) => Promise<void>;
  fetchProjectDetail: (id: number) => Promise<void>;
  removeProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  total: 0,

  fetchProjects: async (params) => {
    set({ loading: true });
    try {
      const data = await getProjectList(params);
      set({ projects: data.items, total: data.total });
    } finally {
      set({ loading: false });
    }
  },

  fetchProjectDetail: async (id) => {
    set({ loading: true });
    try {
      const project = await getProjectDetail(id);
      set({ currentProject: project });
    } finally {
      set({ loading: false });
    }
  },

  removeProject: async (id) => {
    await deleteProject(id);
    // Re-fetch with no params to reload the current view
    const { fetchProjects } = useProjectStore.getState();
    await fetchProjects();
  },
}));
