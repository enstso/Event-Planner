import {Component, OnInit} from '@angular/core';
import {EventsService} from '../../../core/services/events/events.service';
import {Event} from '../../../core/models/event.model';
import {AuthService} from '../../../core/services/auth/auth.service';
import {CreateRegistrationDto} from '../../../core/dto/registration.dto';
import {EventCardComponent} from '../../../shared/components/event-card/event-card.component';
import {NgForOf, NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {forkJoin} from 'rxjs';
import {Registration} from '../../../core/models/registration.model';
import {UserRole} from '../../../core/models/user.model';

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
export class EventListComponent implements OnInit {
  events: Event[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  userRole: UserRole | null = null;
  private registrationsCountByEventId: Record<number, number> = {};
  private registeredEventIds: Set<number> = new Set<number>();

  constructor(
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.fetchEvents();
    this.userRole = this.authService.getCurrentUserRole();
  }

  fetchEvents(): void {
    this.isLoading = true;
    this.eventsService.getAllEvents().subscribe({
      next: (events: Event[]) => {
        this.events = events;

        if (events.length === 0) {
          this.isLoading = false;
          return;
        }

        const observables = events.map((event: Event) =>
          this.eventsService.getRegistrationsByEvent(event.id)
        );

        forkJoin(observables).subscribe({
          next: (results: Registration[][]): void => {
            this.registrationsCountByEventId = {};
            results.forEach((regs: Registration[], index: number) => {
              const eventId: number = this.events[index].id;
              this.registrationsCountByEventId[eventId] = regs.length;
            });

            const userId: number | null = this.authService.getCurrentUserId();
            if (userId === null) {
              this.isLoading = false;
              return;
            }

            this.eventsService.getRegistrationsByUser(userId).subscribe({
              next: (regs: Registration[]): void => {
                this.registeredEventIds = new Set<number>(
                  regs.map((r: Registration) => r.eventId)
                );
                this.isLoading = false;
              },
              error: (): void => {
                this.isLoading = false;
                this.showError('Could not load your registrations.');
              }
            });
          },
          error: (): void => {
            this.isLoading = false;
            this.showError('Could not load registrations.');
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.showError('Could not load events.');
      }
    });
  }


  async onClickDetail(eventId: number): Promise<void> {
   await this.router.navigate(['/events', eventId]);
  }

  onRegister(eventId: number): void {
    const userId: number | null = this.authService.getCurrentUserId();
    if (userId === null) {
      this.showError('You must be logged in to register.');
      return;
    }

    if (this.registeredEventIds.has(eventId)) {
      this.showError('You are already registered for this event.');
      return;
    }

    const dto: CreateRegistrationDto = {userId, eventId};
    this.eventsService.registerToEvent(dto).subscribe({
      next: () => {
        const currentCount: number = this.registrationsCountByEventId[eventId] ?? 0;
        this.registrationsCountByEventId[eventId] = currentCount + 1;
        this.registeredEventIds.add(eventId);
        this.errorMessage = null;
      },
      error: () => {
        this.showError('Could not register to event.');
      }
    });
  }

  getRemainingSeats(event: Event): number {
    const registered: number = this.registrationsCountByEventId[event.id] ?? 0;
    return Math.max(event.capacity - registered, 0);
  }

  isEventRegistered(event: Event): boolean {
    return this.registeredEventIds.has(event.id);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 2000);
  }
}
