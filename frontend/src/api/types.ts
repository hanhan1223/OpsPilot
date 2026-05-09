// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
}

// ── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  repo_url: string;
  branch: string;
  framework: string | null;
  deploy_path: string;
  container_id: string | null;
  container_name: string;
  port: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectListParams {
  page?: number;
  page_size?: number;
  status?: string;
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  page_size: number;
}

// ── Deploy ───────────────────────────────────────────────────────────────────

export interface DeployRequest {
  repo_url: string;
  branch?: string;
  project_name?: string;
}

export interface DeployResponse {
  project_id: number;
  deploy_id: number;
  status: string;
  message: string;
}

export interface DeployRecord {
  id: number;
  project_id: number;
  status: string;
  logs: string | null;
  start_time: string;
  end_time: string | null;
  trigger_type: string;
  error_message: string | null;
}

// ── System ───────────────────────────────────────────────────────────────────

export interface DockerStats {
  running: number;
  stopped: number;
  total: number;
}

export interface SystemStatus {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  docker: DockerStats;
  projects_online: number;
  uptime_seconds: number;
}

// ── AI ───────────────────────────────────────────────────────────────────────

export type AIProvider = 'ollama' | 'openai' | 'anthropic';

export interface AIConfigCreate {
  name: string;
  provider?: AIProvider;
  model_name: string;
  base_url?: string;
  api_key?: string | null;
  temperature?: number;
  max_tokens?: number;
  is_default?: boolean;
}

export interface AIConfig {
  id: number;
  name: string;
  provider: AIProvider;
  model_name: string;
  base_url: string;
  temperature: number;
  max_tokens: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIReport {
  id: number;
  project_id: number | null;
  config_id: number | null;
  report_type: string;
  content: string;
  created_at: string;
}

export interface AIAnalyzeRequest {
  project_id: number;
  report_type?: string;
  config_id?: number | null;
}

export interface AITestConnectionRequest {
  provider?: AIProvider;
  base_url: string;
  model_name: string;
  api_key?: string | null;
}

export interface AITestConnectionResponse {
  success: boolean;
  message: string;
  models: string[];
}

export interface AIReportListParams {
  project_id?: number;
  report_type?: string;
}

// ── WebSocket ────────────────────────────────────────────────────────────────

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}
