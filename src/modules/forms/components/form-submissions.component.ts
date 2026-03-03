import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormSubmissionService } from '../services/form-submission.service';
import { FormSubmission } from '../types';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-form-submissions-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Submissions for: {{ formName }}</h1>
        <a
          [routerLink]="['/manage-forms']"
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
        >
          Back to Forms
        </a>
      </div>

      <div *ngIf="isLoading" class="text-center py-10">
        <mat-icon
          class="animate-spin h-8 w-8 text-blue-600 mx-auto"
          aria-hidden="true"
          >refresh</mat-icon
        >
        <p class="mt-2 text-gray-600">Loading submissions...</p>
      </div>

      <div
        *ngIf="!isLoading && submissions.length === 0"
        class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded"
      >
        <p>No submissions found for this form.</p>
      </div>

      <div
        *ngIf="!isLoading && submissions.length > 0"
        class="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Submitted By
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let submission of submissions">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ submission.submittedBy }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ submission.submittedAt | date: 'medium' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a
                  [routerLink]="['/submissions', submission.uuid]"
                  class="text-blue-600 hover:text-blue-900"
                  >View Details</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class FormSubmissionsListComponent implements OnInit {
  formUuid: string = '';
  formName: string = 'Form';
  submissions: FormSubmission[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private submissionService: FormSubmissionService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.formUuid = params['uuid'];
      this.loadSubmissions();
    });
  }

  async loadSubmissions() {
    try {
      this.isLoading = true;
      const response = await lastValueFrom(
        this.submissionService.getSubmissionsByFormId(this.formUuid),
      );

      this.submissions = response['data'] || [];
      if (this.submissions.length > 0 && this.submissions[0].form) {
        this.formName = this.submissions[0].form.name;
      }
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
