import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRegistrationsComponent } from './my-registrations.component';
import { EventsService } from '../../../core/services/events/events.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { of, throwError } from 'rxjs';
import { Registration } from '../../../core/models/registration.model';
import { Event } from '../../../core/models/event.model';
import { DatePipe, registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localeFr from '@angular/common/locales/fr';

// ✅ Register French locale ONCE for all tests in this file
beforeAll(() => {
  registerLocaleData(localeFr, 'fr-FR');
});

describe('MyRegistrationsComponent', () => {
  let component: MyRegistrationsComponent;
  let fixture: ComponentFixture<MyRegistrationsComponent>;

  let eventsServiceSpy: jasmine.SpyObj<EventsService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockRegistrations: Registration[] = [
    { id: 1, userId: 42, eventId: 10, createdAt: '2025-01-01T10:00:00.000Z' },
    { id: 2, userId: 42, eventId: 20, createdAt: '2025-01-02T10:00:00.000Z' }
  ];

  const mockEvents: Event[] = [
    {
      id: 10,
      title: 'Event 10',
      description: 'Desc 10',
      location: 'Paris',
      startDate: '2025-03-01T10:00:00.000Z',
      endDate: '2025-03-01T12:00:00.000Z',
      capacity: 50,
      organizerId: 100
    },
    {
      id: 20,
      title: 'Event 20',
      description: 'Desc 20',
      location: 'Lyon',
      startDate: '2025-04-01T10:00:00.000Z',
      endDate: '2025-04-01T12:00:00.000Z',
      capacity: 30,
      organizerId: 200
    }
  ];

  beforeEach(async () => {
    eventsServiceSpy = jasmine.createSpyObj<EventsService>(
      'EventsService',
      ['getRegistrationsByUser', 'getEventById', 'deleteRegistration']
    );

    authServiceSpy = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['getCurrentUserId']
    );

    notificationServiceSpy = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['showError', 'showSuccess']
    );

    await TestBed.configureTestingModule({
      imports: [MyRegistrationsComponent], // standalone component
      providers: [
        { provide: EventsService, useValue: eventsServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        DatePipe,
        { provide: LOCALE_ID, useValue: 'fr-FR' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRegistrationsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    authServiceSpy.getCurrentUserId.and.returnValue(null);
    fixture.detectChanges(); // triggers ngOnInit
    expect(component).toBeTruthy();
  });

  it('should set errorMessage when user is not logged in', () => {
    authServiceSpy.getCurrentUserId.and.returnValue(null);

    fixture.detectChanges(); // ngOnInit

    expect(component.errorMessage)
      .toBe('You must be logged in to view your registrations.');
    expect(component.isLoading).toBeFalse();
    expect(eventsServiceSpy.getRegistrationsByUser).not.toHaveBeenCalled();
  });

  it('should load empty list when user has no registrations', () => {
    authServiceSpy.getCurrentUserId.and.returnValue(42);
    eventsServiceSpy.getRegistrationsByUser.and.returnValue(of([]));

    fixture.detectChanges();

    expect(eventsServiceSpy.getRegistrationsByUser).toHaveBeenCalledWith(42);
    expect(component.registrationsWithEvents.length).toBe(0);
    expect(component.isLoading).toBeFalse();
    expect(notificationServiceSpy.showError).not.toHaveBeenCalled();
  });

  it('should load registrations with their events', () => {
    authServiceSpy.getCurrentUserId.and.returnValue(42);
    eventsServiceSpy.getRegistrationsByUser.and.returnValue(of(mockRegistrations));

    // getEventById should return corresponding mock event
    eventsServiceSpy.getEventById.and.callFake((id: number) => {
      const event = mockEvents.find(e => e.id === id);
      return of(event as Event);
    });

    fixture.detectChanges();

    expect(eventsServiceSpy.getRegistrationsByUser).toHaveBeenCalledWith(42);
    expect(eventsServiceSpy.getEventById).toHaveBeenCalledTimes(2);
    expect(component.registrationsWithEvents.length).toBe(2);

    expect(component.registrationsWithEvents[0].registration.id).toBe(1);
    expect(component.registrationsWithEvents[0].event.id).toBe(10);

    expect(component.registrationsWithEvents[1].registration.id).toBe(2);
    expect(component.registrationsWithEvents[1].event.id).toBe(20);

    expect(component.isLoading).toBeFalse();
  });

  it('should show error notification when loading registrations fails', () => {
    authServiceSpy.getCurrentUserId.and.returnValue(42);
    eventsServiceSpy.getRegistrationsByUser.and.returnValue(
      throwError(() => new Error('load error'))
    );

    fixture.detectChanges();

    expect(notificationServiceSpy.showError)
      .toHaveBeenCalledWith('Could not load registrations.');
    expect(component.isLoading).toBeFalse();
  });

  it('should cancel registration and update list on success', () => {
    // Start with some data
    component.registrationsWithEvents = [
      { registration: mockRegistrations[0], event: mockEvents[0] },
      { registration: mockRegistrations[1], event: mockEvents[1] }
    ];

    eventsServiceSpy.deleteRegistration.and.returnValue(of({}));

    component.onCancelRegistration(1);

    expect(eventsServiceSpy.deleteRegistration).toHaveBeenCalledWith(1);
    expect(component.registrationsWithEvents.length).toBe(1);
    expect(component.registrationsWithEvents[0].registration.id).toBe(2);
    expect(notificationServiceSpy.showSuccess)
      .toHaveBeenCalledWith('Registration cancelled.');
  });

  it('should show error when cancel registration fails', () => {
    component.registrationsWithEvents = [
      { registration: mockRegistrations[0], event: mockEvents[0] }
    ];

    eventsServiceSpy.deleteRegistration.and.returnValue(
      throwError(() => new Error('delete error'))
    );

    component.onCancelRegistration(1);

    expect(notificationServiceSpy.showError)
      .toHaveBeenCalledWith('Could not cancel registration.');
    // item should still be present
    expect(component.registrationsWithEvents.length).toBe(1);
  });
});
