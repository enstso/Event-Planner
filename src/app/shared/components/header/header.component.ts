import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  // Observable emitting true/false depending on whether a user is logged in
  isAuthenticated!: Observable<boolean>;

  // Observable emitting the current user role ('ADMIN' | 'USER' | null)
  userRole!: Observable<UserRole | null>;

  // Observable emitting the currently logged-in user's email
  userEmail!: Observable<string | null>;

  constructor(
    // AuthService gives access to authentication state and stored user info
    private readonly authService: AuthService,

    // Router is used to redirect the user on logout
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication status from the auth service
    this.isAuthenticated = this.authService.isAuthenticated$;

    // Subscribe to the current user’s role
    this.userRole = this.authService.userRole$;

    // Subscribe to the current user’s email
    this.userEmail = this.authService.userEmail$;
  }

  // Logs out the user and redirects them to the login page
  onLogout(): void {
    this.authService.logout();
    void this.router.navigate(['/auth/login']);
  }
}
