import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginDto } from '../../../core/dto/auth.dto';
import { User } from '../../../core/models/user.model';
import {NgIf} from '@angular/common';

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
  readonly loginForm: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const dto: LoginDto = this.loginForm.value as LoginDto;

    this.authService.login(dto).subscribe({
      next: (user: User | null) => {
        this.isSubmitting = false;
        if (!user) {
          this.errorMessage = 'Invalid credentials.';
          return;
        }
        void this.router.navigate(['/events']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'An error occurred during login.';
      }
    });
  }
}
