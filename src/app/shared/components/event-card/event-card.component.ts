import {Component, EventEmitter, Input, Output, LOCALE_ID} from '@angular/core';
import {Event} from '../../../core/models/event.model';
import {DatePipe, NgIf} from '@angular/common';
import {EventStatusPipe} from '../../pipes/event-status.pipe';
import {HighlightUpcomingDirective} from '../../directives/highlight-upcoming.directive';

@Component({
  selector: 'app-event-card',
  imports: [
    DatePipe,
    EventStatusPipe,
    HighlightUpcomingDirective,
    NgIf
  ],
  templateUrl: './event-card.component.html',

  // Providers specific to this component
  // - DatePipe: used to format event dates within the template
  // - LOCALE_ID: forces the pipe to format dates in French format ("fr-FR")
  providers: [
    DatePipe,
    {provide: LOCALE_ID, useValue: 'fr-FR'}
  ]
})
export class EventCardComponent {
  // The event object containing title, description, dates, etc.
  @Input() event!: Event;

  // Whether the register button should be displayed
  @Input() showRegisterButton = true;

  // Number of remaining seats for this event (null means unknown)
  @Input() remainingSeats: number | null = null;

  // Indicates whether the current user is already registered
  @Input() isRegistered = false;

  // Output event fired when user clicks "Register"
  // Emits the event ID to the parent component
  @Output() register: EventEmitter<number> = new EventEmitter<number>();

  // Method triggered when the user clicks the register button
  // Emits the event ID to the parent via the Output emitter
  onRegister(): void {
    this.register.emit(this.event.id);
  }
}
