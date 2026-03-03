import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'portal-services',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div
      class="max-w-md mx-auto p-4 bg-white rounded-3xl shadow-sm border border-gray-200"
    >
      <div class="grid grid-cols-3 gap-x-2 gap-y-6 py-2">
        <a
          *ngFor="let service of services"
          [routerLink]="service.route"
          class="flex flex-col items-center"
        >
          <div class="service-icon-wrapper mb-2">
            <div
              [ngClass]="service.bgColor"
              class="w-16 h-16 rounded-full flex items-center justify-center"
            >
              <mat-icon [ngClass]="service.iconColor" class="text-2xl">{{
                service.icon
              }}</mat-icon>
            </div>
          </div>
          <span class="text-sm text-center">{{ service.title }}</span>
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .service-icon-wrapper {
        position: relative;
        transition: transform 0.2s;
      }

      .service-icon-wrapper:hover {
        transform: scale(1.05);
      }

      a:active .service-icon-wrapper {
        transform: scale(0.95);
      }
    `,
  ],
})
export class PortalManagementComponent {
  services = [
    {
      title: 'My Listings',
      icon: 'hotel',
      route: '/listings',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Company Profile',
      icon: 'business',
      route: '/profile',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Submissions',
      icon: 'description',
      route: '/submissions',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Media Uploads',
      icon: 'perm_media',
      route: '/media',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Analytics',
      icon: 'bar_chart',
      route: '/analytics',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/settings',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
    {
      title: 'Messages',
      icon: 'message',
      route: '/messages',
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Payments',
      icon: 'payments',
      route: '/payments',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Help',
      icon: 'help',
      route: '/help',
      bgColor: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
  ];

  constructor(private router: Router) {}
}
