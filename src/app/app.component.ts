import {Component, OnInit} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';
import { AsyncPipe, NgIf } from '@angular/common';
import {Observable} from 'rxjs';
import {UserRole} from './core/models/user.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'event-planner';


  protected isAuthenticated: Observable<boolean> | undefined;
  protected userRole: Observable<UserRole | null> | undefined;
  protected userEmail: Observable<string | null> | undefined;

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
