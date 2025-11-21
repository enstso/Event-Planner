import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { EventsService } from '../../../core/services/events/events.service';
import { CreateEventDto, UpdateEventDto } from '../../../core/dto/event.dto';
import { AuthService } from '../../../core/services/auth/auth.service';
import { eventDateRangeValidator } from '../validators/event-date-range.validator';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Event } from '../../../core/models/event.model';
import { NotificationService} from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-event-form',
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './event-form.component.html'
})
export class EventFormComponent implements OnInit {
  // Reactive form instance used to handle event creation and editing
  readonly eventForm: FormGroup;

  // Indicates whether the component is in "edit" mode or "create" mode
  isEditMode = false;

  // Holds the event ID when editing an existing event
  private eventId: number | null = null;

  constructor(
    // FormBuilder used to construct the reactive form
    private readonly fb: FormBuilder,
    // Service handling all event-related API operations
    private readonly eventsService: EventsService,
    // Service handling authentication and user identity
    private readonly authService: AuthService,
    // Gives access to route parameters (to detect edit mode)
    private readonly route: ActivatedRoute,
    // Router used to navigate after creating or updating an event
    private readonly router: Router,
    // Custom service for success/error notifications
    private readonly notificationService: NotificationService
  ) {
    // Initialize the reactive form structure and validators
    this.eventForm = this.fb.group(
      {
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required, Validators.maxLength(500)]],
        location: ['', [Validators.required]],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        capacity: [10, [Validators.required, Validators.min(1)]]
      },
      {
        // Custom validator ensuring valid date ranges
        validators: eventDateRangeValidator
      }
    );
  }

  ngOnInit(): void {
    // Attempt to read the :id parameter from the route
    const idParam: string | null = this.route.snapshot.paramMap.get('id');

    // If the parameter exists, we are in "edit" mode
    if (idParam !== null) {
      this.isEditMode = true;
      this.eventId = Number(idParam);

      // Fetch the existing event from the API to pre-fill the form
      this.eventsService.getEventById(this.eventId).subscribe({
        next: (event: Event) => {
          // Populate the form with the event data
          this.eventForm.patchValue({
            title: event.title,
            description: event.description,
            location: event.location,
            // Convert ISO dates to datetime-local format by slicing
            startDate: event.startDate.slice(0, 16),
            endDate: event.endDate.slice(0, 16),
            capacity: event.capacity
          });
        },
        error: () => {
          // Notify user on error and redirect to events list
          this.notificationService.showError('Could not load event.');
          void this.router.navigate(['/events']);
        }
      });
    }
  }

  onSubmit(): void {
    // If the form is invalid, show an error and mark fields as touched
    if (this.eventForm.invalid) {
      this.notificationService.showError('Please fill in all required fields.');
      this.eventForm.markAllAsTouched();
      return;
    }

    // Retrieve the ID of the logged-in user (organizer)
    const organizerId: number | null = this.authService.getCurrentUserId();
    if (organizerId === null) {
      this.notificationService.showError('You must be logged in to manage events.');
      void this.router.navigate(['/auth/login']);
      return;
    }

    // Extract raw form values
    const formValue = this.eventForm.value;

    // Convert form values into a DTO, converting dates into ISO format
    const dtoBase: CreateEventDto = {
      title: formValue.title,
      description: formValue.description,
      location: formValue.location,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: new Date(formValue.endDate).toISOString(),
      capacity: formValue.capacity
    };

    // If editing an existing event, call update API
    if (this.isEditMode && this.eventId !== null) {
      const updateDto: UpdateEventDto = dtoBase;

      this.eventsService.updateEvent(this.eventId, updateDto).subscribe({
        next: () => {
          this.notificationService.showSuccess('Event updated.');
          void this.router.navigate(['/events', this.eventId]);
        },
        error: () => {
          this.notificationService.showError('Could not update event.');
        }
      });
      return;
    }

    // Otherwise create a new event
    this.eventsService.createEvent(dtoBase, organizerId).subscribe({
      next: (event: Event) => {
        this.notificationService.showSuccess('Event created.');
        void this.router.navigate(['/events', event.id]);
      },
      error: () => {
        this.notificationService.showError('Could not create event.');
      }
    });
  }
}
