import api from './request';
import type {
  AIConfig,
  AIConfigCreate,
  AIReport,
  AIAnalyzeRequest,
  AITestConnectionRequest,
  AITestConnectionResponse,
  AIReportListParams,
} from './types';

// ── Config CRUD ──────────────────────────────────────────────────────────────

export function getAIConfigs(): Promise<AIConfig[]> {
  return api.get('/v1/ai/configs');
}

export function createAIConfig(data: AIConfigCreate): Promise<AIConfig> {
  return api.post('/v1/ai/configs', data);
}

export function updateAIConfig(id: number, data: AIConfigCreate): Promise<AIConfig> {
  return api.put(`/v1/ai/configs/${id}`, data);
}

export function deleteAIConfig(id: number): Promise<{ message: string }> {
  return api.delete(`/v1/ai/configs/${id}`);
}

export function setDefaultConfig(id: number): Promise<{ message: string }> {
  return api.post(`/v1/ai/configs/${id}/set-default`);
}

// ── Connection & Analysis ────────────────────────────────────────────────────

export function testConnection(
  data: AITestConnectionRequest,
): Promise<AITestConnectionResponse> {
  return api.post('/v1/ai/test-connection', data);
}

export function analyzeProject(data: AIAnalyzeRequest): Promise<AIReport> {
  return api.post('/v1/ai/analyze', data);
}

// ── Reports ──────────────────────────────────────────────────────────────────

export function getAIReports(params?: AIReportListParams): Promise<AIReport[]> {
  return api.get('/v1/ai/reports', { params });
}

// ── Models ───────────────────────────────────────────────────────────────────

export function listModels(
  base_url: string,
  provider: string,
): Promise<{ models: string[] }> {
  return api.get('/v1/ai/models', { params: { base_url, provider } });
}
