import {Component, OnInit} from '@angular/core';
import {provideIcons} from '@ng-icons/core';
import {heroCog6Tooth, heroMagnifyingGlass, heroPencilSquare, heroTrash,} from '@ng-icons/heroicons/outline';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DualMultiSelectComponent} from "components/dual-multiselect/dual-multiselect.component";
import {FetcherComponent} from "components/fetcher/fetcher.component";
import {DatePipe, NgIf} from "@angular/common";
import {minArrayLengthValidator} from "utils/validators";
import {AutocompleteComponent} from "components/autocomplete/autocomplete.component";
import {DatepickerComponent} from "components/datepicker/datepicker.component";
import {SubmitButtonComponent} from "components/submit-button/submit-button.component";
import {AssessorService} from "modules/assessment/assessor.service";
import {ToastService} from "app/toast.service";


interface Item {
  id: number;
  name: string;
}


@Component({
  selector: 'app-assessor-assign-hotels',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    DualMultiSelectComponent,
    FetcherComponent,
    NgIf,
    AutocompleteComponent,
    DatepickerComponent,
    SubmitButtonComponent,


  ],
  viewProviders: [
    provideIcons({
      heroCog6Tooth,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submitForm()">
      <app-fetcher
        api="assessors/approved-applications"
        [defaultParams]="{ size: 20 }"
        loadingLabel="Fetching Assessors.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-autocomplete
              [form]="form"
              name="assessorId"
              formControlName="assessorId"
              label="Select Assessor"
              [displayLabel]="'name'"
              [options]="response.data"
            ></app-autocomplete>
          </div>
          <ng-template #noData>No data available</ng-template>
        </ng-template>
      </app-fetcher>

      <app-fetcher
        api="hotels/new-and-un-assigned"
        [defaultParams]="{ size: '100' }"
        loadingLabel="Fetching Hotels.."
      >
        <ng-template let-response>
          <div *ngIf="response; else noData">
            <app-dual-multi-select
              [title]="'Select Hotels'"
              [items]="response.data"
              [selectedItems]="form.get('hotels').value"
              (onAddRemove)="handleAddRemoveCatchmentAreas($event)"
            />
          </div>
          <ng-template #noData>No data available</ng-template>
        </ng-template>
      </app-fetcher>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 my-5">
        <app-datepicker
          [form]="form"
          label="Date Assigned"
          name="dateAssigned"
        ></app-datepicker>
        <app-datepicker
          [form]="form"
          label="Deadline"
          name="deadline"
        ></app-datepicker>
      </div>
      <div class="flex justify-end my-5">
        <submit-button
          [isDisabled]="form.invalid"
          [isSubmitting]="isSubmitting"
          [buttonText]="'ASSIGN HOTELS'"
          (action)="submitForm()"
        />
      </div>
    </form>
  `,
})
export class AssignHotelComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder,
              private toast: ToastService,
              private datePipe: DatePipe, private assessorService: AssessorService,) {
  }

  ngOnInit() {
    this.form = this.initForm();
  }

  initForm(): FormGroup {
    return this.fb.group({
      assessorId: new FormControl(null, [Validators.required]),
      dateAssigned: new FormControl(this.datePipe.transform(Date.now(), 'yyyy-MM-dd'), [Validators.required]),
      deadline: new FormControl('', [Validators.required]),
      hotels: new FormControl([], [minArrayLengthValidator(1)]),
    });
  }

  handleAddRemoveCatchmentAreas(event: { added: Item[]; removed: Item[] }) {
    const itemsControl = this.form.get('hotels');
    const {removed, added} = event;

    if (itemsControl) {
      const currentServices = itemsControl.value;
      const newServices = [
        ...currentServices,
        ...added.filter(
          (item) => !currentServices.some((service) => service.id === item.id),
        ),
      ];

      const updatedServices = newServices.filter((service) => {
        return !removed.some((r) => r.id === service.id);
      });

      itemsControl.setValue(updatedServices, {emitEvent: true});
      itemsControl.markAsDirty();
    }
  }

  submitForm(): void {
    const formData = this.form.value;
    const dateAssigned = this.datePipe.transform(formData.dateAssigned, 'yyyy-MM-dd');
    const deadline = this.datePipe.transform(formData.deadline, 'yyyy-MM-dd');
    const assessorId = formData.assessorId;
    const ids = formData.hotels.map(r => r.id);
    const payload = {
      dateAssigned,
      deadline,
      hotels: ids,
    }
    this.assessorService.assignHotels(assessorId, payload).subscribe({
      next: (response) => {
        this.form.reset();
        this.toast.success('Success!', 'Hotels Assigned to Assessor Successfully');
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
