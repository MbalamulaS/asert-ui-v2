import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardDataCard } from 'modules/dashboard/data';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-card',
  imports: [CommonModule, MatIconModule],
  standalone: true,
  template: `
    <div
      class="flex flex-col p-4 border border-gray-300 rounded-lg bg-white shadow-sm"
    >
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-4">
          <div class="p-2 rounded-full border border-gray-300">
            <mat-icon class="h-8 w-8">{{ item.icon }}</mat-icon>
          </div>
          <div>
            <p class="text-lg text-gray-500">{{ item.label.name }}</p>
            <h2 class="text-2xl font-bold text-gray-900">{{ item.amount }}</h2>
          </div>
        </div>
        <div class="">
          <mat-icon class="h-8 w-8 rounded-full text-green-700">info</mat-icon>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-md text-gray-500">{{ item.label.description }}</span>
        <div class="flex items-center gap-x-1">
          <div class="bg-gray-100 p-1 border border-gray-300 rounded-md">
            <mat-icon
              class="h-6 w-6"
              [ngClass]="
                item.status === 'up' ? 'text-green-500' : 'text-rose-500'
              "
            >
              {{ item.status === 'up' ? 'trending_up' : 'trending_down' }}
            </mat-icon>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardCardComponent {
  @Input() item!: DashboardDataCard;
}
