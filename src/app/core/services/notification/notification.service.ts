import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationSubject = new BehaviorSubject<Notification | null>(null);

  readonly notification$: Observable<Notification | null> =
    this.notificationSubject.asObservable();

  private readonly AUTO_HIDE_MS = 3000;

  showError(message: string): void {
    this.show(message, 'error');
  }

  showSuccess(message: string): void {
    this.show(message, 'success');
  }

  clear(): void {
    this.notificationSubject.next(null);
  }

  private show(message: string, type: NotificationType): void {
    this.notificationSubject.next({ message, type });

    setTimeout(() => {
      const current = this.notificationSubject.value;
      if (current && current.message === message && current.type === type) {
        this.clear();
      }
    }, this.AUTO_HIDE_MS);
  }
}
