import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Factory function that creates a custom validator checking whether two fields match.
// The names of the form controls to compare are passed as parameters.
export function passwordMatchValidator(
  passwordField: string,
  confirmPasswordField: string
): ValidatorFn {
  // Returns the actual validator function executed by Angular on the form group
  return (control: AbstractControl): ValidationErrors | null => {
    // Retrieve the values of both controls (password and confirmPassword)
    const password: string | null = control.get(passwordField)?.value ?? null;
    const confirmPassword: string | null = control.get(confirmPasswordField)?.value ?? null;

    // If values do not match, return a validation error object
    // This error key can be used in the template to display an error message
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    // If the values match, the validator returns null (meaning “no errors”)
    return null;
  };
}
