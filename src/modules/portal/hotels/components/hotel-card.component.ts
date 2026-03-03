import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconButtonComponent } from 'components/icon-button/icon-button.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageComponent } from 'components/image/image.component';
import { getStatusBadgeClass } from 'components/image/utils';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    IconButtonComponent,
    ImageComponent,
  ],
  template: `
    <div
      class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <!-- Fixed image container with consistent height and width -->
      <app-image
        [src]="hotel.defaultImage?.mediaUrl"
        [alt]="hotel.name"
        [isBase64]="false"
        height="12rem"
        placeholderIcon="hotel"
        [badgeText]="hotel.statusName || hotel.status"
        [badgeClass]="getBadgeClass(hotel.status)"
      />

      <div class="p-4">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-1">
              {{ hotel.name }}
            </h3>
            <p class="text-gray-600 text-sm">
              {{ hotel.propertyTypeName || hotel.propertyType }}
            </p>
          </div>
          <div class="flex">
            <icon-button
              icon="launch"
              tooltip="Edit Hotel"
              color="green"
              (action)="onEdit()"
            />
            <icon-button
              icon="preview"
              tooltip="Preview Hotel"
              color="green"
              (action)="onView()"
            />
            <icon-button
              icon="delete_outline"
              tooltip="Delete Hotel"
              color="accent"
              (action)="onDelete()"
            />
            @if (false) {
              <icon-button
                icon="scoreboard"
                tooltip="View Score"
                color="green"
                (action)="onViewScore()"
              />
            }
          </div>
        </div>
        <div class="mt-4 border-t pt-4">
          <div class="flex items-center gap-1 text-gray-500 text-sm mb-2">
            <span class="material-icons text-sm">email</span>
            <span class="truncate">{{ hotel.email }}</span>
          </div>
          <div class="flex items-center gap-1 text-gray-500 text-sm">
            <span class="material-icons text-sm">call</span>
            <span>{{ hotel.phone }}</span>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <div class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
            {{ hotel.roomTypes?.length || 0 }} Room Types
          </div>
          <div
            class="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
          >
            {{ hotel.facilities?.length || 0 }} Facilities
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HotelCardComponent {
  @Input() hotel: any;
  @Input() onEdit!: () => void;
  @Input() onView!: () => void;
  @Input() onDelete!: () => void;
  @Input() onViewScore!: () => void;

  constructor(private sanitizer: DomSanitizer) {}

  getBadgeClass(string) {
    return getStatusBadgeClass(string);
  }
}
