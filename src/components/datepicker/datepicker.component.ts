import { Component, Input, forwardRef, OnInit, inject } from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import moment from 'moment';

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD',
  },
  display: {
    dateInput: 'YYYY/MM/DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'YYYY/MM/DD',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
    <ng-container *ngIf="form; else standalone">
      <mat-form-field appearance="outline" class="w-full" [formGroup]="form">
        <mat-label>{{ label }}</mat-label>
        <input
          matInput
          [min]="minDate"
          [max]="maxDate"
          [matDatepicker]="picker"
          [id]="name"
          [formControlName]="name"
          [required]="required"
          (dateChange)="onDateChange($event)"
        />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
        <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
          {{ label }} is
          {{ form.get(name)?.errors?.['required'] ? 'required' : 'invalid' }}
        </mat-error>
      </mat-form-field>
    </ng-container>
    <ng-template #standalone>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ label }}</mat-label>
        <input
          matInput
          [min]="minDate"
          [matDatepicker]="picker"
          [id]="name"
          [required]="required"
          [(ngModel)]="value"
          (dateChange)="onDateChange($event)"
        />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
        <mat-error *ngIf="required && !value">This field is required</mat-error>
      </mat-form-field>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_DATE_FORMATS,
    },
  ],
  styles: [],
})
export class DatepickerComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() form: FormGroup | undefined;
  @Input() format: string = 'YYYY-MM-DD';
  @Input() required: boolean = false;
  @Input() minDate: Date;
  @Input() maxDate: Date;

  value: any;
  private dateAdapter: DateAdapter<any>;

  constructor() {
    this.dateAdapter = inject(DateAdapter);
  }

  ngOnInit() {
    this.dateAdapter.setLocale('en-GB');
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    if (obj) {
      // Convert the ISO date string to a moment object and format it
      this.value = moment(obj).format(this.format);
    } else {
      this.value = obj;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onDateChange(event: any): void {
    const val2 = event.value?.format(this.format ?? 'YYYY-MM-DD') ?? null;

    this.onChange(val2);
  }
}
