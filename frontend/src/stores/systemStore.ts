import { create } from 'zustand';
import { getSystemStatus } from '@/api/system';
import type { SystemStatus } from '@/api/types';

interface SystemState {
  status: SystemStatus | null;
  loading: boolean;
  wsConnected: boolean;

  fetchStatus: () => Promise<void>;
  connectWS: () => void;
  disconnectWS: () => void;
}

let wsInstance: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function getWsUrl(): string {
  const token = localStorage.getItem('opspilot_token') || '';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/api/ws/system?token=${encodeURIComponent(token)}`;
}

export const useSystemStore = create<SystemState>((set, get) => ({
  status: null,
  loading: false,
  wsConnected: false,

  fetchStatus: async () => {
    set({ loading: true });
    try {
      const status = await getSystemStatus();
      set({ status });
    } finally {
      set({ loading: false });
    }
  },

  connectWS: () => {
    if (wsInstance) return;

    const ws = new WebSocket(getWsUrl());
    wsInstance = ws;

    ws.onopen = () => {
      set({ wsConnected: true });
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const status: SystemStatus = JSON.parse(event.data);
        set({ status });
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      wsInstance = null;
      set({ wsConnected: false });
      // Auto-reconnect after 3 seconds
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        get().connectWS();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  },

  disconnectWS: () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (wsInstance) {
      wsInstance.close();
      wsInstance = null;
    }
    set({ wsConnected: false });
  },
}));
