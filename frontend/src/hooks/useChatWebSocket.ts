import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addChatMessage,
  replaceOptimisticMessage,
  setTypingUser,
  applyInboxUpdate,
  fetchMessageHistory,
} from '@/store/slices/chatSlice';
import { buildWebSocketUrl } from '@/utils/wsUrl';
import { isWebSocketEnabled } from '@/utils/wsConfig';
import type { ChatMessage, ChatServerPacket } from '@/types';

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

function sameUserId(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  return String(a) === String(b);
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
  const reconnectAttemptRef = useRef(0);
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

  const handleChatMessage = useCallback(
    (message: ChatMessage) => {
      const clientId = message.client_id || message.client_message_id;
      if (clientId && sameUserId(message.sender_id, userId)) {
        dispatch(replaceOptimisticMessage({ clientId, message }));
      } else {
        dispatch(addChatMessage(message));
      }
      if (conversationId) {
        dispatch(applyInboxUpdate({ conversationId, message }));
      }
    },
    [conversationId, dispatch, userId],
  );

  const connect = useCallback(() => {
    if (!isWebSocketEnabled() || !conversationId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    clearReconnectTimer();
    intentionalCloseRef.current = false;

    const url = buildWebSocketUrl(`/ws/chat/${conversationId}/`);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
    };

    ws.onclose = () => {
      setIsConnected(false);
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
      if (intentionalCloseRef.current || !isWebSocketEnabled() || !conversationId) {
        return;
      }
      clearReconnectTimer();
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
        const data = JSON.parse(event.data) as ChatServerPacket;
        if (data.type === 'chat.connected') {
          setIsConnected(true);
          dispatch(
            fetchMessageHistory({ conversationId: conversationId!, merge: true }),
          );
          onConnectedRef.current?.();
        } else if (data.type === 'chat.message') {
          handleChatMessage(data.message);
        } else if (data.type === 'chat.typing') {
          if (!sameUserId(data.sender_id, userId)) {
            dispatch(setTypingUser(data.is_typing ? data.sender_id : null));
          }
        } else if (data.type === 'chat.error') {
          onErrorRef.current?.(data.code, data.message);
        }
      } catch {
        // Ignore malformed packets
      }
    };
  }, [conversationId, clearReconnectTimer, dispatch, handleChatMessage, userId]);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    reconnectAttemptRef.current = 0;
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
    if (!conversationId || !isWebSocketEnabled()) {
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
