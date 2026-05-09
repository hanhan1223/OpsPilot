import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
});

// ── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('opspilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('opspilot_token');
        window.location.href = '/login';
      } else if (status === 403) {
        message.error('Access denied: insufficient permissions');
      } else {
        const msg =
          data?.detail?.message ?? data?.detail ?? 'Request failed';
        message.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    } else {
      message.error('Network error: please check your connection');
    }

    return Promise.reject(error);
  },
);

export default api;
