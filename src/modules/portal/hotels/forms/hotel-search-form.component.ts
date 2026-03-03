import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Hotel } from '../types';
import { HotelService } from '../services/hotel.service';
import { TextInputComponent } from 'components/text-field/text-field.component';
import {
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hotel-search-form',
  standalone: true,
  template: `
    <div class="flex flex-col gap-4">
      <form #searchForm="ngForm" (ngSubmit)="onSubmit(searchForm)">
        <!-- Main Info Section -->
        <div class="bg-white rounded-lg mb-2">
          <app-text-input
            label="Enter TIN Number"
            name="tin"
            ngModel
            [required]="true"
          />
        </div>

        <!-- Submit Buttons -->
        <div class="flex justify-between space-x-4">
          <button
            type="button"
            class="px-6 py-2 border-2 border-blue-600 rounded-md text-blue-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            (click)="cancel()"
          >
            Start New Registration
          </button>

          <button
            type="submit"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Fetch Data
          </button>
        </div>
      </form>

      <div
        *ngFor="let f of facilities"
        class="flex flex-row gap-2 items-center p-2 border hover:bg-gray-200 text-black"
      >
        <div class="flex flex-col flex-1">
          <div class="flex flex-row justify-between">
            <span> {{ f.name }} </span>
            <span class="text-sm"> {{ f.main_activity_name }} </span>
          </div>
          <span class="text-xs"> {{ f.location }} </span>
        </div>
        <button
          (click)="facilitySelected(f)"
          class="px-6 py-2 rounded-md text-blue-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <mat-icon
            class="bg-green-700 text-white mt-1 group-hover:rotate-90 transition-all"
            >add</mat-icon
          >
        </button>
      </div>
    </div>
  `,
  imports: [
    CommonModule,
    TextInputComponent,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
  ],
})
export class HotelSearchFormComponent implements OnInit {
  @Output() formSubmitted = new EventEmitter<Hotel>();
  @Output() cancelClicked = new EventEmitter<boolean>();
  @Input() editMode = false;

  form: FormGroup;
  facilities: any = [];

  isSubmitting = false;
  constructor(
    public hotelService: HotelService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.hotelService.form;
  }

  ngOnInit(): void {}

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.snackBar.open(
        'Please fill in all required fields correctly.',
        'Close',
        { duration: 5000 },
      );
      return;
    }
    const tin = form.value.tin;
    const res = await this.hotelService.importQuery({
      tin,
    });
    console.log(res);
    this.facilities = res?.data ?? [];
    //this.formSubmitted.emit(res?.data);
  }

  cancel(): void {
    this.formSubmitted.emit(null);
    this.cancelClicked.emit(true);
  }

  async facilitySelected(e: any) {
    const bedRoomTypes = await this.hotelService
      .getBedRoomTypes()
      .then((r) => r?.data ?? []);
    const facilities = [];
    const roomTypes = [];
    for (let f of e.facilities) {
      const ftype = f.facility_type.toUpperCase();
      if (ftype != 'ROOM') {
        const name = `${ftype} ${facilities.filter((__f) => __f.facilityType == ftype).length + 1}`;
        const _f = {
          capacity: f.capacity,
          facilityType: ftype,
          name,
          description: ftype,
          openingHours: '10:00 AM',
        };
        facilities.push(
          ...Array.from({ length: f.quantity }, () => ({ ..._f })),
        );
      }
    }

    for (let f of e.rooms) {
      const _f = {
        quantity: f.number_of_beds,
        maxOccupancy: f.number_of_beds,
        bedTypeId: 1,
        bedRoomTypeId:
          bedRoomTypes.find((t) => t.code == f.room_type_code)?.id ?? null,
        amenities: ['Safe'],
      };
      roomTypes.push(_f);
    }

    this.formSubmitted.emit({
      name: e.name,
      website: e.website,
      email: e.email,
      phone: e.phone,
      latitude: e.latitude,
      longitude: e.longitude,
      facilities,
      roomTypes,
    } as any);
  }
}
