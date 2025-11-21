import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, map, of, Subject, switchMap, takeUntil} from 'rxjs';
import {EventsService} from '../../../core/services/events/events.service';
import {AuthService} from '../../../core/services/auth/auth.service';
import {Registration} from '../../../core/models/registration.model';
import {Event} from '../../../core/models/event.model';
import {EventCardComponent} from '../../../shared/components/event-card/event-card.component';
import {NgForOf, NgIf} from '@angular/common';
import {NotificationService} from '../../../core/services/notification/notification.service';

// Data structure combining a registration with its associated event
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
  // Holds pairs of { registration, event } to display in the template
  registrationsWithEvents: RegistrationWithEvent[] = [];

  // Loading indicator
  isLoading = false;

  // Error message displayed in case of failure
  errorMessage: string | null = null;

  // Used to automatically unsubscribe from all streams on component destruction
  private readonly destroy$ = new Subject<void>();

  constructor(
    // Service for event- and registration-related API operations
    private readonly eventsService: EventsService,
    // Service that provides the current user identity
    private readonly authService: AuthService,
    // Service used to display toast notifications
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Get the ID of the authenticated user
    const userId: number | null = this.authService.getCurrentUserId();

    // If user is not logged in, show an error and stop here
    if (userId === null) {
      this.errorMessage = 'You must be logged in to view your registrations.';
      return;
    }

    this.isLoading = true;

    // Step 1: Load all registrations for this user
    this.eventsService
      .getRegistrationsByUser(userId)
      .pipe(
        takeUntil(this.destroy$),

        // Step 2: For each registration, load the corresponding event
        switchMap((registrations: Registration[]) => {
          // If there are no registrations, immediately return an empty array
          if (registrations.length === 0) {
            return of<RegistrationWithEvent[]>([]);
          }

          // Build an array of observables, one for each event being fetched
          const observables = registrations.map((reg: Registration) =>
            this.eventsService.getEventById(reg.eventId).pipe(
              // Combine the registration and event into a single object
              map((event: Event): RegistrationWithEvent => ({
                registration: reg,
                event
              }))
            )
          );

          // Step 3: forkJoin waits for ALL event API calls to complete
          return forkJoin(observables);
        })
      )
      .subscribe({
        next: (list: RegistrationWithEvent[]): void => {
          // Save the combined result
          this.registrationsWithEvents = list;
          this.isLoading = false;
        },
        error: (): void => {
          this.isLoading = false;
          // Show UI error notification
          this.notificationService.showError('Could not load registrations.');
        }
      });
  }

  ngOnDestroy(): void {
    // Ensures all ongoing subscriptions are properly closed
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cancels a registration and updates the UI immediately
  onCancelRegistration(registrationId: number): void {
    this.eventsService.deleteRegistration(registrationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove the cancelled registration from the current display list
          this.registrationsWithEvents = this.registrationsWithEvents.filter(
            (item: RegistrationWithEvent) => item.registration.id !== registrationId
          );

          // Inform the user of success
          this.notificationService.showSuccess('Registration cancelled.');
        },
        error: (): void => {
          this.notificationService.showError('Could not cancel registration.');
        }
      });
  }
}
