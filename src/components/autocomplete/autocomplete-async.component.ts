import {
  Component,
  Input,
  forwardRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  Optional,
  Host,
  SkipSelf,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ControlContainer,
  FormGroup,
  ValidationErrors,
  Validators,
  FormControlStatus,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  filter,
} from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ObservableFetcherComponent } from 'components/fetcher/observable-fetcher.component';
import { Subject } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { HttpService } from 'app/api/api.service';

interface ValidationMessage {
  type: string;
  message: string;
}

@Component({
  selector: 'app-autocomplete-async',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    ObservableFetcherComponent,
  ],
  template: `
    <div>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ label }}</mat-label>
        <input
          type="text"
          matInput
          [formControl]="searchControl"
          [matAutocomplete]="auto"
          [placeholder]="placeholder"
          (focus)="onFocus()"
          (blur)="onInputBlur()"
        />
        <mat-autocomplete
          #auto="matAutocomplete"
          [displayWith]="displayFn"
          (optionSelected)="onOptionSelected($event)"
        >
          <app-fetcher-observable
            #fetcher
            [api]="api"
            [defaultParams]="initialParams"
            [loadingLabel]="loadingLabel"
          >
            <ng-template let-response>
              <div *ngIf="response?.data?.length; else noData">
                <mat-option
                  *ngFor="let option of response.data"
                  [value]="option"
                >
                  {{ option[displayKey] }}
                </mat-option>
              </div>
              <ng-template #noData>
                <mat-option disabled>No results found. </mat-option>
                <div
                  *ngIf="showCreateLink"
                  class="cursor-pointer text-blue-700 px-4 py-1 text-lg"
                  (click)="openNewDialog()"
                >
                  Creat a new one
                </div>
              </ng-template>
            </ng-template>
          </app-fetcher-observable>
        </mat-autocomplete>

        <!-- Dynamic error messages based on validation state -->
        <mat-error *ngIf="shouldShowErrors()">
          {{ getErrorMessage() }}
        </mat-error>
      </mat-form-field>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteAsyncComponent),
      multi: true,
    },
    HttpService,
  ],
})
export class AutocompleteAsyncComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() label: string = '';
  @Input() placeholder: string = 'Search...';
  @Input() api: string = '';
  @Input() defaultParams: { [key: string]: string | number } = { size: '10' };
  @Input() searchParam: string = 'search';
  @Input() displayKey: string = 'name';
  @Input() valueKey: string = 'id';
  @Input() loadingLabel: string = 'Searching';
  // for form integration
  @Input() name: string = '';
  // form integration
  @Input() form: FormGroup | undefined;
  // for backward compatibility
  @Input() error: string = '';
  // for custom validation
  @Input() validationMessages: ValidationMessage[] = [];
  // for required validation
  @Input() required: boolean = false;
  // show create div
  @Input() showCreateLink: boolean = false;

  @Output() onOptionSelect: EventEmitter<any> = new EventEmitter<any>();

  @Output() onNewDialog: EventEmitter<any> = new EventEmitter<void>();

  @ViewChild('fetcher') fetcher!: ObservableFetcherComponent;

  searchControl = new FormControl('');
  initialParams: { [key: string]: string | number } = {};
  selectedOption: any = null;

  private destroy$ = new Subject<void>();

  // Default validation messages
  private defaultValidationMessages: { [key: string]: string } = {
    required: 'This field is required',
    pattern: 'Invalid format',
    minlength: 'Input is too short',
    maxlength: 'Input is too long',
  };

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(
    private httpService: HttpService,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer
  ) {}

  ngOnInit() {
    // Set initial params without search term
    this.initialParams = { ...this.defaultParams, ...DEFAULT_SEARCH_PARAMS };

    // Apply required validator if needed
    if (this.required) {
      this.searchControl.setValidators(Validators.required);
      this.searchControl.updateValueAndValidity();
    }

    // If this component is part of a parent form, sync the validation state
    if (this.form && this.name) {
      // Get the parent form control if it exists
      const formControl = this.form.get(this.name);

      if (formControl) {
        // Sync validators from parent to local control
        this.searchControl.setValidators(formControl.validator);
        this.searchControl.updateValueAndValidity();

        // Sync status changes between local control and parent
        this.searchControl.statusChanges
          .pipe(takeUntil(this.destroy$))
          .subscribe((status: FormControlStatus) => {
            // Transfer error state to parent control
            if (status === 'INVALID' && this.searchControl.errors) {
              formControl.setErrors(this.searchControl.errors);
            } else if (status === 'VALID') {
              formControl.setErrors(null);
            }
          });
      }

      console.log(
        `AutocompleteAsync ${this.name} initialized with form value:`,
        this.form.get(this.name)?.value
      );
    }
  }

  ngAfterViewInit() {
    // Set up the search control to trigger parameter updates after view is ready
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (typeof value === 'string') {
          // Only update when it's a string (not when selecting an option)
          const newParams = {
            ...this.defaultParams,
            // Only add search param if there's actually a search value
            ...(value ? { [this.searchParam]: value } : {}),
          };

          console.log('Search value changed:', value, 'New params:', newParams);

          // If fetcher is initialized, update its params
          if (this.fetcher) {
            this.fetcher.updateParams(newParams);
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFocus() {
    // When field gets focus and is empty, refresh the list
    if (!this.searchControl.value && this.fetcher) {
      this.fetcher.updateParams(this.defaultParams);
    }
  }

  onInputBlur() {
    // Mark as touched for validation
    this.onTouched();
    this.searchControl.markAsTouched();

    // If the input is empty and we had a selected option, reset to the last valid option
    if (
      typeof this.searchControl.value === 'string' &&
      this.searchControl.value.trim() === '' &&
      this.selectedOption
    ) {
      this.searchControl.setValue(this.selectedOption);
    }
  }

  displayFn = (option: any): string => {
    return option ? option[this.displayKey] : '';
  };

  onOptionSelected(event: any) {
    const selectedValue = event.option.value;
    this.selectedOption = selectedValue;
    this.onOptionSelect.emit(selectedValue);
    this.onChange(selectedValue[this.valueKey]);
    this.onTouched();

    // Clear validation errors when a valid option is selected
    this.searchControl.setErrors(null);
    if (this.form && this.name) {
      const control = this.form.get(this.name);
      if (control) {
        control.setErrors(null);
      }
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    // When form control is initialized with a value
    if (value) {
      if (this.selectedOption && this.selectedOption[this.valueKey] === value) {
        // We already have the object, just display it
        this.searchControl.setValue(this.selectedOption);
      } else {
        // We need to fetch the object data by ID
        this.fetchItemById(value);
      }
    } else {
      this.searchControl.setValue('');
      this.selectedOption = null;
    }
  }

  private async fetchItemById(id: string | number) {
    if (!id) return;

    try {
      // For fetching a single item, use the individual item endpoint if available
      // or use a filter to find the specific item
      const fetchParams = {
        ...this.defaultParams,
        // Use ID filter - adjust this based on your API's requirements
        [this.valueKey]: id.toString(),
      };

      const response = await this.fetchItemByParams(fetchParams);

      console.log('Response Returned', response);

      if (response && response.data) {
        let itemData;

        // Handle different API response formats
        if (Array.isArray(response.data)) {
          // Find the matching item in the array
          itemData = response.data.find(
            (item: any) => item[this.valueKey] == id
          );
        } else if (response.data) {
          // Use the direct object
          itemData = response.data;
        }

        if (itemData) {
          this.selectedOption = itemData;
          this.searchControl.setValue(itemData);
        }
      }
    } catch (error) {
      console.error('Error fetching item by ID:', error);
    }
  }

  private fetchItemByParams(params: {
    [key: string]: string | number;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      const httpParams = new HttpParams({ fromObject: params as any });

      this.httpService.get(this.api, httpParams).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error),
      });
    });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.searchControl.disable() : this.searchControl.enable();
  }

  // Helper method to determine if errors should be shown
  shouldShowErrors(): boolean {
    // If a legacy error message is provided, use that
    if (this.error) return true;

    // Check internal control
    if (this.searchControl.invalid && this.searchControl.touched) {
      return true;
    }

    // Check parent form control if available
    if (this.form && this.name) {
      const control = this.form.get(this.name);
      if (control && control.invalid && control.touched) {
        return true;
      }
    }

    return false;
  }

  // Get the appropriate error message based on the validation errors
  getErrorMessage(): string {
    // Priority 1: If legacy error message is provided, use that
    if (this.error) return this.error;

    // Priority 2: Check internal form control errors
    if (this.searchControl.errors) {
      const errorKey = Object.keys(this.searchControl.errors)[0];

      // Check for custom validation messages
      const customMessage = this.validationMessages.find(
        (msg) => msg.type === errorKey
      );
      if (customMessage) {
        return customMessage.message;
      }

      // Check for default messages
      if (this.defaultValidationMessages[errorKey]) {
        return this.defaultValidationMessages[errorKey];
      }

      // Parameterized error messages
      return this.getParameterizedErrorMessage(
        errorKey,
        this.searchControl.errors
      );
    }

    // Priority 3: Check parent form control errors if available
    if (this.form && this.name) {
      const control = this.form.get(this.name);
      if (control && control.errors) {
        const errorKey = Object.keys(control.errors)[0];

        // Check for custom validation messages
        const customMessage = this.validationMessages.find(
          (msg) => msg.type === errorKey
        );
        if (customMessage) {
          return customMessage.message;
        }

        // Check for default messages
        if (this.defaultValidationMessages[errorKey]) {
          return this.defaultValidationMessages[errorKey];
        }

        // Parameterized error messages
        return this.getParameterizedErrorMessage(errorKey, control.errors);
      }
    }

    return `${this.label || 'Field'} is invalid`;
  }

  // Helper to handle validation errors that include parameters
  private getParameterizedErrorMessage(
    errorKey: string,
    errors: ValidationErrors
  ): string {
    switch (errorKey) {
      case 'minlength':
        return `Minimum length is ${errors['minlength'].requiredLength} characters`;
      case 'maxlength':
        return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
      default:
        return `${this.label || 'Field'} is invalid`;
    }
  }

  openNewDialog() {
    this.onNewDialog.emit();
  }
}
