import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { PortalService } from 'layouts/portal-layout/services/portal.service';

interface NavigationItem {
  icon: string;
  label: string;
  route?: string;
  callback?: (event: any) => void;
}

@Component({
  standalone: true,
  selector: `portal-home-component`,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  template: `
    <ng-container>
      <!-- Hero Slider Section -->
      <section
        class="relative w-full  h-[calc(100vh-210px)] md:h-[calc(100vh-215px)] sm:h-[calc(100vh-285px)] overflow-hidden pt-0"
      >
        <!-- Slider container -->
        <div
          class="absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out"
        >
          <!-- Background Image -->
          <div class="absolute inset-0 w-full h-full">
            <img
              [src]="slide.image"
              alt="Slide image"
              class="w-full h-full object-cover"
            />
            <!-- Gradient overlay for better text readability -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-black/90 to-black/40"
            ></div>
          </div>

          <!-- Slide Content -->
          <div
            class="max-w-7xl mx-auto absolute inset-0 flex flex-col justify-center text-white"
          >
            <!-- Animated slide-in headings -->
            <div
              class="text-gray-200/50 md:text-2xl font-normal mb-3 md:mb-5 transform translate-y-0 opacity-100 transition-all duration-700 ease-out delay-200"
            >
              {{ slide.subtitle }}
            </div>
            <div class="overflow-hidden mb-3 md:mb-5">
              <span
                class="mb-2 tracking-wider text-blue-400 font-semibold block md:text-5xl transform translate-y-0 opacity-100 transition-all duration-1000 ease-out"
              >
                {{ slide.title }}
              </span>
            </div>

            <p
              class="md:text-xl max-w-xl mb-8 md:mb-10 lg:mb-10 font-light leading-relaxed text-gray-100 transform translate-y-0 opacity-100 transition-all duration-700 ease-out delay-400"
            >
              {{ slide.description }}
            </p>
            <div
              class="mt-5 md:mt-8 transform translate-y-0 opacity-100 transition-all duration-700 ease-out delay-600"
            >
              <a
                [href]="slide.buttonLink"
                class="relative inline-flex items-center group"
              >
                <span
                  class="relative flex items-center justify-center text-base md:text-xl font-medium tracking-wide px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg text-white
                transform hover:scale-105"
                >
                  {{ slide.buttonText }}
                  <mat-icon
                    class="ml-2 text-base md:text-lg transform transition-transform group-hover:translate-x-1"
                    >arrow_forward</mat-icon
                  >
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </ng-container>
  `,
  styleUrls: ['./slider.scss'],
})
export class PortalHomeComponent implements OnInit {
  portalService = inject(PortalService);

  // Updated slides array with enhanced content
  slide = {
    image: 'assets/slides/slide_0.jpg',
    title: "Tanzania's Premier Grading System",
    subtitle: 'Hospitality Excellence',
    description:
      'Setting the gold standard for hospitality with our comprehensive accommodation classification and grading system across Tanzania.',
    buttonText: 'Get Graded',
    buttonLink: '/get-graded',
  };

  navigationItems: NavigationItem[] = [
    {
      icon: 'login',
      label: 'Sign in',
      callback: (event) => this.openLoginModal(event),
    },
    { icon: 'apartment', label: 'Facilities', route: '/facilities' },
    { icon: 'people', label: 'Assessors', route: '/assessors' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.portalService.setLayoutConfig({
      contentWidth: 'w-full',
    });
  }

  openLoginModal(event: any) {
    event.preventDefault();
    this.portalService.emitEvent(true);
  }

  handleNavItemClick(event: any, item: NavigationItem): void {
    // If the item has a callback function, call it
    if (item.callback) {
      item.callback(event);
    } else if (item.route) {
      // Otherwise navigate to the route
      // We don't need to prevent default here since we want the href to work normally
    }
  }
}
