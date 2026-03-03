import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  heroCog6Tooth,
  heroMagnifyingGlass,
  heroPencilSquare,
  heroTrash,
} from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Assessor } from 'modules/assessment/assessment';
import { AssessorService } from 'modules/assessment/assessor.service';
import { TextAreaComponent } from 'components/text-area/text-area.component';

@Component({
  selector: 'app-assessor-approval-form',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TextAreaComponent,
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
    <form
      [formGroup]="formGroup"
      (ngSubmit)="submitForm()"
      class="w-full lg:w-[100%] space-y-4 bg-white border border-gray-200 p-6 rounded-lg shadow-sm"
    >
      <app-text-area
        label="Approval Notes"
        name="verificationNotes"
        formControlName="verificationNotes"
      />

      <div class="flex justify-end">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="formGroup.invalid"
        >
          Approve
        </button>
      </div>
    </form>
  `,
})
export class AssessorApprovalFormComponent implements OnInit {
  @Input() assessor: Assessor;
  formGroup: FormGroup;

  isSubmitting = false;

  @Output() onApproveSubmit = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    public service: AssessorService,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      verificationNotes: ['APPLICATION_APPROVED', Validators.required],
    });
  }

  async submitForm() {
    if (this.formGroup.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.formGroup.value;
      formData.id = this.assessor.id;
      this.onApproveSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }
}
