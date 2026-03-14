import { Injectable, signal } from '@angular/core';

export type AlertType = 'info' | 'error' | 'success';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  message = signal<string | null>(null);
  type = signal<AlertType>('info');

  show(message: string, type: AlertType = 'info', duration: number = 2200): void {
    this.message.set(message);
    this.type.set(type);

    setTimeout(() => {
      this.message.set(null);
    }, duration);
  }
}
