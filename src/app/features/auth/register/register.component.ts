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
  readonly registerForm: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: passwordMatchValidator('password', 'confirmPassword')
      }
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const dto: RegisterDto = this.registerForm.value as RegisterDto;

    this.authService.register(dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        void this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'An error occurred during registration.';
      }
    });
  }
}
