import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-component',
  standalone: true,
  template: `
    <ul>
      @for (item of items; track item?.id) {
        <li class="flex gap-2 items-center">
          <svg
            class="h-6 w-6 flex-none fill-sky-100 stroke-sky-500 stroke-2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="11" />
            <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
          </svg>
          <p class="pt-2">{{ item[titleField] }} - ({{ item[description] }})</p>
        </li>
      }
    </ul>
  `,
})
export class ListComponent {
  @Input() items: any[] = [];
  @Input() titleField: string = 'title';
  @Input() description: string = 'description';
}
