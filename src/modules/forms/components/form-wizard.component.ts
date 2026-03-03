import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormService } from '../services/form.service';
import {
  Form,
  FormSection,
  FormField,
  FieldType,
  FormDraftData,
  Draft,
  SectionScoreDto,
  FormSubmissionDto,
} from '../types';
import { CommonModule } from '@angular/common';
import { FormSubmissionService } from '../services/form-submission.service';
import { FormDraftService } from '../services/form-draft.service';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { SelectComponent } from 'components/select/select.component';
import { CheckboxComponent } from 'components/checkbox/checkbox.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { MatIconModule } from '@angular/material/icon';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { FileUploadComponent } from 'components/file-upload/file-upload.component';
import { v4 as uuidv4 } from 'uuid';

interface Option {
  id?: any;
  uuid?: string;
  label?: string;
  value?: string;
  name: string;
  orderIndex?: number;
  score?: number;
  [key: string]: any;
}

@Component({
  selector: 'hotel-assessment-form',
  standalone: true,
  templateUrl: './form-wizard.component.html',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    TextInputComponent,
    TextAreaComponent,
    SelectComponent,
    CheckboxComponent,
    RadioButtonComponent,
    DatepickerComponent,
    FileUploadComponent,
    MatIconModule,
  ],
})
export class FormWizardComponent implements OnInit, OnDestroy {
  formId: string;
  form: Form | null = null;
  formGroup: FormGroup = new FormGroup({});
  currentSectionIndex = 0;
  submissionUuid: string = '';
  flattenedSections: FormSection[] = [];

  draftUuid: string | null = null;
  lastSavedTime: Date | null = null;
  draftAutoSaveInterval: any;
  completedSectionScores: SectionScoreDto[] = [];
  completionPercentage: number = 0;
  runningTotalScore: number = 0;
  runningMaxScore: number = 0;

  isLoading = true;
  isSubmitting = false;
  isCompleted = false;
  submitter = '';
  isDebugMode = false;

  // Evidence upload tracking
  evidenceUploads: Map<string, any[]> = new Map();

  // Cache for current section to avoid redundant computations
  private _cachedCurrentSection: FormSection | null = null;
  private _cachedSectionIndex: number = -1;

  // Options for rating field
  ratingOptions: Option[] = [
    { value: '1', label: '1', name: '1' },
    { value: '2', label: '2', name: '2' },
    { value: '3', label: '3', name: '3' },
    { value: '4', label: '4', name: '4' },
    { value: '5', label: '5', name: '5' },
  ];

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private formSubmissionService: FormSubmissionService,
    private formDraftService: FormDraftService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.formId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.formId = id;
        this.loadForm(this.formId);
      } else {
        this.router.navigate(['/forms']);
      }
    });

    this.draftAutoSaveInterval = setInterval(() => {
      if (this.formGroup?.dirty) {
        this.saveDraft();
      }
    }, 60000);
  }

  loadForm(uuid: string): void {
    this.isLoading = true;
    this.formService.getFormById(uuid).subscribe(
      (response) => {
        const { data } = response;

        // Rebuild section hierarchy
        const hierarchicalSections = this.rebuildSectionHierarchy(
          data.sections,
        );

        // Update the form with hierarchical sections
        this.form = {
          ...data,
          sections: hierarchicalSections,
        };

        // Initialize flattened sections array for navigation
        this.flattenedSections = this.getAllSectionsFlattened();

        if (this.isDebugMode) {
          console.log('Flattened sections:', this.flattenedSections);
          console.log('Hierarchical sections:', hierarchicalSections);
        }

        this.buildForm();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading form:', error);
        this.isLoading = false;
      },
    );
  }

  buildForm(): void {
    if (!this.form) {
      console.warn('Form is null, cannot build form');
      return;
    }

    // Initialize form group
    this.formGroup = this.fb.group({
      submitter: ['', Validators.required],
    });

    // Process all fields from all sections (including subsections)
    this.processFormSections(this.form.sections);
  }

  // Recursive function to process sections and their subsections
  processFormSections(sections: FormSection[]): void {
    if (!sections || sections.length === 0) return;

    sections.forEach((section) => {
      // Process the fields in this section
      if (section.fields && section.fields.length > 0) {
        // Sort fields in place instead of creating a copy
        section.fields.sort((a, b) => a.orderIndex - b.orderIndex);
        this.processFields(section.fields);
      }

      // Process subsections recursively
      if (section.subsections && section.subsections.length > 0) {
        this.processFormSections(section.subsections);
      }
    });
  }

  get progress(): number {
    return this.totalSections > 0
      ? ((this.currentSectionIndex + 1) / this.totalSections) * 100
      : 0;
  }

  getFieldId(field: FormField): string {
    return `field_${field.id}`;
  }

  goToPreviousSection(): void {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
    }
  }

  goToNextSection(): void {
    // Check if current section is valid
    if (this.isSectionValid()) {
      if (this.currentSectionIndex < this.totalSections - 1) {
        // Update scoring information for completed section
        this.updateSectionScore();

        // Move to next section
        this.currentSectionIndex++;
      }
    } else {
      // Mark all fields in current section as touched to show validation errors
      this.markSectionAsTouched();
    }
  }

  updateSectionScore(): void {
    if (!this.currentSection) return;

    let sectionScore = 0;
    let maxPossibleScore = 0;

    // Calculate score for this section's fields
    this.currentSection.fields.forEach((field) => {
      const fieldId = this.getFieldId(field);
      const value = this.formGroup.get(fieldId)?.value;

      // For checkbox and radio fields with options that have scores
      if (
        field.options &&
        field.options.length > 0 &&
        (field.fieldType === FieldType.RADIO ||
          field.fieldType === FieldType.CHECKBOX ||
          field.fieldType === FieldType.SELECT)
      ) {
        // Find all options with scores
        const scoringOptions = field.options.filter(
          (opt) => opt.score !== undefined && opt.score !== null,
        );

        if (scoringOptions.length > 0) {
          // For single selection (radio, select)
          if (typeof value === 'string') {
            const selectedOption = field.options.find(
              (opt) => opt.value === value,
            );
            if (selectedOption && selectedOption.score !== undefined) {
              sectionScore += Number(selectedOption.score);
            }
          }
          // For multi-select (checkbox with multiple options)
          else if (Array.isArray(value)) {
            value.forEach((val) => {
              const selectedOption = field.options.find(
                (opt) => opt.value === val,
              );
              if (selectedOption && selectedOption.score !== undefined) {
                sectionScore += Number(selectedOption.score);
              }
            });
          }

          // Calculate max possible score for this field
          const maxOptionScore = Math.max(
            ...scoringOptions.map((opt) => Number(opt.score || 0)),
          );
          maxPossibleScore += maxOptionScore;
        }
      }
      // For rating fields
      else if (field.fieldType === FieldType.RATING && value) {
        sectionScore += Number(value);
        maxPossibleScore += 5; // Assuming rating is 1-5
      }
    });

    // Calculate percentage
    const percentage =
      maxPossibleScore > 0 ? (sectionScore / maxPossibleScore) * 100 : 0;

    // Save section score
    const sectionScoreEntry: SectionScoreDto = {
      sectionId: Number(this.currentSection.id),
      sectionUuid: this.currentSection.uuid!,
      sectionTitle: this.currentSection.title,
      score: sectionScore,
      maxPossible: maxPossibleScore,
      percentage: percentage,
    };

    // Update or add to completed section scores
    const existingIndex = this.completedSectionScores.findIndex(
      (s) => s.sectionUuid === this.currentSection?.uuid,
    );
    if (existingIndex >= 0) {
      this.completedSectionScores[existingIndex] = sectionScoreEntry;
    } else {
      this.completedSectionScores.push(sectionScoreEntry);
    }

    // Update progress display
    this.updateProgressDisplay();
  }

  isSectionValid(): boolean {
    if (!this.currentSection) return false;

    // No need to sort - currentSection getter already sorts fields
    for (const field of this.currentSection.fields) {
      const fieldId = this.getFieldId(field);
      const control = this.formGroup.get(fieldId);

      if (control && field.required && control.invalid) {
        return false;
      }
    }

    return true;
  }

  markSectionAsTouched(): void {
    if (!this.currentSection) return;

    // No need to sort - currentSection getter already sorts fields
    for (const field of this.currentSection.fields) {
      const fieldId = this.getFieldId(field);
      const control = this.formGroup.get(fieldId);

      if (control) {
        control.markAsTouched();
      }
    }
  }

  submitForm(): void {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach((key) => {
        this.formGroup.get(key)?.markAsTouched();
      });
      return;
    }

    // Validate required evidence uploads
    const missingEvidence = this.validateRequiredEvidence();
    if (missingEvidence.length > 0) {
      const fieldLabels = missingEvidence
        .map((item) => item.label)
        .join('\n- ');
      alert(
        `Please upload required evidence for the following fields:\n\n- ${fieldLabels}`,
      );
      console.error('Missing required evidence for fields:', missingEvidence);
      return;
    }

    if (!this.form) {
      console.error('Form is null, cannot submit');
      return;
    }

    this.isSubmitting = true;

    // Update score for final section
    this.updateSectionScore();

    // Create the submission DTO with the expected format
    const submissionDto: FormSubmissionDto = {
      formUuid: this.form.uuid,
      submittedBy: this.formGroup.get('submitter')?.value || '',
      responses: [],
      sectionScores: this.completedSectionScores,
      totalScore: this.completedSectionScores.reduce(
        (sum, section) => sum + section.score,
        0,
      ),
      maxPossibleScore: this.completedSectionScores.reduce(
        (sum, section) => sum + section.maxPossible,
        0,
      ),
      percentage: 0,
    };

    // Calculate overall percentage
    if (submissionDto.maxPossibleScore && submissionDto.maxPossibleScore > 0) {
      submissionDto.percentage =
        (submissionDto.totalScore! / submissionDto.maxPossibleScore) * 100;
    }

    // Gather all responses from all sections and subsections
    this.gatherAllResponses(this.form.sections, submissionDto.responses);

    console.log('Submitting form data:', submissionDto);

    this.formSubmissionService.submitForm(submissionDto).subscribe(
      (result) => {
        this.isSubmitting = false;
        this.isCompleted = true;
        this.submissionUuid = result.uuid!;
        // Clear draft after successful submission
        if (this.draftUuid) {
          this.draftUuid = null;
          this.lastSavedTime = null;
        }
      },
      (error) => {
        console.error('Error submitting form:', error);
        this.isSubmitting = false;
      },
    );
  }

  fieldNeedsOptions(fieldType: string): boolean {
    return (
      fieldType === FieldType.SELECT ||
      fieldType === FieldType.RADIO ||
      fieldType === FieldType.CHECKBOX
    );
  }

  resetForm(): void {
    this.formGroup.reset();
    this.currentSectionIndex = 0;
    this.isCompleted = false;
    this.draftUuid = null;
    this.lastSavedTime = null;
    this.completedSectionScores = [];
    this.updateProgressDisplay();
  }

  getFieldControl(field: FormField): FormControl {
    return this.formGroup.get(this.getFieldId(field)) as FormControl;
  }

  viewResults(): void {
    if (this.submissionUuid) {
      this.router.navigate(['/submissions', this.submissionUuid, 'results']);
    }
  }

  loadDraft(draft: Draft): void {
    if (draft.formData) {
      try {
        const parsedData: FormDraftData = JSON.parse(draft.formData);
        if (parsedData.sectionScores) {
          // Convert the simplified draft scores back to the full SectionScoreDto format
          this.completedSectionScores = parsedData.sectionScores.map(
            (score) => ({
              sectionId: 0, // We might not have this information in the draft
              sectionUuid: score.sectionUuid,
              sectionTitle: '', // Will be filled when form loads
              score: score.score,
              maxPossible: score.maxPossible,
              percentage: score.percentage,
            }),
          );
          this.updateProgressDisplay();
        }
        // Restore form values to formGroup
        if (parsedData.formValues) {
          Object.keys(parsedData.formValues).forEach((key) => {
            const control = this.formGroup.get(key);
            if (control) {
              control.setValue(parsedData.formValues[key]);
            }
          });
        }
        // Restore current section index
        if (parsedData.currentSectionIndex !== undefined) {
          this.currentSectionIndex = parsedData.currentSectionIndex;
        }
      } catch (e) {
        console.error('Error parsing draft formData:', e);
      }
    }
  }

  updateProgressDisplay(): void {
    if (this.completedSectionScores.length > 0) {
      const completedSections = this.completedSectionScores.length;
      const totalSections = this.totalSections;

      this.completionPercentage =
        totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

      this.runningTotalScore = this.completedSectionScores.reduce(
        (sum, section) => sum + section.score,
        0,
      );
      this.runningMaxScore = this.completedSectionScores.reduce(
        (sum, section) => sum + section.maxPossible,
        0,
      );
    }
  }

  saveAndExit(): void {
    this.saveDraft();
    this.router.navigate(['/forms']);
  }

  discardDraft(): void {
    if (
      confirm(
        'Are you sure you want to discard this draft? This cannot be undone.',
      )
    ) {
      if (this.draftUuid) {
        // Call service to delete draft (implement if needed)
        // this.formDraftService.deleteDraft(this.draftUuid).subscribe(...)
        this.draftUuid = null;
        this.lastSavedTime = null;
        this.resetForm();
      }
    }
  }

  saveDraft(): void {
    if (!this.form) {
      console.warn('Form is null, cannot save draft');
      return;
    }

    // Update score for current section if not already done
    this.updateSectionScore();

    // Simplify section scores for storage
    const simplifiedSectionScores = this.completedSectionScores.map(
      (score) => ({
        sectionUuid: score.sectionUuid,
        score: score.score,
        maxPossible: score.maxPossible,
        percentage: score.percentage,
      }),
    );

    const draftData: FormDraftData = {
      formValues: this.formGroup.value,
      sectionScores: simplifiedSectionScores,
      currentSectionIndex: this.currentSectionIndex,
    };

    const draft: Draft = {
      uuid: this.draftUuid,
      formUuid: this.form.uuid,
      submittedBy: this.formGroup.get('submitter')?.value || '',
      currentSectionIndex: this.currentSectionIndex,
      formData: JSON.stringify(draftData),
    };

    // Generate proper UUID instead of a temporary one
    this.draftUuid = this.draftUuid || uuidv4();
    this.lastSavedTime = new Date();

    console.log('Draft saved:', draft);
    // In a real implementation, save to backend:
    // this.formDraftService.saveDraft(draft).subscribe(...);
  }

  toggleDebugMode(): void {
    this.isDebugMode = !this.isDebugMode;
    console.log('Debug mode:', this.isDebugMode ? 'ON' : 'OFF');

    if (this.isDebugMode) {
      console.log('Current form structure:', this.form);
      console.log('Flattened sections:', this.flattenedSections);
      console.log('Form values:', this.formGroup.value);
    }
  }

  ngOnDestroy(): void {
    // Clear autosave interval
    if (this.draftAutoSaveInterval) {
      clearInterval(this.draftAutoSaveInterval);
    }
  }

  private rebuildSectionHierarchy(flatSections: any[]): any[] {
    if (!flatSections || flatSections.length === 0) {
      return [];
    }

    // Create a map of sections by UUID and build hierarchy in a single pass
    const sectionsMap = new Map();
    const topLevelSections: any[] = [];

    // Single iteration to create copies and organize hierarchy
    for (const section of flatSections) {
      // Clone the section and prepare a subsections array
      const sectionCopy = { ...section, subsections: [] };
      sectionsMap.set(section.uuid, sectionCopy);

      // If this is a subsection, add it to its parent's subsections array
      if (section.parentSectionUuid) {
        const parentSection = sectionsMap.get(section.parentSectionUuid);
        if (parentSection) {
          parentSection.subsections.push(sectionCopy);
        }
      }
      // Otherwise, it's a top-level section
      else if (!section.parentSectionUuid || section.sectionLevel === 0) {
        topLevelSections.push(sectionCopy);
      }
    }

    // Sort all sections recursively
    const sortSections = (sections: any[]) => {
      sections.sort((a, b) => a.orderIndex - b.orderIndex);
      for (const section of sections) {
        if (section.subsections && section.subsections.length > 0) {
          sortSections(section.subsections);
        }
      }
    };

    sortSections(topLevelSections);

    return topLevelSections;
  }

  private getAllSectionsFlattened(): FormSection[] {
    if (!this.form || !this.form.sections) return [];

    const allSections: FormSection[] = [];

    // Process top-level sections first
    this.form.sections.forEach((section) => {
      // If the section has fields, add it directly
      if (section.fields && section.fields.length > 0) {
        // Use type assertion with as instead of implicit casting
        allSections.push({
          ...section,
          displayLevel: 0,
          displayTitle: section.title,
        } as FormSection);
      }

      // If it has subsections, add each subsection
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          // Use type assertion
          allSections.push({
            ...subsection,
            displayLevel: 1,
            displayTitle: subsection.title,
            parentTitle: section.title,
          } as FormSection);
        });
      }
      // If it has no fields and no subsections, add it anyway
      else if (!section.fields || section.fields.length === 0) {
        // Use type assertion
        allSections.push({
          ...section,
          displayLevel: 0,
          displayTitle: section.title,
        } as FormSection);
      }
    });

    // Sort by level and order index
    return allSections.sort((a, b) => {
      // First by level
      if ((a.sectionLevel || 0) !== (b.sectionLevel || 0)) {
        return (a.sectionLevel || 0) - (b.sectionLevel || 0);
      }
      // Then by order index
      return a.orderIndex - b.orderIndex;
    });
  }

  get currentSection(): FormSection | null {
    // Return cached section if index hasn't changed
    if (
      this._cachedSectionIndex === this.currentSectionIndex &&
      this._cachedCurrentSection
    ) {
      return this._cachedCurrentSection;
    }

    if (!this.flattenedSections || this.flattenedSections.length === 0) {
      // Re-initialize if needed
      this.flattenedSections = this.getAllSectionsFlattened();
    }

    if (this.flattenedSections.length === 0) {
      this._cachedCurrentSection = null;
      this._cachedSectionIndex = this.currentSectionIndex;
      return null;
    }

    const section = this.flattenedSections[this.currentSectionIndex] || null;

    if (section) {
      // Ensure fields array exists
      section.fields = section.fields || [];

      // If section has no fields but has subsections with fields, use those
      if (
        section.fields.length === 0 &&
        section.subsections &&
        section.subsections.length > 0
      ) {
        const subsectionWithFields = section.subsections.find(
          (sub) => sub.fields && sub.fields.length > 0,
        );
        if (subsectionWithFields) {
          if (this.isDebugMode) {
            console.log(
              `Using fields from subsection: ${subsectionWithFields.title}`,
            );
          }
          section.fields = subsectionWithFields.fields;
        }
      }

      // Sort fields once and cache
      if (
        section.fields.length > 0 &&
        section.fields[0].orderIndex !== undefined
      ) {
        section.fields.sort((a, b) => a.orderIndex - b.orderIndex);
      }

      // Process and normalize options for each field
      section.fields.forEach((field) => {
        if (field.options && field.options.length > 0) {
          // Sort options
          field.options.sort(
            (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0),
          );

          // Normalize options in place
          field.options.forEach((opt) => {
            if (opt.id != null && typeof opt.id !== 'string') {
              opt.id = String(opt.id);
            }
            if (!opt.name) {
              opt.name = opt.label || String(opt.value);
            }
          });
        }
      });
    }

    // Cache the result
    this._cachedCurrentSection = section;
    this._cachedSectionIndex = this.currentSectionIndex;

    return section;
  }

  get totalSections(): number {
    if (!this.flattenedSections || this.flattenedSections.length === 0) {
      this.flattenedSections = this.getAllSectionsFlattened();
    }
    return this.flattenedSections.length;
  }

  // Helper method to get section path for display
  getSectionPath(section: FormSection): string {
    if (!section) return '';

    if (section.parentSectionUuid && section.displayLevel) {
      return section.parentTitle || '';
    }

    return '';
  }

  /**
   * Handles selection for checkbox groups with multiple options
   * @param field The form field
   * @param optionValue The option value being toggled
   * @param isChecked Whether the checkbox is now checked
   */
  onCheckboxOptionChange(
    field: FormField,
    optionValue: string,
    isChecked: boolean,
  ): void {
    const fieldId = this.getFieldId(field);
    const control = this.formGroup.get(fieldId);

    if (!control) return;

    // Initialize as array if it's not already
    let selectedValues: string[] = [];
    if (control.value) {
      // If the current value is a string, put it in an array
      selectedValues = Array.isArray(control.value)
        ? [...control.value]
        : [control.value];
    }

    if (isChecked) {
      // Add the value if it's not already in the array
      if (!selectedValues.includes(optionValue)) {
        selectedValues.push(optionValue);
      }
    } else {
      // Remove the value if it's in the array
      const index = selectedValues.indexOf(optionValue);
      if (index > -1) {
        selectedValues.splice(index, 1);
      }
    }

    // Update the form control with the array of selected values or null if empty
    control.setValue(selectedValues.length > 0 ? selectedValues : null);
    control.markAsDirty();
  }

  /**
   * Checks if a checkbox option is currently selected
   * @param field The form field
   * @param optionValue The option value to check
   * @returns boolean indicating if the option is selected
   */
  isCheckboxOptionSelected(field: FormField, optionValue: string): boolean {
    const fieldId = this.getFieldId(field);
    const control = this.formGroup.get(fieldId);

    if (!control || !control.value) {
      return false;
    }

    if (Array.isArray(control.value)) {
      return control.value.includes(optionValue);
    } else {
      return control.value === optionValue;
    }
  }

  /**
   * Helper to parse and apply validation rules
   */
  private applyValidationRules(field: FormField, validators: any[]): void {
    if (!field.validationRules) return;

    try {
      const rules = JSON.parse(field.validationRules);

      if (rules.minLength) {
        validators.push(Validators.minLength(rules.minLength));
      }
      if (rules.maxLength) {
        validators.push(Validators.maxLength(rules.maxLength));
      }
      if (rules.min !== undefined) {
        validators.push(Validators.min(rules.min));
      }
      if (rules.max !== undefined) {
        validators.push(Validators.max(rules.max));
      }
      if (rules.pattern) {
        validators.push(Validators.pattern(rules.pattern));
      }
    } catch (e) {
      console.error('Error parsing validation rules for field:', field.id, e);
    }
  }

  /**
   * Update the processFields method to properly handle checkbox fields with options
   */
  processFields(fields: FormField[]): void {
    fields.forEach((field) => {
      // Create validators array
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }

      // Add more validators based on field type
      if (field.fieldType === FieldType.EMAIL) {
        validators.push(Validators.email);
      }

      // Apply validation rules
      this.applyValidationRules(field, validators);

      // Set default value based on field type
      let defaultValue: any = '';

      // For checkbox fields with multiple options, initialize as empty array
      if (
        field.fieldType === FieldType.CHECKBOX &&
        field.options &&
        field.options.length > 0
      ) {
        defaultValue = [];
      } else if (field.fieldType === FieldType.CHECKBOX) {
        defaultValue = false; // For single checkbox
      } else if (
        field.fieldType === FieldType.NUMBER ||
        field.fieldType === FieldType.RATING
      ) {
        defaultValue = null;
      }

      // Add the form control
      this.formGroup.addControl(
        `field_${field.id}`,
        new FormControl(defaultValue, validators),
      );
    });
  }

  /**
   * Update the gatherAllResponses method to properly handle checkbox arrays
   */
  gatherAllResponses(
    sections: FormSection[],
    responses: { fieldUuid: string; value: string }[],
  ): void {
    if (!sections || sections.length === 0) return;

    sections.forEach((section) => {
      // Process fields in this section
      section.fields.forEach((field) => {
        const fieldId = this.getFieldId(field);
        const value = this.formGroup.get(fieldId)?.value;

        if (value !== undefined && value !== null) {
          // Handle arrays for checkbox groups
          if (Array.isArray(value)) {
            value.forEach((val) => {
              responses.push({
                fieldUuid: field.uuid!,
                value: val.toString(),
              });
            });
          } else {
            // Handle boolean for single checkbox
            if (
              field.fieldType === FieldType.CHECKBOX &&
              typeof value === 'boolean'
            ) {
              if (value) {
                // Only add if it's checked (true)
                responses.push({
                  fieldUuid: field.uuid!,
                  value: 'true',
                });
              }
            } else {
              // Handle other field types
              responses.push({
                fieldUuid: field.uuid!,
                value: value.toString(),
              });
            }
          }
        }
      });

      // Process subsections recursively
      if (section.subsections && section.subsections.length > 0) {
        this.gatherAllResponses(section.subsections, responses);
      }
    });
  }

  /**
   * Parse validation rules from JSON string
   */
  parseValidationRules(field: FormField): any {
    if (!field.validationRules) return {};
    try {
      return JSON.parse(field.validationRules);
    } catch (e) {
      console.error('Error parsing validation rules:', e);
      return {};
    }
  }

  /**
   * Check if a field requires evidence upload
   */
  requiresEvidence(field: FormField): boolean {
    const rules = this.parseValidationRules(field);
    const fieldValue = this.formGroup.get(this.getFieldId(field))?.value;

    // Evidence is required if:
    // 1. The field has requiresEvidence: true in validation rules
    // 2. The field value is 'Compliant' (for radio fields with Compliant/Non-Compliant options)
    return rules.requiresEvidence === true && fieldValue === 'Compliant';
  }

  /**
   * Get the evidence type (upload type) for a field
   */
  getEvidenceType(field: FormField): string {
    const rules = this.parseValidationRules(field);
    return rules.evidenceType || '';
  }

  /**
   * Handle evidence upload completion
   */
  handleEvidenceUpload(field: FormField, uploadedFiles: any): void {
    const fieldId = this.getFieldId(field);
    console.log('Evidence uploaded for field:', fieldId, uploadedFiles);

    // Store the uploaded files
    if (uploadedFiles && uploadedFiles.data) {
      const currentUploads = this.evidenceUploads.get(fieldId) || [];
      currentUploads.push(uploadedFiles.data);
      this.evidenceUploads.set(fieldId, currentUploads);
    }
  }

  /**
   * Validate that all required evidence has been uploaded
   */
  validateRequiredEvidence(): { field: FormField; label: string }[] {
    const missingEvidence: { field: FormField; label: string }[] = [];

    if (!this.flattenedSections) return missingEvidence;

    this.flattenedSections.forEach((section) => {
      if (!section.fields) return;

      section.fields.forEach((field) => {
        if (this.requiresEvidence(field)) {
          const fieldId = this.getFieldId(field);
          const hasEvidence =
            this.evidenceUploads.has(fieldId) &&
            this.evidenceUploads.get(fieldId)!.length > 0;

          if (!hasEvidence) {
            missingEvidence.push({
              field,
              label: field.label,
            });
          }
        }
      });
    });

    return missingEvidence;
  }

  /**
   * Get uploaded evidence for a field
   */
  getUploadedEvidence(field: FormField): any[] {
    const fieldId = this.getFieldId(field);
    return this.evidenceUploads.get(fieldId) || [];
  }
}
