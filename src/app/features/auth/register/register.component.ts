import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { RegisterDto } from '../../../core/dto/auth.dto';
import { passwordMatchValidator } from '../validators/password-match.validator';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  // Reactive form instance that holds all registration fields
  readonly registerForm: FormGroup;

  // Error message shown when registration fails
  errorMessage: string | null = null;

  // Used to disable the submit button while the request is being processed
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    // Initialize the registration form with validation rules
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],             // Must be a valid email
        firstName: ['', [Validators.required, Validators.minLength(2)]],  // At least 2 characters
        lastName: ['', [Validators.required, Validators.minLength(2)]],   // At least 2 characters
        password: ['', [Validators.required, Validators.minLength(6)]],   // Minimum password length
        confirmPassword: ['', [Validators.required]]                      // Must match password
      },
      {
        // Custom cross-field validator that checks password === confirmPassword
        validators: passwordMatchValidator('password', 'confirmPassword')
      }
    );
  }

  // Called when the user submits the form
  onSubmit(): void {
    // Prevent submission if the form is invalid (show validation errors)
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Start loading state
    this.isSubmitting = true;
    this.errorMessage = null;

    // Extract the form data and cast to DTO type
    const dto: RegisterDto = this.registerForm.value as RegisterDto;

    // Call the AuthService to create the user
    this.authService.register(dto).subscribe({
      next: () => {
        // Stop loading state and redirect to login page
        this.isSubmitting = false;
        void this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Stop loading and show generic error message
        this.isSubmitting = false;
        this.errorMessage = 'An error occurred during registration.';
      }
    });
  }
}
