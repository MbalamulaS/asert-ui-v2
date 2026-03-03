import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { DualMultiSelectComponent } from 'components/dual-multiselect/dual-multiselect.component';
import { HotelService } from '../services/hotel.service';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'hotel-assessor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SubmitButtonComponent,
    MatChipsModule,
    FetcherComponent,
    DualMultiSelectComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
        <app-fetcher
          api="assessors"
          [defaultParams]="{ size: '100', status: 'APPROVED' }"
          loadingLabel="Fetching Assessors.."
        >
          <ng-template let-response>
            <div *ngIf="response; else noData">
              <app-dual-multi-select
                [title]="'Select Assessor'"
                [items]="response.data"
                [selectedItems]="form.value.assessors"
                (onAddRemove)="handleAddRemove($event)"
              />
            </div>
            <ng-template #noData>No data available</ng-template>
          </ng-template>
        </app-fetcher>
      </div>

      <div class="mt-4 flex justify-end">
        <submit-button
          [isDisabled]="!isFormValid() || isSubmitting"
          [isSubmitting]="isSubmitting"
          [buttonText]="
            form.get('id')?.value ? 'Update Assessors' : 'Add Assessors'
          "
          (action)="submitForm()"
        />
      </div>
    </form>
  `,
})
export class HotelAssessorFormComponent {
  form: FormGroup;
  selectedUsers: Item[] = [];
  isSubmitting = false;
  assessors: Item[] = [];

  @Output() onSubmit = new EventEmitter<string>();

  constructor(public service: HotelService) {
    this.form = this.service.userForm;
  }

  async submitForm() {
    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      this.onSubmit.emit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  handleAddRemove(event: { added: Item[]; removed: Item[] }) {
    const assessorsControl = this.form.get('assessors');
    const { removed, added } = event;

    if (assessorsControl) {
      const currentUser = assessorsControl.value;
      const newUsers = [
        ...currentUser,
        ...added.filter(
          (item) => !currentUser.some((user: any) => user.id === item.id),
        ),
      ];

      const updatedUsers = newUsers.filter((user) => {
        return !removed.some((r) => r.id === user.id);
      });

      assessorsControl.setValue(updatedUsers);

      // Mark the control as dirty to activate the button
      assessorsControl.markAsDirty();

      // Also mark the parent form as dirty
      this.form.markAsDirty();
    }
  }

  isFormValid(): boolean {
    const assessorsControl = this.form.get('assessors');
    if (assessorsControl && assessorsControl.value.length > 0) {
      return true;
    }
    return this.form.dirty && this.form.valid;
  }

  mapUserData(response: any) {
    console.log('response', response);
    const { data: assessors } = response;
    if (!Array.isArray(assessors)) {
      return [];
    }

    return assessors.map((u: any) => ({
      id: u.id,
      name: u.name,
      designation: u.designation,
      districtId: u.districtId,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      ldapUser: u.ldapUser,
      phoneNumber: u.phoneNumber,
      regionId: u.regionId,
      username: u.username,
    }));
  }
}
