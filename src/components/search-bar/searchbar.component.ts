import { OverlayModule } from '@angular/cdk/overlay';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SearchOverlayComponent } from './search-overlay.component';
import { SearchBarService } from './search-bar.service';

export type Result = {
  name: string;
  id: number;
};

@Component({
  selector: 'cdk-search-bar',
  standalone: true,
  imports: [MatIconButton, MatIcon, OverlayModule, SearchOverlayComponent],
  template: `
    <div cdkOverlayOrigin #overlayPosition="cdkOverlayOrigin" class="relative">
      <input
        #searchInput
        placeholder="Search Nearest Facilities..."
        class="border border-gray-400 w-full p-4 pl-12 rounded-md focus:outline-gray-300"
        (input)="filterData($event)"
      />
      <button
        class="absolute left-0 -top-7 transform -translate-y-1/2"
        mat-icon-button
      >
        <mat-icon>search</mat-icon>
      </button>
    </div>
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="overlayPosition"
      [cdkConnectedOverlayOpen]="overlayOpen()"
      (overlayOutsideClick)="overlayOpen.set(false)"
      [cdkConnectedOverlayOffsetY]="-48"
    >
      <search-overlay
        [results]="results"
        [overlayWidth]="searchInput.offsetWidth"
      ></search-overlay>
    </ng-template>
  `,
})
export class SearchBarComponent {
  searchBarService = inject(SearchBarService);
  overlayOpen = this.searchBarService.overlayOpen;
  @Output() onInputChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() results: Result[];

  filterData(event: Event) {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value;
    if (searchValue.length > 2) {
      this.overlayOpen.set(true);
      this.onInputChange.emit(searchValue);
    }
  }
}
