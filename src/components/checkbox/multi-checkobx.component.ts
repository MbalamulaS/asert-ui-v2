import {
  Component,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroup,
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
  selector: 'app-multi-checkbox',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  template: `
    <div *ngIf="form && name" [formGroup]="form">
      <label *ngIf="label" class="block text-sm font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <div class="flex flex-col space-y-2">
        <ng-container
          *ngFor="
            let option of normalizedOptions;
            trackBy: trackByFn;
            let i = index
          "
        >
          <mat-checkbox
            [id]="id ? id + '-' + i : name + '-' + i"
            [checked]="isChecked(option.value)"
            (change)="onCheckboxChange($event.checked, option)"
            color="primary"
            class="text-gray-700"
          >
            {{ option.label }}
            <span *ngIf="option.score" class="text-xs text-gray-500 ml-1">
              ({{ option.score }} points)
            </span>
          </mat-checkbox>
        </ng-container>
      </div>
      <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
        {{ label || 'This field' }} is required
      </mat-error>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiCheckboxComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class MultiCheckboxComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() id: string = '';
  @Input() form: FormGroup | undefined;
  @Input() color: string = 'primary';
  @Input() required: boolean = false;
  @Input() options: Option[] | string[] = [];
  @Output() change = new EventEmitter<boolean>();

  normalizedOptions: Option[] = [];
  private values: string[] = [];
  private valueChangeSubscription?: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Options normalization happens in ngOnChanges
  }

  ngAfterViewInit(): void {
    // Sync with form control after view is initialized
    // This ensures the form control exists before we try to access it
    if (this.form && this.name) {
      const control = this.form.get(this.name);
      if (control) {
        // Subscribe to value changes to stay in sync
        this.valueChangeSubscription = control.valueChanges.subscribe(value => {
          this.writeValue(value);
          this.cdr.detectChanges();
        });

        // Set initial value
        this.writeValue(control.value || []);
        this.cdr.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }

  ngOnChanges(): void {
    this.normalizedOptions = Array.isArray(this.options)
      ? this.options.map((option) =>
          typeof option === 'string'
            ? { value: option, label: option }
            : { ...option, label: option.label || option.name },
        )
      : [];

    // Re-sync with form control if options changed
    if (this.form && this.name) {
      const control = this.form.get(this.name);
      if (control && control.value) {
        this.writeValue(control.value);
      }
    }
  }

  writeValue(obj: any): void {
    // Ensure we always have an array
    if (Array.isArray(obj)) {
      this.values = obj;
    } else if (obj !== null && obj !== undefined && obj !== '') {
      this.values = [obj];
    } else {
      this.values = [];
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

  onCheckboxChange(checked: boolean, option: Option): void {
    const value = option.value;
    let currentValues = this.values || [];

    if (checked) {
      if (!currentValues.includes(value)) {
        currentValues = [...currentValues, value];
      }
    } else {
      currentValues = currentValues.filter((v) => v !== value);
    }

    this.values = currentValues;
    
    // Update the form control directly if we have form and name
    if (this.form && this.name) {
      const control = this.form.get(this.name);
      if (control) {
        control.setValue(currentValues.length > 0 ? currentValues : null);
        control.markAsDirty();
      }
    }
    
    // Also call the ControlValueAccessor onChange callback
    this.onChange(currentValues);
    this.change.emit(checked);
  }

  isChecked(value: string): boolean {
    return this.values.includes(value);
  }

  trackByFn(index: number, item: Option): string {
    return item.value || item.id || index.toString();
  }
}
