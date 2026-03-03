import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  Injector,
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-stepper',
  standalone: true,
  template: `
    <form [formGroup]="form">
      <mat-horizontal-stepper [linear]="true">
        <ng-container *ngFor="let step of steps; let i = index">
          <mat-step [stepControl]="form.get(step)">
            <form [formGroup]="stepFormGroup(step)">
              <ng-template matStepLabel>{{ stepLabels[i] }}</ng-template>
              <ng-container
                *ngComponentOutlet="
                  stepComponents[i];
                  injector: createInjector(stepFormGroup(step))
                "
              ></ng-container>
              <div class="mt-4 flex justify-end">
                <button mat-button matStepperPrevious *ngIf="i > 0">
                  Back
                </button>
                <button
                  mat-button
                  matStepperNext
                  *ngIf="i < steps.length - 1"
                  [disabled]="stepFormGroup(step).invalid"
                >
                  Next
                </button>
                <button
                  mat-button
                  (click)="onSubmit.emit(form.value)"
                  *ngIf="i === steps.length - 1"
                  [disabled]="form.invalid"
                >
                  Submit
                </button>
              </div>
            </form>
          </mat-step>
        </ng-container>
      </mat-horizontal-stepper>
    </form>
  `,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatStepperModule,
  ],
})
export class StepperComponent {
  @Input() form!: FormGroup;
  @Input() steps!: string[];
  @Input() stepLabels!: string[];
  @Input() stepComponents!: any[];
  @Output() onSubmit = new EventEmitter<any>();

  stepFormGroup(step: string): FormGroup {
    return this.form.get(step) as FormGroup;
  }

  createInjector(formGroup: FormGroup): Injector {
    return Injector.create({
      providers: [{ provide: FormGroup, useValue: formGroup }],
    });
  }
}
