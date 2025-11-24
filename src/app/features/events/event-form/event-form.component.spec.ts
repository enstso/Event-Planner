import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventFormComponent } from './event-form.component';
import { EventsService } from '../../../core/services/events/events.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Event } from '../../../core/models/event.model';

describe('EventFormComponent', () => {
  let component: EventFormComponent;
  let fixture: ComponentFixture<EventFormComponent>;

  let eventsServiceMock: jasmine.SpyObj<EventsService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockEvent: Event = {
    id: 1,
    title: 'Test event',
    description: 'Desc',
    location: 'Paris',
    startDate: '2024-05-01T10:00:00.000Z',
    endDate: '2024-05-01T12:00:00.000Z',
    capacity: 50,
    organizerId: 123
  };

  function setupTest(paramId: string | null = null): void {
    TestBed.resetTestingModule();

    eventsServiceMock = jasmine.createSpyObj('EventsService', [
      'getEventById',
      'createEvent',
      'updateEvent'
    ]);
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'getCurrentUserId'
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
      'showSuccess'
    ]);

    TestBed.configureTestingModule({
      imports: [
        EventFormComponent,
        RouterTestingModule // ✅ gives a proper Router for RouterLink
      ],
      providers: [
        { provide: EventsService, useValue: eventsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(
                paramId ? { id: paramId } : {}
              )
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventFormComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    setupTest();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show error and mark form as touched when form is invalid on submit', () => {
    setupTest();
    fixture.detectChanges();

    // Make the form invalid by not filling anything
    component.onSubmit();

    expect(notificationServiceMock.showError)
      .toHaveBeenCalledWith('Please fill in all required fields.');
    expect(component.eventForm.touched).toBeTrue();
  });

  it('should show error and redirect to login if user is not logged in', () => {
    setupTest();
    authServiceMock.getCurrentUserId.and.returnValue(null);

    fixture.detectChanges();

    // Fill form with valid-looking data
    component.eventForm.patchValue({
      title: 'Title',
      description: 'Desc',
      location: 'Paris',
      startDate: '2030-01-01T10:00',
      endDate: '2030-01-01T12:00',
      capacity: 10
    });

    component.onSubmit();

    expect(notificationServiceMock.showError)
      .toHaveBeenCalledWith('You must be logged in to manage events.');
  });

  it('should create a new event when not in edit mode', () => {
    setupTest();
    authServiceMock.getCurrentUserId.and.returnValue(123);
    eventsServiceMock.createEvent.and.returnValue(of(mockEvent));

    fixture.detectChanges();

    component.eventForm.patchValue({
      title: 'Title',
      description: 'Desc',
      location: 'Paris',
      startDate: '2030-01-01T10:00',
      endDate: '2030-01-01T12:00',
      capacity: 10
    });

    component.onSubmit();

    expect(eventsServiceMock.createEvent).toHaveBeenCalled();
    expect(notificationServiceMock.showSuccess)
      .toHaveBeenCalledWith('Event created.');
  });

  it('should show error if event creation fails', () => {
    setupTest();
    authServiceMock.getCurrentUserId.and.returnValue(123);
    eventsServiceMock.createEvent.and.returnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();

    component.eventForm.patchValue({
      title: 'Title',
      description: 'Desc',
      location: 'Paris',
      startDate: '2030-01-01T10:00',
      endDate: '2030-01-01T12:00',
      capacity: 10
    });

    component.onSubmit();

    expect(notificationServiceMock.showError)
      .toHaveBeenCalledWith('Could not create event.');
  });

  it('should load event in edit mode and patch form', () => {
    setupTest('1'); // id=1 → edit mode
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));

    fixture.detectChanges();

    expect(component.isEditMode).toBeTrue();
    expect(eventsServiceMock.getEventById).toHaveBeenCalledWith(1);
    expect(component.eventForm.value.title).toEqual(mockEvent.title);
  });

  it('should show error and navigate to /events if loading event fails', () => {
    setupTest('1');
    eventsServiceMock.getEventById.and.returnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();

    expect(notificationServiceMock.showError)
      .toHaveBeenCalledWith('Could not load event.');
  });

  it('should update event in edit mode', () => {
    setupTest('1');
    authServiceMock.getCurrentUserId.and.returnValue(123);
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.updateEvent.and.returnValue(of(mockEvent));

    fixture.detectChanges();

    component.eventForm.patchValue({
      title: 'Updated Title',
      description: 'Updated desc',
      location: 'Lyon',
      startDate: '2030-01-01T10:00',
      endDate: '2030-01-01T12:00',
      capacity: 20
    });

    component.onSubmit();

    expect(eventsServiceMock.updateEvent).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(notificationServiceMock.showSuccess)
      .toHaveBeenCalledWith('Event updated.');
  });

  it('should show error if update fails in edit mode', () => {
    setupTest('1');
    authServiceMock.getCurrentUserId.and.returnValue(123);
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.updateEvent.and.returnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();

    component.eventForm.patchValue({
      title: 'Updated Title',
      description: 'Updated desc',
      location: 'Lyon',
      startDate: '2030-01-01T10:00',
      endDate: '2030-01-01T12:00',
      capacity: 20
    });

    component.onSubmit();

    expect(notificationServiceMock.showError)
      .toHaveBeenCalledWith('Could not update event.');
  });
});
