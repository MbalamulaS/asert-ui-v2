import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelAssessmentFormComponent } from 'modules/facility/components/assessment-form.component';
import { SelfAssessmentService } from '../services/self-assessment.service';
import { FormService } from 'modules/forms/services/form.service';
import { HotelService } from 'modules/portal/hotels/services/hotel.service';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-self-assessment-form-wrapper',
  standalone: true,
  imports: [HotelAssessmentFormComponent, CommonModule],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading self-assessment...</p>
      </div>
    </div>
    <hotel-assessment-form
      *ngIf="!isLoading && selfAssessmentUuid"
      [mode]="'self-assessment'"
      [selfAssessmentUuid]="selfAssessmentUuid"
    ></hotel-assessment-form>
  `
})
export class SelfAssessmentFormWrapperComponent implements OnInit {
  selfAssessmentUuid: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private selfAssessmentService: SelfAssessmentService,
    private formService: FormService,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    console.log('SelfAssessmentFormWrapperComponent - ngOnInit started');

    this.route.paramMap.subscribe(async (params) => {
      this.route.queryParamMap.subscribe(async (queryParams) => {
        try {
          console.log('Route params:', params);
          console.log('Query params:', queryParams);

          const formId = params.get('formId');
          const hotelUuid = queryParams.get('uuid');

          console.log('Extracted - formId:', formId, 'hotelUuid:', hotelUuid);

          if (!formId || !hotelUuid) {
            console.error('Missing required parameters - formId:', formId, 'hotelUuid:', hotelUuid);
            alert('Unable to load self-assessment. Missing required information.');
            this.isLoading = false;
            return;
          }

          console.log('Self-assessment init - formId:', formId, 'hotelUuid:', hotelUuid);

          // Step 1: Get the hotel details (to verify access)
          console.log('Fetching hotel details for:', hotelUuid);
          const hotelResponse = await lastValueFrom(
            this.hotelService.getHotelByUuid(hotelUuid)
          );
          console.log('Hotel response:', hotelResponse);
          const hotel = hotelResponse.data;

          if (!hotel) {
            console.error('Hotel not found in response');
            alert('Hotel not found.');
            this.router.navigate(['/manage-listings']);
            return;
          }

          console.log('Hotel loaded successfully:', hotel);

          // Step 2: Check for existing draft self-assessment for this hotel and form
          console.log('Checking for existing drafts...');
          const existingAssessmentsResponse = await lastValueFrom(
            this.selfAssessmentService.getHotelSelfAssessments(hotelUuid)
          );
          console.log('Existing assessments response:', existingAssessmentsResponse);

          const draftAssessment = existingAssessmentsResponse.data?.find(
            (sa: any) => sa.status === 'DRAFT' && sa.formUuid === formId
          );

          if (draftAssessment) {
            // Resume existing draft
            console.log('Resuming draft self-assessment:', draftAssessment.uuid);
            this.selfAssessmentUuid = draftAssessment.uuid;
          } else {
            // Step 3: Start a new self-assessment
            const response = await lastValueFrom(
              this.selfAssessmentService.startSelfAssessment({
                hotelUuid: hotelUuid,
                formUuid: formId
              })
            );

            console.log('Started new self-assessment:', response.data.uuid);
            this.selfAssessmentUuid = response.data.uuid;
          }

          this.isLoading = false;
        } catch (error) {
          console.error('Error initializing self-assessment:', error);
          alert('Failed to load self-assessment. Please try again.');
          this.isLoading = false;
        }
      });
    });
  }
}
