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
  isAuthenticated!: Observable<boolean>;
  userRole!: Observable<UserRole | null>;
  userEmail!: Observable<string | null>;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated$;
    this.userRole = this.authService.userRole$;
    this.userEmail = this.authService.userEmail$;
  }

  onLogout(): void {
    this.authService.logout();
    void this.router.navigate(['/auth/login']);
  }
}
