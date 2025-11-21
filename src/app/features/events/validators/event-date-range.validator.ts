import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Custom validator used on the event creation/edit form
// It ensures that the start date is not in the past and that
// the end date is after the start date.
export const eventDateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  // Extract values from the form group's controls
  const start: string | null = control.get('startDate')?.value ?? null;
  const end: string | null = control.get('endDate')?.value ?? null;

  // If either field is empty, do not validate yet
  // (the required validator handles missing values)
  if (start === null || end === null) {
    return null;
  }

  // Convert raw form values into Date objects
  const startDate: Date = new Date(start);
  const endDate: Date = new Date(end);

  // Rule 1: End date must be strictly after start date
  if (endDate <= startDate) {
    return { invalidDateRange: true };
  }

  // Rule 2: Start date must not be in the past
  if (startDate < new Date()) {
    return { startInPast: true };
  }

  // If both validations pass → no error
  return null;
};
