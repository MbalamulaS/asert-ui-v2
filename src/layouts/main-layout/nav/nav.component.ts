import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { NavWithoutChildrenComponent } from 'layouts/main-layout/nav/components/nav-without-children.component';
import { MenuItem } from 'layouts/main-layout/nav/menu-items';
import { MatButtonModule } from '@angular/material/button';
import { environment } from 'environment/environment';
import { PortalService } from 'layouts/portal-layout/services/portal.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    NavWithoutChildrenComponent,
    MatButtonModule,
  ],
  template: `
    <nav class="min-h-full custom-scrollbar">
      <ul class="flex flex-col space-y-2">
        @if(menus.length > 0){ @for (menu of menus; track menu?.id) {
        <li
          class="text-gray-600 group hover:bg-gray-200 relative hover:text-black transition-colors duration-300"
        >
          <app-nav-without-children [menu]="menu"></app-nav-without-children>
        </li>
        } }
        @if(!isObjectEmpty(menuSingle)){

        <app-nav-without-children
          [menu]="menuSingle"
        ></app-nav-without-children>
        }
      </ul>
    </nav>
  `,
})
export class NavComponent implements OnInit {
  menus: MenuItem[] = [];
  menuSingle:Partial<MenuItem> = {};

  constructor(private portalService: PortalService) {}

  ngOnInit(): void {
    this.getMenus();
    this.portalService.currentMenuData.subscribe((data) => {
      if (data) {
        this.getMenus();
      }
    });
  }

  hasChildren(menu: MenuItem): boolean {
    return Array.isArray(menu.children) && menu.children.length > 0;
  }

  getMenus() {
    const selectedMenuGroup = localStorage.getItem(
      environment.SELECTED_MENU_GROUP
    );
    const menuGroup = selectedMenuGroup ? JSON.parse(selectedMenuGroup) : null;
    if (menuGroup) {
      this.menus = [];
      this.menuSingle = {};
      if (this.hasChildren(menuGroup)) {
        this.menus = menuGroup.children;
      } else {
        this.menuSingle = menuGroup;
      }
   }
  }

  isObjectEmpty(obj:unknown):boolean{
    return (
      typeof obj === 'object' &&
      obj !== null &&
      !Array.isArray(obj) &&
      Object.keys(obj).length === 0
    );
  }
}
