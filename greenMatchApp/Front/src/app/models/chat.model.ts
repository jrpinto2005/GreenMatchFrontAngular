export interface ChatMessage {
    id?: number;
    session_id?: number;
    sender: 'user' | 'assistant';
    content: string;
    message_type?: string;
    image_gcs_uri?: string;
    vertex_model_name?: string;
    vertex_response_json?: string;
    created_at?: Date;
}

export interface ChatResponse {
    session_id: number;
    reply: string;
}

export interface Conversation {
    id: number;
    user_id?: number;
    messages?: ChatMessage[];
}