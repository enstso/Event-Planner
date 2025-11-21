import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginDto } from '../../../core/dto/auth.dto';
import { User } from '../../../core/models/user.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Reactive form instance for email + password
  readonly loginForm: FormGroup;

  // Holds an optional error message to display in the UI
  errorMessage: string | null = null;

  // Tracks whether the form is submitting (disables button + changes text)
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    // Initialize the reactive form with validation rules
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],   // valid email required
      password: ['', [Validators.required]]                  // password required
    });
  }

  // Called when the user submits the login form
  onSubmit(): void {
    // If the form contains invalid fields, mark all controls as touched
    // so errors display in the UI, and stop submission.
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Start submission state (spinner/disabled button)
    this.isSubmitting = true;
    this.errorMessage = null;

    // Extract form values and cast them to LoginDto
    const dto: LoginDto = this.loginForm.value as LoginDto;

    // Trigger login request through AuthService
    this.authService.login(dto).subscribe({
      next: (user: User | null) => {
        this.isSubmitting = false;

        // If no user returned, credentials were invalid
        if (!user) {
          this.errorMessage = 'Invalid credentials.';
          return;
        }

        // Successful login → redirect to events page
        void this.router.navigate(['/events']);
      },
      error: () => {
        // Handle unexpected errors (server issue, network, etc.)
        this.isSubmitting = false;
        this.errorMessage = 'An error occurred during login.';
      }
    });
  }
}
