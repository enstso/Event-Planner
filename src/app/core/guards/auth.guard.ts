import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  // This guard runs before accessing protected routes.
  // It checks whether the user is authenticated.
  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      // Transform the authentication state into a boolean route permission.
      map((isAuthenticated: boolean) => {
        // If the user is NOT authenticated, redirect them to the login page.
        if (!isAuthenticated) {
          void this.router.navigate(['/auth/login']);
          return false; // Prevent navigation.
        }

        // If authenticated, allow access to the route.
        return true;
      })
    );
  }
}
