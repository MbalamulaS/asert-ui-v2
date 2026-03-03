import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { bootstrapEnvelope, bootstrapFacebook, bootstrapInstagram, bootstrapMailbox, bootstrapTwitterX, bootstrapYoutube } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  standalone: true,
  imports: [MatIconModule, NgIcon],
  providers: [
    provideIcons({
      bootstrapFacebook,
      bootstrapInstagram,
      bootstrapYoutube,
      bootstrapTwitterX,
      bootstrapEnvelope,
    }),
  ],
  selector: `portal-layout-footer`,
  template: `
    <!-- Footer -->
    <footer class="bg-gray-200 text-white pt-8 md:pt-12 pb-6">
      <!-- Main Footer Content -->
      <div class="max-w-7xl mx-auto">
        <div
          class="flex md:flex-row flex-col justify-between space-y-4 items-baseline"
        >
          <!-- Quick Links -->
          <div class="flex-1 text-wrap items-baseline py-2 text-gray-800">
            <a
              href="#"
              class=" hover:text-blue-600 transition-colors text-sm md:text-base"
              >Home</a
            >
            <span class="px-2 text-2xl font-thin">|</span>
            <a
              href="/accredited-assessors"
              class=" hover:text-blue-600 transition-colors text-sm md:text-base"
              >Accredited Assessor</a
            >
            <span class="px-2 text-2xl font-thin">|</span>
            <a
              href="/graded-facilities"
              class=" hover:text-blue-600 transition-colors text-sm md:text-base"
              >Graded Facilities</a
            >
            <span class="px-2 text-2xl font-thin">|</span>
            <a
              href="criteria-guidelines"
              class=" hover:text-blue-600 transition-colors text-sm md:text-base"
              >Criteria and Guidelines</a
            >
          </div>
          <!-- Social Media Icons -->
          <div class="flex-1">
            <div class="flex flex-row gap-x-4 items-end justify-end">
              <a
                href="#"
                class="bg-gray-700 w-12 h-12 flex items-center justify-center text-center rounded-full hover:bg-blue-600 transition-colors"
              >
                <ng-icon
                  name="bootstrapTwitterX"
                  class="text-base md:text-xl"
                ></ng-icon>
              </a>
              <a
                href="#"
                class="bg-gray-700 w-12 h-12 flex items-center justify-center text-center rounded-full hover:bg-blue-600 transition-colors"
                ><ng-icon
                  name="bootstrapFacebook"
                  class="text-base md:text-xl"
                ></ng-icon>
              </a>
              <a
                href="#"
                class="bg-gray-700 w-12 h-12 flex items-center justify-center text-center rounded-full hover:bg-blue-600 transition-colors"
              >
                <ng-icon
                  name="bootstrapInstagram"
                  class="text-base md:text-xl"
                ></ng-icon>
              </a>
              <a
                href="#"
                class="bg-gray-700 w-12 h-12 flex items-center justify-center text-center rounded-full hover:bg-blue-600 transition-colors"
              >
                <ng-icon
                  name="bootstrapYoutube"
                  class="text-base md:text-xl"
                ></ng-icon>
              </a>
              <a
                href="mailto:info@asert.go.tz"
                class="bg-gray-700 w-12 h-12 flex items-center justify-center text-center rounded-full hover:bg-blue-600 transition-colors"
              >
                <ng-icon
                  name="bootstrapEnvelope"
                  class="text-base md:text-xl"
                ></ng-icon>
              </a>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="text-gray-800 border-t border-gray-700 mt-8 pt-6">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class=" text-xs md:text-sm">
              © 2025 AserT. All rights reserved.
            </div>
            <div class="flex space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                class="text-xs md:text-sm hover:text-blue-600 transition-colors"
                >Privacy Policy</a
              >
              <a
                href="#"
                class="text-xs md:text-sm hover:text-blue-600 transition-colors"
                >Terms of Service</a
              >
              <a
                href="#"
                class="text-xs md:text-sm hover:text-blue-600 transition-colors"
                >Cookie Policy</a
              >
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class PortalLayoutFooterComponent {}
