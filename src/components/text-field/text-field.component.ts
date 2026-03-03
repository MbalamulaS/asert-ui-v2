import {
  Component,
  forwardRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
    <ng-container *ngIf="form; else standalone">
      <mat-form-field appearance="outline" class="w-full" [formGroup]="form">
        <mat-label *ngIf="showLabel">
          {{ label }}
          <span *ngIf="required" class="text-red-500">*</span>
        </mat-label>
        <input
          matInput
          autocomplete="off"
          [id]="name"
          [formControlName]="name"
          (input)="onInputChange($event)"
          [type]="type"
          [placeholder]="placeholder || label"
        />
        <button
          *ngIf="icon"
          mat-icon-button
          matSuffix
          type="button"
          [attr.aria-label]="iconAriaLabel"
          (click)="onIconClick()"
        >
          <mat-icon>{{ icon }}</mat-icon>
        </button>
        <mat-error
          *ngIf="
            form.get(name)?.invalid &&
            form.get(name)?.touched &&
            form.get(name)?.errors?.required
          "
        >
          {{ error || label + ' is required' }}
        </mat-error>
        <mat-error
          *ngIf="
            form.get(name)?.invalid &&
            form.get(name)?.touched &&
            form.get(name)?.errors?.weakPassword
          "
        >
          {{
            'Password must be stronger. Try using a mix of letters, numbers, and symbols'
          }}
        </mat-error>
        <mat-error
          *ngIf="
            form.get(name)?.invalid &&
            form.get(name)?.touched &&
            form.get(name)?.errors?.email
          "
        >
          {{ 'Invalid email address' }}
        </mat-error>
        <mat-error
          *ngIf="
            form.get(name)?.invalid &&
            form.get(name)?.touched &&
            form.get(name)?.errors?.confirmedMismatch
          "
        >
          {{ label + ' mismatch' }}
        </mat-error>
      </mat-form-field>
    </ng-container>
    <ng-template #standalone>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label *ngIf="showLabel">
          {{ label }}
          <span *ngIf="required" class="text-red-500">*</span>
        </mat-label>
        <input
          matInput
          autocomplete="off"
          [id]="name"
          [placeholder]="placeholder || label"
          [(ngModel)]="value"
          (input)="onInputChange($event)"
          [type]="type"
          [required]="required"
        />
        <button
          *ngIf="icon"
          mat-icon-button
          matSuffix
          type="button"
          [attr.aria-label]="iconAriaLabel"
          (click)="onIconClick()"
        >
          <mat-icon>{{ icon }}</mat-icon>
        </button>
        <mat-error *ngIf="error">
          {{ error }}
        </mat-error>
      </mat-form-field>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() form: FormGroup | undefined;
  @Input() type: string = 'text';
  @Input() disabled: boolean = false;
  @Input() icon: string = '';
  @Input() iconAriaLabel: string = '';
  @Input() error: string = '';
  @Input() showLabel: boolean = true;
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Output() iconClick = new EventEmitter<void>();

  value: any;
  onChange = (_: any) => {};
  onTouched = () => {};

  get isRequired(): boolean {
    if (!this.form || !this.name) return this.required;
    const control = this.form.get(this.name);
    if (!control) return this.required;

    // Check if the control has a required validator
    const validator = control.validator?.(control);
    return (validator && validator['required']) || this.required;
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    // When used with reactive forms, disable/enable the form control
    if (this.form && this.name) {
      const control = this.form.get(this.name);
      if (control) {
        if (isDisabled) {
          control.disable();
        } else {
          control.enable();
        }
      }
    }
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.value = inputElement.value;
    this.onChange(this.value);
    this.onTouched();
  }

  onIconClick(): void {
    this.iconClick.emit();
  }
}
