import {
  Component,
  forwardRef,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroup,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { createMask, InputMaskModule } from '@ngneat/input-mask';
import { unmaskedPatternValidator } from 'utils/validators';

@Component({
  selector: 'masked-input',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    InputMaskModule,
  ],
  template: `
    <ng-container *ngIf="form; else standalone">
      <mat-form-field appearance="outline" class="w-full" [formGroup]="form">
        <mat-label>{{ label }}</mat-label>
        <input
          matInput
          [id]="name"
          [formControlName]="name"
          (input)="onInputChange($event)"
          [type]="type"
          #inputElement
          [inputMask]="inputMask"
        />
        <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
          {{ getErrorMessage() }}
        </mat-error>
      </mat-form-field>
    </ng-container>
    <ng-template #standalone>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ label }}</mat-label>
        <input
          matInput
          [id]="name"
          [placeholder]="label"
          [(ngModel)]="value"
          (input)="onInputChange($event)"
          [type]="type"
          #inputElement
          [inputMask]="inputMask"
        />
      </mat-form-field>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaskedInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MaskedInputComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class MaskedInputComponent
  implements ControlValueAccessor, AfterViewInit, Validator
{
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() form: FormGroup | undefined;
  @Input() type: string = 'text';
  @Input() pattern: string = '';
  @ViewChild('inputElement') inputElement!: ElementRef;

  value: any;
  inputMask: any;

  constructor(private cdRef: ChangeDetectorRef) {}

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.value = obj;
    if (this.inputElement) {
      this.inputElement.nativeElement.value = obj;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  ngAfterViewInit() {
    if (this.pattern && this.type !== 'email') {
      this.inputMask = createMask({ mask: this.pattern });
      // Manually trigger change detection after updating the mask
      this.cdRef.detectChanges();
    }
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const maskedValue = inputElement.value;
    const unmaskedValue = maskedValue.replace(/\D/g, '');
    this.value = maskedValue;
    this.onChange(unmaskedValue);
  }

  getErrorMessage(): string {
    const control = this.form?.get(this.name);
    if (control?.hasError('required')) {
      return `${this.label} is required`;
    }
    if (control?.hasError('email')) {
      return `Invalid email address`;
    }
    if (control?.hasError('unmaskedPattern')) {
      return `Invalid format`;
    }
    return '';
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.pattern) {
      return unmaskedPatternValidator(this.pattern)(control);
    }
    return null;
  }
}
