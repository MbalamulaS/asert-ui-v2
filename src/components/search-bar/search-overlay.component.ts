import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { Result } from './searchbar.component';

@Component({
  standalone: true,
  imports: [MatListModule, CommonModule],
  selector: 'search-overlay',
  template: `
    <div
      class="bg-white border-gray-600 rounded-sm shadow-gray-50"
      [ngStyle]="{ 'width.px': overlayWidth }"
    >
      <div class="px-2 flex flex-col">
        @for (result of results; track result.id) {
          <span
            (click)="setResult(result)"
            class="px-2 hover:bg-gray-100 transition-all cursor-pointer py-3 border-b border-gray-200"
            >{{ result.name }}</span
          >
        }
      </div>
    </div>
  `,
})
export class SearchOverlayComponent {
  @Input() overlayWidth: number;
  @Input() results: Result[];
  @Output() onSelection: EventEmitter<Result> = new EventEmitter<Result>();

  setResult(result: Result) {
    this.onSelection.emit(result);
  }
}
