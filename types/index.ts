// メッセージの型定義
export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// 会話の型定義
export interface Conversation {
  id: string;
  device_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// 会話とメッセージを含む型
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// チャットリクエストの型
export interface ChatRequest {
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  conversationId?: string;
  deviceId: string;
}

// チャットレスポンスの型（ストリーミング用）
export interface ChatResponse {
  content: string;
  conversationId: string;
  messageId: string;
}

// API レスポンスの型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// 新規会話作成リクエスト
export interface CreateConversationRequest {
  deviceId: string;
  title?: string;
}

// メッセージ作成リクエスト
export interface CreateMessageRequest {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
}
