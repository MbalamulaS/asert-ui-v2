import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-single-column-checkbox-table',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule],
  template: `
    <div class="flex flex-col border border-gray-200 shadow-sm">
      @for (row of rows; track row.id) {
        <div
          class="flex items-center !border-b !border-gray-200 last:border-0 py-2 hover:bg-gray-100"
        >
          <mat-checkbox
            [checked]="isSelected(row.id)"
            (change)="onItemCheck(row.id)"
          >
            {{ row.action }}
          </mat-checkbox>
        </div>
      }
      <!--<pre>{{ rows | json }}</pre>-->
    </div>
  `,
  styles: [
    `
      .container {
        @apply mx-auto p-4;
      }
    `,
  ],
})
export class SingleColumnCheckboxTableComponent {
  @Input() rows: any[] = [];
  @Input() selectedItems: any[] = [];
  @Output() itemChecked = new EventEmitter<string>();

  isSelected(id: string): boolean {
    return this.selectedItems.some((item) => item.id === id);
  }

  onItemCheck(id: string): void {
    this.itemChecked.emit(id);
  }
}
