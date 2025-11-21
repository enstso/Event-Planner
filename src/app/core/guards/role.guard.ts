import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  // This guard verifies whether the user has the required role
  // before allowing access to certain routes (e.g., Admin routes).
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    // Get the list of allowed roles from route metadata.
    // Example in route: data: { roles: ['ADMIN'] }
    const allowedRoles: UserRole[] | undefined =
      route.data['roles'] as UserRole[] | undefined;

    return this.authService.userRole$.pipe(
      map((role: UserRole | null) => {
        // If the user has no role (not logged in) OR
        // their role is not included in the allowed roles list,
        // redirect them to the events list and deny access.
        if (!role || (allowedRoles && !allowedRoles.includes(role))) {
          void this.router.navigate(['/events']);
          return false;
        }

        // Otherwise, user has the correct role → route access granted.
        return true;
      })
    );
  }
}
