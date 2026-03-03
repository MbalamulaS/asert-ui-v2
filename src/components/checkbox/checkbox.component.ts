import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Option {
  id?: string;
  uuid?: string;
  label: string;
  value: string;
  orderIndex?: number;
  score?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
  ],
  template: `
    <ng-container *ngIf="form; else standalone">
      <div [formGroup]="form">
        <ng-container *ngIf="!multiple || normalizedOptions.length <= 1">
          <mat-checkbox
            [id]="name"
            [formControlName]="name"
            [required]="required"
            (change)="onCheckboxChange($event.checked)"
            color="{{ color }}"
          >
            {{
              label ||
                (normalizedOptions.length ? normalizedOptions[0].label : '')
            }}
          </mat-checkbox>
        </ng-container>
        <ng-container *ngIf="multiple && normalizedOptions.length > 1">
          <ng-container
            *ngFor="
              let option of normalizedOptions;
              trackBy: trackByFn;
              let i = index
            "
          >
            <mat-checkbox
              [id]="name + '-' + i"
              [formControlName]="name"
              [required]="required"
              (change)="onMultiCheckboxChange($event.checked, option)"
              color="{{ color }}"
            >
              {{ option.label }}
            </mat-checkbox>
          </ng-container>
        </ng-container>
        <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
          {{ label || 'This field' }} is required
        </mat-error>
      </div>
    </ng-container>
    <ng-template #standalone>
      <ng-container *ngIf="!multiple || normalizedOptions.length <= 1">
        <mat-checkbox
          [id]="name"
          [(ngModel)]="value"
          [required]="required"
          (change)="onCheckboxChange($event.checked)"
          color="{{ color }}"
        >
          {{
            label ||
              (normalizedOptions.length ? normalizedOptions[0].label : '')
          }}
        </mat-checkbox>
      </ng-container>
      <ng-container *ngIf="multiple && normalizedOptions.length > 1">
        <ng-container
          *ngFor="
            let option of normalizedOptions;
            trackBy: trackByFn;
            let i = index
          "
        >
          <mat-checkbox
            [id]="name + '-' + i"
            [(ngModel)]="multiValues[i]"
            [required]="required"
            (change)="onMultiCheckboxChange($event.checked, option)"
            color="{{ color }}"
          >
            {{ option.label }}
          </mat-checkbox>
        </ng-container>
      </ng-container>
      <mat-error *ngIf="required && !value && !hasMultiValues">
        {{ label || 'This field' }} is required
      </mat-error>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() form: FormGroup | undefined;
  @Input() color: string = 'primary';
  @Input() required: boolean = false;
  @Input() options: Option[] | string[] = [];
  @Input() multiple: boolean = false;

  value: any = false;
  multiValues: any[] = [];
  normalizedOptions: Option[] = [];

  ngOnChanges(): void {
    this.normalizedOptions = Array.isArray(this.options)
      ? this.options.map((option) =>
          typeof option === 'string'
            ? { value: option, label: option }
            : { ...option, label: option.label || option.name },
        )
      : [];
  }

  writeValue(obj: any): void {
    if (this.multiple && Array.isArray(obj)) {
      this.multiValues = obj;
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

  onChange = (_: any) => {};
  onTouched = () => {};

  onCheckboxChange(checked: boolean): void {
    if (this.normalizedOptions.length && checked) {
      this.value = this.normalizedOptions[0].value;
    } else {
      this.value = checked;
    }
    this.onChange(this.value);
  }

  onMultiCheckboxChange(checked: boolean, option: Option): void {
    const value = option.value;
    if (checked) {
      this.multiValues = [...this.multiValues, value];
    } else {
      this.multiValues = this.multiValues.filter((v) => v !== value);
    }
    this.onChange(this.multiValues);
  }

  get hasMultiValues(): boolean {
    return this.multiValues.length > 0;
  }

  trackByFn(index: number, item: Option): string {
    return item.value || item.id || index.toString();
  }
}
