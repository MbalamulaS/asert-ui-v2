import { Component, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  heroCog6Tooth,
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperNext,
  MatStepperPrevious,
} from '@angular/material/stepper';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Assessor } from 'modules/assessment/assessment';
import { AssessorService } from 'modules/assessment/assessor.service';
import { AssessorPersonalInformationComponent } from 'modules/my-profile/personal-info/assessor-personal-information.component';
import { AssessorIdentificationComponent } from 'modules/my-profile/identification/assessor-identification.component';
import { AssessorContactComponent } from 'modules/my-profile/contact/assessor-contact.component';
import { AssessorEducationBackgroundComponent } from 'modules/my-profile/education-background/assessor-education-background.component';
import { AssessorEmploymentHistoryComponent } from 'modules/my-profile/employment-history/assessor-employment-history.component';
import { AssessorDocumentComponent } from 'modules/my-profile/document/assessor-document.component';
import { AssessorReferenceComponent } from 'modules/my-profile/reference/assessor-reference.component';
import { AssessorCertificationComponent } from 'modules/my-profile/certification/assessor-certification.component';
import { AssessorPreferenceComponent } from 'modules/my-profile/preference/assessor-preference.component';

@Component({
  selector: 'app-assessor-profile-update',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatStep,
    MatStepper,
    ReactiveFormsModule,
    AssessorPersonalInformationComponent,
    AssessorIdentificationComponent,
    AssessorContactComponent,
    MatStepperNext,
    MatStepperPrevious,
    AssessorEducationBackgroundComponent,
    AssessorEmploymentHistoryComponent,
    MatStepLabel,
    AssessorDocumentComponent,
    AssessorReferenceComponent,
    AssessorCertificationComponent,
    AssessorPreferenceComponent,
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
    <mat-horizontal-stepper [linear]="true">
      <mat-step>
        <ng-template matStepLabel>Personal Information</ng-template>
        <app-personal-information />
        <div class="mt-4 flex justify-end">
          <button mat-button [disabled]="!assessor" matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>ID</ng-template>
        <app-assessor-identification />
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Contacts</ng-template>
        <app-assessor-contact />
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Education Background</ng-template>
        <app-assessor-education-background />
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Employment History</ng-template>
        <app-assessor-employment-history />
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Certifications</ng-template>
        <app-assessor-certification />
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Preferences</ng-template>
        <app-assessor-preferences />
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Documents & Attachments</ng-template>
        <app-assessor-document />
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      <mat-step>
        <ng-template matStepLabel>Referees</ng-template>
        <app-assessor-references />
        <div class="mt-4 flex justify-end">
          <button mat-button matStepperPrevious>Back</button>
        </div>
      </mat-step>
    </mat-horizontal-stepper>
  `,
})
export class UpdateProfileComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  assessor: Assessor | undefined = undefined;

  constructor(private assessorService: AssessorService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: (response) => {
        this.assessor = response.data;
      },
    });
  }
}
