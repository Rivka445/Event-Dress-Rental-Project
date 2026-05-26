import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  send(message: string, history: {role:string, content:string}[]) {
    return this.http.post<{reply: string}>('/api/Chat', { message, history });
  }
}
