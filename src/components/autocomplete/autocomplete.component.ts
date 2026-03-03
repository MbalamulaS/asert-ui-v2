import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ContentChild,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import { MatChipGrid } from '@angular/material/chips';

interface Option {
  id: string | number;
  name: string;
  [key: string]: any;
}

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatOptionModule,
    ReactiveFormsModule,
    FormsModule,
    MatIcon,
    MatIconModule,
    MatChipsModule,
  ],
  template: `
    <ng-container *ngIf="form; else standalone">
      <mat-form-field appearance="outline" class="w-full" [formGroup]="form">
        <mat-icon matPrefix>search</mat-icon>
        <mat-label>
          {{ label }}
          <span *ngIf="required" class="text-red-500">*</span>
        </mat-label>

        <!-- Chip grid for multiple selection -->
        <mat-chip-grid #chipList *ngIf="multiple && selectedOptions.length > 0">
          <mat-chip
            *ngFor="let option of selectedOptions"
            [removable]="true"
            (removed)="removeOption(option)"
          >
            {{ option.name }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
        </mat-chip-grid>

        <input
          #inputElement
          type="text"
          matInput
          [matAutocomplete]="auto"
          [formControlName]="name"
          (input)="filter($event)"
          (blur)="onTouched()"
          [placeholder]="placeholder || label"
          [matChipInputFor]="chipList"
        />

        <mat-autocomplete
          #auto="matAutocomplete"
          [displayWith]="displayFn.bind(this)"
          (optionSelected)="onSelectChange($event.option.value)"
        >
          <ng-container *ngFor="let option of filteredOptions | async">
            <mat-option [value]="returnObject ? option : option.id">
              <ng-container
                *ngIf="optionTemplate; else defaultTemplate"
                [ngTemplateOutlet]="optionTemplate"
                [ngTemplateOutletContext]="{ $implicit: option }"
              ></ng-container>
              <ng-template #defaultTemplate>
                {{ displayLabel ? option[displayLabel] : option.name }}
              </ng-template>
            </mat-option>
          </ng-container>
        </mat-autocomplete>

        <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
          {{ error || label + ' is required' }}
        </mat-error>
      </mat-form-field>
    </ng-container>

    <ng-template #standalone>
      <mat-form-field appearance="outline" class="w-full">
        <mat-icon matPrefix>search</mat-icon>
        <mat-label>
          {{ label }}
          <span *ngIf="required" class="text-red-500">*</span>
        </mat-label>

        <!-- Chip grid for multiple selection -->
        <mat-chip-grid #chipList *ngIf="multiple && selectedOptions.length > 0">
          <mat-chip
            *ngFor="let option of selectedOptions"
            [removable]="true"
            (removed)="removeOption(option)"
          >
            {{ option.name }}
            <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip>
        </mat-chip-grid>

        <input
          #inputElement
          type="text"
          matInput
          [matAutocomplete]="auto"
          [(ngModel)]="inputValue"
          (input)="filter($event)"
          (blur)="onTouched()"
          [placeholder]="placeholder || label"
          [required]="required"
          [matChipInputFor]="chipList"
        />

        <mat-autocomplete
          #auto="matAutocomplete"
          [displayWith]="displayFn.bind(this)"
          (optionSelected)="onSelectChange($event.option.value)"
        >
          <ng-container *ngFor="let option of filteredOptions | async">
            <mat-option [value]="returnObject ? option : option.id">
              <ng-container
                *ngIf="optionTemplate; else defaultTemplate"
                [ngTemplateOutlet]="optionTemplate"
                [ngTemplateOutletContext]="{ $implicit: option }"
              ></ng-container>
              <ng-template #defaultTemplate>
                {{ displayLabel ? option[displayLabel] : option.name }}
              </ng-template>
            </mat-option>
          </ng-container>
        </mat-autocomplete>

        <mat-error *ngIf="error">
          {{ error }}
        </mat-error>
      </mat-form-field>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class AutocompleteComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() options: Option[] = [];
  @Input() form: FormGroup | undefined;
  @Input() returnObject: boolean = false;
  @Input() defaultOpen: boolean = false;
  @Input() displayLabel?: string;
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() error: string = '';
  @Input() showLabel: boolean = true;
  @Input() multiple: boolean = false;
  @Output() onOptionSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() onInputChange: EventEmitter<any> = new EventEmitter<any>();

  @ContentChild('optionTemplate', { static: false })
  optionTemplate!: TemplateRef<any>;

  @ViewChild('chipList', { static: false }) chipList!: MatChipGrid;

  @ViewChild('inputElement', { static: false }) inputElement: any;

  value: any;
  selectedOption: Option | null = null;
  selectedOptions: Option[] = [];
  filteredOptions: Observable<Option[]> = of([]);
  inputValue: string = '';

  onChange = (_: any) => {};
  onTouched = () => {};

  get isRequired(): boolean {
    if (!this.form || !this.name) return this.required;
    const control = this.form.get(this.name);
    if (!control) return this.required;
    const validator = control.validator?.(control);
    return (validator && validator['required']) || this.required;
  }

  writeValue(obj: any): void {
    this.value = obj;
    if (this.multiple) {
      if (Array.isArray(obj)) {
        this.selectedOptions = [];
        obj.forEach((id) => {
          const option = this.options.find((opt) => opt.id === id);
          if (option) {
            this.selectedOptions.push(option);
          }
        });
      }
    } else {
      this.selectedOption =
        this.options.find((option) => option.id === obj) || null;
      this.inputValue = this.selectedOption?.name || '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  ngOnInit() {
    if (this.form) {
      this.filteredOptions =
        this.form.get(this.name)?.valueChanges.pipe(
          startWith(''),
          map((value) => this._filter(value || '')),
        ) || of(this.options);
    } else {
      this.filteredOptions = of(this.options);
    }

    if (this.multiple && Array.isArray(this.value)) {
      this.selectedOptions = [];
      this.value.forEach((id) => {
        const option = this.options.find((opt) => opt.id === id);
        if (option) {
          this.selectedOptions.push(option);
        }
      });
    }
  }

  filter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue = value;
    this.onInputChange.emit(value);
    this.filteredOptions = of(this._filter(value));
  }

  private _filter(value: string): Option[] {
    const filterValue = value.toLowerCase();
    let filteredOptions = this.options.filter((option) =>
      option.name.toLowerCase().includes(filterValue),
    );

    if (this.multiple) {
      const selectedIds = this.selectedOptions.map((opt) => opt.id);
      filteredOptions = filteredOptions.filter(
        (option) => !selectedIds.includes(option.id),
      );
    }

    return filteredOptions;
  }

  onSelectChange(value: any): void {
    if (!Array.isArray(this.options)) {
      return;
    }

    if (this.multiple) {
      let selectedOption: Option | undefined;
      if (!this.returnObject) {
        selectedOption = this.options.find((option) => option.id === value);
      } else {
        selectedOption = value;
      }

      if (
        selectedOption &&
        !this.selectedOptions.some((opt) => opt.id === selectedOption!.id)
      ) {
        this.selectedOptions.push(selectedOption);
        const selectedValues = this.returnObject
          ? this.selectedOptions
          : this.selectedOptions.map((opt) => opt.id);
        this.onChange(selectedValues);
        this.onOptionSelected.emit(selectedValues);
      }

      // Clear the input field after selection
      this.inputValue = '';
      if (this.form) {
        const control = this.form.get(this.name);
        if (control) {
          control.setValue(
            this.returnObject
              ? this.selectedOptions
              : this.selectedOptions.map((opt) => opt.id),
          );
          control.markAsDirty();
        }
      }
      this.inputElement.nativeElement.value = ''; // Clear the input element
      this.filteredOptions = of(this._filter('')); // Reset filtered options
    } else {
      if (!this.returnObject) {
        const selectedOption = this.options.find(
          (option) => option.id === value,
        );
        this.selectedOption = selectedOption || null;
        this.inputValue = this.selectedOption?.name || '';
        this.onChange(selectedOption ? selectedOption.id : null);
        this.onOptionSelected.emit(selectedOption ? selectedOption.id : null);
      } else {
        this.selectedOption = value;
        this.inputValue = value?.name || '';
        this.onChange(value);
        this.onOptionSelected.emit(value);
      }
    }
    this.onTouched();
  }

  removeOption(option: Option): void {
    const index = this.selectedOptions.findIndex((opt) => opt.id === option.id);
    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
      const selectedValues = this.returnObject
        ? this.selectedOptions
        : this.selectedOptions.map((opt) => opt.id);
      this.onChange(selectedValues);
      this.onOptionSelected.emit(selectedValues);

      if (this.form) {
        const control = this.form.get(this.name);
        if (control) {
          control.setValue(selectedValues);
          control.markAsDirty();
        }
      }
    }
  }

  displayFn(value: any): string {
    if (this.multiple) {
      return ''; // For multiple selection, we don't display the value in the input
    }
    if (this.returnObject && value && value.name) {
      return value.name;
    }
    const option = this.options.find((opt) => opt.id === value);
    return option ? option.name : '';
  }
}
