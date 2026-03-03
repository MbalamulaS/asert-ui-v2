import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { Reservation } from '../reservation';
import { ReservationService } from '../reservation.service';
import { AutocompleteComponent } from '../../../../components/autocomplete/autocomplete.component';
import { CountryService } from 'modules/setup/country/country.service';
import { IdentificationTypeService } from 'modules/setup/identification-type/identification-type.service';
import { DatepickerComponent } from '../../../../components/datepicker/datepicker.component';
import { FetcherComponent } from '../../../../components/fetcher/fetcher.component';
import { Hotel } from 'modules/portal/hotels/types';
import { HotelService } from 'modules/portal/hotels/services/hotel.service';
import { AutocompleteAsyncComponent } from 'components/autocomplete/autocomplete-async.component';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    AutocompleteComponent,
    AutocompleteAsyncComponent,
    DatepickerComponent,
    FetcherComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div>
        <app-autocomplete-async
          api="visitors"
          label="Fetching Visitor.."
          [defaultParams]="{ size: '10', searchType: 'or' }"
          searchParam="fullName"
          displayKey="name"
          valueKey="id"
          formControlName="visitorIds"
          loadingLabel="Searching Visitor..."
          (onNewDialog)="openVisitorDialog()"
          showCreateLink="true"
        />
      </div>
      <div>
        <app-fetcher
          class="flex-1"
          api="hotels"
          [defaultParams]="{ size: 20 }"
          loadingLabel="Fetching Hotel.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-autocomplete
                [form]="form"
                name="hotelId"
                formControlName="hotelId"
                label="Select Hotel"
                [displayLabel]="'name'"
                [options]="response.data"
                (onOptionSelected)="selectedHotel($event, response.data)"
              ></app-autocomplete>
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
      </div>
      <div class="flex md:flex-row flex-col md:gap-x-4">
        <app-fetcher
          #roomTypeFetcher
          *ngIf="isHotelSelected"
          class="flex-1"
          api="{{ roomTypeApi }}"
          [defaultParams]=""
          loadingLabel="Fetching Room type.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-autocomplete
                [form]="form"
                name="roomTypeId"
                formControlName="roomTypeId"
                label="Select Room type"
                [displayLabel]="'name'"
                [options]="response.data"
              ></app-autocomplete>
            </div>
            <ng-template #noData>No data available </ng-template>
          </ng-template>
        </app-fetcher>
        <app-text-input
          class="flex-1"
          label="Room number"
          name="roomNumber"
          formControlName="roomNumber"
        />
      </div>
      <div class="flex md:flex-row flex-col md:gap-x-4">
        <app-datepicker
          [form]="form"
          class="flex-1"
          label="Check in date"
          name="checkInDate"
          [minDate]="minDate"
        />
        <app-datepicker
          [form]="form"
          class="flex-1"
          label="Check out date"
          name="checkOutDate"
          [minDate]="minDate"
        />
      </div>
      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!form.dirty || form.invalid || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="form.get('id')?.value ? 'UPDATE' : 'CREATE'"
          (action)="submitForm()"
        />
      </div>
    </form>
  `,
})
export class FormComponent {
  form: FormGroup;
  selectedItems: Reservation[] = [];
  isSubmitting = false;
  minDate: Date = new Date();
  genders = [
    { id: 'M', name: 'Male' },
    { id: 'F', name: 'Female' },
  ];
  isHotelSelected: boolean = false;
  roomTypeApi: string = '';
  @Output() onSubmit = new EventEmitter<string>();
  @ViewChild('roomTypeFetcher') roomTypeFetcher!: FetcherComponent;

  constructor(
    public service: ReservationService,
    public countryService: CountryService,
    public identificationTypeService: IdentificationTypeService,
    public hotelService: HotelService
  ) {
    this.form = this.service.form;
  }

  async submitForm() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      formData.visitorIds = formData.visitorIds.toString().split('');

      this.onSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }
  selectedHotel(e: number, hotelsData: Hotel[]) {
    this.isHotelSelected = false;
    const selectHotel = hotelsData.find((obj) => obj.id === e);
    this.roomTypeApi = `hotels/${selectHotel.uuid}/room-types`;
    this.isHotelSelected = !this.isHotelSelected;
  }

  openVisitorDialog() {
    this.onSubmit.emit('openVisitor');
  }
}
