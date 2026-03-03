import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  OverlayModule,
} from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass } from '@ng-icons/heroicons/outline';
import { CtrlKToggleDirective } from 'app/directives/ctrlk-toggle-directive';
import { SearchBarService } from 'app/services/search-bar.service';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { Router, NavigationEnd } from '@angular/router';
import { DialogService } from './dialog/dialog.service';
import { HeadlessDialogComponent } from 'components/headless-dialog/headless-dialog.component';
import { Hotel } from 'modules/portal/hotels/types';

@Component({
  standalone: true,
  selector: 'command-palette',
  imports: [
    MatIconModule,
    NgIconComponent,
    CtrlKToggleDirective,
    NgIf,
    HeadlessDialogComponent,
    OverlayModule,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    PortalModule,
    CommonModule,
    FetcherComponent,
  ],
  viewProviders: [provideIcons({ heroMagnifyingGlass })],
  template: `
    <div
      class="relative flex items-center w-full max-w-3xl"
      appCtrlKToggle
      [isOpen]="isOpen"
      [setIsOpen]="setIsOpen"
      cdkOverlayOrigin
      #originOverlay="cdkOverlayOrigin"
    >
      <ng-icon
        size="20"
        color="dark-grey"
        name="heroMagnifyingGlass"
        class="absolute left-4  text-white"
      />
      <input
        type="text"
        readonly
        (click)="setIsOpen(true)"
        [placeholder]="label"
        class="pl-12 mt-1 pt-0 border border-blue-600 bg-blue-600 text-white font-medium placeholder-primary-50 placeholder:text-sm !rounded-lg p-2 w-full md:!w-[740px] lg:w-[650px] focus:outline-none"
      />
      <mat-icon
        class="material-symbols-outlined absolute text-lg right-8 text-blue-400"
      >
        keyboard_command_key
      </mat-icon>
      <span
        class="material-symbols-outlined absolute text-sm right-4 text-blue-400"
      >
        <span class="absolute -top-2 right-0">+ K</span>
      </span>

      <headless-dialog [open]="isOpen" (onClose)="handleClose($event)">
        <ng-template>
          <div class="mb-5">
            <div class="flex flex-row justify-center items-center gap-4 px-4">
              <mat-icon class="text-gray-400">search</mat-icon>
              <input
                placeholder="search facilities..."
                (input)="onInputChange($event)"
                class="border-0 text-lg w-full text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-0 h-14"
                (keydown)="handleKeydown($event)"
              />
            </div>
          </div>
        </ng-template>
        <ng-template
          cdkConnectedOverlay
          [cdkConnectedOverlayOrigin]="originOverlay"
          [cdkConnectedOverlayOpen]="overlayOpen()"
          class="relative"
        >
          <div
            class="w-auto md:!w-[740px] -left-1 !relative md:-left-[101px] top-[100px] bg-white border-t py-0 text-sm max-h-96 overflow-y-auto border-gray-300"
          >
            <app-fetcher
              #fetcher
              api="facilities"
              [defaultParams]="defaultParams"
              loadingLabel="Fetching Levels.."
            >
              <ng-template let-response>
                @for (facility of response.data; track $index) {
                  <div
                    (click)="navigateToFacility(facility)"
                    [ngClass]="{
                      'space-x-1 px-4 py-2': true,
                      'bg-blue-500': $index === activeIndex,
                      'bg-white hover:bg-blue-500': $index !== activeIndex,
                    }"
                    tabindex="0"
                    (keydown)="handleFacilityKeydown($event, $index, facility)"
                    #facilityItem
                  >
                    <span
                      [ngClass]="{
                        'font-medium': true,
                        'text-white': $index === activeIndex,
                        'text-gray-900': $index !== activeIndex,
                      }"
                    >
                      {{ facility.name }}
                    </span>
                    <span
                      [ngClass]="{
                        'text-indigo-200': $index === activeIndex,
                        'text-gray-400': $index !== activeIndex,
                      }"
                    >
                      in {{ facility.email }}
                    </span>
                  </div>
                }
                <ng-template #noData>No data available</ng-template>
              </ng-template>
            </app-fetcher>
          </div>
        </ng-template>
      </headless-dialog>
    </div>
  `,
})
export class CommandPalette {
  label: string = 'Find facilities...';
  isOpen = false;
  searchTerm: string = '';
  activeIndex: number | null = null;
  defaultParams: { size: string; name: string; sort: 'id,asc' } = {
    size: '20',
    sort: 'id,asc',
    name: '',
  };

  searchBarService = inject(SearchBarService);
  router = inject(Router);
  overlayOpen = this.searchBarService.overlayOpen;

  @ViewChild('fetcher') fetcherComponent!: FetcherComponent;
  @ViewChildren('facilityItem') facilityItems!: QueryList<ElementRef>;

  constructor(private dialog: DialogService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects === event.url) {
          this.router.navigated = false;
        }
      }
    });
  }

  openModal() {}

  onInputChange(_event: Event) {
    const event = _event.target as HTMLInputElement;
    this.searchTerm = event.value;
    this.defaultParams.name = this.searchTerm;
    this.fetcherComponent?.refetch(this.defaultParams);
    this.searchBarService.setOverlayOpen(true);
  }

  setIsOpen = (isOpen: boolean) => {
    this.isOpen = isOpen;
  };

  handleClose($event) {
    this.searchBarService.setOverlayOpen(false);
  }

  navigateToFacility(facility: Hotel): void {
    this.router
      .navigate([`/manage-listings/${facility.uuid}`], {
        queryParams: {},
      })
      .then(() => {
        this.router.navigate([`/manage-listings/${facility.uuid}`], {});
      });
    this.searchBarService.setOverlayOpen(false);
    this.isOpen = false;
  }

  handleKeydown(event: KeyboardEvent) {
    if (
      event.key === 'Tab' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp'
    ) {
      event.preventDefault();
      const focusableElements = this.facilityItems.toArray();
      const currentIndex = focusableElements.findIndex(
        (item) => item.nativeElement === document.activeElement,
      );

      if (event.shiftKey || event.key === 'ArrowUp') {
        // Move focus to the previous item
        if (currentIndex > 0) {
          focusableElements[currentIndex - 1].nativeElement.focus();
          this.activeIndex = currentIndex - 1;
        } else {
          focusableElements[focusableElements.length - 1].nativeElement.focus();
          this.activeIndex = focusableElements.length - 1;
        }
      } else {
        // Move focus to the next item
        if (currentIndex < focusableElements.length - 1) {
          focusableElements[currentIndex + 1].nativeElement.focus();
          this.activeIndex = currentIndex + 1;
        } else {
          focusableElements[0].nativeElement.focus();
          this.activeIndex = 0;
        }
      }
    } else if (event.key === 'Enter') {
      const focusableElements = this.facilityItems.toArray();
      const currentIndex = focusableElements.findIndex(
        (item) => item.nativeElement === document.activeElement,
      );
      this.navigateToFacility(this.fetcherComponent.data?.data[currentIndex]);
    }
  }

  handleFacilityKeydown(event: KeyboardEvent, index: number, facility: Hotel) {
    if (
      event.key === 'Tab' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp'
    ) {
      event.preventDefault();
      const focusableElements = this.facilityItems.toArray();

      if (event.shiftKey || event.key === 'ArrowUp') {
        if (index > 0) {
          focusableElements[index - 1].nativeElement.focus();
          this.activeIndex = index - 1;
        } else {
          focusableElements[focusableElements.length - 1].nativeElement.focus();
          this.activeIndex = focusableElements.length - 1;
        }
      } else {
        if (index < focusableElements.length - 1) {
          focusableElements[index + 1].nativeElement.focus();
          this.activeIndex = index + 1;
        } else {
          focusableElements[0].nativeElement.focus();
          this.activeIndex = 0;
        }
      }
    } else if (event.key === 'Enter') {
      this.navigateToFacility(facility);
    }
  }
}
