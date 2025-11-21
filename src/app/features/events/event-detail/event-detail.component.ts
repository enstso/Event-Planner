import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {EventsService} from '../../../core/services/events/events.service';
import {Event} from '../../../core/models/event.model';
import {EventStatusPipe} from '../../../shared/pipes/event-status.pipe';
import {DatePipe, NgIf} from '@angular/common';
import {AuthService} from '../../../core/services/auth/auth.service';
import {UserRole} from '../../../core/models/user.model';
import {NotificationService} from '../../../core/services/notification/notification.service';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-event-detail',
  imports: [EventStatusPipe, DatePipe, NgIf, RouterLink],
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit, OnDestroy {
  // Holds the currently loaded event
  event: Event | null = null;

  // UI state flags
  isLoading = false;
  errorMessage: string | null = null;
  canManage = false; // true if the user can edit/delete the event
  remainingSeats: number | null = null;

  // Used to automatically unsubscribe from streams on component destroy
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Retrieve the "id" parameter from the route
    const idParam: string | null = this.route.snapshot.paramMap.get('id');
    const id: number = idParam ? Number(idParam) : NaN;

    // Validate the ID format
    if (Number.isNaN(id)) {
      this.errorMessage = 'Invalid event id.';
      return;
    }

    // Load event from API
    this.isLoading = true;
    this.eventsService.getEventById(id).subscribe({
      next: (event: Event) => {
        this.event = event;
        this.isLoading = false;

        // Determine if current user can manage this event
        this.updateCanManage();

        // Load remaining seats for this event
        this.loadRemainingSeats(event);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Event not found.';
      }
    });
  }

  ngOnDestroy(): void {
    // Emit completion and close the subject to cancel all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRemainingSeats(event: Event): void {
    // Load remaining seats for the given event
    this.eventsService.getRemainingSeatsForEvent(event)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (remaining: number): void => {
          this.remainingSeats = remaining;
        },
        error: (): void => {
          // Null means unknown/failed state
          this.remainingSeats = null;
          this.notificationService.showError('Could not load remaining seats.');
        }
      });
  }

  private updateCanManage(): void {
    // If event is not loaded, user can't manage anything
    if (this.event === null) {
      this.canManage = false;
      return;
    }

    // Get the current user identity
    const currentUserId: number | null = this.authService.getCurrentUserId();
    const role: UserRole | null = this.authService.getCurrentUserRole();

    // Admins or event organizers can manage the event
    this.canManage =
      role === 'ADMIN' ||
      (currentUserId !== null && this.event.organizerId === currentUserId);
  }

  onEdit(): void {
    // Navigate to edit page only if the event is loaded
    if (!this.event) {
      return;
    }
    void this.router.navigate(['/events', this.event.id, 'edit']);
  }

  onDelete(): void {
    // Safety guard
    if (!this.event) {
      return;
    }

    // Delete event from backend
    this.eventsService.deleteEvent(this.event.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Show success, then navigate back to events list
          this.notificationService.showSuccess('Event deleted.');
          void this.router.navigate(['/events']);
        },
        error: () => {
          // Notify error
          this.notificationService.showError('Could not delete event.');
        }
      });
  }
}
