import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Assessor } from 'modules/assessment/assessment';

@Component({
  selector: 'app-assessor-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div
      class="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div class="relative">
        <div class="p-4">
          <div
            class="inline-flex items-center bg-yellow-400 text-gray-800 text-sm font-medium px-2 py-1 rounded-md shadow-sm"
          >
            <mat-icon class="text-sm align-middle mr-0.5">star</mat-icon>
            <span class="text-xs align-middle">Accredited</span>
          </div>
        </div>
        <div class="overflow-hidden flex items-center justify-center">
          <div
            class="h-40 w-40 rounded-full bg-gray-500 border-4 border-gray-300 items-center overflow-hidden"
          >
            <img
              *ngIf="getAssessorImage(assessor)"
              [src]="getAssessorImage(assessor)"
              [alt]="assessor.name"
              class="object-full h-full w-full transition-transform duration-300 hover:scale-105"
            />
            <img
              *ngIf="!getAssessorImage(assessor)"
              src="assets/avatar/user.jpg"
              [alt]="assessor.name"
              class="object-full h-full w-full transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>

      <div class="p-4 text-center">
        <h3
          class="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-100"
        >
          {{ assessor.name }}
        </h3>
        <p class="text-sm text-gray-500 mb-3 flex items-center">
          <mat-icon
            class="text-gray-400 mr-1"
            style="font-size: 16px; height: 16px; width: 16px;"
            >location_on
          </mat-icon>
          {{ assessor.locationName }}
        </p>

        <div class="space-y-2 mb-4">
          <div
            class="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-300"
          >
            <mat-icon class="text-blue-600 mr-2">phone</mat-icon>
            <a [href]="'tel:' + assessor.phone">{{ assessor.phone }}</a>
          </div>
          <div
            class="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-300"
          >
            <mat-icon class="text-blue-600 mr-2">email</mat-icon>
            <a [href]="'mailto:' + assessor.email">{{ assessor.email }}</a>
          </div>
        </div>

        <button
          (click)="viewMore.emit(assessor)"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 ease-in-out flex items-center justify-center"
        >
          View Profile
        </button>
      </div>
    </div>
  `,
})
export class AssessorCardComponent {
  @Input() assessor!: Assessor;
  @Output() viewMore = new EventEmitter<Assessor>();

  getAssessorImage(assessor: Assessor): string {
    if (assessor?.profilePhoto?.uuid) {
      return `/api/v1/uploads/${assessor.profilePhoto.uuid}/view`;
    }
    return '';
  }
}
