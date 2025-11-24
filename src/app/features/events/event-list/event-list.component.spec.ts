import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventListComponent } from './event-list.component';
import { EventsService } from '../../../core/services/events/events.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Event } from '../../../core/models/event.model';
import { Registration } from '../../../core/models/registration.model';
import { UserRole } from '../../../core/models/user.model';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;

  let eventsServiceSpy: jasmine.SpyObj<EventsService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockEvents: Event[] = [
    {
      id: 1,
      title: 'Event 1',
      description: 'Desc 1',
      location: 'Paris',
      startDate: '2025-01-01T10:00:00.000Z',
      endDate: '2025-01-01T11:00:00.000Z',
      capacity: 10,
      organizerId: 100
    },
    {
      id: 2,
      title: 'Event 2',
      description: 'Desc 2',
      location: 'Lyon',
      startDate: '2025-02-01T10:00:00.000Z',
      endDate: '2025-02-01T11:00:00.000Z',
      capacity: 5,
      organizerId: 200
    }
  ];

  beforeEach(async () => {
    eventsServiceSpy = jasmine.createSpyObj<EventsService>(
      'EventsService',
      [
        'getAllEvents',
        'getRemainingSeatsByEvent',
        'getRegistrationsByUser',
        'registerToEvent'
      ]
    );

    authServiceSpy = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['getCurrentUserId', 'getCurrentUserRole']
    );

    notificationServiceSpy = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['showError', 'showSuccess']
    );

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EventListComponent], // standalone component
      providers: [
        { provide: EventsService, useValue: eventsServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Arrange
    eventsServiceSpy.getAllEvents.and.returnValue(of([]));
    eventsServiceSpy.getRemainingSeatsByEvent.and.returnValue(of({}));
    authServiceSpy.getCurrentUserRole.and.returnValue('USER' as UserRole);
    authServiceSpy.getCurrentUserId.and.returnValue(null);

    // Act
    fixture.detectChanges(); // triggers ngOnInit

    // Assert
    expect(component).toBeTruthy();
  });

  it('should load events and remaining seats when user is not logged in', () => {
    eventsServiceSpy.getAllEvents.and.returnValue(of(mockEvents));
    eventsServiceSpy.getRemainingSeatsByEvent.and.returnValue(of({ 1: 7, 2: 3 }));
    authServiceSpy.getCurrentUserId.and.returnValue(null);
    authServiceSpy.getCurrentUserRole.and.returnValue('USER' as UserRole);

    fixture.detectChanges();

    expect(eventsServiceSpy.getAllEvents).toHaveBeenCalled();
    expect(eventsServiceSpy.getRemainingSeatsByEvent).toHaveBeenCalledWith(mockEvents);
    expect(component.events.length).toBe(2);
    expect(component.getRemainingSeats(mockEvents[0])).toBe(7);
    expect(component.getRemainingSeats(mockEvents[1])).toBe(3);
    expect(component.isLoading).toBeFalse();
  });

  it('should load user registrations when user is logged in', () => {
    const registrations: Registration[] = [
      { id: 1, userId: 42, eventId: 1, createdAt: '2025-01-01T09:00:00.000Z' }
    ];

    eventsServiceSpy.getAllEvents.and.returnValue(of(mockEvents));
    eventsServiceSpy.getRemainingSeatsByEvent.and.returnValue(of({ 1: 7, 2: 3 }));
    authServiceSpy.getCurrentUserId.and.returnValue(42);
    authServiceSpy.getCurrentUserRole.and.returnValue('USER' as UserRole);
    eventsServiceSpy.getRegistrationsByUser.and.returnValue(of(registrations));

    fixture.detectChanges();

    expect(eventsServiceSpy.getRegistrationsByUser).toHaveBeenCalledWith(42);
    expect(component.isEventRegistered(mockEvents[0])).toBeTrue();
    expect(component.isEventRegistered(mockEvents[1])).toBeFalse();
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading events fails', () => {
    eventsServiceSpy.getAllEvents.and.returnValue(
      throwError(() => new Error('Events error'))
    );
    authServiceSpy.getCurrentUserId.and.returnValue(null);
    authServiceSpy.getCurrentUserRole.and.returnValue('USER' as UserRole);

    fixture.detectChanges();

    expect(notificationServiceSpy.showError)
      .toHaveBeenCalledWith('Could not load events.');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading remaining seats fails', () => {
    eventsServiceSpy.getAllEvents.and.returnValue(of(mockEvents));
    eventsServiceSpy.getRemainingSeatsByEvent.and.returnValue(
      throwError(() => new Error('Seats error'))
    );
    authServiceSpy.getCurrentUserId.and.returnValue(null);
    authServiceSpy.getCurrentUserRole.and.returnValue('USER' as UserRole);

    fixture.detectChanges();

    expect(notificationServiceSpy.showError)
      .toHaveBeenCalledWith('Could not load registrations.');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading user registrations fails', () => {
    eventsServiceSpy.getAllEvents.and.returnValue(of(mockEvents));
    eventsServiceSpy.getRemainingSeatsByEvent.and.returnValue(of({ 1: 7, 2: 3 }));
    authServiceSpy.getCurrentUserId.and.returnValue(42);
    authServiceSpy.getCurrentUserRole.and.returnValue('USER' as UserRole);
    eventsServiceSpy.getRegistrationsByUser.and.returnValue(
      throwError(() => new Error('Regs error'))
    );

    fixture.detectChanges();

    expect(notificationServiceSpy.showError)
      .toHaveBeenCalledWith('Could not load your registrations.');
    expect(component.isLoading).toBeFalse();
  });

  it('should navigate to event detail on onClickDetail', async () => {
    eventsServiceSpy.getAllEvents.and.returnValue(of([]));
    eventsServiceSpy.getRemainingSeatsByEvent.and.returnValue(of({}));
    authServiceSpy.getCurrentUserId.and.returnValue(null);
    authServiceSpy.getCurrentUserRole.and.returnValue('USER' as UserRole);

    fixture.detectChanges();

    await component.onClickDetail(1);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/events', 1]);
  });

  it('should show error if user is not logged in when registering', () => {
    authServiceSpy.getCurrentUserId.and.returnValue(null);

    component.onRegister(1);

    expect(notificationServiceSpy.showError)
      .toHaveBeenCalledWith('You must be logged in to register.');
    expect(eventsServiceSpy.registerToEvent).not.toHaveBeenCalled();
  });

  it('should prevent double registration', () => {
    authServiceSpy.getCurrentUserId.and.returnValue(42);

    // Simulate that the user is already registered for event 1
    (component as any).registeredEventIds = new Set<number>([1]);

    component.onRegister(1);

    expect(notificationServiceSpy.showError)
      .toHaveBeenCalledWith('You are already registered for this event.');
    expect(eventsServiceSpy.registerToEvent).not.toHaveBeenCalled();
  });

  it('should register to event successfully and update state', () => {
    authServiceSpy.getCurrentUserId.and.returnValue(42);

    // Remaining seats before registration
    (component as any).registrationsCountByEventId = { 1: 5 };
    (component as any).registeredEventIds = new Set<number>();

    eventsServiceSpy.registerToEvent.and.returnValue(of({
      id: 1,
      userId: 42,
      eventId: 1,
      createdAt: '2025-01-01T09:00:00.000Z'
    } as Registration));

    component.onRegister(1);

    expect(eventsServiceSpy.registerToEvent).toHaveBeenCalledWith({
      userId: 42,
      eventId: 1
    });
    expect(notificationServiceSpy.showSuccess)
      .toHaveBeenCalledWith('You have been registered to the event.');
    expect(component.getRemainingSeats({ id: 1 } as Event)).toBe(4);
    expect(component.isEventRegistered({ id: 1 } as Event)).toBeTrue();
  });

  it('should show error when registration API call fails', () => {
    authServiceSpy.getCurrentUserId.and.returnValue(42);
    (component as any).registrationsCountByEventId = { 1: 5 };
    (component as any).registeredEventIds = new Set<number>();

    eventsServiceSpy.registerToEvent.and.returnValue(
      throwError(() => new Error('Register error'))
    );

    component.onRegister(1);

    expect(notificationServiceSpy.showError)
      .toHaveBeenCalledWith('Could not register to event.');
  });

  it('getRemainingSeats should return 0 if event has no entry in the map', () => {
    (component as any).registrationsCountByEventId = {};
    const event: Event = { ...mockEvents[0], id: 999 };

    const seats = component.getRemainingSeats(event);

    expect(seats).toBe(0);
  });
});
