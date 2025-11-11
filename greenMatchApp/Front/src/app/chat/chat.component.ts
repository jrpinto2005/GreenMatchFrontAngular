import { Component, OnInit } from '@angular/core';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChatMessage, ChatResponse, Conversation } from '../models/chat.model';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [BarraSuperiorComponent, BarraInferiorComponent, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent {
  messages: ChatMessage[] = [];
  newMessage = '';
  userId = Number(localStorage.getItem('user_id'));
  sessionId: number | null = null;

  showSidebar = false;
  pastConversations: Conversation[] = [];

  constructor(private chatService: ChatService) {}

  handleSubmit() {
    this.sendMessage();
  }
  
  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.messages.push({
      sender: 'user',
      content: this.newMessage,
      created_at: new Date()
    } as ChatMessage);

    this.chatService.sendMessage(this.userId, this.sessionId, this.newMessage)
      .subscribe({
        next: (response: ChatResponse) => {
          this.sessionId = response.session_id;

          this.messages.push({
            sender: 'assistant',
            content: response.reply,
            session_id: this.sessionId,
            created_at: new Date()
          } as ChatMessage);
        },
        error: (err) => console.error('Error enviando mensaje', err)
      });

      this.newMessage = '';
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;

    if (this.showSidebar && this.pastConversations.length === 0) {
      this.loadPastConversations();
    }
  }

  loadPastConversations() {
    const userId = Number(localStorage.getItem('user_id'));
    this.chatService.getUserConversations(userId).subscribe({
      next: (convs) => (this.pastConversations = convs),
      error: (err) => console.error('Error loading past conversations', err)
    });
  }

  selectConversation(conv: Conversation) {
    this.sessionId = conv.id;
    this.showSidebar = false;
    this.chatService.getConversationChats(conv.id).subscribe({
      next: (msgs) => {

      },
      error: (err) => console.error('Error loading messages', err)
    });
  }

}


/*interface Message {
  from: 'user' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [BarraSuperiorComponent, BarraInferiorComponent, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit{
  conversation?: Conversation;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  userId: number = 1; //get user from auth

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
      this.startConversation();
  }

  handleSubmit() {
    this.sendMessage();
  }

  private getNextId(msgs: ChatMessage[]): number {
    const used = new Set<number>();
    for (const m of msgs) {
      if (typeof m.id === 'number' && Number.isFinite(m.id) && m.id > 0) used.add(m.id);
    }
    let id = 1;
    while (used.has(id)) id++;
    return id;
  }

  startConversation() {
    this.chatService.createConversation(this.userId).subscribe({
      next: (conv) => {
        this.conversation = conv;
      },
      error: (err) => console.error('Error creando conversacion', err)
    });
  }

  sendMessage() {
    if (!this.conversation || !this.newMessage.trim()) return;

    const nextId = this.getNextId(this.messages);

    const userMsg: ChatMessage = {
      session_id: this.conversation.id,
      sender: 'user',
      content: this.newMessage,
      id: nextId,
      message_type: '',
      image_gcs_uri: '',
      vertex_model_name: '',
      vertex_response_json: '',
      created_at: new Date()
    };
    this.messages.push(userMsg);

    this.chatService.sendMessage(this.conversation.id, this.newMessage).subscribe({
      next: (updatedMessages) => {
        this.messages = updatedMessages;
      },
      error: (err) => console.log('Error enviando mensaje', err)
    });

    this.newMessage = '';
  }

}*/
