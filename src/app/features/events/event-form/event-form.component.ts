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
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { NgIf } from '@angular/common';
import { Event } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-form',
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './event-form.component.html'
})
export class EventFormComponent implements OnInit {
  readonly eventForm: FormGroup;
  isEditMode = false;
  private eventId: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
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
        validators: eventDateRangeValidator
      }
    );
  }

  ngOnInit(): void {
    const idParam: string | null = this.route.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.isEditMode = true;
      this.eventId = Number(idParam);

      this.eventsService.getEventById(this.eventId).subscribe((event: Event) => {
        this.eventForm.patchValue({
          title: event.title,
          description: event.description,
          location: event.location,
          startDate: event.startDate.slice(0, 16), // for datetime-local
          endDate: event.endDate.slice(0, 16),
          capacity: event.capacity
        });
      });
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const organizerId: number | null = this.authService.getCurrentUserId();
    if (organizerId === null) {
      return;
    }

    const formValue = this.eventForm.value;

    // convert back to ISO string
    const dtoBase: CreateEventDto = {
      title: formValue.title,
      description: formValue.description,
      location: formValue.location,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: new Date(formValue.endDate).toISOString(),
      capacity: formValue.capacity
    };

    if (this.isEditMode && this.eventId !== null) {
      const updateDto: UpdateEventDto = dtoBase;
      this.eventsService.updateEvent(this.eventId, updateDto).subscribe(() => {
        void this.router.navigate(['/events', this.eventId]);
      });
      return;
    }

    this.eventsService.createEvent(dtoBase, organizerId).subscribe((event: Event) => {
      void this.router.navigate(['/events', event.id]);
    });
  }
}
