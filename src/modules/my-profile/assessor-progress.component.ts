import {Component, Input, OnInit} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {AssessorService} from "modules/assessment/assessor.service";
import {NgClass, NgIf, NgStyle} from "@angular/common";
import {ConfirmDialogComponent} from "components/confirm/confirm.dialog";
import {Assessor} from "modules/assessment/assessment";

export interface ProfileCompletionResponse {
  data: number;
}


@Component({
  selector: 'app-assessor-progress',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    NgStyle,
    NgClass,
    ConfirmDialogComponent,
    NgIf,


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
    <div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <!-- Header: Label + % -->
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">Profile Completion</span>
        <span
          class="text-sm font-semibold text-gray-700">{{ (assessor?.completionPercentage ? assessor.completionPercentage : 0) }}
          %</span>
      </div>

      <!-- Progress Bar -->
      <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          [ngStyle]="{ width: (assessor?.completionPercentage ?assessor.completionPercentage:0) + '%' }"
          [ngClass]="getProgressColor(assessor?.completionPercentage)"
        ></div>
      </div>

      <!-- Description -->
      <p class="mt-2 text-xs text-gray-500">
        Complete your profile to 100% to be eligible for assessments.
      </p>

      <!-- Submit Button -->
      <div class="mt-4 flex justify-end"
           *ngIf="(!assessor?.dateApplied || assessor?.dateRejected) && !assessor?.dateVerified && showButton && assessor">
        <button
          type="button"
          class="text-white px-5 py-2 rounded-md text-sm shadow-md transition-all duration-300"
          [ngClass]="[getProgressColor(assessor?.completionPercentage), getHoverColor(assessor?.completionPercentage)]"
          (click)="openConfirmDialog()"
        >
          {{ !assessor?.dateApplied ? "✅ Submit Application" : "✅ Re-submit Application" }}
        </button>
      </div>
    </div>

    <app-confirm-dialog
      [open]="isConfirmationDialogOpen"
      [title]="'Application Submission Confirmation'"
      [message]="'Are you sure you want to submit this profile?'"
      (onClose)="closeConfirmDialog($event)"
      (onConfirm)="handleConfirmSubmission()"
    />
  `,
})
export class AssessorProgressComponent implements OnInit {
  assessor: Assessor = null;
  isConfirmationDialogOpen = false;
  @Input() id: number = 0;
  @Input() showButton: boolean = true;

  constructor(private assessorService: AssessorService) {
  }

  ngOnInit(): void {
    this.loadProgress();
  }

  loadProgress() {
    this.assessorService.getProfileProgress(this.id).subscribe({
      next: (res) => {
        this.assessor = res.data;
      },
      error: (err) => {
        console.error('Failed to load profile completion', err);
      }
    });
  }

  getProgressColor(percent: number): string {
    if (percent < 41) {
      return 'bg-red-500';
    } else if (percent < 71) {
      return 'bg-yellow-400';
    } else if (percent < 100) {
      return 'bg-blue-500';
    } else {
      return 'bg-green-600';
    }
  }

  getHoverColor(percent: number): string {
    if (percent < 41) return 'hover:bg-red-600';
    else if (percent < 71) return 'hover:bg-yellow-500';
    else if (percent < 100) return 'hover:bg-blue-600';
    else return 'hover:bg-green-700';
  }

  openConfirmDialog() {
    this.isConfirmationDialogOpen = true;
  }

  closeConfirmDialog(event: any) {
    this.isConfirmationDialogOpen = false;
  }

  handleConfirmSubmission() {
    this.assessorService.submitApplication().subscribe({
      next: () => {
        console.log('Profile submitted!');
      },
      error: (err) => {
        console.error('Failed to submit profile', err);
      }
    });
  }
}
