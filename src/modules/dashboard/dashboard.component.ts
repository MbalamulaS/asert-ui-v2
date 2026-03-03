import { Component, OnInit } from '@angular/core';
import { cardData } from 'modules/dashboard/data';
import { environment } from 'environment/environment';
import { PortalService } from 'layouts/portal-layout/services/portal.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MenuItem } from 'layouts/main-layout/nav/menu-items';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (user) {
      <h1 class="font-sans text-3xl text-gray-600">
        Welcome back!
        <span class="font-light">{{ user.fullName || user.firstName }}</span>
      </h1>
    }
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      @for (menu of menus; track menu?.id) {
        <div
          class=" border-gray-200 hover:border-gray-300 border rounded-lg shadow-md group
          cursor-pointer bg-white hover:bg-gray-300
          transition-all duration-300 ease-out hover:scale-105"
          (click)="selectedGroup(menu)"
        >
          <div class="flex flex-col items-center justify-center p-2 ">
            <span
              class="material-icons text-7xl text-blue-500 group-hover:text-blue-600"
              >{{ menu.icon }}</span
            >
            <div class="text-xl pt-4 text-gray-600 group-hover:text-black">
              {{ menu.name }}
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  user: any;
  dashboardCards = cardData;
  menus: any;

  constructor(
    private portalService: PortalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getUser();

    // Subscribe to dialog state changes
    this.portalService.dialogEvent$.subscribe((isOpen) => {
      console.log('Dialog state updated:', isOpen);

      // Automatically close the dialog if it's open
      if (isOpen) {
        this.closeDialog();
      }
    });
  }

  closeDialog(): void {
    this.portalService.emitEvent(false);
    console.log('Close dialog event emitted.');
  }

  getUser(): void {
    const _user = localStorage.getItem(environment.ASERT_USER);
    const loggedIn = _user ? JSON.parse(_user) : null;

    // Use optional chaining to avoid runtime errors
    this.user = loggedIn?.user;
    this.menus = this.sortMenus(loggedIn.user.menus as MenuItem[]);
  }

  hasChildren(menu: MenuItem): boolean {
    return Array.isArray(menu.children) && menu.children.length > 0;
  }

  sortMenus(menus: MenuItem[]) {
    return menus.sort((a, b) => {
      // Check if menus have children
      const aHasChildren = a.children && a.children.length > 0;
      const bHasChildren = b.children && b.children.length > 0;

      // If one has children and the other doesn't
      if (!aHasChildren && bHasChildren) return -1; // a (no children) comes first
      if (aHasChildren && !bHasChildren) return 1; // b (no children) comes first

      // If both have same children status, sort by id
      return a.id - b.id;
    });
  }

  selectedGroup(data: any): void {
    localStorage.setItem(environment.SELECTED_MENU_GROUP, JSON.stringify(data));
    this.portalService.updateMenus(true);
    const url = this.hasChildren(data) ? data?.children[0].state : data.state;
    this.router.navigate([url]);
  }
}
