import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'tree-ui-wrapper',
  standalone: true,
  template: `
    <div class="border border-gray-200 rounded-md overflow-hidden">
      <div class="border-b border-gray-300 bg-gray-100 px-4 py-3 font-medium">
        {{ treeLabel }}
      </div>

      <div class="p-4">
        <div
          *ngIf="isLoadingTree"
          class="flex items-center justify-center py-4"
        >
          <mat-spinner diameter="24" />
          <span class="ml-2">{{ loadingLabel }}</span>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  imports: [MatProgressSpinnerModule, CommonModule],
})
export class TreeUIWrapperComponent {
  @Input() isLoadingTree: boolean = false;
  @Input() treeLabel: string = 'Tree Section';
  @Input() loadingLabel: string = 'Loading...';
}
