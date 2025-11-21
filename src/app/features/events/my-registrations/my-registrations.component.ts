import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, map, of, Subject, switchMap, takeUntil} from 'rxjs';
import {EventsService} from '../../../core/services/events/events.service';
import {AuthService} from '../../../core/services/auth/auth.service';
import {Registration} from '../../../core/models/registration.model';
import {Event} from '../../../core/models/event.model';
import {EventCardComponent} from '../../../shared/components/event-card/event-card.component';
import {NgForOf, NgIf} from '@angular/common';
import {NotificationService} from '../../../core/services/notification/notification.service';

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
export class MyRegistrationsComponent implements OnInit, OnDestroy {
  registrationsWithEvents: RegistrationWithEvent[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {
  }

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
        takeUntil(this.destroy$),
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
          this.notificationService.showError('Could not load registrations.');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancelRegistration(registrationId: number): void {
    this.eventsService.deleteRegistration(registrationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.registrationsWithEvents = this.registrationsWithEvents.filter(
            (item: RegistrationWithEvent) => item.registration.id !== registrationId
          );
          this.notificationService.showSuccess('Registration cancelled.');
        },
        error: (): void => {
          this.notificationService.showError('Could not cancel registration.');
        }
      });
  }
}
