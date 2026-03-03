import {Component, OnInit} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Assessor} from "modules/assessment/assessment";
import {AssessorService} from "modules/assessment/assessor.service";
import {ActionButtonComponent} from "components/action-button/action-button.component";
import {AssessorProgressComponent} from "modules/my-profile/assessor-progress.component";
import {ContainerComponent} from "components/container/container.component";
import {DialogComponent} from "components/dialog/dialog.component";
import {HeaderComponent} from "components/header/header.component";
import {NgIf} from "@angular/common";
import {WrapperComponent} from "components/wrapper/wrapper.component";
import {
  AssessorIdentificationFormComponent
} from "modules/my-profile/identification/assessor-identification-form.component";

@Component({
  selector: 'app-assessor-identification',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ActionButtonComponent,
    AssessorProgressComponent,
    ContainerComponent,
    DialogComponent,
    HeaderComponent,
    NgIf,
    WrapperComponent,
    AssessorIdentificationFormComponent,

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
    <container>
      <app-header title="Identification"/>

      <app-wrapper>
        <app-assessor-progress></app-assessor-progress>
      </app-wrapper>

      <app-wrapper *ngIf="assessor">
        <div class="w-full flex justify-end">
          <action-button
            label="Edit Identification"
            icon="{{ assessor ? 'edit' : 'add' }}"
            class="w-full md:w-auto"
            (action)="openFormDialog()"
          />
        </div>
      </app-wrapper>

      <ng-container *ngIf="assessor; else noData">
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex flex-col md:flex-row gap-6 items-start">

            <!-- Info Section -->
            <div class="w-full md:w-2/3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700">
                <div>
                  <span class="font-medium text-gray-500">ID Type:</span>
                  <div>{{ assessor.identificationType }}</div>
                </div>
                <div>
                  <span class="font-medium text-gray-500">ID Number:</span>
                  <div>{{ assessor.identificationId }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Fallback -->
      <ng-template #noData>
        <div class="text-center text-gray-500 mt-10">
          <p class="text-sm">No personal information found.</p>
          <p class="mt-2 text-sm">Click "Fill Personal Information first" to get started.</p>
          <div class="mt-4 flex justify-center">
            <action-button
              label="Initialize Profile"
              icon="add"
              class="w-full md:w-auto"
              (action)="openFormDialog()"
            />
          </div>
        </div>
      </ng-template>

      <!-- Dialog -->
      <app-dialog
        [open]="isOpen"
        (onClose)="handleClose()"
        width="740px"
        title="ID form"
      >
        <ng-template>
          <app-assessor-identification-form (onSubmit)="saveData($event)"/>
        </ng-template>
      </app-dialog>
    </container>
  `,
})
export class AssessorIdentificationComponent implements OnInit {
  assessor: Assessor | undefined = undefined;
  isOpen = false;

  constructor(
    private assessorService: AssessorService,
  ) {
  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData(): void {
    this.assessorService.getCurrentUserAssessorData().subscribe({
      next: response => {
        this.assessor = response.data
      }
    });
  }

  openFormDialog(): void {
    this.isOpen = true;
  }

  handleClose(): void {
    this.isOpen = false;
    this.assessorService.clearIdForm();
    this.ngOnInit();
  }

  saveData(data: any): void {
    const payload = {
      ...this.assessor,
      identificationType: data.identificationType,
      identificationId: data.identificationId,
    } as Assessor;

    this.assessorService.update(data.uuid, payload).subscribe({
      next: response => {
        this.isOpen = false;
        this.loadData();
      },
      error: error => {
      }
    });
  }
}
