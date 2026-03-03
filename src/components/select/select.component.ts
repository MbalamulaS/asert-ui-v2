import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnChanges,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormGroup,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

interface Option {
  id?: string;
  uuid?: string;
  label: string;
  name: string;
  value: string;
  orderIndex?: number;
  score?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-select',
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
          [placeholder]="placeholder"
          [multiple]="multiple"
          (selectionChange)="handleSelectionChange($event)"
        >
          <mat-option
            *ngFor="let option of normalizedOptions; trackBy: trackByFn"
            [value]="option.value"
          >
            {{ option.label }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
          {{ label }} is required
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
          [placeholder]="placeholder"
          [multiple]="multiple"
          (selectionChange)="handleSelectionChange($event)"
        >
          <mat-option
            *ngFor="let option of normalizedOptions; trackBy: trackByFn"
            [value]="option.value"
          >
            {{ option.label }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="required && !value">This field is required</mat-error>
      </mat-form-field>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class SelectComponent implements ControlValueAccessor, OnChanges {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() form: FormGroup | undefined;
  @Input() options: Option[] | string[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() required: boolean = false;
  @Input() multiple: boolean = false;
  @Output() onOptionSelected = new EventEmitter<any>();
  value: any;

  normalizedOptions: Option[] = [];

  ngOnChanges(): void {
    // console.log('SelectComponent options:', this.options);

    this.normalizedOptions = Array.isArray(this.options)
      ? this.options.map((option) => {
          if (typeof option === 'string') {
            return { value: option, name: option, label: option };
          }

          // Ensure value is properly extracted
          const value = option.id || option.uuid || option.value || option;

          return {
            ...option,
            label: option.label || option.name || '',
            name: option.name || option.label || '',
            value: value,
          };
        })
      : [];

    // console.log('Normalized options:', this.normalizedOptions);
  }

  handleSelectionChange(event: any): void {
    // console.log('Selection changed:', event.value);
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
    this.onOptionSelected.emit(this.value);
  }

  writeValue(obj: any): void {
    // console.log('writeValue called with:', obj);
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onChange = (value: any) => {
    // console.log('onChange called with:', value);
  };

  onTouched = () => {};

  trackByFn(index: number, option: Option): string {
    return option.value || option.id || index.toString();
  }
}
