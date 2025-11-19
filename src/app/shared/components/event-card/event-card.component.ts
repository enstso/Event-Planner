import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Event } from '../../../core/models/event.model';
import { DatePipe, NgIf } from '@angular/common';
import { EventStatusPipe } from '../../pipes/event-status.pipe';
import { HighlightUpcomingDirective } from '../../directives/highlight-upcoming.directive';

@Component({
  selector: 'app-event-card',
  imports: [
    DatePipe,
    EventStatusPipe,
    HighlightUpcomingDirective,
    NgIf
  ],
  templateUrl: './event-card.component.html'
})
export class EventCardComponent {
  @Input() event!: Event;
  @Input() showRegisterButton = true;
  @Input() remainingSeats: number | null = null;
  @Input() isRegistered = false;

  @Output() register: EventEmitter<number> = new EventEmitter<number>();

  onRegister(): void {
    this.register.emit(this.event.id);
  }
}
