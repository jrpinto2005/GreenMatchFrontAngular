export interface ChatMessage {
  id?: number;
  session_id?: number;
  sender: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

export interface ChatResponse {
  session_id: number;
  reply: string;
}

export interface Conversation {
  id: number;
  started_at: string;    
  last_activity_at: string;
  title: string | null;
}
