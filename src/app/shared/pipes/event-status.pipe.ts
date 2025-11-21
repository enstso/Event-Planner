import { Pipe, PipeTransform } from '@angular/core';
import { Event } from '../../core/models/event.model';

@Pipe({
  name: 'eventStatus'
})
export class EventStatusPipe implements PipeTransform {

  // Transforms an Event object into a string representing its status
  transform(event: Event): string {
    // Get the current date/time
    const now: Date = new Date();

    // Convert the event's start and end dates into Date objects
    const start: Date = new Date(event.startDate);
    const end: Date = new Date(event.endDate);

    // If the event has already ended, it's finished
    if (end < now) {
      return 'Finished';
    }

    // If current time is between start and end, the event is ongoing
    if (start <= now && end >= now) {
      return 'Ongoing';
    }

    // Otherwise, the event is scheduled for the future
    return 'Upcoming';
  }
}
