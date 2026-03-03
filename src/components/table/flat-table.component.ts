import { CommonModule, NgSwitch } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

interface ColumnDefinition {
  label: string;
  value: string;
}

@Component({
  selector: 'flat-table',
  standalone: true,
  imports: [
    CommonModule,
    CommonModule,
    MatCheckboxModule,
    MatPaginatorModule,
    NgSwitch,
  ],
  template: `
    <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <ng-container *ngIf="showSelection">
              <th
                class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <mat-checkbox
                  (change)="$event ? toggleAllRows() : null"
                  [checked]="selection.length && isAllSelected()"
                  [indeterminate]="selection.length && !isAllSelected()"
                  [aria-label]="checkboxLabel()"
                >
                </mat-checkbox>
              </th>
            </ng-container>
            <ng-container *ngFor="let column of columns; trackBy: trackByValue">
              <th
                class="px-4 py-4 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ column.label }}
              </th>
            </ng-container>
            <ng-container *ngIf="actionTemplate">
              <th
                class="px-4 py-4 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </ng-container>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let row of data; trackBy: trackById">
            <tr class="border-b">
              <ng-container *ngIf="showSelection">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <mat-checkbox
                    (click)="$event.stopPropagation()"
                    (change)="$event ? toggleRow(row) : null"
                    [checked]="isSelected(row)"
                    [aria-label]="checkboxLabel(row)"
                  >
                  </mat-checkbox>
                </td>
              </ng-container>
              <ng-container
                *ngFor="let column of columns; trackBy: trackByValue"
              >
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <ng-container *ngIf="htmlTemplate; else defaultContent">
                    <ng-container
                      *ngTemplateOutlet="
                        htmlTemplate;
                        context: {
                          value: row[column.value],
                          column: column.value,
                        }
                      "
                    ></ng-container>
                  </ng-container>
                  <ng-template #defaultContent>
                    {{ row[column.value] }}
                  </ng-template>
                </td>
              </ng-container>
              <ng-container *ngIf="actionTemplate">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <ng-container
                    *ngTemplateOutlet="
                      actionTemplate;
                      context: { $implicit: row }
                    "
                  ></ng-container>
                </td>
              </ng-container>
            </tr>
          </ng-container>
        </tbody>
      </table>
      <mat-paginator
        *ngIf="showPagination"
        [length]="dataLength"
        [pageSize]="pageSize"
        [pageIndex]="page"
        [pageSizeOptions]="[5, 10, 25, 50]"
        (page)="handlePageEvent($event)"
      ></mat-paginator>
    </div>
  `,
  styles: [],
})
export class FlatTableComponent implements OnInit {
  @Input() data!: any[];
  @Input() columns!: ColumnDefinition[];
  @Input() htmlTemplate!: TemplateRef<any>;
  @Input() showSelection: boolean = false;
  @Input() showPagination: boolean = true;
  @Input() dataLength: number = 0;
  @Input() pageSize: number = 10;
  @Input() page: number = 0;
  @Output() onPagination: EventEmitter<PageEvent> =
    new EventEmitter<PageEvent>();
  @Output() handePagination: EventEmitter<{ page: number; size: number }> =
    new EventEmitter<{ page: number; size: number }>();
  @ContentChild('actionTemplate') actionTemplate!: TemplateRef<any>;

  selection: any[] = [];

  constructor() {}

  ngOnInit(): void {}

  trackById(index: number, item: any): any {
    return item.id;
  }

  trackByValue(index: number, item: ColumnDefinition): any {
    return item.value;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.length;
    const numRows = this.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection = [];
      return;
    }
    this.selection = [...this.data];
  }

  toggleRow(row: any) {
    const index = this.selection.indexOf(row);
    if (index === -1) {
      this.selection.push(row);
    } else {
      this.selection.splice(index, 1);
    }
  }

  isSelected(row: any): boolean {
    return this.selection.includes(row);
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  handlePageEvent(event: PageEvent) {
    this.onPagination.emit(event);
    this.handePagination.emit({ page: event.pageIndex, size: event.pageSize });
  }
}
