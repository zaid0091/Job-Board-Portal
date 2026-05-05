import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchUnreadCount, addNotification } from '@/store/slices/notificationsSlice';

const WS_ENABLED = import.meta.env.VITE_WS_ENABLED === 'true';

interface UseWebSocketReturn {
  isConnected: boolean;
  reconnect: () => void;
  disconnect: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const getWsUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/v1/ws/notifications/`;
  }, []);

  const connect = useCallback(() => {
    if (!WS_ENABLED) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        dispatch(fetchUnreadCount());
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        if (!WS_ENABLED) return;
        const delay = Math.min(
          30000,
          (reconnectTimeoutRef.current ? 15000 : 1000) * 1.5
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, delay);
      };

      ws.onerror = () => {};

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_notification' && data.notification) {
            dispatch(addNotification(data.notification));
            dispatch(fetchUnreadCount());
          }
        } catch {
          // Ignore malformed messages
        }
      };
    } catch {
      setIsConnected(false);
    }
  }, [getWsUrl, dispatch]);

  const reconnect = useCallback(() => {
    if (!WS_ENABLED) return;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
    connect();
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!WS_ENABLED) return;
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { isConnected, reconnect, disconnect };
}
