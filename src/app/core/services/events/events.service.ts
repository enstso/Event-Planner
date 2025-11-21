import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
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

  // Fetch all events from JSON Server.
  getAllEvents(): Observable<Event[]> {
    return this.api.get<Event[]>('events');
  }

  // Fetch a single event by ID.
  getEventById(id: number): Observable<Event> {
    return this.api.get<Event>(`events/${id}`);
  }

  // Create a new event.
  // The backend (JSON Server) automatically assigns an ID.
  createEvent(dto: CreateEventDto, organizerId: number): Observable<Event> {
    const event: Omit<Event, 'id'> = {
      ...dto,
      organizerId // Attach the ID of the user creating the event.
    };
    return this.api.post<Event, Omit<Event, 'id'>>('events', event);
  }

  // Update an existing event.
  updateEvent(id: number, dto: UpdateEventDto): Observable<Event> {
    return this.api.put<Event, UpdateEventDto>(`events/${id}`, dto);
  }

  // Delete an event by ID.
  deleteEvent(id: number): Observable<unknown> {
    return this.api.delete<unknown>(`events/${id}`);
  }

  // Create a registration for an event.
  registerToEvent(dto: CreateRegistrationDto): Observable<Registration> {
    // Base registration data (JSON Server generates the ID).
    const registration: Omit<Registration, 'id' | 'createdAt'> = {
      userId: dto.userId,
      eventId: dto.eventId
    };

    // Add createdAt timestamp manually.
    const body: Omit<Registration, 'id'> = {
      ...registration,
      createdAt: new Date().toISOString()
    };

    return this.api.post<Registration, Omit<Registration, 'id'>>(
      'registrations',
      body
    );
  }

  // Get all registrations made by a specific user.
  getRegistrationsByUser(userId: number): Observable<Registration[]> {
    return this.api.get<Registration[]>(`registrations?userId=${userId}`);
  }

  // Remove a registration (used in "My Registrations").
  deleteRegistration(registrationId: number): Observable<unknown> {
    return this.api.delete<unknown>(`registrations/${registrationId}`);
  }

  // Get all registrations for a specific event.
  getRegistrationsByEvent(eventId: number): Observable<Registration[]> {
    return this.api.get<Registration[]>(`registrations?eventId=${eventId}`);
  }

  // Compute remaining seats for a list of events.
  // Returns: a dictionary { eventId: remainingSeats }
  getRemainingSeatsByEvent(events: Event[]): Observable<Record<number, number>> {
    // If no events, return an empty object immediately.
    if (events.length === 0) {
      return of({});
    }

    // For each event, request its registration list.
    const observables = events.map((event: Event) =>
      this.getRegistrationsByEvent(event.id)
    );

    // forkJoin waits until ALL HTTP calls complete.
    return forkJoin(observables).pipe(
      map((results: Registration[][]) => {
        const counts: Record<number, number> = {};

        // Each result corresponds to one event, in original order.
        results.forEach((regs: Registration[], index: number) => {
          const event: Event = events[index];
          // Prevent negative values.
          counts[event.id] = Math.max(event.capacity - regs.length, 0);
        });

        return counts;
      })
    );
  }

  // Compute remaining seats for a single event.
  getRemainingSeatsForEvent(event: Event): Observable<number> {
    return this.getRegistrationsByEvent(event.id).pipe(
      map((registrations: Registration[]) =>
        Math.max(event.capacity - registrations.length, 0)
      )
    );
  }
}
