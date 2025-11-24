import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatMessage, ChatResponse, Conversation } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  sendMessage(
    userId: number,
    sessionId: number | null,
    message: string,
    imageUris?: string[]
  ): Observable<ChatResponse> {
    const body: any = {
      message,
      user_id: userId,
    };
    if (sessionId != null) {
      body.session_id = sessionId;
    }
    if (imageUris && imageUris.length) {
      body.image_uris = imageUris;
    }

    return this.http.post<ChatResponse>(`${this.apiUrl}/chat/message`, body);
  }

  uploadImages(formData: FormData): Observable<{
    session_id: number;
    image_urls: string[];
    message_id: number;
  }> {
    return this.http.post<{
      session_id: number;
      image_urls: string[];
      message_id: number;
    }>(`${this.apiUrl}/chat/upload-images`, formData);
  }

  getUserConversations(userId: number): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/chat/sessions`, {
      params: { user_id: userId.toString() }
    });
  }

  getConversationChats(sessionId: number): Observable<ChatMessage[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/chat/sessions/${sessionId}/messages`)
      .pipe(
        map(rows =>
          rows.map(row => ({
            id: row.id,
            session_id: row.session_id,
            sender: row.sender,
            content: row.content ?? '',
            created_at: new Date(row.created_at),
            message_type: (row.message_type as 'text' | 'image' | 'mixed') ?? 'text',
            image_gcs_uris: row.image_gcs_uris ?? null,
          }) as ChatMessage)
        )
      );
  }

  deleteConversation(sessionId: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/chat/sessions/${sessionId}`);
}
}
