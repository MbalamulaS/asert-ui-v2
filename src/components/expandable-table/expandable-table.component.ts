import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  ContentChildren,
  TemplateRef,
  Directive,
  QueryList,
  AfterContentInit,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Directive({
  selector: '[columnDef]',
  standalone: true,
})
export class ColumnDefDirective {
  @Input('columnDef') columnName!: string;

  constructor(public template: TemplateRef<any>) {}
}

export interface ExpandableTableGroup<T> {
  groupKey: string;
  groupLabel: string;
  groupData?: any;
  items: T[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-expandable-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    ColumnDefDirective,
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
  template: `
    <div class="overflow-auto">
      <table
        mat-table
        [dataSource]="groups"
        multiTemplateDataRows
        class="mt-5 border border-[#ccc] min-w-full bg-white rounded-t rounded-md shadow-lg"
        [ngStyle]="{ 'margin-top': '20px', border: '1px solid #ccc' }"
      >
        <!-- Expand Icon Column -->
        <ng-container matColumnDef="expand">
          <th
            mat-header-cell
            *matHeaderCellDef
            class="!bg-gray-200 p-2 w-12"
          ></th>
          <td mat-cell *matCellDef="let group" class="p-2 w-12">
            <button
              mat-icon-button
              (click)="toggleGroup(group); $event.stopPropagation()"
              [attr.aria-label]="'Expand ' + group.groupLabel"
            >
              <mat-icon
                class="transition-transform duration-200"
                [class.rotate-90]="group.isExpanded"
              >
                chevron_right
              </mat-icon>
            </button>
          </td>
        </ng-container>

        <!-- Group Label Column -->
        <ng-container matColumnDef="groupLabel">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-200 p-2">
            {{ groupColumnLabel || 'Group' }}
          </th>
          <td mat-cell *matCellDef="let group" class="p-2">
            <div class="flex items-center justify-between w-full">
              <div>
                <span class="font-semibold text-gray-800">{{
                  group.groupLabel
                }}</span>
                <span
                  class="ml-2 px-2 py-1 bg-gray-200 rounded-full text-xs font-medium"
                >
                  {{ group.items.length }}
                  {{ group.items.length === 1 ? 'item' : 'items' }}
                </span>
              </div>
              <!-- Optional group actions -->
              <div
                *ngIf="groupActionsTemplate"
                (click)="$event.stopPropagation()"
              >
                <ng-container
                  *ngTemplateOutlet="
                    groupActionsTemplate;
                    context: { $implicit: group }
                  "
                ></ng-container>
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Expanded Content Row -->
        <ng-container matColumnDef="expandedDetail">
          <td
            mat-cell
            *matCellDef="let group"
            [attr.colspan]="2"
            class="!p-0 !border-0"
          >
            <div
              class="overflow-hidden"
              [@detailExpand]="group.isExpanded ? 'expanded' : 'collapsed'"
            >
              <div *ngIf="group.isExpanded" class="bg-gray-50">
                <!-- Inner Table -->
                <table
                  mat-table
                  [dataSource]="group.items"
                  class="w-full bg-white border border-gray-300 shadow-sm"
                >
                  <!-- Dynamic Columns -->
                  <ng-container
                    *ngFor="let column of columns"
                    [matColumnDef]="column.value"
                  >
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!bg-[#f2f2f2] p-2 !h-[60px]"
                    >
                      {{ column.label }}
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let element; let i = index"
                      class="p-2"
                      [ngClass]="{
                        '!bg-[#f2f2f2]': striped && i % 2 === 1,
                        '!border-l !border-l-gray-300': showBorders,
                      }"
                      [ngStyle]="{
                        height: rowHeight ? rowHeight + 'px' : '30px',
                      }"
                    >
                      <!-- Check if there's a specific template for this column using columnDef directive -->
                      <ng-container
                        *ngIf="
                          getColumnTemplate(column.value);
                          else checkInputTemplate
                        "
                      >
                        <ng-container
                          *ngTemplateOutlet="
                            getColumnTemplate(column.value);
                            context: {
                              $implicit: element,
                              item: element,
                              value: getNestedValue(element, column.value),
                              column: column.value,
                            }
                          "
                        ></ng-container>
                      </ng-container>

                      <!-- Check if there's a template passed via column configuration -->
                      <ng-template #checkInputTemplate>
                        <ng-container
                          *ngIf="column.template; else defaultColumn"
                        >
                          <ng-container
                            *ngTemplateOutlet="
                              column.template;
                              context: {
                                $implicit: element,
                                item: element,
                                value: getNestedValue(element, column.value),
                                column: column.value,
                              }
                            "
                          ></ng-container>
                        </ng-container>
                      </ng-template>

                      <ng-template #defaultColumn>
                        {{ getNestedValue(element, column.value) }}
                      </ng-template>
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container *ngIf="actionsTemplate" matColumnDef="actions">
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="!bg-[#f2f2f2] p-2 !h-[60px]"
                    >
                      Actions
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let element; let i = index"
                      class="p-2"
                      [ngClass]="{
                        '!bg-[#f2f2f2]': striped && i % 2 === 1,
                        '!border-l !border-l-gray-300': showBorders,
                      }"
                      [ngStyle]="{
                        height: rowHeight ? rowHeight + 'px' : '30px',
                      }"
                    >
                      <ng-container
                        *ngTemplateOutlet="
                          actionsTemplate;
                          context: { $implicit: element, item: element }
                        "
                      ></ng-container>
                    </td>
                  </ng-container>

                  <tr
                    mat-header-row
                    *matHeaderRowDef="innerColumns"
                    class="bg-[#f2f2f2] border-b border-gray-300"
                  ></tr>
                  <tr
                    mat-row
                    *matRowDef="let row; columns: innerColumns; let i = index"
                    class="hover:bg-gray-100 border-b border-gray-300"
                    [ngClass]="{ '!bg-[#f2f2f2]': striped && i % 2 === 1 }"
                  ></tr>

                  <!-- No Data Row -->
                  <tr *ngIf="group.items.length === 0">
                    <td
                      [attr.colspan]="innerColumns.length"
                      class="text-center p-4"
                    >
                      No items in this group
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Main Table Rows -->
        <tr
          mat-header-row
          *matHeaderRowDef="outerColumns"
          class="bg-gray-200"
        ></tr>
        <tr
          mat-row
          *matRowDef="let group; columns: outerColumns"
          class="hover:bg-gray-100 cursor-pointer"
          (click)="toggleGroup(group)"
        ></tr>
        <tr
          mat-row
          *matRowDef="let group; columns: ['expandedDetail']"
          class="detail-row"
        ></tr>

        <!-- Empty State -->
        <tr *ngIf="!groups || groups.length === 0">
          <td [attr.colspan]="2" class="text-center p-10">
            <div class="flex flex-col items-center text-gray-500">
              <mat-icon class="text-6xl mb-4 text-gray-400">inbox</mat-icon>
              <p>{{ emptyMessage || 'No data available' }}</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `,
  styles: [
    `
      .detail-row {
        height: 0;
      }

      .rotate-90 {
        transform: rotate(90deg);
      }

      ::ng-deep .mat-mdc-row:hover .mat-mdc-cell {
        background-color: inherit;
      }
    `,
  ],
})
export class ExpandableTableComponent<T> implements AfterContentInit {
  @Input() groups: ExpandableTableGroup<T>[] = [];
  @Input() columns: {
    label: string;
    value: string;
    template?: TemplateRef<any>;
  }[] = [];
  @Input() emptyMessage?: string;
  @Input() expandAllByDefault = false;
  @Input() groupColumnLabel = 'Group';

  // Styling options matching React implementation
  @Input() striped = false; // Alternate row colors
  @Input() showBorders = true; // Show cell borders
  @Input() rowHeight?: number; // Custom row height in pixels (default: 30)

  @ContentChild('actions') actionsTemplate?: TemplateRef<any>;
  @ContentChild('groupActions') groupActionsTemplate?: TemplateRef<any>;

  // Collection of column templates using columnDef directive
  @ContentChildren(ColumnDefDirective)
  columnTemplates!: QueryList<ColumnDefDirective>;

  @Output() groupToggled = new EventEmitter<ExpandableTableGroup<T>>();

  outerColumns = ['expand', 'groupLabel'];
  private columnTemplateMap = new Map<string, TemplateRef<any>>();

  get innerColumns(): string[] {
    const cols = this.columns.map((col) => col.value);
    if (this.actionsTemplate) {
      cols.push('actions');
    }
    return cols;
  }

  ngOnInit() {
    // Set initial expansion state
    if (this.expandAllByDefault) {
      this.groups.forEach((group) => (group.isExpanded = true));
    } else {
      // Expand only the first group by default
      if (this.groups.length > 0) {
        this.groups[0].isExpanded = true;
      }
    }
  }

  ngAfterContentInit() {
    // Create a map of column name -> template for easy lookup
    if (this.columnTemplates) {
      this.columnTemplates.forEach((columnTemplate) => {
        this.columnTemplateMap.set(
          columnTemplate.columnName,
          columnTemplate.template,
        );
      });
    }
  }

  // Get a column-specific template if it exists
  getColumnTemplate(columnName: string): TemplateRef<any> | null {
    return this.columnTemplateMap.get(columnName) || null;
  }

  toggleGroup(group: ExpandableTableGroup<T>) {
    group.isExpanded = !group.isExpanded;
    this.groupToggled.emit(group);
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  }

  expandAll() {
    this.groups.forEach((group) => (group.isExpanded = true));
  }

  collapseAll() {
    this.groups.forEach((group) => (group.isExpanded = false));
  }
}
