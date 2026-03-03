import { FormGroup, ValidationErrors, ValidatorFn,AbstractControl, UntypedFormGroup } from '@angular/forms';

export function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  const valid = pattern.test(value);

  return valid ? null : { weakPassword: true };
}

export const passwordMatchValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const passwordConfirm = group.get('passwordConfirm')?.value;
  return password === passwordConfirm ? null : { passwordsMismatch: true };
};

export function confirmedMatchValidator(
  controlName: string,
  matchingControlName: string
): ValidatorFn {
  return (formGroup: FormGroup): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);
    if (control?.value !== matchingControl?.value) {
      matchingControl?.setErrors({ confirmedMismatch: true });
      return { confirmedMismatch: true };
    } else {
      matchingControl?.setErrors(null);
      return null;
    }
  };
}

