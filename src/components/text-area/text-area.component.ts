import {
  Component,
  forwardRef,
  Input,
  ElementRef,
  HostListener,
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
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-text-area',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
    <ng-container *ngIf="form; else standalone">
      <mat-form-field appearance="outline" class="w-full" [formGroup]="form">
        <mat-label>{{ label }}</mat-label>
        <textarea
          matInput
          [id]="name"
          [formControlName]="name"
          [placeholder]="placeholder"
          [required]="required"
          (input)="onInputChange($event)"
          [rows]="rows"
        ></textarea>
        <mat-error *ngIf="form.get(name)?.invalid && form.get(name)?.touched">
          {{ label }} is
          {{ form.get(name)?.errors?.['required'] ? 'required' : 'invalid' }}
        </mat-error>
      </mat-form-field>
    </ng-container>
    <ng-template #standalone>
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>{{ label }}</mat-label>
        <textarea
          matInput
          [id]="name"
          [placeholder]="placeholder"
          [required]="required"
          [(ngModel)]="value"
          (input)="onInputChange($event)"
          [rows]="rows"
        ></textarea>
        <mat-error *ngIf="required && !value">This field is required</mat-error>
      </mat-form-field>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaComponent),
      multi: true,
    },
  ],
  styles: [
    `
      textarea {
        overflow: hidden;
        resize: none;
      }
    `,
  ],
})
export class TextAreaComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() form: FormGroup | undefined;
  @Input() rows: number = 1;
  @Input() placeholder: string = '';
  @Input() required: boolean = false;

  value: any;

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private el: ElementRef) {}

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onInputChange(event: Event): void {
    const textareaElement = event.target as HTMLTextAreaElement;
    this.value = textareaElement.value;
    this.onChange(this.value);
    this.adjustTextAreaHeight();
  }

  @HostListener('input')
  adjustTextAreaHeight(): void {
    const textarea: HTMLTextAreaElement =
      this.el.nativeElement.querySelector('textarea');
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
