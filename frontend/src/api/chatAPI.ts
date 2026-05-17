import axiosInstance from './axiosInstance';
import type {
  ChatMessage,
  ConversationDetail,
  ConversationInboxItem,
  MessageHistoryResponse,
  PaginatedResponse,
} from '@/types';

export const chatAPI = {
  getConversations: async (page = 1) => {
    const response = await axiosInstance.get<PaginatedResponse<ConversationInboxItem>>(
      '/chat/conversations/',
      { params: { page } },
    );
    return response.data;
  },

  getConversation: async (id: string) => {
    const response = await axiosInstance.get<ConversationDetail>(
      `/chat/conversations/${id}/`,
    );
    return response.data;
  },

  openConversation: async (applicationId: string) => {
    const response = await axiosInstance.post<ConversationDetail>(
      '/chat/conversations/open/',
      { application_id: applicationId },
    );
    return response.data;
  },

  getMessages: async (conversationId: string, cursor?: string) => {
    const response = await axiosInstance.get<MessageHistoryResponse>(
      `/chat/conversations/${conversationId}/messages/`,
      { params: cursor ? { cursor } : {} },
    );
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    text: string,
    clientMessageId?: string,
  ) => {
    const response = await axiosInstance.post<ChatMessage>(
      `/chat/conversations/${conversationId}/messages/`,
      {
        text,
        ...(clientMessageId ? { client_message_id: clientMessageId } : {}),
      },
    );
    return response.data;
  },

  markRead: async (conversationId: string, upToMessageId?: string) => {
    const response = await axiosInstance.post<{ detail: string }>(
      `/chat/conversations/${conversationId}/read/`,
      upToMessageId ? { up_to_message_id: upToMessageId } : {},
    );
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get<{ unread_count: number }>(
      '/chat/conversations/unread-count/',
    );
    return response.data;
  },
};
