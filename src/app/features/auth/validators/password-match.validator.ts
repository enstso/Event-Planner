import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(
  passwordField: string,
  confirmPasswordField: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password: string | null = control.get(passwordField)?.value ?? null;
    const confirmPassword: string | null = control.get(confirmPasswordField)?.value ?? null;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  };
}
