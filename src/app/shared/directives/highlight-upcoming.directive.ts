import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Event } from '../../core/models/event.model';

@Directive({
  selector: '[appHighlightUpcoming]'
})
export class HighlightUpcomingDirective implements OnInit {
  @Input() appHighlightUpcomingEvent?: Event;

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const event: Event | undefined = this.appHighlightUpcomingEvent;
    if (!event) {
      return;
    }

    const startDate: Date = new Date(event.startDate);
    const now: Date = new Date();
    const diffInMs: number = startDate.getTime() - now.getTime();
    const diffInDays: number = diffInMs / (1000 * 60 * 60 * 24);

    // Highlight events starting in the next 7 days
    if (diffInDays >= 0 && diffInDays <= 7) {
      this.el.nativeElement.classList.add(
        'border',
        'border-amber-400',
        'bg-amber-50'
      );
    }
  }
}
