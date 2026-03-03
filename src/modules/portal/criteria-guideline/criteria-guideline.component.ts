import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-criteria-guideline',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mt-16 py-8 rounded-lg shadow-sm">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Criteria and Guidelines
          </h1>
          <div
            class="w-32 h-1 bg-blue-600 mx-auto mb-8 shadow-sm rounded-full"
          ></div>
        </div>
        <div class="bg-white p-4 mb-8">
          <!-- overview -->
          <div class="mb-8">
            <h2 class="text-gray-800">Overview</h2>
            <div class="text-lg font-thin text-gray-700">
              <p class="text-justify">
                Criteria are standard set for the purpose of star rating from
                one to five star for accommodation facilities with amenities
                that qualifies to be graded. These Criteria are commonly known
                for standardization of accommodation facilities and restaurants
                (Classification and Grading). While Guidelines are minimum
                standard set for accommodation facilities that do not have
                amenities that qualifies them to be graded or rated into Star
                from one to five Star.
              </p>
              <p class="text-justify">
                Under EAC, 2021, copyright note, users are reminded that no
                section of this criteria may be reproduced, stored in a
                retrieval system in any form or transmitted by any means without
                prior permission in writing from the EAC.
              </p>
            </div>
          </div>
          <!-- scope -->
          <div class="mb-8">
            <h2 class="text-gray-800">Scope of Criteria and Guidelines</h2>
            <div class="text-lg font-thin text-gray-700">
              <p class="text-justify">
                This standard prescribes requirements for Physical quality
                features, Guest services, Safety & security, Health &
                recreational services, Staff services & facilities and Guest
                satisfaction & experiences. The standard as much as is practical
                embraces sustainability principles.
              </p>
            </div>
          </div>
          <!-- criteria -->
          <div class="mb-8">
            <h2 class="text-gray-800">Criteria</h2>
            <div class="text-lg font-thin text-gray-700">
              <p class="text-justify">
                Criteria are standard set for the purpose of star rating from
                one to five-star for accommodation facilities with amenities
                that qualifies to be graded. These Criteria are commonly known
                for standardization of accommodation facilities and restaurants
                (Classification and Grading).
              </p>
            </div>
          </div>
          <!-- town hotel -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">Town Hotel</h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div class="mb-4 mr-8 border-2 border-gray-300 shadow-lg">
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/town_hotel_criteria.png"
                  alt="town hotel"
                />
              </div>
              <div>
                <p class="text-justify">
                  A commercial establishment with at least 10 lettable rooms,
                  located within urban, sub-urban areas providing accommodation,
                  food and beverage services of which majority of clientele are
                  business or leisure travelers.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/town_hotel.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Download
                </a>
              </div>
            </div>
          </div>
          <!-- vacation hotel -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">Vacation Hotel</h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div class="mb-4 mr-8 border-2 border-gray-300 shadow-lg">
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/vacation_hotel_criteria.png"
                  alt="vacation hotel"
                />
              </div>
              <div>
                <p class="text-justify">
                  A commercial establishment with at least 10 lettable rooms
                  providing accommodation, food and beverage services,
                  entertainment and intended primarily for vacationers and
                  usually located in places frequented for relaxation or
                  recreation including scenic mountains, beaches, oceans, lakes,
                  rivers or historic areas and spas.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/vacation_hotel.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Download
                </a>
              </div>
            </div>
          </div>
          <!-- restaurant hotel -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">Restaurants</h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div class="mb-4 mr-8 border-2 border-gray-300 shadow-lg">
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/restaurants_criteria.png"
                  alt="restaurant"
                />
              </div>
              <div>
                <p class="text-justify">
                  A commercial food and beverage establishment offering an
                  extensive range of specialized or non-specialized cuisines,
                  where refreshments and/ or meals are served, on a flexible or
                  non-flexible time arrangement.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/restaurants.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Download
                </a>
              </div>
            </div>
          </div>
          <!-- lodge hotel -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">Lodges</h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div class="mb-4 mr-8 border-2 border-gray-300 shadow-lg">
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/lodges_criteria.png"
                  alt="lodge"
                />
              </div>
              <div>
                <p class="text-justify">
                  A commercial hospitality establishment physically designed to
                  blend with the natural or cultural environment (using
                  naturally and locally occurring material) and have minimum
                  impact on the environment with at least five lettable rooms
                  located within or near a natural ecosystem or conservation
                  area with majority of clientele being leisure or adventure
                  seekers and has at least one guided natural or cultural
                  experience.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/lodges.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Download
                </a>
              </div>
            </div>
          </div>
          <!-- tented_camp hotel -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">Tented Camps</h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div class="mb-4 mr-8 border-2 border-gray-300 shadow-lg">
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/tented_camps_criteria.png"
                  alt="tented_camp"
                />
              </div>
              <div>
                <p class="text-justify">
                  A commercial semi-permanent hospitality facility physically
                  designed to blend with the natural or cultural environment
                  (using mainly canvas and locally occurring material) and have
                  minimum impact on the environment with at least five lettable
                  rooms located within or near a natural ecosystem or
                  conservation area with majority of clientele being leisure or
                  adventure seekers and has at least one guided natural or
                  cultural experience.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/tented_camps.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Download
                </a>
              </div>
            </div>
          </div>
          <!-- villa hotel -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">Villas</h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div class="mb-4 mr-8 border-2 border-gray-300 shadow-lg">
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/villas_cottages_serviced_apartments.png"
                  alt="villa"
                />
              </div>
              <div>
                <p class="text-justify">
                  A villa is a family house or holiday home that is detached or
                  semi-detached fully furnished and could be self-catering,
                  located in urban, suburban, coast lines or country side areas
                  and often in a cluster of at least 3 lettable units, luxurious
                  in nature with its own grounds and which is rented out to a
                  selected clientele.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/villas_cottages_serviced_apartments.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Download
                </a>
              </div>
            </div>
          </div>
          <!-- Cottage hotel -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">Cottages</h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div class="mb-4 mr-8 border-2 border-gray-300 shadow-lg">
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/villas_cottages_serviced_apartments.png"
                  alt="Cottage"
                />
              </div>
              <div>
                <p class="text-justify">
                  A cottage is a commercial establishment, typically small and
                  cozy dwelling unit, fully furnished and could be
                  self-catering. It may carry the connotation of being an old or
                  old-fashioned building modernly used for accommodation for
                  holiday making in urban, coastline, rural, or semi-rural
                  location.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/villas_cottages_serviced_apartments.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Download
                </a>
              </div>
            </div>
          </div>
          <!-- Serviced Apartment hotel -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">Serviced Apartments</h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div

                class="mb-4 mr-8 border-2 border-gray-300 shadow-lg"
              >
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/villas_cottages_serviced_apartments.png"
                  alt="Serviced Apartment"
                />
              </div>
              <div>
                <p class="text-justify">
                  A commercial story establishment with at least 4 lettable
                  units, fully furnished and could be self-catering, located in
                  urban settings or beach resorts, fully furnished and equipped
                  with a kitchen or offers meal services for short-term or
                  long-term stays. They offer amenities and utilities,
                  housekeeping and a range of services for guests.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/villas_cottages_serviced_apartments.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Download
                </a>
              </div>
            </div>
          </div>
          <!-- Motel hotel -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">Motels</h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div

                class="mb-4 mr-8 border-2 border-gray-300 shadow-lg"
              >
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/motels_criteria.png"
                  alt="Motel"
                />
              </div>
              <div>
                <p class="text-justify">
                  A commercial establishment with at least 10 lettable rooms
                  with garage and parking directly outside, located along
                  highway providing accommodation, food and beverage services of
                  which majority of clientele are motorists.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/motels.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Download
                </a>
              </div>
            </div>
          </div>
          <!-- Guideline -->
          <div class="mb-8">
            <h2 class="text-gray-800">Guidelines</h2>
            <div class="text-lg font-thin text-gray-700">
              <p class="text-justify">
                Guidelines are minimum standard set for accommodation facilities
                that do not have amenities that qualifies them to be graded or
                rated into stars from one to five stars.
              </p>
            </div>
          </div>
          <!-- Guideline files -->
          <div class="mb-8 bg-slate-50 p-6 rounded-md">
            <h3 class="text-gray-800">
              Approved Hotels, Guest Houses, Hostels, Home Stays, Caravan and
              Campsites
            </h3>
            <div
              class="text-lg font-thin text-gray-700 flex flex-col md:flex-row"
            >
              <div

                class=" mb-4 mr-8 border-2 border-gray-300 shadow-lg"
              >
                <img
                  class="min-w-[260px] min-h-[300px] object-cover"
                  src="assets/criteriaguideline/images/guidelines_book_cover.png"
                  alt="Guidelines"
                />
              </div>
              <div>
                <p class="text-justify">
                  The following is a list of guidelines for each accommodation
                  facility. Click on the link to download respective guideline.
                </p>
                <a
                  href="assets/criteriaguideline/pdf/approved_hotels.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pb-4 flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Approved Hotels
                </a>
                <a
                  href="assets/criteriaguideline/pdf/guest_houses.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pb-4 flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Guest Houses
                </a>
                <a
                  href="assets/criteriaguideline/pdf/hostels.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pb-4 flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Hostels
                </a>
                <a
                  href="assets/criteriaguideline/pdf/home_stays.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pb-4 flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Home Stays
                </a>
                <a
                  href="assets/criteriaguideline/pdf/caravan_campsites.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pb-4 flex items-end text-base text-blue-500 hover:underline"
                >
                  <mat-icon class="mr-2">download</mat-icon>
                  Caravan and Campsites
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CriteriaGuidelineComponent {
  constructor() {}
}
