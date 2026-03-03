import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from 'components/table/table.component';
import { MatIconModule } from '@angular/material/icon';
import { provideIcons } from '@ng-icons/core';
import {
  heroEye,
  heroCheckCircle,
  heroXCircle,
  heroClock,
  heroFunnel,
} from '@ng-icons/heroicons/outline';
import { HeaderComponent } from 'components/header/header.component';
import { lastValueFrom } from 'rxjs';
import { DEFAULT_SEARCH_PARAMS } from 'utils/helpers';
import { ContainerComponent } from 'components/container/container.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { DialogComponent } from 'components/dialog/dialog.component';
import { AssessmentRequestService } from '../services/assessment-request.service';
import { 
  AssessmentRequest, 
  AssessmentRequestStatus, 
  AssessmentRequestFilters 
} from '../types/assessment-request.types';
import { AssessmentRequestViewDialogComponent } from './assessment-request-view-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-request-list',
  standalone: true,
  viewProviders: [
    provideIcons({
      heroEye,
      heroCheckCircle,
      heroXCircle,
      heroClock,
      heroFunnel,
    }),
  ],
  imports: [
    CommonModule,
    TableComponent,
    MatIconModule,
    HeaderComponent,
    ContainerComponent,
    IconButtonComponent,
    DialogComponent,
    AssessmentRequestViewDialogComponent,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <container>
      <app-header title="Assessment Request Approvals" />
      
      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <mat-select formControlName="status" placeholder="All Statuses" class="w-full">
              <mat-option value="">All Statuses</mat-option>
              <mat-option 
                *ngFor="let status of statusOptions" 
                [value]="status.value"
              >
                {{ status.label }}
              </mat-option>
            </mat-select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
            <mat-form-field class="w-full">
              <input matInput formControlName="hotelName" placeholder="Search by hotel name">
            </mat-form-field>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <mat-form-field class="w-full">
              <input matInput formControlName="email" placeholder="Search by email">
            </mat-form-field>
          </div>
          
          <div class="flex items-end gap-2">
            <button 
              type="button" 
              mat-raised-button 
              color="primary"
              (click)="applyFilters()"
              class="flex-1"
            >
              <mat-icon>filter_list</mat-icon>
              Filter
            </button>
            <button 
              type="button" 
              mat-button 
              (click)="clearFilters()"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6" *ngIf="statistics">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <mat-icon class="text-yellow-600">pending</mat-icon>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending</p>
              <p class="text-2xl font-semibold text-gray-900">{{ statistics.SUBMITTED || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <mat-icon class="text-blue-600">rate_review</mat-icon>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Under Review</p>
              <p class="text-2xl font-semibold text-gray-900">{{ statistics.UNDER_REVIEW || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <mat-icon class="text-green-600">check_circle</mat-icon>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Approved</p>
              <p class="text-2xl font-semibold text-gray-900">{{ statistics.APPROVED || 0 }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <mat-icon class="text-red-600">cancel</mat-icon>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Rejected</p>
              <p class="text-2xl font-semibold text-gray-900">{{ statistics.REJECTED || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <app-table
        [data]="data"
        [columns]="columns"
        [dataLength]="dataLength"
        [tableClass]="'min-w-full bg-white rounded-lg shadow-lg'"
        (handePagination)="getPaginatedData($event)"
        [pageSize]="pageSize"
        [page]="page"
      >
        <!-- Status Column Template -->
        <ng-template #statusTemplate let-item>
          <span 
            class="px-2 py-1 text-xs font-medium rounded-full"
            [ngClass]="getStatusBadgeClass(item.status)"
          >
            {{ item.statusDisplayName }}
          </span>
        </ng-template>

        <!-- Completion Column Template -->
        <ng-template #completionTemplate let-item>
          <div class="flex items-center">
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full" 
                [style.width.%]="item.completionPercentage"
              ></div>
            </div>
            <span class="ml-2 text-sm text-gray-600">{{ item.completionPercentage | number:'1.0-0' }}%</span>
          </div>
        </ng-template>

        <!-- Actions Column Template -->
        <ng-template #actionTemplate let-item>
          <div class="flex items-center gap-2">
            <icon-button
              icon="heroEye"
              tooltip="View Details"
              (action)="viewRequest(item)"
              color="primary"
            />
            
            <icon-button
              *ngIf="item.status === 'SUBMITTED'"
              icon="heroClock"
              tooltip="Set Under Review"
              (action)="setUnderReview(item)"
              color="accent"
            />
            
            <icon-button
              *ngIf="item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW'"
              icon="heroCheckCircle"
              tooltip="Approve"
              (action)="approveRequest(item)"
              color="primary"
              class="text-green-600"
            />
            
            <icon-button
              *ngIf="item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW'"
              icon="heroXCircle"
              tooltip="Reject"
              (action)="rejectRequest(item)"
              color="warn"
              class="text-red-600"
            />
          </div>
        </ng-template>
      </app-table>

      <!-- View Dialog -->
      <app-dialog
        [open]="isViewDialogOpen"
        (onClose)="handleViewClose($event)"
        width="1200px"
        title="Assessment Request Details"
      >
        <ng-template>
          <app-assessment-request-view-dialog 
            [request]="selectedRequest" 
            (onApprove)="handleApprove($event)"
            (onReject)="handleReject($event)"
            (onSetUnderReview)="handleSetUnderReview($event)"
          />
        </ng-template>
      </app-dialog>
    </container>
  `,
})
export class AssessmentRequestListComponent implements OnInit {
  isViewDialogOpen = false;
  data: AssessmentRequest[] = [];
  selectedRequest!: AssessmentRequest;
  statistics: any = {};

  // Pagination
  dataLength = 0;
  pageSize = 10;
  page = 0;
  paginationParams = { page: 0, size: 10 };

  // Filter form
  filterForm: FormGroup;
  currentFilters: AssessmentRequestFilters = {};

  columns = [
    { label: 'Hotel Name', value: 'facilityName' },
    { label: 'Contact Person', value: 'contactPerson' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phoneNumber' },
    { label: 'Status', value: 'status', template: 'statusTemplate' },
    { label: 'Completion', value: 'completionPercentage', template: 'completionTemplate' },
    { label: 'Submitted', value: 'submittedAt' },
    { label: 'Actions', value: 'actions', template: 'actionTemplate' },
  ];

  statusOptions = [
    { value: AssessmentRequestStatus.SUBMITTED, label: 'Submitted' },
    { value: AssessmentRequestStatus.UNDER_REVIEW, label: 'Under Review' },
    { value: AssessmentRequestStatus.APPROVED, label: 'Approved' },
    { value: AssessmentRequestStatus.REJECTED, label: 'Rejected' },
  ];

  constructor(
    private assessmentRequestService: AssessmentRequestService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      hotelName: [''],
      email: [''],
    });
  }

  async ngOnInit() {
    await this.loadData();
    await this.loadStatistics();
  }

  async loadData() {
    try {
      const query = { 
        ...this.paginationParams, 
        ...DEFAULT_SEARCH_PARAMS,
        ...this.currentFilters
      };
      
      const response = await lastValueFrom(
        this.assessmentRequestService.getAssessmentRequests(query)
      );

      this.data = response.data || [];
      this.dataLength = response.total || 0;
    } catch (error) {
      console.error('Error loading assessment requests:', error);
    }
  }

  async loadStatistics() {
    try {
      const response = await lastValueFrom(
        this.assessmentRequestService.getStatusStatistics()
      );
      this.statistics = response.data || {};
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }

  async getPaginatedData(event: any) {
    this.paginationParams = {
      page: event.pageIndex,
      size: event.pageSize,
    };
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    await this.loadData();
  }

  applyFilters() {
    const formValue = this.filterForm.value;
    this.currentFilters = {};
    
    if (formValue.status) {
      this.currentFilters.status = formValue.status;
    }
    if (formValue.hotelName) {
      this.currentFilters.hotelName = formValue.hotelName;
    }
    if (formValue.email) {
      this.currentFilters.email = formValue.email;
    }
    
    this.paginationParams.page = 0;
    this.page = 0;
    this.loadData();
  }

  clearFilters() {
    this.filterForm.reset();
    this.currentFilters = {};
    this.paginationParams.page = 0;
    this.page = 0;
    this.loadData();
  }

  viewRequest(request: AssessmentRequest) {
    this.selectedRequest = request;
    this.isViewDialogOpen = true;
  }

  async setUnderReview(request: AssessmentRequest) {
    try {
      await lastValueFrom(
        this.assessmentRequestService.setUnderReview(request.uuid)
      );
      await this.loadData();
      await this.loadStatistics();
    } catch (error) {
      console.error('Error setting under review:', error);
    }
  }

  async approveRequest(request: AssessmentRequest) {
    this.selectedRequest = request;
    this.isViewDialogOpen = true;
    // The approval will be handled in the view dialog
  }

  async rejectRequest(request: AssessmentRequest) {
    this.selectedRequest = request;
    this.isViewDialogOpen = true;
    // The rejection will be handled in the view dialog
  }

  async handleApprove(data: { uuid: string; notes?: string }) {
    try {
      await lastValueFrom(
        this.assessmentRequestService.approveAssessmentRequest(data.uuid, data.notes)
      );
      this.isViewDialogOpen = false;
      await this.loadData();
      await this.loadStatistics();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  }

  async handleReject(data: { uuid: string; notes: string }) {
    try {
      await lastValueFrom(
        this.assessmentRequestService.rejectAssessmentRequest(data.uuid, data.notes)
      );
      this.isViewDialogOpen = false;
      await this.loadData();
      await this.loadStatistics();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  }

  async handleSetUnderReview(data: { uuid: string; notes?: string }) {
    try {
      await lastValueFrom(
        this.assessmentRequestService.setUnderReview(data.uuid, data.notes)
      );
      this.isViewDialogOpen = false;
      await this.loadData();
      await this.loadStatistics();
    } catch (error) {
      console.error('Error setting under review:', error);
    }
  }

  handleViewClose(event: boolean) {
    this.isViewDialogOpen = event;
  }

  getStatusBadgeClass(status: AssessmentRequestStatus): string {
    return this.assessmentRequestService.getStatusBadgeClass(status);
  }
}