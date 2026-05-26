import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  send(message: string, history: {role:string, content:string}[]) {
    return this.http.post<{reply: string}>('/api/chat', {
      message,
      history,
      products: []   
    });
  }
}
