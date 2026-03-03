import { Component, OnInit } from '@angular/core';
import { FormService } from './services/form.service';
import { Form } from './types';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { SearchComponent } from 'components/search/search.component';
import { ActionButtonComponent } from 'components/action-button/action-button.component';
import { CantPipe } from '../../app/pipes/cant.pipe';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';
import { DialogComponent } from 'components/dialog/dialog.component';
import { FormSectionScoresDialogComponent } from './components/form-section-scores.component';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';

@Component({
  selector: 'app-form-list',
  standalone: true,
  template: `
    <container>
      <app-header title="Forms Management" />
      <app-wrapper>
        <app-search
          class="w-full md:w-auto border border-gray-300 rounded-lg"
          (onSearch)="handleSearch($event)"
        />
        <action-button
          label="ADD NEW"
          class="w-full md:w-auto"
          icon="add"
          [isDisabled]="'' | cant: 'create' : 'Form'"
          routerLink="/forms/create"
        />
      </app-wrapper>

      <div class="py-6">
        <div
          *ngIf="isLoading"
          class="flex flex-col items-center justify-center py-16"
        >
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          ></div>
          <p class="mt-4 text-gray-600 font-medium">Loading forms...</p>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="!isLoading && forms.length === 0"
          class="bg-white rounded-xl shadow-sm border border-blue-100 p-8 text-center"
        >
          <div
            class="bg-blue-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4"
          >
            <mat-icon class="text-blue-500 transform scale-150"
              >description</mat-icon
            >
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            No forms found
          </h3>
          <p class="text-gray-600 mb-6">
            Get started by creating your first form
          </p>
          <button
            routerLink="/forms/create"
            class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors duration-200"
          >
            <mat-icon>add</mat-icon>
            <span>Create New Form</span>
          </button>
        </div>

        <!-- Form Cards Grid -->
        <div
          *ngIf="!isLoading && forms.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            *ngFor="let form of forms"
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div class="p-6">
              <h5 class="text-xl font-semibold text-gray-800 mb-2">
                {{ form.name }}
              </h5>
              <p class="text-gray-600 mb-4 line-clamp-2 min-h-[48px]">
                {{ form.description || 'No description provided' }}
              </p>
              <div class="flex items-center text-gray-500">
                <mat-icon class="text-blue-500 mr-2 text-sm">folder</mat-icon>
                <span class="text-sm">{{ form.sections.length }} Sections</span>
              </div>
            </div>

            <div class="border-t border-gray-100 px-6 py-4 bg-gray-50">
              <div class="flex flex-wrap gap-3 justify-between">
                <!-- Management Actions -->
                <div class="flex gap-2">
                  <icon-button
                    icon="launch"
                    tooltip="Edit Form"
                    [routerLink]="['/forms/edit', form.uuid]"
                    class="inline-flex items-center justify-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  />

                  <icon-button
                    icon="delete"
                    tooltip="Edit Form"
                    (action)="openConfirmDialog(form)"
                    class="inline-flex items-center justify-center border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                  />
                </div>

                <!-- Usage Actions -->
                <div class="flex gap-2">
                  <icon-button
                    icon="format_list_bulleted"
                    tooltip="View Section Scores"
                    (action)="openSectionScoresDialog(form)"
                    class="inline-flex items-center justify-center  bg-green-600 text-white rounded-lg hover:bg-green-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <app-confirm-dialog
        [open]="isDialogOpen"
        [title]="'Delete Form'"
        [message]="'Are you sure you want to delete this form?'"
        (onClose)="closeConfirmDialog()"
        (onConfirm)="handleConfirm()"
      />

      <app-dialog
        [open]="isSectionScoresDialogOpen"
        (onClose)="closeSectionScoresDialog()"
        width="840px"
        title="Section Scores"
      >
        <ng-template>
          <app-form-section-scores-dialog
            [formUuid]="selectedFormForScores?.uuid || ''"
            (closeDialog)="closeSectionScoresDialog()"
          />
        </ng-template>
      </app-dialog>
    </container>
  `,
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    ContainerComponent,
    HeaderComponent,
    WrapperComponent,
    SearchComponent,
    ActionButtonComponent,
    IconButtonComponent,
    CantPipe,
    ConfirmDialogComponent,
    DialogComponent,
    FormSectionScoresDialogComponent,
  ],
})
export class FormListComponent implements OnInit {
  forms: Form[] = [];
  isLoading = true;
  isDialogOpen = false;
  isSectionScoresDialogOpen = false;
  selectedItem!: Form;
  selectedFormForScores!: Form;
  searchTerm: string = '';

  paginationParams: any = {
    page: 0,
    size: 10,
  };

  dataLength = 0;
  pageSize = 10;
  page = 0;

  constructor(
    private formService: FormService,
    private dialog: MatDialog,
  ) {}

  async ngOnInit() {
    await this.loadForms();
  }

  async loadForms() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'id,desc',
    };

    if (this.searchTerm && this.searchTerm.length > 0) {
      query['name'] = this.searchTerm;
      query['description'] = this.searchTerm;
      query['propertyType'] = this.searchTerm;
    }

    this.isLoading = true;
    this.formService.getAllForms({ ...query, size: this.pageSize }).subscribe(
      (data) => {
        this.forms = data.data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading forms:', error);
        this.isLoading = false;
      },
    );
  }

  openConfirmDialog(data: Form) {
    this.selectedItem = data;
    this.isDialogOpen = true;
  }

  closeConfirmDialog() {
    this.isDialogOpen = false;
  }

  async handleConfirm() {
    const response = await lastValueFrom(
      this.formService.deleteForm(this.selectedItem.uuid),
    );
    this.closeConfirmDialog();
    await this.loadForms();
  }

  handleSearch(query: string): void {
    this.searchTerm = query;
    this.page = 0;
    this.paginationParams.page = 0;
    this.loadForms();
  }

  openSectionScoresDialog(form: Form): void {
    this.selectedFormForScores = form;
    this.isSectionScoresDialogOpen = true;
  }

  closeSectionScoresDialog(): void {
    this.isSectionScoresDialogOpen = false;
    this.selectedFormForScores = undefined!;
  }
}
