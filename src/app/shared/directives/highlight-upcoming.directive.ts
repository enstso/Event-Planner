import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Event } from '../../core/models/event.model';

@Directive({
  selector: '[appHighlightUpcoming]'
})
export class HighlightUpcomingDirective implements OnInit {
  // Receives the event object from the component using the directive
  @Input() appHighlightUpcomingEvent?: Event;

  // ElementRef gives direct access to the host DOM element
  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    // Retrieve the event passed via the directive input
    const event: Event | undefined = this.appHighlightUpcomingEvent;
    if (!event) {
      // If no event is provided, do nothing
      return;
    }

    // Convert the event start date to a Date object
    const startDate: Date = new Date(event.startDate);

    // Current date/time
    const now: Date = new Date();

    // Calculate difference in milliseconds between start date and now
    const diffInMs: number = startDate.getTime() - now.getTime();

    // Convert milliseconds to days
    const diffInDays: number = diffInMs / (1000 * 60 * 60 * 24);

    // Highlight events that start within the next 7 days (including today)
    if (diffInDays >= 0 && diffInDays <= 7) {
      // Apply CSS utility classes to visually highlight the event card
      this.el.nativeElement.classList.add(
        'border',
        'border-amber-400',
        'bg-amber-50'
      );
    }
  }
}
