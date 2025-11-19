import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { EventsService } from '../../../core/services/events/events.service';
import { Event } from '../../../core/models/event.model';
import { EventStatusPipe } from '../../../shared/pipes/event-status.pipe';
import { DatePipe, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { Registration } from '../../../core/models/registration.model';

@Component({
  selector: 'app-event-detail',
  imports: [EventStatusPipe, DatePipe, NgIf, RouterLink],
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  canManage = false;
  remainingSeats: number | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
    private readonly router: Router
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

  private loadRemainingSeats(event: Event): void {
    this.eventsService.getRegistrationsByEvent(event.id).subscribe({
      next: (registrations: Registration[]): void => {
        const registered: number = registrations.length;
        this.remainingSeats = Math.max(event.capacity - registered, 0);
      },
      error: (): void => {
        this.remainingSeats = null;
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

    this.eventsService.deleteEvent(this.event.id).subscribe({
      next: () => {
        void this.router.navigate(['/events']);
      },
      error: () => {
        this.errorMessage = 'Could not delete event.';
      }
    });
  }
}
