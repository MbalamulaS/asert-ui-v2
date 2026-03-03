import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';

interface RatingOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [
    CommonModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  template: `
    <div *ngIf="form && name" [formGroup]="form">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <mat-radio-group
        [formControlName]="name"
        class="flex items-center space-x-2"
        role="radiogroup"
        [attr.aria-label]="label + ' rating options'"
      >
        <mat-radio-button
          *ngFor="let option of options; let i = index"
          [id]="id ? id + '-' + i : name + '-' + i"
          [value]="option.value"
          color="primary"
        >
          {{ option.value }}
        </mat-radio-button>
      </mat-radio-group>
      <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
        {{ label || 'This field' }} is required
      </mat-error>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class RatingComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() id: string = '';
  @Input() form: FormGroup | undefined;
  @Input() required: boolean = false;
  @Input() options: RatingOption[] = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
  ];

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}
}
