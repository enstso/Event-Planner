import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventDetailComponent } from './event-detail.component';
import { EventsService } from '../../../core/services/events/events.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Event } from '../../../core/models/event.model';
import { UserRole } from '../../../core/models/user.model';

describe('EventDetailComponent', () => {
  let component: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;

  let eventsServiceMock: jasmine.SpyObj<EventsService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let router: Router;

  const mockEvent: Event = {
    id: 1,
    title: 'Test Event',
    description: 'Some description',
    location: 'Paris',
    startDate: '2099-01-01T10:00:00.000Z',
    endDate: '2099-01-01T12:00:00.000Z',
    capacity: 100,
    organizerId: 123
  };

  function setupTest(idParam: string | null): void {
    TestBed.resetTestingModule();

    eventsServiceMock = jasmine.createSpyObj('EventsService', [
      'getEventById',
      'getRemainingSeatsForEvent',
      'deleteEvent'
    ]);

    authServiceMock = jasmine.createSpyObj('AuthService', [
      'getCurrentUserId',
      'getCurrentUserRole'
    ]);

    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
      'showSuccess'
    ]);

    TestBed.configureTestingModule({
      imports: [
        EventDetailComponent,
        RouterTestingModule  // ✅ gives a proper Router for RouterLink
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
                idParam ? { id: idParam } : {}
              )
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  it('should create', () => {
    setupTest('1');
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.getRemainingSeatsForEvent.and.returnValue(of(10));
    authServiceMock.getCurrentUserId.and.returnValue(null);
    authServiceMock.getCurrentUserRole.and.returnValue(null);

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should set errorMessage when route id is invalid', () => {
    setupTest('abc'); // NaN
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Invalid event id.');
    expect(eventsServiceMock.getEventById).not.toHaveBeenCalled();
  });

  it('should load event and remaining seats on init', () => {
    setupTest('1');
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.getRemainingSeatsForEvent.and.returnValue(of(5));
    authServiceMock.getCurrentUserId.and.returnValue(null);
    authServiceMock.getCurrentUserRole.and.returnValue(null);

    fixture.detectChanges();

    expect(eventsServiceMock.getEventById).toHaveBeenCalledWith(1);
    expect(eventsServiceMock.getRemainingSeatsForEvent).toHaveBeenCalledWith(mockEvent);
    expect(component.event).toEqual(mockEvent);
    expect(component.remainingSeats).toBe(5);
    expect(component.isLoading).toBeFalse();
  });

  it('should set remainingSeats to null and show error if loading remaining seats fails', () => {
    setupTest('1');
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.getRemainingSeatsForEvent.and.returnValue(
      throwError(() => new Error('fail'))
    );
    authServiceMock.getCurrentUserId.and.returnValue(null);
    authServiceMock.getCurrentUserRole.and.returnValue(null);

    fixture.detectChanges();

    expect(component.remainingSeats).toBeNull();
    expect(notificationServiceMock.showError)
      .toHaveBeenCalledWith('Could not load remaining seats.');
  });

  it('should set canManage to true for organizer', () => {
    setupTest('1');
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.getRemainingSeatsForEvent.and.returnValue(of(10));
    authServiceMock.getCurrentUserId.and.returnValue(123);  // same as organizerId
    authServiceMock.getCurrentUserRole.and.returnValue('USER' as UserRole);

    fixture.detectChanges();

    expect(component.canManage).toBeTrue();
  });

  it('should set canManage to true for ADMIN', () => {
    setupTest('1');
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.getRemainingSeatsForEvent.and.returnValue(of(10));
    authServiceMock.getCurrentUserId.and.returnValue(999);
    authServiceMock.getCurrentUserRole.and.returnValue('ADMIN' as UserRole);

    fixture.detectChanges();

    expect(component.canManage).toBeTrue();
  });

  it('onEdit should navigate to edit page when event is loaded', () => {
    setupTest('1');
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.getRemainingSeatsForEvent.and.returnValue(of(10));
    authServiceMock.getCurrentUserId.and.returnValue(null);
    authServiceMock.getCurrentUserRole.and.returnValue(null);

    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    fixture.detectChanges(); // loads event

    component.onEdit();

    expect(navigateSpy).toHaveBeenCalledWith(['/events', mockEvent.id, 'edit']);
  });

  it('onEdit should do nothing when event is null', () => {
    setupTest('1');
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    // do NOT call fixture.detectChanges, so event stays null
    component.onEdit();

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('onDelete should delete event, show success and navigate on success', () => {
    setupTest('1');
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.getRemainingSeatsForEvent.and.returnValue(of(10));
    eventsServiceMock.deleteEvent.and.returnValue(of({}));
    authServiceMock.getCurrentUserId.and.returnValue(123);
    authServiceMock.getCurrentUserRole.and.returnValue('ADMIN' as UserRole);

    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    fixture.detectChanges(); // sets event

    component.onDelete();

    expect(eventsServiceMock.deleteEvent).toHaveBeenCalledWith(mockEvent.id);
    expect(notificationServiceMock.showSuccess)
      .toHaveBeenCalledWith('Event deleted.');
    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
  });

  it('onDelete should show error if delete fails', () => {
    setupTest('1');
    eventsServiceMock.getEventById.and.returnValue(of(mockEvent));
    eventsServiceMock.getRemainingSeatsForEvent.and.returnValue(of(10));
    eventsServiceMock.deleteEvent.and.returnValue(throwError(() => new Error('fail')));
    authServiceMock.getCurrentUserId.and.returnValue(123);
    authServiceMock.getCurrentUserRole.and.returnValue('ADMIN' as UserRole);

    fixture.detectChanges();

    component.onDelete();

    expect(notificationServiceMock.showError)
      .toHaveBeenCalledWith('Could not delete event.');
  });
});
