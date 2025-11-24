// auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from '../api.service';
import { LoginDto, RegisterDto, AuthStorage } from '../../dto/auth.dto';
import { User, UserRole } from '../../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const AUTH_KEY = 'auth';

  const mockUser: User = {
    id: 1,
    email: 'john.doe@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'ADMIN'
  };

  beforeEach(() => {
    // Clean localStorage before each test
    localStorage.clear();

    apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization with localStorage', () => {
    it('should restore user state from localStorage if auth data exists', () => {
      const storedAuth: AuthStorage = {
        userId: 42,
        email: 'restored@example.com',
        role: 'USER',
        token: 'fake-token-42'
      };

      // Set localStorage before creating a new instance
      localStorage.setItem(AUTH_KEY, JSON.stringify(storedAuth));

      // Recreate service to trigger constructor logic again
      const newService: AuthService = new AuthService(apiServiceSpy);

      expect(newService.getCurrentUserId()).toBe(42);
      expect(newService.getCurrentUserRole()).toBe('USER');

      newService.userEmail$.subscribe(email => {
        expect(email).toBe('restored@example.com');
      });
    });

    it('should start unauthenticated if no auth data in localStorage', (done) => {
      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBeFalse();
        done();
      });
    });
  });

  describe('login', () => {
    it('should authenticate and store user when credentials are valid', (done) => {
      const dto: LoginDto = {
        email: mockUser.email,
        password: mockUser.password
      };

      apiServiceSpy.get.and.returnValue(of([mockUser]));

      service.login(dto).subscribe(user => {
        expect(user).toEqual(mockUser);

        // Subjects should be updated
        expect(service.getCurrentUserId()).toBe(mockUser.id);
        expect(service.getCurrentUserRole()).toBe(mockUser.role);

        service.userEmail$.subscribe(email => {
          expect(email).toBe(mockUser.email);
        });

        // localStorage should be set
        const saved: string | null = localStorage.getItem(AUTH_KEY);
        expect(saved).not.toBeNull();

        const parsed: AuthStorage = JSON.parse(saved as string) as AuthStorage;
        expect(parsed.userId).toBe(mockUser.id);
        expect(parsed.email).toBe(mockUser.email);
        expect(parsed.role).toBe(mockUser.role);
        expect(parsed.token).toBe(`fake-token-${mockUser.id}`);

        done();
      });
    });

    it('should return null and not set state when credentials are invalid', (done) => {
      const dto: LoginDto = {
        email: 'wrong@example.com',
        password: 'wrong'
      };

      apiServiceSpy.get.and.returnValue(of([])); // no matching user

      service.login(dto).subscribe(user => {
        expect(user).toBeNull();

        // No auth state should be set
        expect(service.getCurrentUserId()).toBeNull();
        expect(service.getCurrentUserRole()).toBeNull();

        const saved: string | null = localStorage.getItem(AUTH_KEY);
        expect(saved).toBeNull();

        done();
      });
    });
  });

  describe('register', () => {
    it('should call ApiService.post with correct payload', (done) => {
      const dto: RegisterDto = {
        email: 'new.user@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
        firstName: 'New',
        lastName: 'User'
      };

      const createdUser: User = {
        id: 10,
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'USER'
      };

      apiServiceSpy.post.and.returnValue(of(createdUser));

      service.register(dto).subscribe(user => {
        expect(apiServiceSpy.post).toHaveBeenCalledWith('users', {
          email: dto.email,
          password: dto.password,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'USER'
        });
        expect(user).toEqual(createdUser);
        done();
      });
    });
  });

  describe('logout', () => {
    it('should clear auth state and localStorage', () => {
      // Simulate logged-in user
      const storedAuth: AuthStorage = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        token: `fake-token-${mockUser.id}`
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(storedAuth));

      service.logout();

      expect(service.getCurrentUserId()).toBeNull();
      expect(service.getCurrentUserRole()).toBeNull();

      service.userEmail$.subscribe(email => {
        expect(email).toBeNull();
      });

      const saved: string | null = localStorage.getItem(AUTH_KEY);
      expect(saved).toBeNull();
    });
  });

  describe('getters', () => {
    it('getCurrentUserId should return current user id', () => {
      (service as any).currentUserId$.next(5);
      expect(service.getCurrentUserId()).toBe(5);
    });

    it('getCurrentUserRole should return current user role', () => {
      (service as any).currentUserRole$.next('ADMIN' as UserRole);
      expect(service.getCurrentUserRole()).toBe('ADMIN');
    });

    it('getAuthStorage should return parsed object when present', () => {
      const storedAuth: AuthStorage = {
        userId: 99,
        email: 'stored@example.com',
        role: 'USER',
        token: 'fake-token-99'
      };

      localStorage.setItem(AUTH_KEY, JSON.stringify(storedAuth));

      const result: AuthStorage | null = service.getAuthStorage();
      expect(result).toEqual(storedAuth);
    });

    it('getAuthStorage should return null when nothing in localStorage', () => {
      localStorage.removeItem(AUTH_KEY);
      const result: AuthStorage | null = service.getAuthStorage();
      expect(result).toBeNull();
    });

    it('isAuthenticated$ should emit true when user id is set', (done) => {
      (service as any).currentUserId$.next(1);
      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBeTrue();
        done();
      });
    });

    it('userRole$ should emit the current role', (done) => {
      const role: UserRole = 'ADMIN';
      (service as any).currentUserRole$.next(role);

      service.userRole$.subscribe(r => {
        expect(r).toBe(role);
        done();
      });
    });

    it('userEmail$ should emit the current email', (done) => {
      const email = 'test@example.com';
      (service as any).currentUserEmail$.next(email);

      service.userEmail$.subscribe(e => {
        expect(e).toBe(email);
        done();
      });
    });
  });
});
