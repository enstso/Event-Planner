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
  events: Event[] = [];
  isLoading = false;
  userRole: UserRole | null = null;

  private registrationsCountByEventId: Record<number, number> = {};
  private registeredEventIds: Set<number> = new Set<number>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
    this.userRole = this.authService.getCurrentUserRole();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchEvents(): void {
    this.isLoading = true;

    this.eventsService.getAllEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events: Event[]) => {
          this.events = events;

          this.eventsService.getRemainingSeatsByEvent(events)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (counts: Record<number, number>): void => {
                this.registrationsCountByEventId = counts;

                const userId: number | null = this.authService.getCurrentUserId();
                if (userId === null) {
                  this.isLoading = false;
                  return;
                }

                this.eventsService.getRegistrationsByUser(userId)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (regs: Registration[]): void => {
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


  async onClickDetail(eventId: number): Promise<void> {
   await this.router.navigate(['/events', eventId]);
  }

  onRegister(eventId: number): void {
    const userId: number | null = this.authService.getCurrentUserId();
    if (userId === null) {
      this.notificationService.showError('You must be logged in to register.');
      return;
    }

    if (this.registeredEventIds.has(eventId)) {
      this.notificationService.showError('You are already registered for this event.');
      return;
    }

    const dto: CreateRegistrationDto = { userId, eventId };
    this.eventsService.registerToEvent(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
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

  getRemainingSeats(event: Event): number {
    return this.registrationsCountByEventId[event.id] ?? 0;
  }

  isEventRegistered(event: Event): boolean {
    return this.registeredEventIds.has(event.id);
  }
}
