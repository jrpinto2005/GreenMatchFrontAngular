import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = environment.apiUrl;

constructor(private http: HttpClient) { }

sendMessage(userId: number | null, sessionId: number | null, message: string) {
  const body: any = { message };

  if (sessionId) {
    body.session_id = sessionId;
  } else {
    body.user_id = userId;
  }

  return this.http.post<any>(`${this.baseUrl}/chat/message`, body);

}

/*createConversation(userId: number): Observable<Conversation> {
  return this.http.post<Conversation>(`${this.baseUrl}/conversations`, { user_id: userId });
}

getConversationChats(conversationId: number): Observable<ChatMessage[]> {
  return this.http.get<ChatMessage[]>(`${this.baseUrl}/conversations/${conversationId}/chats`);
}

sendMessage(conversationId: number, content: string): Observable<ChatMessage[]> {
  return this.http.post<ChatMessage[]>(
    `${this.baseUrl}/conversations/${conversationId}/chats`,
    { content }
  );
}*/

}
