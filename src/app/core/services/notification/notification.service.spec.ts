import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {
  NotificationService,
  Notification,
  NotificationType
} from './notification.service';
import {take} from 'rxjs/operators';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose notification$ as an observable', (done) => {
    service.notification$.pipe(take(1)).subscribe(value => {
      // Initial value is null because no notification is shown yet
      expect(value).toBeNull();
      done();
    });
  });

  it('showError should emit an error notification', () => {
    let latest: Notification | null = null;

    service.notification$.subscribe(n => (latest = n));

    const message = 'Something went wrong';
    service.showError(message);

    // @ts-ignore
    expect(latest).toEqual<Notification>({
      message,
      type: 'error'
    });
  });

  it('showSuccess should emit a success notification', () => {
    let latest: Notification | null = null;

    service.notification$.subscribe(n => (latest = n));

    const message = 'Operation successful';
    service.showSuccess(message);

    // @ts-ignore
    expect(latest).toEqual<Notification>({
      message,
      type: 'success'
    });
  });

  it('clear should remove the current notification', () => {
    let latest: Notification | null = null;

    service.notification$.subscribe(n => (latest = n));

    service.showSuccess('Will be cleared');
    expect(latest).not.toBeNull();

    service.clear();
    expect(latest).toBeNull();
  });

  it('should auto-hide after AUTO_HIDE_MS', fakeAsync(() => {
    let latest: Notification | null = null;
    service.notification$.subscribe(n => (latest = n));

    service.showError('Auto hide test');

    // Immediately after calling show, the notification must be present
    expect(latest).not.toBeNull();

    // Move forward almost to the auto-hide delay (3000 ms)
    tick(2999);
    expect(latest).not.toBeNull(); // still visible

    // Move forward 1 ms → timeout should trigger
    tick(1);
    expect(latest).toBeNull();
  }));

  it('should NOT clear a new notification when the first timeout triggers', fakeAsync(() => {
    let latest: Notification | null = null;
    service.notification$.subscribe((n: Notification | null) => {
      latest = n
    });

    // First notification
    service.showError('First');

    // @ts-ignore
    expect(latest?.message).toBe('First');
    // @ts-ignore
    expect(latest?.type).toBe<NotificationType>('error');

    // After 1 second, show a new notification
    tick(1000);
    service.showSuccess('Second');

    // @ts-ignore
    expect(latest?.message).toBe('Second');
    // @ts-ignore
    expect(latest?.type).toBe<NotificationType>('success');

    // When the timeout for the first notification triggers (3000 ms total),
    // the second one MUST NOT be cleared.
    tick(2000);
    expect(latest).not.toBeNull();

    // @ts-ignore
    expect(latest?.message).toBe('Second');

    // After another AUTO_HIDE_MS for the second notification, it should clear
    tick(1000);
    expect(latest).toBeNull();
  }));
});
