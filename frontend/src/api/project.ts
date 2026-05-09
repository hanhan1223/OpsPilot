import api from './request';
import type { Project, ProjectListParams, ProjectListResponse } from './types';

export function getProjectList(params?: ProjectListParams): Promise<ProjectListResponse> {
  return api.get('/v1/projects/', { params });
}

export function getProjectDetail(id: number): Promise<Project> {
  return api.get(`/v1/projects/${id}`);
}

export function deleteProject(id: number): Promise<{ message: string }> {
  return api.delete(`/v1/projects/${id}`);
}
