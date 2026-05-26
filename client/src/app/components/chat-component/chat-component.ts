
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.html',
  styleUrls: ['./chat-component.scss']
})
export class ChatComponent {
  messages: {role: string; content: string}[] = [];
  input = '';
  loading = false;
  isOpen = false;

  constructor(private chatService: ChatService) {}

  send() {
    if (!this.input.trim() || this.loading) return;
    const msg = this.input;
    this.input = '';
    this.loading = true;
    this.messages = [...this.messages, { role: 'user', content: msg }];

    this.chatService.send(msg, this.messages.slice(0, -1)).subscribe({
      next: res => {
        this.messages = [...this.messages, { role: 'assistant', content: res.reply }];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }
}
