import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PortalService } from '../services/portal.service';
import { StorageService } from 'modules/login/storage.service';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StorageKey } from 'modules/login/storage.model';
import { CompanyDialogService } from 'modules/portal/company/services/company-dialog.service';
import asertLogo from 'assets/asert_logo.png';

const { ASERT_USER } = StorageKey;

interface NavigationItem {
  icon: string;
  title: string;
  route?: string;
  bgColor: string;
  callback?: (event: any) => void;
}

@Component({
  standalone: true,
  selector: 'portal-nav',
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <header
      class="fixed top-0 w-full z-50 transition-all duration-300"
      [ngClass]="getHeaderClasses()"
    >
      <div class="flex items-center justify-between px-4 py-2">
        <!-- Logo -->
        <div class="flex items-center">
          <a href="/">
            <img [src]="logoUrl" alt="AserT Logo" class="h-12" />
          </a>
          <div
            class="text-xs ml-1 mt-5 transition-colors duration-300"
            [ngClass]="getLogoTextClasses()"
          >
            QUALITY IN TOURISM
          </div>
        </div>

        <!-- Mobile Menu Button - Only visible on small screens -->
        <a
          class="md:hidden transition-colors duration-300 flex items-center justify-center"
          [ngClass]="getMobileMenuButtonClasses()"
          (click)="toggleMobileMenu()"
        >
          <mat-icon>{{ isMobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
        </a>

        <!-- Desktop Navigation - Hidden on small screens -->
        <div
          class="hidden md:flex items-center space-x-4 text-xl tracking-wide"
        >
          @if (!currentUser) {
          <a
            href="/accredited-assessors"
            class="hover:bg-blue-600 px-2 py-4 font-normal hover:font-normal rounded-lg transition-colors duration-300"
            [ngClass]="getNavLinkClasses()"
          >
            Acredited Assessors
          </a>

          <a
            href="/graded-facilities"
            class="hover:bg-blue-600 px-2 py-4 font-normal hover:font-normal rounded-lg transition-colors duration-300"
            [ngClass]="getNavLinkClasses()"
          >
            Graded Facilities
          </a>
          <a
            href="/criteria-guidelines"
            class="hover:bg-blue-600 px-2 py-4 font-normal hover:font-normal rounded-lg transition-colors duration-300"
            [ngClass]="getNavLinkClasses()"
          >
            Criteria and Guidelines
          </a>
          <button
            (click)="openLoginModal($event)"
            [ngClass]="getNavLinkClasses()"
            class="hover:bg-blue-600 p-4  font-normal rounded-lg"
          >
            Login
          </button>
          }

          <!-- Services Menu - Only visible when logged in -->
          @if (currentUser && currentUser.isClient) {
          <button
            mat-icon-button
            [matMenuTriggerFor]="serviceMenu"
            matTooltip="Services"
            class="grid-menu-button"
          >
            <mat-icon
              [ngClass]="getIconClasses()"
              class="material-symbols-outlined"
              >apps
            </mat-icon>
          </button>

          <mat-menu
            xPosition="before"
            #serviceMenu="matMenu"
            class="service-menu-panel"
          >
            <div class="p-4 grid grid-cols-3 gap-4 w-80">
              <a
                *ngFor="let service of services"
                [href]="service.route ? service.route : 'javascript:void(0)'"
                (click)="handleNavItemClick($event, service)"
                class="flex flex-col items-center transition-transform hover:scale-105 active:scale-95"
                mat-menu-item
              >
                <div
                  class="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                  [ngClass]="service.bgColor"
                >
                  <mat-icon class="text-lg">{{ service.icon }}</mat-icon>
                </div>
                <span class="text-xs font-medium text-gray-800 mt-1">{{
                  service.title
                }}</span>
              </a>
            </div>
          </mat-menu>
          } @if (currentUser) {
          <!-- Google-style Account Menu Button -->
          <button
            mat-icon-button
            [matMenuTriggerFor]="accountMenu"
            matTooltip="Account"
            class="account-menu-button"
          >
            @if (currentUser) {
            <!-- Use first letter of email as avatar if no image -->
            <div
              class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-base"
            >
              {{ currentUser.email.charAt(0).toUpperCase() }}
            </div>
            } @else {
            <mat-icon
              [ngClass]="getIconClasses()"
              class="material-symbols-outlined"
              >account_circle
            </mat-icon>
            }
          </button>

          <!-- Google-style Account Menu -->
          <mat-menu
            xPosition="before"
            #accountMenu="matMenu"
            class="account-menu-panel"
          >
            <!-- Header with user info -->
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex flex-col items-center">
                <div
                  class="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg mb-2"
                >
                  {{ currentUser.email.charAt(0).toUpperCase() }}
                </div>
                <h3 class="text-base font-medium">
                  Hi, {{ getCurrentUserFirstName() }}!
                </h3>
                <p class="text-sm text-gray-600 !-mt-4">
                  {{ currentUser.email }}
                </p>
                <button
                  (click)="goToDashboard()"
                  class="mt-3 text-blue-600 text-sm font-medium"
                >
                  Manage Your Tasks
                </button>
              </div>
            </div>

            <!-- Account Options -->
            <div class="py-2">
              <mat-divider></mat-divider>
              <a mat-menu-item (click)="logout($event)">
                <mat-icon class="material-symbols-outlined">logout</mat-icon>
                <span>Sign out</span>
              </a>
            </div>
          </mat-menu>
          }
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div
        *ngIf="isMobileMenuOpen"
        class="md:hidden absolute w-full bg-white shadow-md z-50 transition-all duration-300 py-4"
      >
        <div class="flex flex-col space-y-3 px-4">
          <a
            href="/get-graded"
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors block"
          >
            GET GRADED
          </a>

          <a
            href="/assessors"
            class="text-black hover:text-gray-700 transition-colors block py-2"
          >
            ASSESSORS
          </a>

          <a
            href="/facilities"
            class="text-black hover:text-gray-700 transition-colors block py-2"
          >
            FACILITIES
          </a>

          @if (currentUser) {
          <mat-divider></mat-divider>

          <a
            [routerLink]="'manage-facilities'"
            class="text-black hover:text-gray-700 transition-colors block py-2"
          >
            MY FACILITIES
          </a>

          <a
            [routerLink]="'facility-registration-requests'"
            class="text-black hover:text-gray-700 transition-colors block py-2"
          >
            MY REGISTRATIONS
          </a>

          <a
            [routerLink]="'manage-bills'"
            class="text-black hover:text-gray-700 transition-colors block py-2"
          >
            MY BILLS
          </a>

          <a
            [routerLink]="'manage-payments'"
            class="text-black hover:text-gray-700 transition-colors block py-2"
          >
            MY PAYMENTS
          </a>
          }

          <div class="flex space-x-2 justify-start py-2">
            <a
              class="text-black hover:text-gray-700 transition-colors flex items-center justify-center w-10 h-10"
            >
              <mat-icon>translate</mat-icon>
            </a>

            <a
              class="text-black hover:text-gray-700 transition-colors flex items-center justify-center w-10 h-10"
            >
              <mat-icon>add</mat-icon>
            </a>
            @if (currentUser) {
            <a
              (click)="logout($event)"
              class="text-black hover:text-gray-700 transition-colors flex items-center justify-center w-10 h-10"
            >
              <mat-icon>logout</mat-icon>
            </a>
            } @else {
            <a
              (click)="openLoginModal($event)"
              class="text-black hover:text-gray-700 transition-colors flex items-center justify-center w-10 h-10"
            >
              <mat-icon>login</mat-icon>
            </a>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      ::ng-deep .service-menu-panel {
        max-width: none !important;
        width: 340px !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        margin-top: 8px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      }

      ::ng-deep .service-menu-panel .mat-mdc-menu-content {
        padding: 0 !important;
      }

      ::ng-deep .service-menu-panel .mat-mdc-menu-item {
        height: auto !important;
        min-height: auto !important;
        padding: 8px !important;
      }

      ::ng-deep .service-menu-panel .mat-mdc-menu-item:hover {
        background-color: transparent !important;
      }

      ::ng-deep .service-menu-panel .mat-mdc-menu-item .mat-icon {
        margin-right: 0 !important;
      }

      ::ng-deep .account-menu-panel {
        width: 320px !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        margin-top: 8px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      }

      .grid-menu-button {
        position: relative;
      }

      .grid-menu-button::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        transform: scale(0);
        transition: transform 0.3s;
      }

      .grid-menu-button:hover::after {
        transform: scale(1);
      }

      .account-menu-button {
        transition: transform 0.2s;
      }

      .account-menu-button:hover {
        transform: scale(1.05);
      }
    `,
  ],
})
export class PortalNavComponent implements OnInit {
  @Input() currentUser: any;
  // New input property with default value
  @Input() navbarColor: string = 'default';

  logoUrl = asertLogo;

  companyDialogService = inject(CompanyDialogService);

  isScrolled: boolean = false;
  isMobileMenuOpen = false;

  // Google-style service tiles with pastel colors
  services: Array<NavigationItem> = [
    {
      title: 'My Listings',
      icon: 'hotel',
      route: '/manage-listings',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Company Profile',
      icon: 'business',
      callback: (event) => this.openCompanyProfile(event),
      bgColor: 'bg-gray-100',
    },
    {
      title: 'Submissions',
      icon: 'description',
      route: '/submissions',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Media',
      icon: 'perm_media',
      route: '/media',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Analytics',
      icon: 'bar_chart',
      route: '/analytics',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/settings',
      bgColor: 'bg-gray-100',
    },
    {
      title: 'Visitors',
      icon: 'message',
      route: '/manage-visitors',
      bgColor: 'bg-teal-100',
    },
    {
      title: 'Reservations',
      icon: 'payments',
      route: '/manage-reservations',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Help',
      icon: 'help',
      route: '/help',
      bgColor: 'bg-pink-100',
    },
  ];

  constructor(
    public portalService: PortalService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScroll();
    console.log('currentUser', this.currentUser);
  }

  // Get user's first name from email
  getCurrentUserFirstName(): string {
    if (!this.currentUser || !this.currentUser.email) return '';
    const emailParts = this.currentUser.email.split('@');
    if (emailParts.length > 0) {
      const namePart = emailParts[0];
      // Try to extract a name from the email username part
      if (namePart.includes('.')) {
        // If email has a dot format like "john.doe@example.com"
        return (
          namePart.split('.')[0].charAt(0).toUpperCase() +
          namePart.split('.')[0].slice(1)
        );
      } else {
        // Otherwise just use the first part and capitalize it
        return namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }
    }
    return '';
  }

  // Updated method to handle header classes based on navbarColor
  getHeaderClasses() {
    if (this.navbarColor === 'default') {
      return {
        'bg-transparent': !this.isScrolled,
        'bg-blue-500/90 shadow-md': this.isScrolled,
      };
    } else if (this.navbarColor === 'primary') {
      return 'bg-blue-600 shadow-md';
    } else if (this.navbarColor === 'secondary') {
      return 'bg-purple-600 shadow-md';
    } else if (this.navbarColor === 'dark') {
      return 'bg-gray-800 shadow-md';
    } else {
      // If custom color class is passed directly
      return this.navbarColor;
    }
  }

  // Helper method for logo text color
  getLogoTextClasses() {
    if (this.navbarColor === 'default') {
      return {
        'text-white': !this.isScrolled,
        'text-blue-800': this.isScrolled,
      };
    } else {
      return 'text-white';
    }
  }

  // Helper method for mobile menu button colors
  getMobileMenuButtonClasses() {
    if (this.navbarColor === 'default') {
      return {
        'text-white': !this.isScrolled,
        'text-black': this.isScrolled,
      };
    } else {
      return 'text-white';
    }
  }

  // Helper method for nav link colors
  getNavLinkClasses() {
    if (this.navbarColor === 'default') {
      return {
        'text-white hover:text-gray-200': !this.isScrolled,
        'text-black hover:text-gray-700': this.isScrolled,
      };
    } else {
      return 'text-white hover:text-gray-200';
    }
  }

  // Helper method for icon colors
  getIconClasses() {
    if (this.navbarColor === 'default') {
      return {
        'text-white': !this.isScrolled,
        'text-black': this.isScrolled,
      };
    } else {
      return 'text-white';
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Only change appearance on scroll if using default color scheme
    if (this.navbarColor === 'default') {
      this.isScrolled = window.pageYOffset > 0;
    }
  }

  openLoginModal(event: any) {
    event.preventDefault();
    this.portalService.emitEvent(true);
  }

  goToDashboard() {
    if (!this.currentUser) return;

    const isClient = this.currentUser
      ? false
      : this.currentUser.roles[0].isClient;
    const url = isClient ? '/manage-listings' : '/dashboard';
    this.router.navigate([url]);
  }

  logout(event: any) {
    event.preventDefault();
    this.storageService.clear();
    this.storageService.remove(ASERT_USER);
    let url = '/';
    this.router.navigate([url]);
    window.location.reload();
  }

  @HostListener('window:scroll')
  checkScroll() {
    // Only change appearance on scroll if using default color scheme
    if (this.navbarColor === 'default') {
      this.isScrolled = window.scrollY > 50;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    // Close mobile menu when navigating
    this.isMobileMenuOpen = false;
  }

  openCompanyProfile(event: any) {
    event.preventDefault();
    this.companyDialogService.openDialog('/manage-listings');
  }

  handleNavItemClick(event: any, item: NavigationItem): void {
    if (item.callback) {
      item.callback(event);
    } else if (item.route) {
    }
  }
}
