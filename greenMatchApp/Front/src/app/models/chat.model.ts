export interface ChatMessage {
  id?: number;
  session_id?: number;
  sender: 'user' | 'assistant';
  content: string | null;
  created_at: Date;
  message_type?: 'text' | 'image' | 'mixed';
  image_gcs_uris?: string[] | null;
}

export interface ChatResponse {
  session_id: number;
  reply: string;
}

export interface Conversation {
  id: number;
  started_at: string | Date;
  last_activity_at: string | Date;
  title: string | null;
}
