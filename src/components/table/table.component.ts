import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ContentChild,
  ContentChildren,
  QueryList,
  Output,
  EventEmitter,
  Directive,
  AfterContentInit,
} from '@angular/core';
import { CommonModule, NgSwitch } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';

@Directive({
  selector: '[columnDef]',
  standalone: true,
})
export class ColumnDefDirective {
  @Input('columnDef') columnName!: string;

  constructor(public template: TemplateRef<any>) {}
}

interface ColumnDefinition {
  label: string;
  value: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="overflow-auto">
      <table
        mat-table
        [dataSource]="data"
        [class]="tableClass"
        [ngStyle]="{ 'margin-top': '20px', border: '1px solid #ccc' }"
        class="mt-5 border border-[#ccc] min-w-full bg-white rounded-t rounded-md shadow-lg"
      >
        <ng-container *ngIf="showSelection" matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-200 p-2">
            <mat-checkbox
              (change)="$event ? toggleAllRows() : null"
              [checked]="selection.hasValue() && isAllSelected()"
              [indeterminate]="selection.hasValue() && !isAllSelected()"
              [aria-label]="checkboxLabel()"
            >
            </mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let row" class="p-2">
            <mat-checkbox
              (click)="$event.stopPropagation()"
              (change)="$event ? selection.toggle(row) : null"
              [checked]="selection.isSelected(row)"
              [aria-label]="checkboxLabel(row)"
            >
            </mat-checkbox>
          </td>
        </ng-container>

        <ng-container
          *ngFor="let column of columns"
          [matColumnDef]="column.value"
        >
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-200 p-2">
            {{ column.label }}
          </th>
          <td mat-cell *matCellDef="let element" class="p-2">
            <!-- Check if there's a specific template for this column -->
            <ng-container
              *ngIf="getColumnTemplate(column.value); else noColumnTemplate"
            >
              <ng-container
                *ngTemplateOutlet="
                  getColumnTemplate(column.value);
                  context: {
                    $implicit: element,
                    item: element,
                    value: element[column.value],
                    column: column.value,
                  }
                "
              ></ng-container>
            </ng-container>

            <!-- If no specific column template, fall back to the general template or default -->
            <ng-template #noColumnTemplate>
              <ng-container *ngIf="htmlTemplate; else defaultContent">
                <ng-container
                  *ngTemplateOutlet="
                    htmlTemplate;
                    context: {
                      value: element[column.value],
                      column: column.value,
                      item: element,
                    }
                  "
                ></ng-container>
              </ng-container>
              <ng-template #defaultContent>
                {{ element[column.value] }}
              </ng-template>
            </ng-template>
          </td>
        </ng-container>

        <ng-container *ngIf="actionTemplate" matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="!bg-gray-200 p-2">
            Actions
          </th>
          <td mat-cell *matCellDef="let element" class="p-2">
            <ng-container
              *ngTemplateOutlet="
                actionTemplate;
                context: { $implicit: element, item: element }
              "
            ></ng-container>
          </td>
        </ng-container>

        <tr
          mat-header-row
          *matHeaderRowDef="computedColumns"
          class="bg-gray-200"
        ></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: computedColumns"
          class="hover:bg-gray-200"
        ></tr>

        <!-- No Data Row -->
        <tr *ngIf="data.length === 0">
          <td [attr.colspan]="computedColumns.length" class="text-center p-4">
            No Data
          </td>
        </tr>
      </table>
      <mat-paginator
        *ngIf="showPagination"
        [length]="dataLength"
        [pageSize]="pageSize"
        [pageIndex]="page"
        [pageSizeOptions]="[5, 10, 25, 50]"
        (page)="handlePageEvent($event)"
        class="border border-gray-300 border-t-0"
      ></mat-paginator>
    </div>
  `,
  styles: [],
})
export class TableComponent implements OnInit, AfterContentInit {
  @Input() data!: any[];
  @Input() columns!: ColumnDefinition[];
  @Input() htmlTemplate!: TemplateRef<any>;
  @Input() showSelection: boolean = false;
  @Input() showPagination: boolean = true;
  @Input() dataLength: number = 0;
  @Input() pageSize: number = 10;
  @Input() page: number = 0;
  @Input() tableClass: string = '';
  @Input() tableStyle: { [klass: string]: any } = {};
  @Output() onPagination: EventEmitter<PageEvent> =
    new EventEmitter<PageEvent>();
  @Output() handePagination: EventEmitter<{ page: number; size: number }> =
    new EventEmitter<{ page: number; size: number }>();
  @ContentChild('actionTemplate') actionTemplate!: TemplateRef<any>;

  // Collection of column templates
  @ContentChildren(ColumnDefDirective)
  columnTemplates!: QueryList<ColumnDefDirective>;

  selection = new SelectionModel<any>(true, []);
  private columnTemplateMap = new Map<string, TemplateRef<any>>();

  constructor() {}

  ngOnInit(): void {}

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

  get computedColumns(): string[] {
    const columns = this.columns.map((column) => column.value);
    if (this.showSelection) {
      columns.unshift('select');
    }
    if (this.actionTemplate) {
      columns.push('actions');
    }
    return columns;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.data);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  handlePageEvent(event: PageEvent) {
    this.onPagination.emit(event);
    this.handePagination.emit({ page: event.pageIndex, size: event.pageSize });
  }
}
