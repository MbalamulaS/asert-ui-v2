import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PreloaderService } from 'components/preloader/preloader.service';
import { CommonModule } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

type TailwindSize = '5' | '6' | '8' | '16' | '20';

@Component({
  selector: 'preloader',
  imports: [CommonModule],
  standalone: true,
  template: `
    <div
      *ngIf="loading"
      aria-label="Loading..."
      role="status"
      class="flex items-center space-x-2 fixed inset-0 justify-center opacity-0 transition-opacity duration-300"
      (@fadeInOut.start)="animationStarted($event)"
      (@fadeInOut.done)="animationDone($event)"
      [@fadeInOut]="animationState"
    >
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
        >&#8203;</span
      >

      <svg class="h-16 w-16 animate-spin stroke-white" viewBox="0 0 256 256">
        <line
          x1="128"
          y1="32"
          x2="128"
          y2="64"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="24"
        ></line>
        <line
          x1="195.9"
          y1="60.1"
          x2="173.3"
          y2="82.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="24"
        ></line>
        <line
          x1="224"
          y1="128"
          x2="192"
          y2="128"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="24"
        ></line>
        <line
          x1="195.9"
          y1="195.9"
          x2="173.3"
          y2="173.3"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="24"
        ></line>
        <line
          x1="128"
          y1="224"
          x2="128"
          y2="192"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="24"
        ></line>
        <line
          x1="60.1"
          y1="195.9"
          x2="82.7"
          y2="173.3"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="24"
        ></line>
        <line
          x1="32"
          y1="128"
          x2="64"
          y2="128"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="24"
        ></line>
        <line
          x1="60.1"
          y1="60.1"
          x2="82.7"
          y2="82.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="24"
        ></line>
      </svg>
      <span [attr.class]="getLoaderClasses('span')">Loading...</span>
    </div>
  `,
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
  ],
})
export class PreloaderComponent implements OnInit, OnDestroy {
  loading = false;
  private subscription!: Subscription;
  animationState: string = '';
  @Input() loaderColor: string = 'gray-500';
  @Input() textColor: string = 'red-500';
  @Input() size: TailwindSize = '16';

  constructor(
    private preloaderService: PreloaderService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.subscription = this.preloaderService.loading$.subscribe((loading) => {
      this.loading = loading;
      // Trigger change detection
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  animationStarted(event: any) {
    this.animationState = 'in';
  }

  animationDone(event: any) {
    if (event.toState === 'void') {
      this.animationState = '';
    }
  }

  getLoaderClasses(element: string): string {
    let existingClasses = '';

    if (element === 'svg') {
      existingClasses = `h-${this.size} w-${this.size} animate-spin stroke-${this.loaderColor}`;
    } else if (element === 'span') {
      existingClasses = `text-3xl font-medium text-${this.textColor}`;
    }

    return existingClasses;
  }
}
