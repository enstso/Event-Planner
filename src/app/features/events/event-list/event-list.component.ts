import {Component, OnDestroy, OnInit} from '@angular/core';
import {EventsService} from '../../../core/services/events/events.service';
import {Event} from '../../../core/models/event.model';
import {AuthService} from '../../../core/services/auth/auth.service';
import {CreateRegistrationDto} from '../../../core/dto/registration.dto';
import {EventCardComponent} from '../../../shared/components/event-card/event-card.component';
import {NgForOf, NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {Registration} from '../../../core/models/registration.model';
import {UserRole} from '../../../core/models/user.model';
import {NotificationService} from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-event-list',
  imports: [
    EventCardComponent,
    NgIf,
    RouterLink,
    NgForOf
  ],
  templateUrl: './event-list.component.html'
})
export class EventListComponent implements OnInit,OnDestroy {
  // List of events loaded from the backend
  events: Event[] = [];

  // Indicates whether events are currently being loaded
  isLoading = false;

  // Role of the currently authenticated user (ADMIN or USER)
  userRole: UserRole | null = null;

  // Map of eventId -> remaining seats (or related count, depending on service logic)
  private registrationsCountByEventId: Record<number, number> = {};

  // Set of event IDs for which the current user is registered
  private registeredEventIds: Set<number> = new Set<number>();

  // Subject used to signal unsubscription when the component is destroyed
  private readonly destroy$ = new Subject<void>();

  constructor(
    // Service responsible for all event and registration API calls
    private readonly eventsService: EventsService,
    // Service responsible for authentication and user info
    private readonly authService: AuthService,
    // Angular router to navigate to event details
    private readonly router: Router,
    // Service used to show success/error notifications
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Load events when the component initializes
    this.fetchEvents();

    // Get current user role (used in template to show/hide admin actions)
    this.userRole = this.authService.getCurrentUserRole();
  }

  ngOnDestroy(): void {
    // Emit a value to notify all subscriptions to complete
    this.destroy$.next();
    // Complete the subject to free resources
    this.destroy$.complete();
  }

  // Fetches events and related registration data from the backend
  fetchEvents(): void {
    this.isLoading = true;

    this.eventsService.getAllEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events: Event[]) => {
          // Save the list of events
          this.events = events;

          // For all events, load aggregated data about remaining seats
          this.eventsService.getRemainingSeatsByEvent(events)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (counts: Record<number, number>): void => {
                // Store the counts (per-event information)
                this.registrationsCountByEventId = counts;

                // Get current user ID, if authenticated
                const userId: number | null = this.authService.getCurrentUserId();
                if (userId === null) {
                  // If no user is logged in, stop loading here
                  this.isLoading = false;
                  return;
                }

                // Load registrations for the current user
                this.eventsService.getRegistrationsByUser(userId)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (regs: Registration[]): void => {
                      // Build a set of event IDs for which the user is registered
                      this.registeredEventIds = new Set<number>(
                        regs.map((r: Registration) => r.eventId)
                      );
                      this.isLoading = false;
                    },
                    error: (): void => {
                      this.isLoading = false;
                      this.notificationService.showError('Could not load your registrations.');
                    }
                  });
              },
              error: (): void => {
                this.isLoading = false;
                this.notificationService.showError('Could not load registrations.');
              }
            });
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.showError('Could not load events.');
        }
      });
  }

  // Navigate to the event detail page when a card is clicked
  async onClickDetail(eventId: number): Promise<void> {
    await this.router.navigate(['/events', eventId]);
  }

  // Called when the user clicks "Register" on an event card
  onRegister(eventId: number): void {
    const userId: number | null = this.authService.getCurrentUserId();

    // Require user to be logged in before registering
    if (userId === null) {
      this.notificationService.showError('You must be logged in to register.');
      return;
    }

    // Prevent double registration for the same event
    if (this.registeredEventIds.has(eventId)) {
      this.notificationService.showError('You are already registered for this event.');
      return;
    }

    // Build the DTO for the registration API call
    const dto: CreateRegistrationDto = { userId, eventId };

    this.eventsService.registerToEvent(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update local counters after successful registration
          const currentCount: number = this.registrationsCountByEventId[eventId] ?? 0;
          this.registrationsCountByEventId[eventId] = currentCount - 1;
          this.registeredEventIds.add(eventId);
          this.notificationService.showSuccess('You have been registered to the event.');
        },
        error: () => {
          this.notificationService.showError('Could not register to event.');
        }
      });
  }

  // Returns the remaining seats (or computed number) for a given event
  getRemainingSeats(event: Event): number {
    return this.registrationsCountByEventId[event.id] ?? 0;
  }

  // Returns true if the current user is registered to the given event
  isEventRegistered(event: Event): boolean {
    return this.registeredEventIds.has(event.id);
  }
}
