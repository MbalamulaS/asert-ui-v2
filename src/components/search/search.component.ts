import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencilSquare,
  heroTrash,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-search',
  standalone: true,
  viewProviders: [
    provideIcons({ heroPencilSquare, heroTrash, heroMagnifyingGlass }),
  ],
  imports: [CommonModule, MatIconModule, NgIconComponent],
  template: `
    <div class="relative flex items-center w-full max-w-3xl">
      <input
        type="text"
        [placeholder]="label"
        class="border border-gray-400 bg-white rounded-lg p-5 w-full md:w-[400px] lg:w-[650px] focus:outline-none"
        (input)="onInputChange($event)"
      />
      <ng-icon
        size="20"
        color="dark-grey"
        name="heroMagnifyingGlass"
        class="absolute right-4 text-gray-600"
      ></ng-icon>
    </div>
  `,
})
export class SearchComponent {
  @Output() onSearch = new EventEmitter<string>();
  @Input() label? = 'Search...';

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.onSearch.emit(input.value);
  }
}
