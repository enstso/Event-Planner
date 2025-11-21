import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeaderComponent} from './shared/components/header/header.component';
import {Observable} from 'rxjs';
import {NotificationService, Notification} from './core/services/notification/notification.service';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgClass, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'event-planner';

  // Observable stream of the current notification (or null).
  // The template subscribes to this using the async pipe.
  readonly notification$: Observable<Notification | null>;

  constructor(private readonly notificationService: NotificationService) {
    // Connect the component to the NotificationService.
    // Every time a notification is emitted, the template will automatically update.
    this.notification$ = this.notificationService.notification$;
  }
}
