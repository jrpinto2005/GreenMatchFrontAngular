import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChatMessage, ChatResponse, Conversation } from '../models/chat.model';
import { ChatService } from './chat.service';
import { take } from 'rxjs/operators';

// Markdown
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    BarraSuperiorComponent,
    BarraInferiorComponent,
    CommonModule,
    FormsModule,
    HttpClientModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('messagesContainer')
  private messagesContainer?: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  newMessage = '';
  userId = Number(localStorage.getItem('user_id'));
  sessionId: number | null = null;

  showSidebar = false;
  pastConversations: Conversation[] = [];

  // Imágenes en el front
  pendingFiles: File[] = [];
  pendingPreviews: string[] = [];
  dragOver = false;
  isSending = false;

  // Estado del nav lateral derecho (igual que isCollapsed en el preview React)
  rightNavCollapsed = true;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    // Si viene un prompt desde Mis Plantas, autoenvía
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const prompt = params.get('prompt');
      if (prompt && prompt.trim()) {
        this.newMessage = prompt.trim();
        this.sendMessage();
      }
    });

    // Carga conversaciones previas al entrar
    if (this.userId) {
      this.loadPastConversations();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  // ------------------
  //   Markdown render
  // ------------------
  renderMarkdown(content: string | null | undefined): SafeHtml {
    if (!content) return '';
    const html = marked.parse(content, { breaks: true }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ------------------
  //   Form submit
  // ------------------
  handleSubmit() {
    this.sendMessage();
  }

  // ------------------
  //   Drag & drop
  // ------------------
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    if (!event.dataTransfer?.files?.length) return;

    const files = Array.from(event.dataTransfer.files);
    this.addFiles(files);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    this.addFiles(files);

    // Limpiamos el input para poder volver a subir las mismas imágenes
    input.value = '';
  }

  private addFiles(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    const availableSlots = 3 - this.pendingFiles.length;
    if (availableSlots <= 0) return;

    const toAdd = imgs.slice(0, availableSlots);
    for (const file of toAdd) {
      this.pendingFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        this.pendingPreviews.push(src);
      };
      reader.readAsDataURL(file);
    }
  }

  removePending(index: number) {
    this.pendingFiles.splice(index, 1);
    this.pendingPreviews.splice(index, 1);
  }

  // ------------------
  //   Envío mensaje
  // ------------------
  sendMessage() {
    const text = this.newMessage.trim();
    const hasImages = this.pendingFiles.length > 0;

    if (!text && !hasImages) return;
    if (!this.userId) {
      console.error('No userId found, user not logged in');
      return;
    }

    this.isSending = true;

    // Mensaje local optimista
    const localMsg: ChatMessage = {
      sender: 'user',
      content: text || (hasImages ? '' : null),
      created_at: new Date(),
      message_type: hasImages && text ? 'mixed' : hasImages ? 'image' : 'text',
      image_gcs_uris: hasImages ? [...this.pendingPreviews] : null,
    };
    this.messages.push(localMsg);
    this.scrollToBottom();

    const filesToUpload = [...this.pendingFiles];

    // Limpiamos el input y previews
    this.newMessage = '';
    this.pendingFiles = [];
    this.pendingPreviews = [];

    const sendTextAndGetReply = (imageUris?: string[]) => {
      const textToSend =
        text || (imageUris?.length ? 'Te envío fotos de mi planta.' : '');

      this.chatService
        .sendMessage(this.userId, this.sessionId, textToSend, imageUris)
        .subscribe({
          next: (response: ChatResponse) => {
            const wasNewConversation = this.sessionId == null;
            this.sessionId = response.session_id;

            this.messages.push({
              sender: 'assistant',
              content: response.reply,
              session_id: this.sessionId,
              created_at: new Date(),
              message_type: 'text',
            } as ChatMessage);
            this.scrollToBottom();

            if (wasNewConversation) {
              this.loadPastConversations();
            }
            this.isSending = false;
          },
          error: (err) => {
            console.error('Error enviando mensaje', err);
            this.isSending = false;
          },
        });
    };

    // Si hay imágenes → primero subirlas al bucket
    if (filesToUpload.length) {
      const formData = new FormData();
      formData.append('user_id', this.userId.toString());
      if (this.sessionId != null) {
        formData.append('session_id', this.sessionId.toString());
      }

      for (const f of filesToUpload) {
        formData.append('files', f);
      }

      this.chatService.uploadImages(formData).subscribe({
        next: (resp) => {
          this.sessionId = resp.session_id;
          const imageUris = resp.image_urls;
          sendTextAndGetReply(imageUris);
        },
        error: (err) => {
          console.error('Error subiendo imágenes', err);
          this.isSending = false;
        },
      });
    } else {
      // Solo texto
      sendTextAndGetReply();
    }
  }

  // ------------------
  //   Sidebar izq
  // ------------------
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
      error: (err) => console.error('Error loading past conversations', err),
    });
  }

  selectConversation(conv: Conversation) {
    this.sessionId = conv.id;
    this.showSidebar = false;

    this.chatService.getConversationChats(conv.id).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.scrollToBottom();
      },
      error: (err) => console.error('Error loading messages', err),
    });
  }

  newConversation() {
    this.sessionId = null;
    this.messages = [];
    this.showSidebar = false;
  }

  // ------------------
  //   Estado nav lateral derecho
  // ------------------
  onRightNavCollapsed(collapsed: boolean) {
    this.rightNavCollapsed = collapsed;
  }

  // ------------------
  //   Scroll al fondo
  // ------------------
  private scrollToBottom() {
    queueMicrotask(() => {
      const el = this.messagesContainer?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }
}
