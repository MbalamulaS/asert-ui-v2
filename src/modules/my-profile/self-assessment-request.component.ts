import { Component, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash, } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from "@angular/forms";
import { HotelResponseDto } from "modules/assessment/assessment";
import { AssessorService } from "modules/assessment/assessor.service";
import { Router } from "@angular/router";
import { DEFAULT_SEARCH_PARAMS } from "utils/helpers";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { ConfirmDialogComponent } from "components/confirm/confirm.dialog";
import { ContainerComponent } from "components/container/container.component";
import { DataCollectionFormComponent } from "modules/my-profile/data-collection-form.component";
import { DialogComponent } from "components/dialog/dialog.component";
import { HeaderComponent } from "components/header/header.component";
import { HotelCardComponent } from "modules/facility/components/facility-card.component";
import { NgForOf, NgIf } from "@angular/common";


@Component({
  selector: 'app-assessor-self-assessment-request',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    ContainerComponent,
    DataCollectionFormComponent,
    DialogComponent,
    HeaderComponent,
    HotelCardComponent,
    MatPaginator,
    NgForOf,
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
    <container>
      <app-header title="New Assignments(Self Assessment Request)"/>
      <div
        *ngIf="!isLoading && data && data.length > 0"
        class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <app-hotel-card
          *ngFor="let hotel of data"
          [hotel]="hotel"
          [onView]="getViewHandler(hotel)"
          [onSubmitAssessment]="openSubmissionConfirmation(hotel)"
          [onCollectAssessmentData]="openDataCollectionForm(hotel)"
        ></app-hotel-card>
      </div>

      <div
        *ngIf="
            !isLoading && data && data.length > 0 && dataLength > pageSize
          "
        class="mt-6 flex justify-center"
      >
        <mat-paginator
          [length]="dataLength"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50,100,200,250,500,1000]"
          (page)="onPageChange($event)"
          aria-label="Select page"
        >
        </mat-paginator>
      </div>

      <app-dialog
        [open]="dataCollectionFormOpen"
        (onClose)="closeDataCollectionForm($event)"
        width="960px"
        title="Assessment Form"
      >
        <ng-template>
          <app-assessor-data-collection-form (onSubmit)="saveData($event)"/>
        </ng-template>
      </app-dialog>

      <app-confirm-dialog
        [open]="isConfirmSubmissionDialogOpen"
        [title]="'Data Submission Confirmation'"
        [message]="'Are you sure you want to submit this data?'"
        (onClose)="closeConfirmSubmissionDialog($event)"
        (onConfirm)="submitAssessment()"
      />
    </container>
  `,
})
export class SelfAssessmentRequestComponent implements OnInit {
  dataCollectionFormOpen = false;
  isConfirmSubmissionDialogOpen = false;
  data: HotelResponseDto[] = [];
  selectedIem!: HotelResponseDto;
  paginationParams: any = {
    page: 0,
    size: 10,
  };
  isLoading = false;
  dataLength = 0;
  pageSize = 10;
  page = 0;

  constructor(
    public service: AssessorService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  openDataCollectionForm(row: HotelResponseDto): () => void {
    return () => {
      this.router.navigate(['/establishment-details'], {
        queryParams: {uuid: row.uuid},
      });
    }
  }

  closeDataCollectionForm(result: boolean): void {
    this.dataCollectionFormOpen = false;
  }

  async loadData() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'dateAssigned,desc',
    };
    this.isLoading = true
    this.service.myNewAssignments({...query, size: this.pageSize, selfAssessmentRequest: true}).subscribe({
      next: (response) => {
        const {page, size, total, data} = response;
        this.isLoading = false;
        this.paginationParams = {
          page: page - 1,
          size,
        };

        this.data = this.mapData(data);
        this.dataLength = total;
      },
      error: (error) => {
        this.isLoading = false;
      }
    })
  }

  mapData = (data: HotelResponseDto[]) => {
    return data.map((item: HotelResponseDto) => ({
      ...item,
    }));
  };

  saveData(event: any) {

  }

  closeConfirmSubmissionDialog(event: any) {
    this.isConfirmSubmissionDialogOpen = false;
  }

  openSubmissionConfirmation(hotelResponseDto: HotelResponseDto): () => void {
    return () => {
      this.selectedIem = hotelResponseDto;
      this.isConfirmSubmissionDialogOpen = true;
    }
  }

  submitAssessment() {
    this.service.submitAssessment(this.selectedIem.id).subscribe({
      next: (response) => {
        this.page = 0;
        this.paginationParams.page = 0;
        this.loadData();
      },
      error: (error) => {
      }
    })
  }

  viewHotel(hotel: HotelResponseDto): void {
    this.router.navigate(['/establishment-details'], {
      queryParams: {uuid: hotel.uuid},
    });
  }

  getViewHandler(hotel: HotelResponseDto): () => void {
    return () => this.viewHotel(hotel);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.paginationParams.page = event.pageIndex;
    this.paginationParams.size = event.pageSize;
    this.loadData();
  }
}
