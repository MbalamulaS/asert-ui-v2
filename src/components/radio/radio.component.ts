import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Option {
  id?: any;
  uuid?: string;
  label?: string;
  value?: string;
  name: string;
  orderIndex?: number;
  score?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [
    CommonModule,
    MatRadioModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
  ],
  template: `
    <ng-container *ngIf="form; else standalone">
      <div [formGroup]="form">
        <div class="flex flex-col">
          <label *ngIf="showLabel">{{ label }}</label>
          <mat-radio-group
            [id]="name"
            [formControlName]="name"
            [required]="required"
            (change)="onRadioChange($event.value)"
          >
            <mat-radio-button
              *ngFor="let option of normalizedOptions; trackBy: trackByFn"
              [value]="returnObject ? option : option.value"
            >
              {{ displayLabel ? option[displayLabel] : option.label }}
            </mat-radio-button>
          </mat-radio-group>
          <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
            {{ label }} is required
          </mat-error>
        </div>
      </div>
    </ng-container>
    <ng-template #standalone>
      <div class="flex flex-col">
        <label *ngIf="showLabel" class="ml-2">{{ label }}</label>
        <mat-radio-group
          [id]="name"
          [(ngModel)]="value"
          [required]="required"
          (change)="onRadioChange($event.value)"
        >
          <mat-radio-button
            *ngFor="let option of normalizedOptions; trackBy: trackByFn"
            [value]="returnObject ? option : option.value"
          >
            {{ displayLabel ? option[displayLabel] : option.label }}
          </mat-radio-button>
        </mat-radio-group>
        <mat-error *ngIf="required && !value">This field is required</mat-error>
      </div>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class RadioButtonComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() options: Option[] | string[] = []; // Support both Option[] and string[]
  @Input() form: FormGroup | undefined;
  @Input() showLabel: boolean = true;
  @Input() returnObject: boolean = false;
  @Input() displayLabel?: string;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;

  @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();

  value: any;
  normalizedOptions: Option[] = []; // Normalized options as Option[]

  ngOnChanges(): void {
    // Normalize options to Option[]
    this.normalizedOptions = Array.isArray(this.options)
      ? this.options.map((option) =>
          typeof option === 'string'
            ? { value: option, label: option }
            : { ...option, label: option.label || option.name },
        )
      : [];
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

  onChange = (_: any) => {};
  onTouched = () => {};

  onRadioChange(value: any): void {
    if (!this.returnObject) {
      const selectedOption = this.normalizedOptions.find(
        (option) => option.value === value,
      );
      const selectedValue = selectedOption ? selectedOption.value : null;
      this.onChange(selectedValue);
      this.selectionChange.emit(selectedValue);
    } else {
      this.onChange(value);
      this.selectionChange.emit(value);
    }
  }

  trackByFn(index: number, item: Option): string {
    return item.value || item.id || index.toString();
  }
}
