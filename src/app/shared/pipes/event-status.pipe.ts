import { Pipe, PipeTransform } from '@angular/core';
import { Event } from '../../core/models/event.model';

@Pipe({
  name: 'eventStatus'
})
export class EventStatusPipe implements PipeTransform {
  transform(event: Event): string {
    const now: Date = new Date();
    const start: Date = new Date(event.startDate);
    const end: Date = new Date(event.endDate);

    if (end < now) {
      return 'Finished';
    }

    if (start <= now && end >= now) {
      return 'Ongoing';
    }

    return 'Upcoming';
  }
}
