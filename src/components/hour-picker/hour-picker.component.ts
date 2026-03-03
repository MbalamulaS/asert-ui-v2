import { Component, Input, forwardRef, OnInit } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hour-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
    <ng-container *ngIf="form; else standalone">
      <mat-form-field appearance="outline" class="w-full" [formGroup]="form">
        <mat-label>{{ label }}</mat-label>
        <mat-select
          [id]="name"
          [formControlName]="name"
          [required]="required"
          (selectionChange)="onSelectionChange($event)"
        >
          <mat-option *ngFor="let hour of hours" [value]="hour.value">
            {{ hour.display }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
          {{ label }} is
          {{ form.get(name)?.errors?.['required'] ? 'required' : 'invalid' }}
        </mat-error>
      </mat-form-field>
    </ng-container>
    <ng-template #standalone>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ label }}</mat-label>
        <mat-select
          [id]="name"
          [(ngModel)]="value"
          [required]="required"
          (selectionChange)="onSelectionChange($event)"
        >
          <mat-option *ngFor="let hour of hours" [value]="hour.value">
            {{ hour.display }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="required && !value">This field is required</mat-error>
      </mat-form-field>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HourPickerComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class HourPickerComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = 'Hour';
  @Input() name: string = '';
  @Input() form: FormGroup | undefined;
  @Input() required: boolean = false;
  @Input() use24Hour: boolean = false;
  @Input() hourInterval: number = 1; // Default 1-hour intervals

  value: string | null = null;
  hours: { value: string; display: string }[] = [];

  ngOnInit() {
    this.generateHourOptions();
  }

  generateHourOptions() {
    this.hours = [];
    const totalHours = 24;

    for (let i = 0; i < totalHours; i += this.hourInterval) {
      if (this.use24Hour) {
        // 24-hour format: 00, 01, 02, ..., 23
        const hourStr = i.toString().padStart(2, '0');
        this.hours.push({
          value: hourStr,
          display: `${hourStr}:00`,
        });
      } else {
        // 12-hour format with AM/PM: 12 AM, 1 AM, ..., 11 PM
        const period = i < 12 ? 'AM' : 'PM';
        const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
        this.hours.push({
          value: i.toString().padStart(2, '0'),
          display: `${hour12} ${period}`,
        });
      }
    }
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onSelectionChange(event: any): void {
    const selectedValue = event.value;
    this.onChange(selectedValue);
    this.onTouched();
  }
}
