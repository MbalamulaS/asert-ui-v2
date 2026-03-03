import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { animations } from 'layouts/main-layout/nav/animation';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'layouts/main-layout/nav/menu-items';

@Component({
  selector: 'app-nav-with-children',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatListModule,
    MatIconModule,
    MatMenuModule,
  ],
  animations: animations,
  template: `
    <div class="flex items-center pl-4">
      <mat-icon class="mr-2">{{ menu.icon }} </mat-icon>
      <a
        [routerLink]="menu.state"
        class="rounded relative text-lg inline-block w-full pr-4 py-2 flex-grow"
        (click)="toggleMenu(menu)"
      >
        <span class="ml-2">{{ menu.name }}</span>
        <mat-icon
          class="cursor-pointer absolute top-3 right-3 transition-transform duration-300"
          [ngClass]="menu.isOpen ? 'rotate-180' : ''"
        >
          expand_more
        </mat-icon>
      </a>
    </div>
    <ul
      [@submenu]="menu.isOpen ? 'open' : 'closed'"
      class="flex flex-col pl-2 ml-8 text-gray-800 border-l border-gray-400"
    >
      @for (child of menu.children; track child?.id) {
        <li
          class="inline-block w-full px-4 py-2 rounded hover:bg-gray-100 hover:text-black transition-colors duration-300"
        >
          <a [routerLink]="child.state">
            {{ child.name }}
          </a>
        </li>
      }
    </ul>
  `,
})
export class NavWithChildrenComponent {
  @Input() menu: MenuItem;

  toggleMenu(menu: any) {
    menu.isOpen = !menu.isOpen;
  }
}
