import { Component } from '@angular/core';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';
import { BarraInferiorComponent } from '../barra-inferior/barra-inferior.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Message {
  from: string;
  text: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [BarraSuperiorComponent, BarraInferiorComponent, CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent {
  messages: Message[] = [];
  newMessage: string = '';

  sendMessage() {
    if (this.newMessage.trim() === '') return;

    this.messages.push({ from: 'me', text: this.newMessage });

    this.newMessage = '';

    // Fake response
    setTimeout(() => {
      this.messages.push({ from: 'bot', text: 'Got it!' });
    }, 500);
  }

}
