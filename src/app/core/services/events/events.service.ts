import { Injectable } from '@angular/core';
import {forkJoin, map, Observable, of} from 'rxjs';
import { ApiService } from '../api.service';
import { Event } from '../../models/event.model';
import { CreateEventDto, UpdateEventDto } from '../../dto/event.dto';
import { Registration } from '../../models/registration.model';
import { CreateRegistrationDto } from '../../dto/registration.dto';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  constructor(private readonly api: ApiService) {}

  getAllEvents(): Observable<Event[]> {
    return this.api.get<Event[]>('events');
  }

  getEventById(id: number): Observable<Event> {
    return this.api.get<Event>(`events/${id}`);
  }

  createEvent(dto: CreateEventDto, organizerId: number): Observable<Event> {
    const event: Omit<Event, 'id'> = {
      ...dto,
      organizerId
    };
    return this.api.post<Event, Omit<Event, 'id'>>('events', event);
  }

  updateEvent(id: number, dto: UpdateEventDto): Observable<Event> {
    return this.api.put<Event, UpdateEventDto>(`events/${id}`, dto);
  }

  deleteEvent(id: number): Observable<unknown> {
    return this.api.delete<unknown>(`events/${id}`);
  }

  registerToEvent(dto: CreateRegistrationDto): Observable<Registration> {
    const registration: Omit<Registration, 'id' | 'createdAt'> = {
      userId: dto.userId,
      eventId: dto.eventId
    };

    const body: Omit<Registration, 'id'> = {
      ...registration,
      createdAt: new Date().toISOString()
    };

    return this.api.post<Registration, Omit<Registration, 'id'>>('registrations', body);
  }

  getRegistrationsByUser(userId: number): Observable<Registration[]> {
    return this.api.get<Registration[]>(`registrations?userId=${userId}`);
  }

  deleteRegistration(registrationId: number): Observable<unknown> {
    return this.api.delete<unknown>(`registrations/${registrationId}`);
  }

  getRegistrationsByEvent(eventId: number): Observable<Registration[]> {
    return this.api.get<Registration[]>(`registrations?eventId=${eventId}`);
  }

  getRemainingSeatsByEvent(events: Event[]): Observable<Record<number, number>> {
    if (events.length === 0) {
      return of({});
    }

    const observables = events.map((event: Event) =>
      this.getRegistrationsByEvent(event.id)
    );

    return forkJoin(observables).pipe(
      map((results: Registration[][]) => {
        const counts: Record<number, number> = {};
        results.forEach((regs: Registration[], index: number) => {
          const event: Event = events[index];
          counts[event.id] = Math.max(event.capacity - regs.length, 0);
        });
        return counts;
      })
    );
  }

  getRemainingSeatsForEvent(event: Event): Observable<number> {
    return this.getRegistrationsByEvent(event.id).pipe(
      map((registrations: Registration[]) =>
        Math.max(event.capacity - registrations.length, 0)
      )
    );
  }
}
