import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'layouts/main-layout/nav/menu-items';

@Component({
  selector: 'app-nav-without-children',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    RouterLinkActive,
  ],
  template: `
    <div
      class="flex items-center pl-4"
      routerLinkActive="bg-blue-50 text-blue-700"
    >
      <!-- <mat-icon class="mr-2">{{ menu.icon }} </mat-icon> -->
      <a
        [routerLink]="menu.state"
        class="rounded relative text-lg inline-block w-full pr-4 py-2 flex-grow"
      >
        <span class="ml-2">{{ menu.name }}</span>
      </a>
    </div>
  `,
})
export class NavWithoutChildrenComponent {
  @Input() menu: MenuItem;
}
