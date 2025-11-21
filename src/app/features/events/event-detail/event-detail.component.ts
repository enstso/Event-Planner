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
  event: Event | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  canManage = false;
  remainingSeats: number | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const idParam: string | null = this.route.snapshot.paramMap.get('id');
    const id: number = idParam ? Number(idParam) : NaN;

    if (Number.isNaN(id)) {
      this.errorMessage = 'Invalid event id.';
      return;
    }

    this.isLoading = true;
    this.eventsService.getEventById(id).subscribe({
      next: (event: Event) => {
        this.event = event;
        this.isLoading = false;
        this.updateCanManage();
        this.loadRemainingSeats(event);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Event not found.';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRemainingSeats(event: Event): void {
    this.eventsService.getRemainingSeatsForEvent(event)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (remaining: number): void => {
          this.remainingSeats = remaining;
        },
        error: (): void => {
          this.remainingSeats = null;
          this.notificationService.showError('Could not load remaining seats.');
        }
      });
  }

  private updateCanManage(): void {
    if (this.event === null) {
      this.canManage = false;
      return;
    }

    const currentUserId: number | null = this.authService.getCurrentUserId();
    const role: UserRole | null = this.authService.getCurrentUserRole();

    this.canManage =
      role === 'ADMIN' ||
      (currentUserId !== null && this.event.organizerId === currentUserId);
  }

  onEdit(): void {
    if (!this.event) {
      return;
    }
    void this.router.navigate(['/events', this.event.id, 'edit']);
  }

  onDelete(): void {
    if (!this.event) {
      return;
    }

    this.eventsService.deleteEvent(this.event.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Event deleted.');
          void this.router.navigate(['/events']);
        },
        error: () => {
          this.notificationService.showError('Could not delete event.');
        }
      });
  }
}
