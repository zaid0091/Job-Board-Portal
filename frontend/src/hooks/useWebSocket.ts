import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchUnreadCount, addNotification } from '@/store/slices/notificationsSlice';
import {
  fetchChatUnreadCount,
  fetchConversations,
  applyInboxUpdate,
} from '@/store/slices/chatSlice';
import { buildWebSocketUrl } from '@/utils/wsUrl';
import { isWebSocketEnabled } from '@/utils/wsConfig';
import type { ChatMessage } from '@/types';

const NOTIFICATIONS_WS_URL = buildWebSocketUrl('/ws/notifications/');

interface UseWebSocketReturn {
  isConnected: boolean;
  reconnect: () => void;
  disconnect: () => void;
}

type NotificationWsPacket =
  | { type: 'new_notification'; notification: { notification_type?: string } }
  | {
      type: 'chat.inbox_update';
      conversation_id: string;
      message: ChatMessage;
    };

export function useWebSocket(): UseWebSocketReturn {
  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!isWebSocketEnabled()) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(NOTIFICATIONS_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptRef.current = 0;
        dispatch(fetchUnreadCount());
        dispatch(fetchChatUnreadCount());
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        if (!isWebSocketEnabled()) return;
        const delay = Math.min(30000, 1000 * 2 ** reconnectAttemptRef.current);
        reconnectAttemptRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, delay);
      };

      ws.onerror = () => {};

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as NotificationWsPacket;
          if (data.type === 'new_notification' && 'notification' in data) {
            dispatch(addNotification(data.notification));
            dispatch(fetchUnreadCount());
            if (data.notification.notification_type === 'CHAT_MESSAGE') {
              dispatch(fetchChatUnreadCount());
              dispatch(fetchConversations(1));
            }
          } else if (data.type === 'chat.inbox_update') {
            dispatch(
              applyInboxUpdate({
                conversationId: data.conversation_id,
                message: data.message,
              }),
            );
            dispatch(fetchChatUnreadCount());
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
    if (!isWebSocketEnabled()) return;
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
    if (!isWebSocketEnabled()) return;
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { isConnected, reconnect, disconnect };
}
