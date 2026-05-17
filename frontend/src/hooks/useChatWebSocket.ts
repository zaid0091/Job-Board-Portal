import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addChatMessage,
  replaceOptimisticMessage,
  setTypingUser,
} from '@/store/slices/chatSlice';
import { buildWebSocketUrl } from '@/utils/wsUrl';
import type { ChatMessage, ChatServerPacket } from '@/types';

const WS_ENABLED = import.meta.env.VITE_WS_ENABLED === 'true';

interface UseChatWebSocketOptions {
  conversationId: string | null;
  onConnected?: () => void;
  onError?: (code: string, message: string) => void;
}

interface UseChatWebSocketReturn {
  isConnected: boolean;
  sendMessage: (text: string, clientMessageId?: string) => boolean;
  sendTyping: (isTyping: boolean) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useChatWebSocket({
  conversationId,
  onConnected,
  onError,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  const onConnectedRef = useRef(onConnected);
  const onErrorRef = useRef(onError);
  onConnectedRef.current = onConnected;
  onErrorRef.current = onError;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const closeSocket = useCallback(() => {
    const ws = wsRef.current;
    if (!ws) return;
    intentionalCloseRef.current = true;
    ws.onopen = null;
    ws.onclose = null;
    ws.onerror = null;
    ws.onmessage = null;
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!WS_ENABLED || !conversationId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    clearReconnectTimer();
    intentionalCloseRef.current = false;

    const url = buildWebSocketUrl(`/ws/chat/${conversationId}/`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
      if (intentionalCloseRef.current || !WS_ENABLED || !conversationId) {
        return;
      }
      clearReconnectTimer();
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connect();
      }, 1500);
    };

    ws.onerror = () => {};

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ChatServerPacket;
        if (data.type === 'chat.connected') {
          setIsConnected(true);
          onConnectedRef.current?.();
        } else if (data.type === 'chat.message') {
          const clientId =
            data.message.client_id || data.message.client_message_id;
          if (clientId && data.message.sender_id === userId) {
            dispatch(
              replaceOptimisticMessage({
                clientId,
                message: data.message,
              }),
            );
          } else {
            dispatch(addChatMessage(data.message));
          }
        } else if (data.type === 'chat.typing') {
          if (data.sender_id !== userId) {
            dispatch(setTypingUser(data.is_typing ? data.sender_id : null));
          }
        } else if (data.type === 'chat.error') {
          onErrorRef.current?.(data.code, data.message);
        }
      } catch {
        // Ignore malformed packets
      }
    };
  }, [conversationId, clearReconnectTimer, dispatch, userId]);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    closeSocket();
  }, [clearReconnectTimer, closeSocket]);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  const sendMessage = useCallback(
    (text: string, clientMessageId?: string): boolean => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return false;
      }
      const payload: Record<string, string> = {
        type: 'chat.message',
        text: text.trim(),
      };
      if (clientMessageId) {
        payload.client_message_id = clientMessageId;
      }
      wsRef.current.send(JSON.stringify(payload));
      return true;
    },
    [],
  );

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({ type: 'chat.typing', is_typing: isTyping }),
    );
  }, []);

  useEffect(() => {
    if (!conversationId || !WS_ENABLED) {
      disconnect();
      return;
    }
    connect();
    return () => {
      disconnect();
    };
  }, [conversationId, connect, disconnect]);

  return { isConnected, sendMessage, sendTyping, disconnect, reconnect };
}

export function createOptimisticMessage(
  text: string,
  senderId: string,
  clientId: string,
): ChatMessage {
  return {
    id: `temp-${clientId}`,
    sender_id: senderId,
    timestamp: new Date().toISOString(),
    text,
    client_id: clientId,
  };
}
