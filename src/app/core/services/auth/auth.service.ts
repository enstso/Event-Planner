import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { LoginDto, RegisterDto, AuthStorage } from '../../dto/auth.dto';
import { User, UserRole } from '../../models/user.model';

const AUTH_KEY = 'auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserId$ = new BehaviorSubject<number | null>(null);
  private readonly currentUserRole$ = new BehaviorSubject<UserRole | null>(null);
  private readonly currentUserEmail$ = new BehaviorSubject<string | null>(null);

  constructor(private readonly api: ApiService) {
    const saved: string | null = localStorage.getItem(AUTH_KEY);
    if (saved !== null) {
      const parsed: AuthStorage = JSON.parse(saved) as AuthStorage;
      this.currentUserId$.next(parsed.userId);
      this.currentUserRole$.next(parsed.role);
      this.currentUserEmail$.next(parsed.email);
    }
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.currentUserId$.asObservable().pipe(
      map((id: number | null) => id !== null)
    );
  }

  get userRole$(): Observable<UserRole | null> {
    return this.currentUserRole$.asObservable();
  }

  get userEmail$(): Observable<string | null> {
    return this.currentUserEmail$.asObservable();
  }

  login(dto: LoginDto): Observable<User | null> {
    return this.api
      .get<User[]>(`users?email=${dto.email}&password=${dto.password}`)
      .pipe(
        map((users: User[]) => {
          if (users.length === 1) {
            const user: User = users[0];

            const authStorage: AuthStorage = {
              userId: user.id,
              email: user.email,
              role: user.role,
              token: `fake-token-${user.id}`
            };

            localStorage.setItem(AUTH_KEY, JSON.stringify(authStorage));

            this.currentUserId$.next(user.id);
            this.currentUserRole$.next(user.role);
            this.currentUserEmail$.next(user.email);

            return user;
          }
          return null;
        })
      );
  }

  register(dto: RegisterDto): Observable<User> {
    const user: Omit<User, 'id'> = {
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: 'USER'
    };
    return this.api.post<User, Omit<User, 'id'>>('users', user);
  }

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    this.currentUserId$.next(null);
    this.currentUserRole$.next(null);
    this.currentUserEmail$.next(null);
  }

  getCurrentUserId(): number | null {
    return this.currentUserId$.value;
  }

  getCurrentUserRole(): UserRole | null {
    return this.currentUserRole$.value;
  }

  getAuthStorage(): AuthStorage | null {
    const saved: string | null = localStorage.getItem(AUTH_KEY);
    if (saved === null) {
      return null;
    }
    return JSON.parse(saved) as AuthStorage;
  }
}
