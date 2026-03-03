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
import { ContainerComponent } from "components/container/container.component";
import { DialogComponent } from "components/dialog/dialog.component";
import { HeaderComponent } from "components/header/header.component";
import { NgForOf, NgIf } from "@angular/common";
import { ScoreComponent } from "modules/assessment-assignment/score.component";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { HotelCardComponent } from "modules/facility/components/facility-card.component";


@Component({
  selector: 'app-assessor-assignment-awaiting-approval',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    ContainerComponent,
    DialogComponent,
    HeaderComponent,
    NgIf,
    ScoreComponent,
    HotelCardComponent,
    MatPaginator,
    NgForOf,

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
      <app-header title="Assignments Awaiting Approval"/>
      <div
        *ngIf="!isLoading && data && data.length > 0"
        class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <app-hotel-card
          *ngFor="let hotel of data"
          [hotel]="hotel"
          [onView]="getViewHandler(hotel)"
          [onViewScore]="openScoreSheet(hotel)"
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
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          aria-label="Select page"
        >
        </mat-paginator>
      </div>

      <app-dialog
        [open]="scoreSheetOpen"
        (onClose)="closeScoreSheet($event)"
        width="960px"
        title="Score"
      >
        <ng-template>
          <app-assessor-data-score [hotelResponseDto]="selectedIem"/>
        </ng-template>
      </app-dialog>
    </container>
  `,
})
export class MyAssignmentAwaitingApprovalComponent implements OnInit {
  scoreSheetOpen = false;
  data: HotelResponseDto[] = [];
  selectedIem!: HotelResponseDto;
  paginationParams: any = {
    page: 0,
    size: 10,
  };
  isLoading = false
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

  openScoreSheet(row: HotelResponseDto): () => void {
    return () => {
      this.scoreSheetOpen = true;
    }
  }

  closeScoreSheet(result: boolean): void {
    this.scoreSheetOpen = false;
  }

  loadData() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'dateAssigned,asc',
    };
    this.isLoading = true;

    this.service.mySubmittedAssignments({...query, size: this.pageSize}).subscribe({
      next: (response) => {
        const {page, size, total, data} = response;
        this.isLoading = false;
        this.paginationParams = {
          page: page - 1,
          size,
        };
        this.data = this.mapData(data);
        this.dataLength = total;
      }, error: (error) => {
        this.isLoading = false;

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

  mapData = (data: HotelResponseDto[]) => {
    return data.map((item: HotelResponseDto) => ({
      ...item,
    }));
  };
}
