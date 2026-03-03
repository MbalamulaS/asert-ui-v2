import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ReactiveFormsModule} from "@angular/forms";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {UnAssignedHotelsComponent} from "modules/assessment-assignment/un-assigned-hotels.component";
import {AssignedHotelsComponent} from "modules/assessment-assignment/assigned-hotels.component";
import {
  AssessmentAwaitingApprovalComponent
} from "modules/assessment-assignment/assessment-awaiting-approval.component";
import {
  CompletedAssessmentAssignmentComponent
} from "modules/assessment-assignment/completed-assessment-assignment.component";


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
    UnAssignedHotelsComponent,
    AssignedHotelsComponent,
    AssessmentAwaitingApprovalComponent,
    CompletedAssessmentAssignmentComponent,

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
        <ng-template matStepLabel>New Applications</ng-template>
        <app-assessment-un-assigned-hotels></app-assessment-un-assigned-hotels>
        <div class="mt-4 flex justify-end">
          <button
            mat-button
            matStepperNext>
            Next
          </button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Assigned to Assessors</ng-template>
        <app-assessor-assigned-hotels></app-assessor-assigned-hotels>
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
        <ng-template matStepLabel>Awaiting Approval</ng-template>
        <app-assessment-awaiting-approval-assignments></app-assessment-awaiting-approval-assignments>
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
        <app-assessment-completed-assignments></app-assessment-completed-assignments>
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
        </div>
      </mat-step>
    </mat-horizontal-stepper>
  `,
})
export class AssignmentComponent implements OnInit {
  isSubmitting = false;
  @Output() onSubmit = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }
}
