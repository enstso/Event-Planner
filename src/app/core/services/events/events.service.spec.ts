import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EventsService } from './events.service';
import { ApiService } from '../api.service';
import { Event } from '../../models/event.model';
import { Registration } from '../../models/registration.model';
import { CreateEventDto } from '../../dto/event.dto';
import { CreateRegistrationDto } from '../../dto/registration.dto';

describe('EventsService', () => {
  let service: EventsService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockEvents: Event[] = [
    {
      id: 1,
      title: 'Event 1',
      description: 'Description 1',
      location: 'Paris',
      startDate: '2025-01-01T10:00:00.000Z',
      endDate: '2025-01-01T12:00:00.000Z',
      capacity: 10,
      organizerId: 1
    },
    {
      id: 2,
      title: 'Event 2',
      description: 'Description 2',
      location: 'Lyon',
      startDate: '2025-02-01T10:00:00.000Z',
      endDate: '2025-02-01T12:00:00.000Z',
      capacity: 5,
      organizerId: 2
    }
  ];

  const mockRegistrationsEvent1: Registration[] = [
    {
      id: 1,
      userId: 1,
      eventId: 1,
      createdAt: '2025-01-01T09:00:00.000Z'
    },
    {
      id: 2,
      userId: 2,
      eventId: 1,
      createdAt: '2025-01-01T09:05:00.000Z'
    }
  ];

  const mockRegistrationsEvent2: Registration[] = [
    {
      id: 3,
      userId: 3,
      eventId: 2,
      createdAt: '2025-02-01T09:00:00.000Z'
    }
  ];

  beforeEach(() => {
    apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', [
      'get',
      'post',
      'put',
      'delete'
    ]);

    TestBed.configureTestingModule({
      providers: [
        EventsService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(EventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Basic CRUD methods
  // ---------------------------------------------------------------------------

  it('getAllEvents should call ApiService.get with "events" and return events', (done) => {
    apiServiceSpy.get.and.returnValue(of(mockEvents));

    service.getAllEvents().subscribe(events => {
      expect(apiServiceSpy.get).toHaveBeenCalledWith('events');
      expect(events).toEqual(mockEvents);
      done();
    });
  });

  it('getEventById should call ApiService.get with correct URL', (done) => {
    const eventId = 1;
    apiServiceSpy.get.and.returnValue(of(mockEvents[0]));

    service.getEventById(eventId).subscribe(event => {
      expect(apiServiceSpy.get).toHaveBeenCalledWith(`events/${eventId}`);
      expect(event).toEqual(mockEvents[0]);
      done();
    });
  });

  it('createEvent should call ApiService.post with dto + organizerId', (done) => {
    const organizerId = 99;
    const dto: CreateEventDto = {
      title: 'New Event',
      description: 'Some description',
      location: 'Marseille',
      startDate: '2025-03-01T10:00:00.000Z',
      endDate: '2025-03-01T12:00:00.000Z',
      capacity: 20
    };

    const createdEvent: Event = {
      id: 123,
      ...dto,
      organizerId
    };

    apiServiceSpy.post.and.returnValue(of(createdEvent));

    service.createEvent(dto, organizerId).subscribe(event => {
      expect(apiServiceSpy.post).toHaveBeenCalledWith('events', {
        ...dto,
        organizerId
      });
      expect(event).toEqual(createdEvent);
      done();
    });
  });

  it('updateEvent should call ApiService.put with correct URL and body', (done) => {
    const id = 1;
    const updateDto = {
      title: 'Updated title'
    };

    const updatedEvent: Event = {
      ...mockEvents[0],
      ...updateDto
    };

    apiServiceSpy.put.and.returnValue(of(updatedEvent));

    service.updateEvent(id, updateDto).subscribe(event => {
      expect(apiServiceSpy.put).toHaveBeenCalledWith(`events/${id}`, updateDto);
      expect(event).toEqual(updatedEvent);
      done();
    });
  });

  it('deleteEvent should call ApiService.delete with correct URL', (done) => {
    const id = 2;
    apiServiceSpy.delete.and.returnValue(of({}));

    service.deleteEvent(id).subscribe(result => {
      expect(apiServiceSpy.delete).toHaveBeenCalledWith(`events/${id}`);
      expect(result).toEqual({});
      done();
    });
  });

  // ---------------------------------------------------------------------------
  // Registrations methods
  // ---------------------------------------------------------------------------

  it('registerToEvent should call ApiService.post with registration body including createdAt', (done) => {
    const dto: CreateRegistrationDto = {
      userId: 10,
      eventId: 20
    };

    const returnedRegistration: Registration = {
      id: 1,
      userId: dto.userId,
      eventId: dto.eventId,
      createdAt: '2025-01-01T10:00:00.000Z'
    };

    apiServiceSpy.post.and.returnValue(of(returnedRegistration));

    service.registerToEvent(dto).subscribe(reg => {
      // Check the call side ApiService.post
      expect(apiServiceSpy.post).toHaveBeenCalled();

      const [path, body]:[any,any] = apiServiceSpy.post.calls.mostRecent().args;

      expect(path).toBe('registrations');
      expect(body.userId).toBe(dto.userId);
      expect(body.eventId).toBe(dto.eventId);
      expect(body.createdAt).toEqual(jasmine.any(String)); // ISO string

      expect(reg).toEqual(returnedRegistration);
      done();
    });
  });

  it('getRegistrationsByUser should call ApiService.get with userId filter', (done) => {
    const userId = 5;
    apiServiceSpy.get.and.returnValue(of(mockRegistrationsEvent1));

    service.getRegistrationsByUser(userId).subscribe(regs => {
      expect(apiServiceSpy.get).toHaveBeenCalledWith(`registrations?userId=${userId}`);
      expect(regs).toEqual(mockRegistrationsEvent1);
      done();
    });
  });

  it('deleteRegistration should call ApiService.delete with correct URL', (done) => {
    const registrationId = 10;
    apiServiceSpy.delete.and.returnValue(of({}));

    service.deleteRegistration(registrationId).subscribe(result => {
      expect(apiServiceSpy.delete).toHaveBeenCalledWith(`registrations/${registrationId}`);
      expect(result).toEqual({});
      done();
    });
  });

  it('getRegistrationsByEvent should call ApiService.get with eventId filter', (done) => {
    const eventId = 1;
    apiServiceSpy.get.and.returnValue(of(mockRegistrationsEvent1));

    service.getRegistrationsByEvent(eventId).subscribe(regs => {
      expect(apiServiceSpy.get).toHaveBeenCalledWith(`registrations?eventId=${eventId}`);
      expect(regs).toEqual(mockRegistrationsEvent1);
      done();
    });
  });

  // ---------------------------------------------------------------------------
  // Remaining seats (multiple events)
  // ---------------------------------------------------------------------------

  it('getRemainingSeatsByEvent should return empty object if events array is empty', (done) => {
    service.getRemainingSeatsByEvent([]).subscribe(counts => {
      expect(counts).toEqual({});
      // ApiService.get ne doit pas être appelé
      expect(apiServiceSpy.get).not.toHaveBeenCalled();
      done();
    });
  });

  it('getRemainingSeatsByEvent should compute remaining seats correctly', (done) => {
    // On mock getRegistrationsByEvent au niveau du service pour isoler.
    spyOn(service, 'getRegistrationsByEvent').and.callFake((eventId: number) => {
      if (eventId === 1) {
        return of(mockRegistrationsEvent1); // 2 regs, cap 10 -> 8 seats left
      }
      if (eventId === 2) {
        return of(mockRegistrationsEvent2); // 1 reg, cap 5 -> 4 seats left
      }
      return of([]);
    });

    service.getRemainingSeatsByEvent(mockEvents).subscribe(counts => {
      expect(counts[1]).toBe(8);
      expect(counts[2]).toBe(4);
      done();
    });
  });

  // ---------------------------------------------------------------------------
  // Remaining seats (single event)
  // ---------------------------------------------------------------------------

  it('getRemainingSeatsForEvent should compute remaining seats for a single event', (done) => {
    spyOn(service, 'getRegistrationsByEvent').and.returnValue(
      of(mockRegistrationsEvent1) // 2 registrations
    );

    const event: Event = mockEvents[0]; // capacity 10

    service.getRemainingSeatsForEvent(event).subscribe(remaining => {
      expect(service.getRegistrationsByEvent).toHaveBeenCalledWith(event.id);
      expect(remaining).toBe(8);
      done();
    });
  });

  it('getRemainingSeatsForEvent should never return a negative number', (done) => {
    const event: Event = {
      ...mockEvents[0],
      capacity: 1
    };

    // 2 registrations for capacity 1 -> should clamp to 0
    spyOn(service, 'getRegistrationsByEvent').and.returnValue(
      of(mockRegistrationsEvent1)
    );

    service.getRemainingSeatsForEvent(event).subscribe(remaining => {
      expect(remaining).toBe(0);
      done();
    });
  });
});
