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

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const allowedRoles: UserRole[] | undefined = route.data['roles'] as UserRole[] | undefined;

    return this.authService.userRole$.pipe(
      map((role: UserRole | null) => {
        if (!role || (allowedRoles && !allowedRoles.includes(role))) {
          void this.router.navigate(['/events']);
          return false;
        }
        return true;
      })
    );
  }
}
