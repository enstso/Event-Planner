import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { LoginDto, RegisterDto, AuthStorage } from '../../dto/auth.dto';
import { User, UserRole } from '../../models/user.model';

const AUTH_KEY = 'auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Store the currently authenticated user's ID.
  private readonly currentUserId$ = new BehaviorSubject<number | null>(null);

  // Store the user's role (ADMIN or USER).
  private readonly currentUserRole$ = new BehaviorSubject<UserRole | null>(null);

  // Store the user's email (for header display).
  private readonly currentUserEmail$ = new BehaviorSubject<string | null>(null);

  constructor(private readonly api: ApiService) {
    // On service initialization, try to load persisted authentication data.
    const saved: string | null = localStorage.getItem(AUTH_KEY);

    // If authentication data exists, restore user state.
    if (saved !== null) {
      const parsed: AuthStorage = JSON.parse(saved) as AuthStorage;
      this.currentUserId$.next(parsed.userId);
      this.currentUserRole$.next(parsed.role);
      this.currentUserEmail$.next(parsed.email);
    }
  }

  // Observable that emits true/false depending on authentication status.
  get isAuthenticated$(): Observable<boolean> {
    return this.currentUserId$.asObservable().pipe(
      map((id: number | null) => id !== null)
    );
  }

  // Observable for user role (ADMIN or USER).
  get userRole$(): Observable<UserRole | null> {
    return this.currentUserRole$.asObservable();
  }

  // Observable for the email of the logged-in user.
  get userEmail$(): Observable<string | null> {
    return this.currentUserEmail$.asObservable();
  }

  // Login logic using JSON Server.
  // Since JSON Server cannot do real authentication, we manually check the credentials.
  login(dto: LoginDto): Observable<User | null> {
    return this.api
      // Search for a user matching the provided email + password.
      .get<User[]>(`users?email=${dto.email}&password=${dto.password}`)
      .pipe(
        map((users: User[]) => {
          // If exactly one matching user is found, authentication succeeds.
          if (users.length === 1) {
            const user: User = users[0];

            // Create an object to persist authentication data (fake token included).
            const authStorage: AuthStorage = {
              userId: user.id,
              email: user.email,
              role: user.role,
              token: `fake-token-${user.id}` // Mock token for interceptor.
            };

            // Save authentication data in localStorage.
            localStorage.setItem(AUTH_KEY, JSON.stringify(authStorage));

            // Update BehaviorSubjects.
            this.currentUserId$.next(user.id);
            this.currentUserRole$.next(user.role);
            this.currentUserEmail$.next(user.email);

            return user;
          }

          // If no match, login fails.
          return null;
        })
      );
  }

  // Register a new user.
  // JSON Server automatically assigns the ID.
  register(dto: RegisterDto): Observable<User> {
    // Prepare a user object without ID (JSON Server will manage it).
    const user: Omit<User, 'id'> = {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: 'USER' // All new accounts are regular users.
    };

    return this.api.post<User, Omit<User, 'id'>>('users', user);
  }

  // Logs the user out by clearing storage and resetting subjects.
  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    this.currentUserId$.next(null);
    this.currentUserRole$.next(null);
    this.currentUserEmail$.next(null);
  }

  // Get current user ID (synchronous).
  getCurrentUserId(): number | null {
    return this.currentUserId$.value;
  }

  // Get current user role (synchronous).
  getCurrentUserRole(): UserRole | null {
    return this.currentUserRole$.value;
  }

  // Retrieve the complete auth storage object directly from localStorage.
  getAuthStorage(): AuthStorage | null {
    const saved: string | null = localStorage.getItem(AUTH_KEY);
    if (saved === null) {
      return null;
    }
    return JSON.parse(saved) as AuthStorage;
  }
}
