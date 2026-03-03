import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minArrayLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (Array.isArray(value) && value.length >= minLength) {
      return null;
    }
    return {
      minArrayLength: {
        requiredLength: minLength,
        actualLength: value ? value.length : 0,
      },
    };
  };
}

export function validatePhoneNumber(
  control: AbstractControl,
): { [key: string]: any } | null {
  const phoneNumber = control.value;
  const regex = /^\d{3}(-\d{3})?\d{3}$/; // Allows both formats with and without dashes

  if (!phoneNumber || !regex.test(phoneNumber)) {
    return { unmaskedPattern: true }; // Custom error key for phone number format
  }

  return null;
}

export function unmaskedPatternValidator(pattern: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value || !pattern) {
      return null;
    }

    // Strip non-numeric characters from the pattern
    const strippedPattern = pattern.replace(/\D/g, '');
    // Remove all non-digit characters from the value
    const unmaskedValue = control.value.replace(/\D/g, '');

    // Check if the length of the unmasked value matches the stripped pattern length
    const isValid = unmaskedValue.length === strippedPattern.length;

    return isValid ? null : { unmaskedPattern: true };
  };
}
