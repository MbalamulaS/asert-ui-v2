import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroEye,
  heroPencilSquare,
  heroLightBulb,
  heroChevronDown,
  heroChevronUp,
} from '@ng-icons/heroicons/outline';
import { DialogComponent } from 'components/dialog/dialog.component';
import { HeaderComponent } from 'components/header/header.component';
import { WrapperComponent } from 'components/wrapper/wrapper.component';
import { ContainerComponent } from 'components/container/container.component';
import { SelectComponent } from 'components/select/select.component';
import {
  ExpandableTableComponent,
  ExpandableTableGroup,
} from 'components/expandable-table/expandable-table.component';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import {
  AssessmentVarianceLog,
  VarianceFilterOptions,
} from '../../types/variance.types';
import { VarianceService } from '../../services/variance.service';

@Component({
  selector: 'app-variance-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    NgIconComponent,
    DialogComponent,
    HeaderComponent,
    WrapperComponent,
    ContainerComponent,
    SelectComponent,
    ExpandableTableComponent,
    IconButtonComponent,
  ],
  providers: [
    provideIcons({
      heroEye,
      heroPencilSquare,
      heroLightBulb,
      heroChevronDown,
      heroChevronUp,
    }),
  ],
  template: `
    <container>
      <app-header title="Assessment Variance Log" />

      <app-wrapper>
        <div class="flex justify-between items-center">
          <app-select
            class="w-full md:w-48"
            label="Filter by Status"
            name="status"
            [(ngModel)]="filters.status"
            [options]="statusOptions"
            (onOptionSelected)="onFilterChange()"
          />

          <div class="flex gap-2">
            <button
              mat-button
              (click)="expandableTable?.expandAll()"
              class="text-blue-600"
            >
              <mat-icon>unfold_more</mat-icon>
              Expand All
            </button>
            <button
              mat-button
              (click)="expandableTable?.collapseAll()"
              class="text-blue-600"
            >
              <mat-icon>unfold_less</mat-icon>
              Collapse All
            </button>
          </div>
        </div>
      </app-wrapper>

      <app-expandable-table
        #expandableTable
        [groups]="groupedVariances"
        [columns]="columns"
        emptyMessage="No variances detected"
      >
        <!-- Custom column templates -->
        <ng-template #formTemplate let-item>
          {{ item.form?.name }}
        </ng-template>

        <ng-template #sectionTemplate let-item>
          <div
            [ngClass]="{
              'font-bold text-gray-900 text-base':
                isParentSectionVariance(item),
              'pl-6 text-gray-700':
                !isParentSectionVariance(item) && item.section,
              'text-gray-900 font-medium': !item.section,
            }"
          >
            <!-- Icon for parent sections -->
            <span
              *ngIf="isParentSectionVariance(item)"
              class="inline-flex items-center gap-2"
            >
              <mat-icon class="text-blue-600 !text-lg">folder</mat-icon>
              {{ item.section?.title }}
            </span>
            <!-- Subsections with indent indicator -->
            <span
              *ngIf="!isParentSectionVariance(item) && item.section"
              class="inline-flex items-center gap-2"
            >
              <mat-icon class="text-gray-400 !text-sm"
                >subdirectory_arrow_right</mat-icon
              >
              {{ item.section?.title }}
            </span>
            <!-- Overall (no section) -->
            <span *ngIf="!item.section">Overall</span>
          </div>
        </ng-template>

        <ng-template #scoreDiffTemplate let-item>
          <span
            [ngClass]="{
              'font-semibold text-orange-600':
                item.scoreDifference <= 15 && !isParentSectionVariance(item),
              'font-semibold text-red-600':
                item.scoreDifference > 15 && !isParentSectionVariance(item),
              'text-gray-500 font-medium italic': isParentSectionVariance(item),
            }"
          >
            {{ item.scoreDifference | number: '1.1-1' }} pts
            <span *ngIf="isParentSectionVariance(item)" class="text-xs"
              >(total)</span
            >
          </span>
        </ng-template>

        <ng-template #statusTemplate let-item>
          <span
            class="px-3 py-1 rounded-full text-xs"
            [ngClass]="[
              getStatusClass(item.status),
              isParentSectionVariance(item)
                ? 'opacity-60 italic'
                : 'font-semibold',
            ]"
          >
            {{ getStatusLabel(item.status) }}
          </span>
        </ng-template>

        <ng-template #assessorTemplate let-item>
          {{ getAssessorFullName(item.assessor) }}
        </ng-template>

        <!-- Actions template -->
        <ng-template #actions let-item>
          <div class="flex justify-center">
            <!-- Show "Resolve" button if variance is not fully resolved AND is not a parent section -->
            <!-- Parent sections should never show resolve actions as they are aggregate entries -->
            <icon-button
              *ngIf="
                (item.status === 'OPEN' ||
                  item.status === 'PARTIALLY_RESOLVED') &&
                !isParentSectionVariance(item)
              "
              icon="sync_alt"
              tooltip="Resolve Variance"
              color="warn"
              (action)="openDetails(item)"
            ></icon-button>

            <!-- Show "View Details" button if variance is fully resolved AND is not a parent section -->
            <icon-button
              *ngIf="
                item.status === 'RESOLVED' && !isParentSectionVariance(item)
              "
              icon="visibility"
              tooltip="View Details"
              color="primary"
              (action)="openDetails(item)"
            ></icon-button>
          </div>
        </ng-template>
      </app-expandable-table>

      <!-- Pagination Controls -->
      <app-wrapper *ngIf="totalHotels > 0" class="mt-4">
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <!-- Left: Page info and size selector -->
          <div class="flex flex-col md:flex-row items-center gap-4">
            <div class="text-sm text-gray-700">
              <span class="font-medium text-gray-900">
                {{ getPageStartIndex() }}-{{ getPageEndIndex() }}
              </span>
              of
              <span class="font-medium text-gray-900">{{ totalHotels }}</span>
              hotels
              <span class="mx-2 text-gray-400">•</span>
              <span class="font-medium text-gray-900">{{
                totalVariances
              }}</span>
              variances
            </div>

            <!-- Page size selector -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Hotels per page:</span>
              <select
                [(ngModel)]="filters.size"
                (change)="onPageSizeChange()"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [value]="3">3</option>
                <option [value]="5">5</option>
                <option [value]="10">10</option>
                <option [value]="20">20</option>
              </select>
            </div>
          </div>

          <!-- Right: Navigation controls -->
          <div class="flex items-center gap-2">
            <!-- First page button -->
            <button
              mat-icon-button
              (click)="goToPage(0)"
              [disabled]="!hasPreviousPage()"
              [class.opacity-50]="!hasPreviousPage()"
              matTooltip="First page"
            >
              <mat-icon>first_page</mat-icon>
            </button>

            <!-- Previous button -->
            <button
              mat-icon-button
              (click)="previousPage()"
              [disabled]="!hasPreviousPage()"
              [class.opacity-50]="!hasPreviousPage()"
              matTooltip="Previous page"
            >
              <mat-icon>chevron_left</mat-icon>
            </button>

            <!-- Page numbers -->
            <div class="flex gap-1 items-center px-2">
              <button
                *ngFor="let pageNum of getPageNumbers()"
                mat-button
                [class.bg-blue-600]="pageNum === filters.page"
                [class.text-white]="pageNum === filters.page"
                [class.text-blue-600]="pageNum !== filters.page"
                [class.hover:bg-blue-50]="pageNum !== filters.page"
                (click)="goToPage(pageNum)"
                class="min-w-[40px] h-[40px] transition-colors"
                [matTooltip]="'Go to page ' + (pageNum + 1)"
              >
                {{ pageNum + 1 }}
              </button>
            </div>

            <!-- Next button -->
            <button
              mat-icon-button
              (click)="nextPage()"
              [disabled]="!hasNextPage()"
              [class.opacity-50]="!hasNextPage()"
              matTooltip="Next page"
            >
              <mat-icon>chevron_right</mat-icon>
            </button>

            <!-- Last page button -->
            <button
              mat-icon-button
              (click)="goToPage(totalPages - 1)"
              [disabled]="!hasNextPage()"
              [class.opacity-50]="!hasNextPage()"
              matTooltip="Last page"
            >
              <mat-icon>last_page</mat-icon>
            </button>
          </div>
        </div>
      </app-wrapper>
    </container>

    <!-- Variance Details Dialog -->
    <app-dialog
      [open]="isDialogOpen"
      (onClose)="handleDialogClose()"
      width="800px"
      [title]="dialogTitle"
    >
      <ng-template>
        <div *ngIf="selectedVariance" class="space-y-4">
          <!-- Section and Score Difference -->
          <div class="grid grid-cols-2 gap-6 pb-4">
            <div>
              <p class="text-sm text-gray-600 font-medium mb-1">Section</p>
              <p class="text-gray-900 text-lg font-medium">
                {{ selectedVariance.section?.title || 'Overall' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600 font-medium mb-1">
                Score Difference
              </p>
              <p class="text-red-600 font-bold text-2xl">
                {{ selectedVariance.scoreDifference | number: '1.1-1' }} points
              </p>
            </div>
          </div>

          <!-- Assessor Scores -->
          <div class="border-t pt-4">
            <h4 class="font-semibold text-gray-800 mb-4">Assessor Scores</h4>
            <div class="grid grid-cols-3 gap-4">
              <div
                *ngFor="let assessor of selectedVariance.assessorScores"
                class="text-center"
              >
                <p class="text-sm text-gray-700 mb-2">
                  {{ assessor.title }} {{ assessor.firstName }}
                  {{ assessor.lastName }}
                </p>
                <p class="text-4xl font-bold text-gray-900">
                  {{ assessor.score | number: '1.1-1' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Suggested Action -->
          <div
            *ngIf="selectedVariance.suggestedAssessor"
            class="bg-blue-50 p-5 rounded-lg mt-4"
          >
            <h4
              class="font-semibold text-blue-900 mb-3 flex items-center gap-2"
            >
              <ng-icon
                name="heroLightBulb"
                size="24"
                class="text-blue-600"
              ></ng-icon>
              Suggested Action
            </h4>
            <div class="space-y-2">
              <p class="text-base text-blue-900">
                <strong>Recommended Assessor:</strong>
                <span class="ml-1">{{
                  selectedVariance.suggestedAssessor.name
                }}</span>
              </p>
              <p class="text-sm text-blue-800 leading-relaxed">
                {{ selectedVariance.suggestedAssessor.reason }}
              </p>
              <p class="text-sm text-blue-700">
                <strong>Deviation from median:</strong>
                {{
                  selectedVariance.suggestedAssessor.deviation | number: '1.1-1'
                }}
                points
              </p>
            </div>
          </div>

          <!-- Resolution Notes (if resolved) -->
          <div *ngIf="selectedVariance.resolutionNotes" class="border-t pt-4">
            <h4 class="font-semibold text-gray-800 mb-2">Resolution Notes</h4>
            <p class="text-gray-700">{{ selectedVariance.resolutionNotes }}</p>
          </div>

          <!-- Resolution Actions -->
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              mat-stroked-button
              (click)="handleDialogClose()"
              class="text-gray-700 px-6"
            >
              {{ selectedVariance.status === 'RESOLVED' ? 'Close' : 'Cancel' }}
            </button>
            <button
              *ngIf="
                selectedVariance.status === 'OPEN' ||
                selectedVariance.status === 'PARTIALLY_RESOLVED'
              "
              mat-raised-button
              (click)="resolveVarianceFromDialog()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <mat-icon>sync_alt</mat-icon>
              {{
                selectedVariance.status === 'PARTIALLY_RESOLVED'
                  ? 'Continue Resolving'
                  : 'Resolve'
              }}
            </button>
          </div>
        </div>
      </ng-template>
    </app-dialog>
  `,
})
export class VarianceListComponent implements OnInit {
  @ViewChild('formTemplate') formTemplate!: TemplateRef<any>;
  @ViewChild('sectionTemplate') sectionTemplate!: TemplateRef<any>;
  @ViewChild('scoreDiffTemplate') scoreDiffTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('detectedAtTemplate') detectedAtTemplate!: TemplateRef<any>;
  @ViewChild('assessorTemplate') assessorTemplate!: TemplateRef<any>;
  @ViewChild('expandableTable')
  expandableTable?: ExpandableTableComponent<AssessmentVarianceLog>;

  columns: any[] = [];
  groupedVariances: ExpandableTableGroup<AssessmentVarianceLog>[] = [];

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Open', value: 'OPEN' },
    { label: 'Partially Resolved', value: 'PARTIALLY_RESOLVED' },
    { label: 'Resolved', value: 'RESOLVED' },
  ];

  variances: AssessmentVarianceLog[] = [];
  filters: VarianceFilterOptions = {
    page: 0,
    size: 5, // Number of hotels per page
  };

  // Pagination metadata
  totalHotels = 0;
  totalPages = 0;
  totalVariances = 0;

  isDialogOpen = false;
  dialogTitle = '';
  selectedVariance: AssessmentVarianceLog | null = null;

  constructor(
    private varianceService: VarianceService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadVariances();
  }

  ngAfterViewInit() {
    // Set up columns with templates after view init
    this.columns = [
      {
        label: 'Section',
        value: 'section.title',
        template: this.sectionTemplate,
      },
      {
        label: 'Score Difference',
        value: 'scoreDifference',
        template: this.scoreDiffTemplate,
      },
      { label: 'Status', value: 'status', template: this.statusTemplate },
      {
        label: 'Submitted By',
        value: 'assessor',
        template: this.assessorTemplate,
      },
    ];
    // Trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();
  }

  getAssessorFullName(assessor: {
    title: string;
    firstName: string;
    lastName: string;
  }): string {
    return `${assessor.title} ${assessor.firstName} ${assessor.lastName}`;
  }

  /**
   * Check if a variance is for a parent section (which should not be resolvable).
   * Parent sections are containers/categories that have subsections underneath.
   * Only subsections (leaf nodes) should be resolved by assessors.
   *
   * @param variance The variance to check
   * @returns true if this is a parent section variance (should not show resolve action)
   */
  isParentSectionVariance(variance: AssessmentVarianceLog): boolean {
    // If no section, it's an overall variance - NOT a parent, keep it
    if (!variance.section) {
      return false;
    }

    // A section is a PARENT (top-level container) if:
    // 1. It has sectionLevel === 0 (top level in hierarchy)
    // 2. AND it has NO parent (parentSectionUuid is null/undefined/empty)
    //
    // A section is a SUBSECTION (can be resolved) if:
    // 1. It has sectionLevel > 0 (child in hierarchy)
    // 2. AND it has a parentSectionUuid (has a parent)
    const hasParentUuid =
      variance.section.parentSectionUuid !== null &&
      variance.section.parentSectionUuid !== undefined &&
      variance.section.parentSectionUuid !== '';

    // If it has a parent UUID, it's definitely a subsection (NOT a parent)
    if (hasParentUuid) {
      return false;
    }

    // If no parent UUID, check if it's a top-level section (parent)
    // sectionLevel === 0 means top level = parent section (container only)
    const sectionLevel = variance.section.sectionLevel;
    const isTopLevel = sectionLevel === 0;

    return isTopLevel;
  }

  /**
   * Handle filter changes - reset to first page
   */
  onFilterChange() {
    this.filters.page = 0;
    this.loadVariances();
  }

  /**
   * Handle page size change - reset to first page
   */
  onPageSizeChange() {
    this.filters.page = 0;
    this.loadVariances();
  }

  /**
   * Get the starting index of items on current page (1-based)
   */
  getPageStartIndex(): number {
    if (this.totalHotels === 0) return 0;
    return this.filters.page * this.filters.size + 1;
  }

  /**
   * Get the ending index of items on current page (1-based)
   */
  getPageEndIndex(): number {
    if (this.totalHotels === 0) return 0;
    const end = (this.filters.page + 1) * this.filters.size;
    return Math.min(end, this.totalHotels);
  }

  loadVariances() {
    this.varianceService
      .getVariancesGroupedByHotel(this.filters)
      .subscribe((response) => {
        console.log('📊 Grouped variance response:', response);
        if (response && response.data) {
          const pagedResponse = response.data;

          // Update pagination metadata
          this.totalHotels = pagedResponse.totalElements || 0;
          this.totalPages = pagedResponse.totalPages || 0;
          this.totalVariances = pagedResponse.totalVariances || 0;

          console.log(
            `📊 Page ${pagedResponse.page + 1} of ${this.totalPages} | ` +
              `${this.totalHotels} hotels | ${this.totalVariances} total variances`,
          );

          // Extract hotel groups from response
          const hotelGroups = pagedResponse.content || [];

          // Flatten hotel groups into variances array and group them for display
          this.groupedVariances = hotelGroups.map((hotelGroup: any) => {
            const variances = hotelGroup.variances || [];

            // Calculate suggested assessor for each variance
            variances.forEach((variance: AssessmentVarianceLog) => {
              variance.suggestedAssessor =
                this.calculateSuggestedAssessor(variance);
            });

            // Sort variances hierarchically within each hotel
            const sortedVariances = this.sortVariancesHierarchically(variances);

            return {
              groupKey: hotelGroup.hotel.uuid,
              groupLabel: hotelGroup.hotel.name,
              groupData: hotelGroup.hotel,
              items: sortedVariances,
              isExpanded: false,
            };
          });

          console.log(
            `✅ Displaying ${this.groupedVariances.length} hotel groups on this page`,
          );
        }
      });
  }

  /**
   * Sort variances hierarchically: parent sections first, followed by their subsections
   */
  private sortVariancesHierarchically(
    variances: AssessmentVarianceLog[],
  ): AssessmentVarianceLog[] {
    // Separate into parents and subsections
    const parents = variances.filter((v) => this.isParentSectionVariance(v));
    const subsections = variances.filter(
      (v) => !this.isParentSectionVariance(v),
    );

    // Create a map of parent UUID to parent variance for quick lookup
    const parentMap = new Map<string, AssessmentVarianceLog>();
    parents.forEach((p) => {
      if (p.sectionUuid) {
        parentMap.set(p.sectionUuid, p);
      }
    });

    // Group subsections by their parent
    const subsectionsByParent = new Map<string, AssessmentVarianceLog[]>();
    subsections.forEach((sub) => {
      // If subsection has a parent UUID, group it under that parent
      const parentUuid = sub.section?.parentSectionUuid;
      if (parentUuid) {
        if (!subsectionsByParent.has(parentUuid)) {
          subsectionsByParent.set(parentUuid, []);
        }
        subsectionsByParent.get(parentUuid)!.push(sub);
      } else {
        // Orphan subsections (no parent) - add to a special "no-parent" group
        if (!subsectionsByParent.has('__NO_PARENT__')) {
          subsectionsByParent.set('__NO_PARENT__', []);
        }
        subsectionsByParent.get('__NO_PARENT__')!.push(sub);
      }
    });

    // Build the final sorted array: parent → its children → next parent → its children...
    const sorted: AssessmentVarianceLog[] = [];
    const addedSubsections = new Set<string>();

    // First, add parents and their children
    // Only include parents that have children with variances
    parents.forEach((parent) => {
      const children = subsectionsByParent.get(parent.sectionUuid) || [];

      // Skip parent sections with no children - they serve no purpose
      if (children.length === 0) {
        console.log(
          `📦 Skipping parent section with no child variances: ${parent.section?.title}`,
        );
        return;
      }

      // Add parent (only if it has children)
      sorted.push(parent);

      // Add its children
      children.forEach((child) => {
        sorted.push(child);
        if (child.uuid) {
          addedSubsections.add(child.uuid);
        }
      });
    });

    // Add orphan subsections (those without a parent in the list)
    const orphans = subsectionsByParent.get('__NO_PARENT__') || [];
    orphans.forEach((orphan) => {
      sorted.push(orphan);
      if (orphan.uuid) {
        addedSubsections.add(orphan.uuid);
      }
    });

    // CRITICAL FIX: Add any remaining subsections that weren't added yet
    // These are subsections whose parent section doesn't have a variance entry
    subsections.forEach((sub) => {
      if (!sub.uuid || !addedSubsections.has(sub.uuid)) {
        sorted.push(sub);
        console.warn(
          `⚠️ Found orphaned subsection (parent variance missing):`,
          sub.section?.title,
          `(parent UUID: ${sub.section?.parentSectionUuid})`,
        );
      }
    });

    return sorted;
  }

  /**
   * Navigate to a specific page
   */
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.filters.page = page;
      this.loadVariances();
    }
  }

  /**
   * Navigate to next page
   */
  nextPage() {
    this.goToPage(this.filters.page + 1);
  }

  /**
   * Navigate to previous page
   */
  previousPage() {
    this.goToPage(this.filters.page - 1);
  }

  /**
   * Check if there's a next page
   */
  hasNextPage(): boolean {
    return this.filters.page < this.totalPages - 1;
  }

  /**
   * Check if there's a previous page
   */
  hasPreviousPage(): boolean {
    return this.filters.page > 0;
  }

  /**
   * Get array of page numbers to display in pagination
   * Shows current page ± 2 pages
   */
  getPageNumbers(): number[] {
    const current = this.filters.page;
    const total = this.totalPages;
    const range = 2; // Show 2 pages on each side of current

    let start = Math.max(0, current - range);
    let end = Math.min(total - 1, current + range);

    // Adjust if we're near the start or end
    if (current < range) {
      end = Math.min(total - 1, end + (range - current));
    }
    if (current > total - range - 1) {
      start = Math.max(0, start - (range - (total - current - 1)));
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  openDetails(variance: AssessmentVarianceLog) {
    this.selectedVariance = variance;
    console.log('Selected variance for details:', variance);
    this.dialogTitle = 'Variance Details';
    this.isDialogOpen = true;
  }

  handleDialogClose() {
    this.isDialogOpen = false;
    this.selectedVariance = null;
  }

  resolveVarianceFromDialog() {
    if (this.selectedVariance) {
      this.resolveVariance(this.selectedVariance);
      this.handleDialogClose();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'PARTIALLY_RESOLVED':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PARTIALLY_RESOLVED':
        return 'Partially Resolved';
      default:
        return status.replace('_', ' ');
    }
  }

  resolveVariance(variance: AssessmentVarianceLog) {
    // Safety check: Don't allow resolving parent sections
    if (this.isParentSectionVariance(variance)) {
      console.error(
        '❌ Cannot resolve parent section variance. Only subsections can be resolved.',
        variance,
      );
      return;
    }

    // Navigate to the assessment form with the SPECIFIC SUBSECTION UUID
    // This ensures users land on the exact subsection that needs resolution,
    // not the parent section
    const queryParams: any = {
      uuid: variance.hotel.uuid,
      isVarianceResolution: 'true', // Flag to allow re-submission
    };

    // Use sectionUuid to navigate directly to the subsection that has the variance
    // This is critical - without this, users would land on the wrong section
    if (variance.sectionUuid) {
      queryParams.sectionUuid = variance.sectionUuid;
      console.log(
        `✅ Navigating to subsection: ${variance.section?.title} (UUID: ${variance.sectionUuid})`,
      );
    } else {
      console.warn(
        '⚠️ No sectionUuid found for variance, navigation may not work correctly',
        variance,
      );
    }

    this.router.navigate(
      [`/establishment-details/assessment/${variance.form.uuid}`],
      { queryParams },
    );
  }

  /**
   * Calculate which assessor(s) should make corrections
   * Logic:
   * - Assessors with LOWER scores should increase their scores to match the highest scorer
   * - For 2 assessors: suggest the lower scorer
   * - For 3 assessors: suggest ALL assessors below the highest score
   */
  calculateSuggestedAssessor(
    variance: AssessmentVarianceLog,
  ):
    | { id: number; name: string; reason: string; deviation: number }
    | undefined {
    const assessors = variance.assessorScores;

    if (!assessors || assessors.length < 2) {
      return undefined;
    }

    // Sort assessors by score (ascending - lowest first)
    const sorted = [...assessors].sort((a, b) => a.score - b.score);
    const lowestScorer = sorted[0];
    const highestScorer = sorted[sorted.length - 1];

    // If only 2 assessors, suggest the lower scorer
    if (assessors.length === 2) {
      const scoreDiff = Math.abs(highestScorer.score - lowestScorer.score);

      return {
        id: lowestScorer.id,
        name: `${lowestScorer.title} ${lowestScorer.firstName} ${lowestScorer.lastName}`,
        reason: `This assessor's score (${lowestScorer.score.toFixed(1)}) is lower than ${highestScorer.title} ${highestScorer.firstName} ${highestScorer.lastName}'s score (${highestScorer.score.toFixed(1)}) and should review their assessment to increase the score.`,
        deviation: scoreDiff,
      };
    }

    // For 3+ assessors, find all assessors below the highest score
    const belowHighest = sorted.filter((a) => a.score < highestScorer.score);

    if (belowHighest.length === 0) {
      // All scores are equal
      return undefined;
    }

    // If there are multiple assessors below the highest, suggest them
    // For UI purposes, we'll suggest the lowest scorer with a message about all low scorers
    const assessorNames = belowHighest
      .map((a) => `${a.title} ${a.firstName} ${a.lastName}`)
      .join(' and ');

    const scoreDiff = Math.abs(highestScorer.score - lowestScorer.score);

    if (belowHighest.length === 1) {
      // Only one assessor below the highest
      return {
        id: lowestScorer.id,
        name: `${lowestScorer.title} ${lowestScorer.firstName} ${lowestScorer.lastName}`,
        reason: `This assessor's score (${lowestScorer.score.toFixed(1)}) is lower than the highest score (${highestScorer.score.toFixed(1)}) and should review their assessment to increase the score.`,
        deviation: scoreDiff,
      };
    }

    // Multiple assessors below the highest - suggest all of them
    return {
      id: lowestScorer.id, // For tracking purposes, use the lowest
      name: assessorNames,
      reason: `These assessors have lower scores compared to the highest score (${highestScorer.score.toFixed(1)}) and should review their assessments to increase their scores.`,
      deviation: scoreDiff,
    };
  }
}
