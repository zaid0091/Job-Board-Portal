import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatAPI } from '@/api';
import type { ChatMessage, ConversationInboxItem, PaginatedResponse } from '@/types';

interface ChatState {
  inbox: PaginatedResponse<ConversationInboxItem> | null;
  activeMessages: ChatMessage[];
  activeConversationId: string | null;
  hasMoreMessages: boolean;
  nextCursor: string | null;
  unreadCount: number;
  isLoadingInbox: boolean;
  isLoadingMessages: boolean;
  typingUserId: string | null;
}

const initialState: ChatState = {
  inbox: null,
  activeMessages: [],
  activeConversationId: null,
  hasMoreMessages: false,
  nextCursor: null,
  unreadCount: 0,
  isLoadingInbox: false,
  isLoadingMessages: false,
  typingUserId: null,
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (page: number = 1) => chatAPI.getConversations(page),
);

export const fetchChatUnreadCount = createAsyncThunk(
  'chat/unreadCount',
  async () => {
    const data = await chatAPI.getUnreadCount();
    return data.unread_count;
  },
);

export const fetchMessageHistory = createAsyncThunk(
  'chat/fetchMessages',
  async ({
    conversationId,
    cursor,
    merge,
  }: {
    conversationId: string;
    cursor?: string;
    merge?: boolean;
  }) => {
    return {
      conversationId,
      merge: Boolean(merge),
      ...(await chatAPI.getMessages(conversationId, cursor)),
    };
  },
);

export const markConversationRead = createAsyncThunk(
  'chat/markRead',
  async ({
    conversationId,
    upToMessageId,
  }: {
    conversationId: string;
    upToMessageId?: string;
  }) => {
    await chatAPI.markRead(conversationId, upToMessageId);
    return conversationId;
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      if (state.activeConversationId !== action.payload) {
        state.activeMessages = [];
        state.hasMoreMessages = false;
        state.nextCursor = null;
      }
      state.activeConversationId = action.payload;
    },
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      const msg = action.payload;
      if (state.activeMessages.some((m) => m.id === msg.id)) return;
      state.activeMessages.push(msg);
    },
    addOptimisticMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.activeMessages.push(action.payload);
    },
    replaceOptimisticMessage: (
      state,
      action: PayloadAction<{ clientId: string; message: ChatMessage }>,
    ) => {
      const idx = state.activeMessages.findIndex(
        (m) =>
          m.client_id === action.payload.clientId ||
          m.id === `temp-${action.payload.clientId}`,
      );
      if (idx >= 0) {
        state.activeMessages[idx] = action.payload.message;
      } else {
        if (!state.activeMessages.some((m) => m.id === action.payload.message.id)) {
          state.activeMessages.push(action.payload.message);
        }
      }
    },
    prependMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      const existing = new Set(state.activeMessages.map((m) => m.id));
      const toPrepend = action.payload.filter((m) => !existing.has(m.id));
      state.activeMessages = [...toPrepend, ...state.activeMessages];
    },
    setTypingUser: (state, action: PayloadAction<string | null>) => {
      state.typingUserId = action.payload;
    },
    applyInboxUpdate: (
      state,
      action: PayloadAction<{ conversationId: string; message: ChatMessage }>,
    ) => {
      const { conversationId, message } = action.payload;
      const preview =
        message.text.length > 100 ? `${message.text.slice(0, 100)}…` : message.text;
      const isActiveRoom = state.activeConversationId === conversationId;

      if (isActiveRoom && !state.activeMessages.some((m) => m.id === message.id)) {
        state.activeMessages.push(message);
      }

      if (!state.inbox?.results) {
        if (!isActiveRoom) {
          state.unreadCount += 1;
        }
        return;
      }

      const idx = state.inbox.results.findIndex((c) => c.id === conversationId);
      if (idx < 0) {
        if (!isActiveRoom) {
          state.unreadCount += 1;
        }
        return;
      }

      const conv = state.inbox.results[idx];
      const unread = isActiveRoom ? conv.unread_count : conv.unread_count + 1;
      const updated = {
        ...conv,
        last_message_preview: preview,
        last_message_at: message.timestamp,
        unread_count: unread,
      };
      state.inbox.results.splice(idx, 1);
      state.inbox.results.unshift(updated);

      if (!isActiveRoom) {
        state.unreadCount += 1;
      }
    },
    clearChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoadingInbox = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoadingInbox = false;
        state.inbox = action.payload;
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.isLoadingInbox = false;
      })
      .addCase(fetchChatUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchMessageHistory.pending, (state) => {
        state.isLoadingMessages = true;
      })
      .addCase(fetchMessageHistory.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        const { conversationId, results, has_more, next_cursor, merge } = action.payload;
        if (state.activeConversationId !== conversationId) return;

        if (action.meta.arg.cursor) {
          const existing = new Set(state.activeMessages.map((m) => m.id));
          const toPrepend = results.filter((m) => !existing.has(m.id));
          state.activeMessages = [...toPrepend, ...state.activeMessages];
        } else if (merge) {
          const existing = new Set(state.activeMessages.map((m) => m.id));
          for (const msg of results) {
            if (!existing.has(msg.id)) {
              state.activeMessages.push(msg);
            }
          }
          state.activeMessages.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );
        } else {
          state.activeMessages = results;
        }
        state.hasMoreMessages = has_more;
        state.nextCursor = next_cursor;
      })
      .addCase(fetchMessageHistory.rejected, (state) => {
        state.isLoadingMessages = false;
      })
      .addCase(markConversationRead.fulfilled, (state, action) => {
        if (state.inbox?.results) {
          state.inbox.results = state.inbox.results.map((c) =>
            c.id === action.payload ? { ...c, unread_count: 0 } : c,
          );
        }
      });
  },
});

export const {
  setActiveConversation,
  addChatMessage,
  addOptimisticMessage,
  replaceOptimisticMessage,
  prependMessages,
  setTypingUser,
  applyInboxUpdate,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
