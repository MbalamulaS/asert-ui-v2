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
import { lastValueFrom } from "rxjs";
import { ContainerComponent } from "components/container/container.component";
import { HeaderComponent } from "components/header/header.component";
import { NgForOf, NgIf } from "@angular/common";
import { HotelCardComponent } from "modules/facility/components/facility-card.component";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { DialogComponent } from "components/dialog/dialog.component";
import { ScoreComponent } from "modules/assessment-assignment/score.component";


@Component({
  selector: 'app-assessment-completed-assignments',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    ContainerComponent,
    HeaderComponent,
    NgIf,
    HotelCardComponent,
    NgForOf,
    MatPaginator,
    DialogComponent,
    ScoreComponent,

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
      <app-header title="Completed Assignments"/>

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
export class CompletedAssessmentAssignmentComponent implements OnInit {
  isLoading = false;
  data: HotelResponseDto[] = [];
  selectedIem!: HotelResponseDto;
  paginationParams: any = {
    page: 0,
    size: 10,
  };
  scoreSheetOpen = false;

  dataLength = 0;
  pageSize = 10;
  page = 0;

  constructor(
    public service: AssessorService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.fetchitems();
  }

  async fetchitems() {
    let query = {
      ...this.paginationParams,
      ...DEFAULT_SEARCH_PARAMS,
      sort: 'dateAssigned,asc',
    };

    const response = await lastValueFrom(
      this.service.completedAssignments({...query, size: this.pageSize}),
    );

    const {page, size, total, data} = response;

    this.paginationParams = {
      page: page - 1,
      size,
    };

    this.data = this.mapData(data);
    this.dataLength = total;
  }

  mapData = (data: HotelResponseDto[]) => {
    return data.map((item: HotelResponseDto) => ({
      ...item,
    }));
  };

  closeScoreSheet(result: boolean): void {
    this.scoreSheetOpen = false;
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
    this.fetchitems();
  }


  openScoreSheet(row: HotelResponseDto): () => void {
    return () => {
      this.scoreSheetOpen = true;
    }
  }
}
