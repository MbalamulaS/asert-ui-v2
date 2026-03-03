import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash, } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from "@angular/forms";
import { MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious } from "@angular/material/stepper";
import { MyNewAssignmentComponent } from "modules/my-profile/my-new-assignment.component";
import { MyAssignmentAwaitingApprovalComponent } from "modules/my-profile/my-assignment-awaiting-approval.component";
import { MyCompletedAssignmentComponent } from "modules/my-profile/my-completed-assignment.component";


@Component({
  selector: 'app-assessor-data-collection-form',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatStep,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
    MyNewAssignmentComponent,
    MyAssignmentAwaitingApprovalComponent,
    MyCompletedAssignmentComponent,
  ],
  viewProviders: [
    provideIcons({
      heroCog6Tooth,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <mat-horizontal-stepper [linear]="false">
      <mat-step>
        <ng-template matStepLabel>New Assignment</ng-template>
        <app-assessor-new-assignment></app-assessor-new-assignment>
        <div class="mt-4 flex justify-end">
          <button
            mat-button
            matStepperNext>
            Next
          </button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Awaiting Approval</ng-template>
        <app-assessor-assignment-awaiting-approval></app-assessor-assignment-awaiting-approval>
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
          <button
            mat-button
            matStepperNext
          >
            Next
          </button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Completed</ng-template>
        <app-assessor-completed-assignments></app-assessor-completed-assignments>
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
        </div>
      </mat-step>
    </mat-horizontal-stepper>
  `,
})
export class MyAssignmentComponent implements OnInit {
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }
}
