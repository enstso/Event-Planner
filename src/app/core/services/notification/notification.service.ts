import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Holds the current notification (or null if hidden).
  // BehaviorSubject ensures that subscribers always receive the latest value.
  private readonly notificationSubject = new BehaviorSubject<Notification | null>(null);

  // Public observable exposing the notification to components.
  readonly notification$: Observable<Notification | null> =
    this.notificationSubject.asObservable();

  // Duration before a notification automatically disappears (3 seconds).
  private readonly AUTO_HIDE_MS = 3000;

  // Convenience method for displaying an error notification.
  showError(message: string): void {
    this.show(message, 'error');
  }

  // Convenience method for displaying a success message.
  showSuccess(message: string): void {
    this.show(message, 'success');
  }

  // Clears the current notification, hiding it from the UI.
  clear(): void {
    this.notificationSubject.next(null);
  }

  // Internal method used by all public notification triggers.
  private show(message: string, type: NotificationType): void {
    // Emit the new notification to all subscribers.
    this.notificationSubject.next({ message, type });

    // Automatically clear the notification after a delay.
    setTimeout(() => {
      const current = this.notificationSubject.value;

      // Clear only if the message is still the same and hasn’t been replaced by a newer one.
      if (current && current.message === message && current.type === type) {
        this.clear();
      }
    }, this.AUTO_HIDE_MS);
  }
}
