import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule,} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {NgxMaskDirective} from "ngx-mask";

@Component({
  selector: 'app-phone-number',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskDirective,
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
          mask="0999999999"
          placeholder="0752936798"
        />
        <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
          {{ label }} is required
        </mat-error>
      </mat-form-field>
    </ng-container>
    <ng-template #standalone>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ label }}</mat-label>
        <input
          matInput
          [id]="name"
          [(ngModel)]="value"
          (input)="onInputChange($event)"
          mask="0000000000"
          placeholder="0752936798"
        />
      </mat-form-field>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextPhoneInputComponent),
      multi: true,
    },
  ],
  styles: [],
})
export class TextPhoneInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() form: FormGroup | undefined;

  value: any;

  onChange = (_: any) => {
  };
  onTouched = () => {
  };

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
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.value = inputElement.value;
    this.onChange(this.value);
  }
}
