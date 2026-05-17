export interface ChatMessage {
  id: string;
  sender_id: string;
  timestamp: string;
  text: string;
  client_id?: string;
  client_message_id?: string;
}

export interface ConversationInboxItem {
  id: string;
  application_id: string;
  job_title: string;
  job_slug: string;
  other_party_name: string;
  other_party_id: string;
  other_party_avatar_url: string | null;
  last_message_preview: string;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export interface ConversationDetail extends ConversationInboxItem {
  participants: string[];
  seeker_id: string;
  employer_user_id: string;
}

export interface MessageHistoryResponse {
  results: ChatMessage[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface ChatConnectedPacket {
  type: 'chat.connected';
  conversation_id: string;
  participants: string[];
  last_read_at: string | null;
}

export interface ChatMessagePacket {
  type: 'chat.message';
  message: ChatMessage;
}

export interface ChatErrorPacket {
  type: 'chat.error';
  code: string;
  message: string;
}

export interface ChatTypingPacket {
  type: 'chat.typing';
  sender_id: string;
  is_typing: boolean;
}

export type ChatServerPacket =
  | ChatConnectedPacket
  | ChatMessagePacket
  | ChatErrorPacket
  | ChatTypingPacket;
