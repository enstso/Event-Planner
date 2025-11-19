import { Component, OnInit } from '@angular/core';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { EventsService } from '../../../core/services/events/events.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Registration } from '../../../core/models/registration.model';
import { Event } from '../../../core/models/event.model';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { NgForOf, NgIf } from '@angular/common';

interface RegistrationWithEvent {
  registration: Registration;
  event: Event;
}

@Component({
  selector: 'app-my-registrations',
  imports: [
    EventCardComponent,
    NgIf,
    NgForOf
  ],
  templateUrl: './my-registrations.component.html'
})
export class MyRegistrationsComponent implements OnInit {
  registrationsWithEvents: RegistrationWithEvent[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private readonly eventsService: EventsService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId: number | null = this.authService.getCurrentUserId();
    if (userId === null) {
      this.errorMessage = 'You must be logged in to view your registrations.';
      return;
    }

    this.isLoading = true;

    this.eventsService
      .getRegistrationsByUser(userId)
      .pipe(
        switchMap((registrations: Registration[]) => {
          if (registrations.length === 0) {
            return of<RegistrationWithEvent[]>([]);
          }

          const observables = registrations.map((reg: Registration) =>
            this.eventsService.getEventById(reg.eventId).pipe(
              map((event: Event): RegistrationWithEvent => ({
                registration: reg,
                event
              }))
            )
          );

          return forkJoin(observables);
        })
      )
      .subscribe({
        next: (list: RegistrationWithEvent[]): void => {
          this.registrationsWithEvents = list;
          this.isLoading = false;
        },
        error: (): void => {
          this.isLoading = false;
          this.errorMessage = 'Could not load registrations.';
        }
      });
  }

  onCancelRegistration(registrationId: number): void {
    this.eventsService.deleteRegistration(registrationId).subscribe({
      next: () => {
        this.registrationsWithEvents = this.registrationsWithEvents.filter(
          (item: RegistrationWithEvent) => item.registration.id !== registrationId
        );
      },
      error: (): void => {
        this.errorMessage = 'Could not cancel registration.';
      }
    });
  }
}
