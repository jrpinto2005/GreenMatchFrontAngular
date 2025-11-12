import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChatMessage, ChatResponse, Conversation } from '../models/chat.model';
import { ChatService } from './chat.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    BarraSuperiorComponent,
    BarraInferiorComponent,
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage = '';
  userId = Number(localStorage.getItem('user_id'));
  sessionId: number | null = null;

  showSidebar = false;
  pastConversations: Conversation[] = [];

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Si viene un prompt desde Mis Plantas (o cualquier pantalla), autoenvíalo
    this.route.queryParamMap.pipe(take(1)).subscribe(params => {
      const prompt = params.get('prompt');
      if (prompt && prompt.trim()) {
        this.newMessage = prompt.trim();
        this.sendMessage();
      }
    });
  }

  // Barra inferior dispara esto
  handleSubmit() {
    this.sendMessage();
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    if (!this.userId) {
      console.error('No userId found, user not logged in');
      return;
    }

    // Mensaje del usuario se muestra inmediatamente
    this.messages.push({
      sender: 'user',
      content: this.newMessage,
      created_at: new Date()
    } as ChatMessage);

    const messageToSend = this.newMessage;
    this.newMessage = '';

    this.chatService.sendMessage(this.userId, this.sessionId, messageToSend).subscribe({
      next: (response: ChatResponse) => {
        const wasNewConversation = this.sessionId == null;
        this.sessionId = response.session_id;

        this.messages.push({
          sender: 'assistant',
          content: response.reply,
          session_id: this.sessionId,
          created_at: new Date()
        } as ChatMessage);

        // Si se acaba de crear una nueva conversación, recargar listado
        if (wasNewConversation) {
          this.loadPastConversations();
        }
      },
      error: (err) => {
        console.error('Error enviando mensaje', err);
        // opcional: mostrar error en UI y revertir el último push si quieres
      }
    });
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    if (this.showSidebar) {
      this.loadPastConversations();
    }
  }

  loadPastConversations() {
    if (!this.userId) return;

    this.chatService.getUserConversations(this.userId).subscribe({
      next: (convs) => (this.pastConversations = convs),
      error: (err) => console.error('Error loading past conversations', err)
    });
  }

  selectConversation(conv: Conversation) {
    this.sessionId = conv.id;
    this.showSidebar = false;

    this.chatService.getConversationChats(conv.id).subscribe({
      next: (msgs) => {
        this.messages = msgs;
      },
      error: (err) => console.error('Error loading messages', err)
    });
  }

  newConversation() {
    this.sessionId = null;
    this.messages = [];
    this.showSidebar = false;
  }
}
