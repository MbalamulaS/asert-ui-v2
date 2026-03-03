import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { SubmitButtonComponent } from 'components/submit-button/submit-button.component';
import { BedTypeService } from '../bed-type.service';
import { TextAreaComponent } from 'components/text-area/text-area.component';

interface Item {
  id: number;
  name: string;
}

@Component({
  selector: 'bed-type-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TextInputComponent,
    SubmitButtonComponent,
    TextAreaComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <app-text-input label="Name" name="name" formControlName="name" />
      <app-text-area
        label="Description"
        name="description"
        [rows]="3"
        formControlName="description"
      />

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
export class BedTypeFormComponent {
  form: FormGroup;
  selectedItems: Item[] = [];
  isSubmitting = false;
  canApprove: boolean = false;

  @Output() onSubmit = new EventEmitter<string>();

  constructor(public service: BedTypeService) {
    this.form = this.service.form;
  }

  async submitForm() {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      this.onSubmit.emit(formData);
    } catch (error) {
    } finally {
      this.isSubmitting = false;
    }
  }

  handleOptionSelected(event: any) {
    this.selectedItems = event;
  }

  onSelectionChanged(selectedItems: any[]): void {
    this.selectedItems = selectedItems;
  }

  handleAddRemove(event: { added: string[]; removed: string[] }) {
    const statesControl = this.form.get('states');
    const { removed, added } = event;

    if (statesControl) {
      const currentStates = statesControl.value;
      const newRoles = [
        ...currentStates,
        ...added.filter(
          (item) => !currentStates.some((state: string) => state === item),
        ),
      ];

      const updatedRoles = newRoles.filter((state) => {
        return !removed.some((s) => s === state);
      });

      statesControl.setValue(updatedRoles);
    }
  }

  onApprovalSelectionChange(value: any): void {
    this.canApprove = value;
  }

  _canApprove() {
    const approvalControl = this.form.get('hasApprovalStages');
    if (approvalControl && approvalControl.value) {
      this.canApprove = approvalControl.value;
    }
  }
}
