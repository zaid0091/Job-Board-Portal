import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchUnreadCount, addNotification } from '@/store/slices/notificationsSlice';
import { buildWebSocketUrl } from '@/utils/wsUrl';

const WS_ENABLED = import.meta.env.VITE_WS_ENABLED === 'true';
const NOTIFICATIONS_WS_URL = buildWebSocketUrl('/ws/notifications/');

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

  const connect = useCallback(() => {
    if (!WS_ENABLED) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(NOTIFICATIONS_WS_URL);
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
  }, [dispatch]);

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
