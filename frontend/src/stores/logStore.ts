import { create } from 'zustand';
import type { LogEntry } from '@/api/types';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
const MAX_LOGS = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

interface LogState {
  logs: LogEntry[];
  connected: boolean;
  autoScroll: boolean;
  ws: WebSocket | null;

  connect: (deployId: number) => void;
  disconnect: () => void;
  clearLogs: () => void;
  setAutoScroll: (val: boolean) => void;
}

export const useLogStore = create<LogState>((set, get) => {
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleReconnect(deployId: number) {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

    const delay = Math.min(1000 * 2 ** reconnectAttempts, 30_000);
    reconnectTimer = setTimeout(() => {
      reconnectAttempts++;
      get().connect(deployId);
    }, delay);
  }

  return {
    logs: [],
    connected: false,
    autoScroll: true,
    ws: null,

    connect: (deployId) => {
      // Tear down any existing connection first
      get().disconnect();

      const url = `${WS_BASE_URL}/api/ws/deploy/${deployId}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        reconnectAttempts = 0;
        set({ connected: true });
      };

      ws.onmessage = (event) => {
        try {
          const entry: LogEntry = JSON.parse(event.data);
          set((state) => {
            const next = [...state.logs, entry];
            // Cap at MAX_LOGS by dropping the oldest entries
            if (next.length > MAX_LOGS) {
              return { logs: next.slice(next.length - MAX_LOGS) };
            }
            return { logs: next };
          });
        } catch {
          // If the message is plain text, wrap it
          set((state) => {
            const next = [
              ...state.logs,
              { timestamp: new Date().toISOString(), level: 'info', message: String(event.data) } as LogEntry,
            ];
            if (next.length > MAX_LOGS) {
              return { logs: next.slice(next.length - MAX_LOGS) };
            }
            return { logs: next };
          });
        }
      };

      ws.onclose = () => {
        set({ connected: false, ws: null });
        scheduleReconnect(deployId);
      };

      ws.onerror = () => {
        ws.close();
      };

      set({ ws });
    },

    disconnect: () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // prevent reconnect on manual disconnect
      const { ws } = get();
      if (ws) {
        ws.close();
        set({ ws: null, connected: false });
      }
    },

    clearLogs: () => {
      set({ logs: [] });
    },

    setAutoScroll: (val) => {
      set({ autoScroll: val });
    },
  };
});
