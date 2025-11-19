import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const eventDateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const start: string | null = control.get('startDate')?.value ?? null;
  const end: string | null = control.get('endDate')?.value ?? null;

  if (start === null || end === null) {
    return null;
  }

  const startDate: Date = new Date(start);
  const endDate: Date = new Date(end);

  if (endDate <= startDate) {
    return { invalidDateRange: true };
  }

  if (startDate < new Date()) {
    return { startInPast: true };
  }

  return null;
};
