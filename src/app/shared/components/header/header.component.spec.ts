import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserRole } from '../../../core/models/user.model';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  // Simple mock for AuthService
  const mockAuthService: Partial<AuthService> = {
    isAuthenticated$: of(true),
    userRole$: of<UserRole | null>('ADMIN'),
    userEmail$: of('admin@example.com'),
    logout: jasmine.createSpy('logout')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule // needed for RouterLink/RouterLinkActive + Router
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to auth observables on init', (done) => {
    component.isAuthenticated.subscribe(isAuth => {
      expect(isAuth).toBeTrue();
    });

    component.userRole.subscribe(role => {
      expect(role).toBe('ADMIN');
    });

    component.userEmail.subscribe(email => {
      expect(email).toBe('admin@example.com');
      done(); // complete when last expectation passes
    });
  });

  it('should logout and navigate to /auth/login on onLogout()', async () => {
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.onLogout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });
});
