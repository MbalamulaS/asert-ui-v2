import { Component, Input, forwardRef, OnInit } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
    <div class="time-picker-container">
      <ng-container *ngIf="form; else standalone">
        <div class="time-picker-flex">
          <!-- Hour Select -->
          <mat-form-field
            appearance="outline"
            class="time-picker-field"
            [formGroup]="form"
          >
            <mat-label>{{ hourLabel }}</mat-label>
            <mat-select
              [id]="name + '_hour'"
              [formControlName]="name + '_hour'"
              [required]="required"
              (selectionChange)="onTimeChange()"
            >
              <mat-option *ngFor="let hour of hours" [value]="hour.value">
                {{ hour.display }}
              </mat-option>
            </mat-select>
            <mat-error
              *ngIf="
                form.get(name + '_hour')?.invalid &&
                form.get(name + '_hour')?.touched
              "
            >
              {{ hourLabel }} is required
            </mat-error>
          </mat-form-field>

          <!-- Minute Select -->
          <mat-form-field
            appearance="outline"
            class="time-picker-field"
            [formGroup]="form"
          >
            <mat-label>{{ minuteLabel }}</mat-label>
            <mat-select
              [id]="name + '_minute'"
              [formControlName]="name + '_minute'"
              [required]="required"
              (selectionChange)="onTimeChange()"
            >
              <mat-option *ngFor="let minute of minutes" [value]="minute.value">
                {{ minute.display }}
              </mat-option>
            </mat-select>
            <mat-error
              *ngIf="
                form.get(name + '_minute')?.invalid &&
                form.get(name + '_minute')?.touched
              "
            >
              {{ minuteLabel }} is required
            </mat-error>
          </mat-form-field>

          <!-- Period Select (AM/PM) for 12-hour format -->
          <mat-form-field
            *ngIf="!use24Hour"
            appearance="outline"
            class="time-picker-field"
            [formGroup]="form"
          >
            <mat-label>Period</mat-label>
            <mat-select
              [id]="name + '_period'"
              [formControlName]="name + '_period'"
              [required]="required"
              (selectionChange)="onTimeChange()"
            >
              <mat-option value="AM">AM</mat-option>
              <mat-option value="PM">PM</mat-option>
            </mat-select>
            <mat-error
              *ngIf="
                form.get(name + '_period')?.invalid &&
                form.get(name + '_period')?.touched
              "
            >
              Period is required
            </mat-error>
          </mat-form-field>
        </div>
      </ng-container>
      <ng-template #standalone>
        <div class="time-picker-flex">
          <!-- Hour Select -->
          <mat-form-field appearance="outline" class="time-picker-field">
            <mat-label>{{ hourLabel }}</mat-label>
            <mat-select
              [id]="name + '_hour'"
              [(ngModel)]="hourValue"
              [required]="required"
              (selectionChange)="onTimeChange()"
            >
              <mat-option *ngFor="let hour of hours" [value]="hour.value">
                {{ hour.display }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="required && !hourValue"
              >{{ hourLabel }} is required</mat-error
            >
          </mat-form-field>

          <!-- Minute Select -->
          <mat-form-field appearance="outline" class="time-picker-field">
            <mat-label>{{ minuteLabel }}</mat-label>
            <mat-select
              [id]="name + '_minute'"
              [(ngModel)]="minuteValue"
              [required]="required"
              (selectionChange)="onTimeChange()"
            >
              <mat-option *ngFor="let minute of minutes" [value]="minute.value">
                {{ minute.display }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="required && !minuteValue"
              >{{ minuteLabel }} is required</mat-error
            >
          </mat-form-field>

          <!-- Period Select (AM/PM) for 12-hour format -->
          <mat-form-field
            *ngIf="!use24Hour"
            appearance="outline"
            class="time-picker-field"
          >
            <mat-label>Period</mat-label>
            <mat-select
              [id]="name + '_period'"
              [(ngModel)]="periodValue"
              [required]="required"
              (selectionChange)="onTimeChange()"
            >
              <mat-option value="AM">AM</mat-option>
              <mat-option value="PM">PM</mat-option>
            </mat-select>
            <mat-error *ngIf="required && !periodValue"
              >Period is required</mat-error
            >
          </mat-form-field>
        </div>
      </ng-template>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
  ],
  styles: [
    `
      .time-picker-container {
        width: 100%;
      }
      .time-picker-flex {
        display: flex;
        flex-direction: row;
        gap: 10px;
      }
      .time-picker-field {
        flex: 1;
      }
    `,
  ],
})
export class TimePickerComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = 'Time';
  @Input() hourLabel: string = 'Hour';
  @Input() minuteLabel: string = 'Minute';
  @Input() name: string = '';
  @Input() form: FormGroup | undefined;
  @Input() required: boolean = false;
  @Input() use24Hour: boolean = false;
  @Input() hourInterval: number = 1; // Default 1-hour intervals
  @Input() minuteInterval: number = 5; // Default 5-minute intervals

  // For standalone mode
  hourValue: string | null = null;
  minuteValue: string | null = null;
  periodValue: string = 'AM';

  // Options for dropdowns
  hours: { value: string; display: string }[] = [];
  minutes: { value: string; display: string }[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.generateHourOptions();
    this.generateMinuteOptions();

    if (this.form && this.name) {
      // Add the form controls if they don't exist
      if (!this.form.contains(this.name + '_hour')) {
        this.form.addControl(
          this.name + '_hour',
          this.fb.control(
            null,
            this.required
              ? [
                  /*Validators.required*/
                ]
              : [],
          ),
        );
      }
      if (!this.form.contains(this.name + '_minute')) {
        this.form.addControl(
          this.name + '_minute',
          this.fb.control(
            null,
            this.required
              ? [
                  /*Validators.required*/
                ]
              : [],
          ),
        );
      }
      if (!this.use24Hour && !this.form.contains(this.name + '_period')) {
        this.form.addControl(
          this.name + '_period',
          this.fb.control(
            'AM',
            this.required
              ? [
                  /*Validators.required*/
                ]
              : [],
          ),
        );
      }

      // Add hidden control for the combined value
      if (!this.form.contains(this.name)) {
        this.form.addControl(this.name, this.fb.control(null));
      }
    }
  }

  generateHourOptions() {
    this.hours = [];

    if (this.use24Hour) {
      // 24-hour format: 00, 01, 02, ..., 23
      for (let i = 0; i < 24; i += this.hourInterval) {
        const hourStr = i.toString().padStart(2, '0');
        this.hours.push({
          value: hourStr,
          display: hourStr,
        });
      }
    } else {
      // 12-hour format: 1, 2, ..., 12
      for (let i = 1; i <= 12; i += this.hourInterval) {
        this.hours.push({
          value: i.toString(),
          display: i.toString(),
        });
      }
    }
  }

  generateMinuteOptions() {
    this.minutes = [];
    for (let i = 0; i < 60; i += this.minuteInterval) {
      const minuteStr = i.toString().padStart(2, '0');
      this.minutes.push({
        value: minuteStr,
        display: minuteStr,
      });
    }
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    if (!obj) return;

    try {
      // Parse time string (expected format HH:MM or HH:MM AM/PM)
      if (typeof obj === 'string') {
        const timeParts = obj.split(' ');
        const [hours, minutes] = timeParts[0]
          .split(':')
          .map((part) => part.trim());

        if (this.use24Hour) {
          this.setFormValues(hours, minutes, null);
        } else {
          const period = timeParts.length > 1 ? timeParts[1] : 'AM';
          this.setFormValues(
            parseInt(hours) > 12 ? (parseInt(hours) - 12).toString() : hours,
            minutes,
            period,
          );
        }
      }
    } catch (error) {
      console.error('Error parsing time value', error);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onTimeChange(): void {
    let formattedTime: string | null = null;

    if (this.form && this.name) {
      const hour = this.form.get(this.name + '_hour')?.value;
      const minute = this.form.get(this.name + '_minute')?.value;

      if (hour && minute) {
        if (this.use24Hour) {
          formattedTime = `${hour}:${minute}`;
        } else {
          const period = this.form.get(this.name + '_period')?.value || 'AM';
          formattedTime = `${hour}:${minute} ${period}`;

          // Also update the 24-hour value
          const hour24 = this.convertTo24Hour(hour, period);
          this.form.get(this.name)?.setValue(`${hour24}:${minute}`);
        }

        // Update the hidden form control with the formatted time
        this.form.get(this.name)?.setValue(formattedTime);
        this.onChange(formattedTime);
      }
    } else {
      // Standalone mode
      if (this.hourValue && this.minuteValue) {
        if (this.use24Hour) {
          formattedTime = `${this.hourValue}:${this.minuteValue}`;
        } else {
          formattedTime = `${this.hourValue}:${this.minuteValue} ${this.periodValue}`;
        }

        this.onChange(formattedTime);
      }
    }

    this.onTouched();
  }

  setFormValues(
    hour: string | null,
    minute: string | null,
    period: string | null,
  ): void {
    if (this.form && this.name) {
      if (hour) this.form.get(this.name + '_hour')?.setValue(hour);
      if (minute) this.form.get(this.name + '_minute')?.setValue(minute);
      if (!this.use24Hour && period)
        this.form.get(this.name + '_period')?.setValue(period);
    } else {
      this.hourValue = hour;
      this.minuteValue = minute;
      if (!this.use24Hour && period) this.periodValue = period;
    }
  }

  convertTo24Hour(hour: string, period: string): string {
    let hour24 = parseInt(hour);

    if (period === 'PM' && hour24 < 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    return hour24.toString().padStart(2, '0');
  }
}
