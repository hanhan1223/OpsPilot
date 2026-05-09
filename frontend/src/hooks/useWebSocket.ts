import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  onMessage?: (data: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnect?: boolean;
  maxReconnects?: number;
}

interface UseWebSocketReturn {
  connected: boolean;
  send: (data: string | object) => void;
  disconnect: () => void;
}

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {},
): UseWebSocketReturn {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    maxReconnects = 5,
  } = options;

  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualClose = useRef(false);

  // Keep callbacks in a ref so we never re-create the connection just because
  // a consumer forgot to memoize the callbacks.
  const callbacksRef = useRef({ onMessage, onOpen, onClose, onError });
  callbacksRef.current = { onMessage, onOpen, onClose, onError };

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    manualClose.current = true;
    cleanup();
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, [cleanup]);

  const connect = useCallback(() => {
    cleanup();

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = (event) => {
      reconnectAttempts.current = 0;
      setConnected(true);
      callbacksRef.current.onOpen?.(event);
    };

    ws.onmessage = (event) => {
      callbacksRef.current.onMessage?.(event);
    };

    ws.onclose = (event) => {
      setConnected(false);
      wsRef.current = null;
      callbacksRef.current.onClose?.(event);

      if (!manualClose.current && reconnect && reconnectAttempts.current < maxReconnects) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30_000);
        reconnectTimer.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    ws.onerror = (event) => {
      callbacksRef.current.onError?.(event);
    };
  }, [url, reconnect, maxReconnects, cleanup]);

  const send = useCallback(
    (data: string | object) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
      }
    },
    [],
  );

  useEffect(() => {
    manualClose.current = false;
    connect();
    return () => {
      manualClose.current = true;
      cleanup();
      wsRef.current?.close();
    };
  }, [connect, cleanup]);

  return { connected, send, disconnect };
}
