import {
  Component,
  Input,
  Output,
  EventEmitter,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-stepper',
  imports: [MatStepperModule, CommonModule, ReactiveFormsModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <mat-horizontal-stepper [linear]="linear">
      <mat-step
        *ngFor="let step of steps; let i = index"
        [stepControl]="step.formGroup"
      >
        <form [formGroup]="step.formGroup">
          <ng-template matStepLabel>{{ step.label }}</ng-template>
          <ng-container *ngIf="i === 0">
            <ng-content select="[step-0]"></ng-content>
          </ng-container>
          <ng-container *ngIf="i === 1">
            <ng-content select="[step-1]"></ng-content>
          </ng-container>
          <div class="mt-4 flex justify-end">
            <button mat-button matStepperPrevious *ngIf="i > 0">Back</button>
            <button
              mat-button
              matStepperNext
              *ngIf="i < steps.length - 1"
              [disabled]="step.formGroup.invalid"
            >
              Next
            </button>
            <button
              mat-raised-button
              *ngIf="i === steps.length - 1"
              (click)="submitForm()"
            >
              Submit
            </button>
          </div>
        </form>
      </mat-step>
    </mat-horizontal-stepper>
  `,
})
export class StepperComponent {
  @Input() steps: Array<{ label: string; formGroup: FormGroup }>;
  @Input() linear: boolean = true;

  @Output() onSubmit = new EventEmitter<any>();

  submitForm() {
    const isInvalid = this.steps.some((step) => step.formGroup.invalid);
    if (isInvalid) {
      return;
    }
    const formData = this.steps.reduce((acc, step) => {
      acc = { ...acc, ...step.formGroup.value };
      return acc;
    }, {});
    this.onSubmit.emit(formData);
  }
}
