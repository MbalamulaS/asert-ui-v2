import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  Input,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { SelectComponent } from 'components/select/select.component';
import { CheckboxComponent } from 'components/checkbox/checkbox.component';
import { DatepickerComponent } from 'components/datepicker/datepicker.component';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { RadioButtonComponent } from 'components/radio/radio.component';
import { MatStepper } from '@angular/material/stepper';
import { HotelService } from '../services/hotel.service';
import {
  FieldType,
  Form,
  FormField,
  FormSection,
  FormSubmissionDto,
  SectionScoreDto,
} from 'modules/forms/types';
import {
  FormDraftService,
  FormDraftData,
} from 'modules/forms/services/form-draft.service';
import { FormSubmissionService } from 'modules/forms/services/form-submission.service';
import { ConditionalLogicService } from 'modules/forms/services/conditional-logic.service';
import { SelfAssessmentService } from 'modules/self-assessment/services/self-assessment.service';
import { SelfAssessmentDraftService } from 'modules/self-assessment/services/self-assessment-draft.service';
import { Optional } from '@angular/core';
import {
  lastValueFrom,
  Subscription,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { FormService } from 'modules/forms/services/form.service';
import { Hotel } from 'modules/portal/hotels/types';
import { ContainerComponent } from 'components/container/container.component';
import { HeaderComponent } from 'components/header/header.component';
import { MultiCheckboxComponent } from 'components/checkbox/multi-checkobx.component';
import { RatingComponent } from 'components/checkbox/app-rating.component';
import {
  FormValidationDialogComponent,
  ValidationDialogData,
  ValidationDialogResult,
  UnansweredField,
} from './form-validation-dialog.component';

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
  templateUrl: './assessment-form.component.html',
  providers: [ConditionalLogicService],
  styleUrls: ['./assessment-form.component.scss'],
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
    MatIconModule,
    MatStepperModule,
    ContainerComponent,
    HeaderComponent,
    MultiCheckboxComponent,
    RatingComponent,
    FormValidationDialogComponent,
  ],
})
export class HotelAssessmentFormComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('stepper', { read: ElementRef }) stepperElementRef: ElementRef;

  // Input for mode: 'official' (default) or 'self-assessment'
  @Input() mode: 'official' | 'self-assessment' = 'official';
  @Input() selfAssessmentUuid?: string; // UUID when continuing a draft

  formId: string;
  form: Form | null = null;
  formGroup: FormGroup = new FormGroup({});
  currentSectionIndex = 0;
  currentSection: FormSection | null = null; // Now a property
  submissionUuid: string = '';
  flattenedSections: FormSection[] = [];
  hotel: Hotel | undefined;

  lastSavedTime: Date | null = null;
  isAutoSaving = false;
  private subscriptions: Subscription[] = [];
  private formChangeSubscription?: Subscription;
  completedSectionScores: SectionScoreDto[] = [];
  completionPercentage: number = 0;
  runningTotalScore: number = 0;
  runningMaxScore: number = 0;

  isLoading = true;
  isSubmitting = false;
  isCompleted = false;
  submitter = '';
  isDebugMode = false;
  private selfAssessmentInitialized = false;
  // Flag to allow re-submission for variance resolution
  private isVarianceResolution = false;

  // Conditional logic state
  fieldVisibility: Record<string, boolean> = {};
  fieldRequiredStatus: Record<string, boolean> = {};
  sectionVisibility: Record<string, boolean> = {};

  // Cache for parsed conditional logic to avoid re-parsing on every evaluation
  private parsedConditionalLogicCache: Map<string, any[]> = new Map();

  // Memoization caches for expensive operations
  private sectionsFlattenedCache: FormSection[] | null = null;
  private allFieldsCache: FormField[] | null = null;
  private fieldsWithConditionalLogicCache: FormField[] | null = null;

  // Validation dialog state
  showValidationDialog = false;
  validationDialogData: ValidationDialogData = {
    unansweredFields: [],
    totalFields: 0,
    answeredFields: 0,
  };

  ratingOptions: Option[] = [
    { value: '1', label: '1', name: '1' },
    { value: '2', label: '2', name: '2' },
    { value: '3', label: '3', name: '3' },
    { value: '4', label: '4', name: '4' },
    { value: '5', label: '5', name: '5' },
  ];

  constructor(
    private fb: FormBuilder,
    private formSubmissionService: FormSubmissionService,
    private formService: FormService,
    private formDraftService: FormDraftService,
    @Optional() private conditionalLogicService: ConditionalLogicService,
    private route: ActivatedRoute,
    private router: Router,
    public hotelService: HotelService,
    private cdr: ChangeDetectorRef,
    private selfAssessmentService: SelfAssessmentService,
    private selfAssessmentDraftService: SelfAssessmentDraftService,
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

    this.route.queryParamMap.subscribe((params) => {
      const hotelUuid = params.get('uuid');
      const mode = params.get('mode');
      const sectionUuid = params.get('sectionUuid');
      const isVarianceResolution = params.get('isVarianceResolution');

      if (hotelUuid) {
        this.fetchHotelByUuid(hotelUuid);
      }

      // Set mode from query params (for self-assessment vs official assessment)
      if (mode === 'self-assessment') {
        this.mode = 'self-assessment';
      }

      // Set variance resolution flag to bypass duplicate submission check
      if (isVarianceResolution === 'true') {
        this.isVarianceResolution = true;
      }

      // Navigate to specific section if sectionUuid is provided (for variance resolution)
      if (sectionUuid) {
        this.navigateToSectionByUuid(sectionUuid);
      }
    });

    // Subscribe to autosave status
    this.subscriptions.push(
      this.formDraftService.lastSavedTime$.subscribe(
        (time) => (this.lastSavedTime = time),
      ),
      this.formDraftService.isAutoSaving$.subscribe(
        (isAutoSaving) => (this.isAutoSaving = isAutoSaving),
      ),
    );
  }

  async fetchHotelByUuid(uuid: string) {
    try {
      const response = await lastValueFrom(
        this.hotelService.getHotelByUuid(uuid),
      );
      this.hotel = response.data;
    } catch (error) {
      console.error('Error fetching hotel data:', error);
    }
  }

  /**
   * Navigate to a specific section by UUID (used for variance resolution)
   */
  navigateToSectionByUuid(sectionUuid: string): void {
    // Wait for form to be loaded and stepper to be initialized
    setTimeout(() => {
      if (!this.form || !this.stepper || !this.flattenedSections.length) {
        // Try again after a delay if form not yet loaded
        setTimeout(() => this.navigateToSectionByUuid(sectionUuid), 500);
        return;
      }

      // Find the section index by UUID
      const sectionIndex = this.flattenedSections.findIndex(
        (section) => section.uuid === sectionUuid,
      );

      if (sectionIndex !== -1) {
        console.log(
          `Navigating to section with UUID ${sectionUuid} at index ${sectionIndex}`,
        );
        this.stepper.selectedIndex = sectionIndex;
        this.currentSectionIndex = sectionIndex;
        this.cdr.detectChanges();

        // Scroll the selected section tab into view for better UX
        setTimeout(() => {
          this.scrollToActiveTab();
        }, 200);
      } else {
        console.warn(`Section with UUID ${sectionUuid} not found in form`);
      }
    }, 100);
  }

  /**
   * Scroll the active stepper tab into view
   */
  private scrollToActiveTab(): void {
    try {
      //console.log('scrollToActiveTab called, stepper:', this.stepper);

      // Use the stepper's native element to find the header container
      if (!this.stepper || !this.stepperElementRef) {
        // console.warn('Stepper or stepper element ref not available');
        return;
      }

      const stepperElement = this.stepperElementRef
        .nativeElement as HTMLElement;
      // console.log('Stepper element:', stepperElement);

      // Find the header container within the stepper
      const headerContainer = stepperElement.querySelector(
        '.mat-horizontal-stepper-header-container',
      ) as HTMLElement;
      // console.log('Header container found:', headerContainer);

      if (!headerContainer) {
        console.warn('Header container not found');
        return;
      }

      // Find the selected header within the container
      // We need to find the .mat-step-header element, not just the label
      let activeHeader: HTMLElement | null = null;

      // First, try to find by the label with selected class, then get its parent header
      const activeLabel = headerContainer.querySelector(
        '.mat-step-label-selected',
      ) as HTMLElement;
      if (activeLabel) {
        // The label is inside the header, so get the closest .mat-step-header ancestor
        activeHeader = activeLabel.closest('.mat-step-header') as HTMLElement;
      }

      if (!activeHeader) {
        // Try finding by aria-selected on the header itself
        activeHeader = headerContainer.querySelector(
          '.mat-step-header[aria-selected="true"]',
        ) as HTMLElement;
      }

      if (!activeHeader) {
        // Last resort: find the header at the current index
        const headers = headerContainer.querySelectorAll('.mat-step-header');
        if (headers && headers.length > this.currentSectionIndex) {
          activeHeader = headers[this.currentSectionIndex] as HTMLElement;
        }
      }

      if (!activeHeader) {
        console.warn('Active header not found after trying all selectors');
        return;
      }

      // Calculate the scroll position to center the active tab
      const containerWidth = headerContainer.offsetWidth;
      const activeHeaderLeft = activeHeader.offsetLeft;
      const activeHeaderWidth = activeHeader.offsetWidth;

      // Calculate scroll position to center the active tab
      const scrollPosition = Math.max(
        0,
        activeHeaderLeft - containerWidth / 2 + activeHeaderWidth / 2,
      );

      // Scroll the container smoothly
      headerContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    } catch (error) {
      console.error('Error scrolling to active tab:', error);
    }
  }

  loadForm(uuid: string): void {
    this.isLoading = true;
    // Clear all caches before loading new form
    this.clearCaches();
    this.formService.getFormById(uuid).subscribe(
      async (response) => {
        const { data } = response;

        try {
          // Process form data asynchronously to avoid blocking UI
          await this.processFormDataAsync(data);

          setTimeout(() => {
            // Load existing draft for both modes
            this.loadExistingDraft();
            this.isLoading = false;
          }, 100);
        } catch (error) {
          console.error('Error processing form:', error);
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('Error loading form:', error);
        this.isLoading = false;
      },
    );
  }

  private async processFormDataAsync(data: any): Promise<void> {
    // Rebuild section hierarchy
    const hierarchicalSections = this.rebuildSectionHierarchy(data.sections);

    // Update the form with hierarchical sections
    this.form = {
      ...data,
      sections: hierarchicalSections,
    };

    // Initialize flattened sections array for navigation
    this.flattenedSections = this.getAllSectionsFlattened();
    this.processSections(); // Process sections at load

    // Yield to UI after section processing
    await this.yieldToUI();

    if (this.isDebugMode) {
      console.log('Flattened sections:', this.flattenedSections);
      console.log('Hierarchical sections:', hierarchicalSections);
    }

    this.currentSectionIndex = 0;
    this.currentSection = this.getProcessedSection(this.currentSectionIndex);

    // Build form synchronously - don't yield before this
    // The form controls need to be ready before the template renders
    this.buildForm();

    // Trigger change detection to ensure checkbox components are properly initialized
    this.cdr.detectChanges();

    // Yield after form is built to allow change detection
    await this.yieldToUI();
  }

  private yieldToUI(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  private clearCaches(): void {
    this.sectionsFlattenedCache = null;
    this.allFieldsCache = null;
    this.fieldsWithConditionalLogicCache = null;
    this.parsedConditionalLogicCache.clear();
  }

  buildForm(): void {
    if (!this.form) {
      console.warn('Form is null, cannot build form');
      return;
    }

    // Initialize form group
    this.formGroup = this.fb.group({});

    // Process all fields from all sections (including subsections)
    this.processFormSections(this.form.sections);

    // Setup auto-save on form changes
    this.setupAutoSave();

    // Initial conditional logic evaluation
    if (this.conditionalLogicService) {
      this.evaluateConditionalLogic();
    }
  }

  processFormSections(sections: FormSection[]): void {
    if (!sections || sections.length === 0) return;

    sections.forEach((section) => {
      if (section.fields && section.fields.length > 0) {
        const sortedFields = [...section.fields].sort(
          (a, b) => a.orderIndex - b.orderIndex,
        );
        this.processFields(sortedFields);
      }

      if (section.subsections && section.subsections.length > 0) {
        this.processFormSections(section.subsections);
      }
    });
  }

  get totalSections(): number {
    if (!this.flattenedSections || this.flattenedSections.length === 0) {
      this.flattenedSections = this.getAllSectionsFlattened();
      this.processSections();
    }
    return this.flattenedSections.length;
  }

  processSections(): void {
    this.flattenedSections = this.flattenedSections.map((section) => {
      const processedSection = { ...section };

      // Ensure fields array exists
      processedSection.fields = processedSection.fields || [];

      // If section has no fields but has subsections with fields, use those
      if (
        processedSection.fields.length === 0 &&
        processedSection.subsections &&
        processedSection.subsections.length > 0
      ) {
        const subsectionWithFields = processedSection.subsections.find(
          (sub) => sub.fields && sub.fields.length > 0,
        );
        if (subsectionWithFields) {
          if (this.isDebugMode) {
            console.log(
              `Using fields from subsection: ${subsectionWithFields.title}`,
            );
          }
          processedSection.fields = [...subsectionWithFields.fields];
        }
      }

      // Sort fields
      processedSection.fields = [...processedSection.fields].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );

      if (this.isDebugMode) {
        console.log(
          `Section "${processedSection.title}" field order:`,
          processedSection.fields.map((f) => ({
            label: f.label,
            orderIndex: f.orderIndex,
          })),
        );
      }

      // Sort and normalize options for each field
      processedSection.fields.forEach((field) => {
        if (field.options) {
          field.options = [...field.options]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((opt) => ({
              ...opt,
              id: opt.id != null ? String(opt.id) : undefined,
              name: opt.label || String(opt.value),
            }));
        }
      });

      return processedSection;
    });
  }

  getProcessedSection(index: number): FormSection | null {
    if (!this.flattenedSections || this.flattenedSections.length === 0) {
      this.flattenedSections = this.getAllSectionsFlattened();
      this.processSections();
    }

    if (this.flattenedSections.length === 0) return null;

    return this.flattenedSections[index] || null;
  }

  getFieldId(field: FormField): string {
    return `field_${field.id}`;
  }

  findFieldByUuid(uuid: string): FormField | null {
    if (!this.form?.sections) return null;

    for (const section of this.form.sections) {
      const field = this.findFieldInSection(section, uuid);
      if (field) return field;
    }
    return null;
  }

  private findFieldInSection(
    section: FormSection,
    uuid: string,
  ): FormField | null {
    // Check fields in this section
    if (section.fields) {
      const field = section.fields.find((f) => f.uuid === uuid);
      if (field) return field;
    }

    // Check subsections recursively
    if (section.subsections) {
      for (const subsection of section.subsections) {
        const field = this.findFieldInSection(subsection, uuid);
        if (field) return field;
      }
    }

    return null;
  }

  getSortedFields(fields: FormField[]): FormField[] {
    if (!fields || fields.length === 0) return [];
    return [...fields].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  trackByFieldId(index: number, field: FormField): any {
    return field.id || field.uuid || index;
  }

  updateSectionScore(): void {
    if (!this.currentSection) return;

    let sectionScore = 0;
    let maxPossibleScore = 0;

    this.currentSection.fields.forEach((field) => {
      const fieldId = this.getFieldId(field);
      const value = this.formGroup.get(fieldId)?.value;

      if (
        field.options &&
        field.options.length > 0 &&
        (field.fieldType === FieldType.RADIO ||
          field.fieldType === FieldType.CHECKBOX ||
          field.fieldType === FieldType.SELECT)
      ) {
        const scoringOptions = field.options.filter(
          (opt) => opt.score !== undefined && opt.score !== null,
        );

        if (scoringOptions.length > 0) {
          if (typeof value === 'string') {
            const selectedOption = field.options.find(
              (opt) => opt.value === value,
            );
            if (selectedOption && selectedOption.score !== undefined) {
              sectionScore += Number(selectedOption.score);
            }
          } else if (Array.isArray(value)) {
            value.forEach((val) => {
              const selectedOption = field.options.find(
                (opt) => opt.value === val,
              );
              if (selectedOption && selectedOption.score !== undefined) {
                sectionScore += Number(selectedOption.score);
              }
            });
          }

          const maxOptionScore = Math.max(
            ...scoringOptions.map((opt) => Number(opt.score || 0)),
          );
          maxPossibleScore += maxOptionScore;
        }
      } else if (field.fieldType === FieldType.RATING && value) {
        sectionScore += Number(value);
        maxPossibleScore += 5;
      }
    });

    const percentage =
      maxPossibleScore > 0 ? (sectionScore / maxPossibleScore) * 100 : 0;

    const sectionScoreEntry: SectionScoreDto = {
      sectionId: Number(this.currentSection.id),
      sectionUuid: this.currentSection.uuid!,
      sectionTitle: this.currentSection.title,
      score: sectionScore,
      maxPossible: maxPossibleScore,
      percentage: percentage,
    };

    const existingIndex = this.completedSectionScores.findIndex(
      (s) => s.sectionUuid === this.currentSection?.uuid,
    );
    if (existingIndex >= 0) {
      this.completedSectionScores[existingIndex] = sectionScoreEntry;
    } else {
      this.completedSectionScores.push(sectionScoreEntry);
    }

    this.updateProgressDisplay();
  }

  isSectionValid(): boolean {
    if (!this.currentSection) return false;

    const fields = [...this.currentSection.fields].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );

    for (const field of fields) {
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

    const fields = [...this.currentSection.fields].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );

    for (const field of fields) {
      const fieldId = this.getFieldId(field);
      const control = this.formGroup.get(fieldId);

      if (control) {
        control.markAsTouched();
      }
    }
  }

  submitForm(): void {
    // Check for unanswered questions first
    const validationResult = this.validateFormCompletion();

    console.log('Form validation result:', validationResult);
    console.log(
      'Number of unanswered fields:',
      validationResult.unansweredFields.length,
    );

    if (validationResult.unansweredFields.length > 0) {
      console.log(
        'Showing validation dialog with unanswered fields:',
        validationResult.unansweredFields,
      );
      this.validationDialogData = validationResult;
      this.showValidationDialog = true;
      return;
    }

    console.log('All required fields completed, proceeding with submission');

    this.markAllFieldsAsTouched();

    if (this.formGroup.invalid) {
      console.log('Form is invalid, cannot submit');
      console.log('Invalid controls:', this.getInvalidControls());
      return;
    }

    if (!this.form) {
      console.error('Form is null, cannot submit');
      return;
    }

    this.performSubmission();
  }

  private performSubmission(): void {
    this.isSubmitting = true;

    if (this.mode === 'self-assessment') {
      this.performSelfAssessmentSubmission();
    } else {
      this.performOfficialSubmission();
    }
  }

  private performOfficialSubmission(): void {
    this.updateSectionScore();

    const submissionDto: FormSubmissionDto = {
      formUuid: this.form.uuid,
      hotelUuid: this.hotel?.uuid,
      submittedBy: '',
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

    if (submissionDto.maxPossibleScore && submissionDto.maxPossibleScore > 0) {
      submissionDto.percentage =
        (submissionDto.totalScore! / submissionDto.maxPossibleScore) * 100;
    }

    this.gatherAllResponses(this.form.sections, submissionDto.responses);

    console.log('Submitting official assessment form data:', submissionDto);
    console.log('Is variance resolution:', this.isVarianceResolution);

    this.formSubmissionService
      .submitForm(submissionDto, this.isVarianceResolution)
      .subscribe(
        (result) => {
          this.isSubmitting = false;
          this.isCompleted = true;
          this.submissionUuid = result.uuid!;
          // KEEP DRAFTS: Do not clear draft after submission
          // This allows assessors to reload their data when resolving variances
          // const currentDraftUuid = this.formDraftService.getCurrentDraftUuid();
          // if (currentDraftUuid) {
          //   this.formDraftService.reset();
          // }
        },
        (error) => {
          console.error('Error submitting official assessment form:', error);
          this.isSubmitting = false;
        },
      );
  }

  private async performSelfAssessmentSubmission(): Promise<void> {
    console.log('Submitting self-assessment...');

    this.updateSectionScore();

    // Gather all responses
    const responses: any[] = [];
    this.gatherAllResponses(this.form.sections, responses);

    try {
      // Create self-assessment from the draft data
      const startResponse = await lastValueFrom(
        this.selfAssessmentService.startSelfAssessment({
          hotelUuid: this.hotel.uuid,
          formUuid: this.form.uuid,
        }),
      );

      const selfAssessmentUuid = startResponse.data.uuid;

      // Save all responses
      await lastValueFrom(
        this.selfAssessmentService.saveDraft(selfAssessmentUuid, responses),
      );

      // Submit
      const submitResponse = await lastValueFrom(
        this.selfAssessmentService.submitSelfAssessment(selfAssessmentUuid),
      );

      this.isSubmitting = false;
      this.isCompleted = true;
      this.submissionUuid = submitResponse.data.uuid;

      // Delete the draft
      const currentDraftUuid =
        this.selfAssessmentDraftService.getCurrentDraftUuid();
      if (currentDraftUuid) {
        this.selfAssessmentDraftService
          .deleteDraft(currentDraftUuid)
          .subscribe();
      }

      // Navigate to results
      this.router.navigate([
        '/self-assessment',
        this.submissionUuid,
        'results',
      ]);
    } catch (error) {
      console.error('Error submitting self-assessment:', error);
      this.isSubmitting = false;
      alert('Failed to submit self-assessment. Please try again.');
    }
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
    this.currentSection = this.getProcessedSection(this.currentSectionIndex);
    this.isCompleted = false;
    this.lastSavedTime = null;
    this.completedSectionScores = [];
    this.formDraftService.reset();
    this.updateProgressDisplay();

    if (this.stepper) {
      this.stepper.selectedIndex = 0;
    }
  }

  getFieldControl(field: FormField): FormControl {
    return this.formGroup.get(this.getFieldId(field)) as FormControl;
  }

  viewResults(): void {
    if (this.submissionUuid) {
      this.router.navigate(['/submissions', this.submissionUuid, 'results']);
    }
  }

  loadExistingDraft(): void {
    if (!this.form?.uuid) return;

    // IMPROVED LOGIC: Always try to load from existing submission first
    // This ensures assessors see their latest submitted data whether they:
    // 1. Click "Resolve Variance" (explicit flag)
    // 2. Click "Assess Hotel" after already submitting (implicit)
    // 3. Want to review/update their previous assessment
    if (this.hotel?.uuid) {
      console.log(
        'Checking for existing submission before loading draft...',
      );

      this.formSubmissionService
        .getLatestSubmissionForVarianceResolution(this.form.uuid, this.hotel.uuid)
        .subscribe({
          next: (response) => {
            if (response && response.data) {
              console.log(
                '✅ Found existing submission - loading that instead of draft',
                response.data,
              );
              // Enable variance resolution mode automatically if submission exists
              // This allows re-submission with updates
              this.isVarianceResolution = true;
              this.loadDraftData(response.data);
            } else {
              // No submission exists yet - load from draft
              console.log('No existing submission found - loading draft');
              this.loadDraftFallback();
            }
          },
          error: (error) => {
            // No submission exists or error occurred - fall back to draft
            console.log(
              'No submission found or error occurred - loading draft as fallback',
            );
            this.loadDraftFallback();
          },
        });
      return;
    }

    // No hotel UUID - just load draft
    this.loadDraftFallback();
  }

  /**
   * Fallback method to load draft when no submission exists
   */
  private loadDraftFallback(): void {
    // Use different draft service based on mode
    const draftService =
      this.mode === 'self-assessment'
        ? this.selfAssessmentDraftService
        : this.formDraftService;

    console.log(`Loading ${this.mode} draft...`);

    draftService.loadDraft(this.form.uuid, this.hotel?.uuid).subscribe({
      next: (draft) => {
        if (draft && draft.data) {
          console.log(`Found existing ${this.mode} draft:`, draft);
          this.loadDraftData(draft);
        } else {
          console.log(
            `No existing ${this.mode} draft found - starting fresh`,
          );
          // Create initial draft for new assessment
        }
      },
      error: (error) => {
        console.error('Error loading draft:', error);
        // If error is 404, it means no draft exists, which is fine - create initial draft
        if (error.status === 404) {
          console.log('No draft exists - starting fresh');
        } else {
          console.warn('Unexpected error loading draft:', error);
        }
      },
    });
  }

  /**
   * @deprecated This method is now handled by loadExistingDraft() automatically.
   * Kept for backwards compatibility.
   */
  loadFromExistingSubmission(): void {
    if (!this.form?.uuid || !this.hotel?.uuid) {
      console.error('Cannot load submission: form or hotel UUID is missing');
      return;
    }

    console.log(
      'Loading latest submission for form:',
      this.form.uuid,
      'hotel:',
      this.hotel.uuid,
    );

    this.formSubmissionService
      .getLatestSubmissionForVarianceResolution(this.form.uuid, this.hotel.uuid)
      .subscribe({
        next: (response) => {
          console.log('Latest submission response:', response);

          if (response && response.data) {
            const submission = response.data;
            console.log(
              'Found existing submission for variance resolution:',
              submission,
            );
            this.loadDraftData(submission);
          } else {
            console.warn(
              'No existing submission found for variance resolution - falling back to draft',
            );
            // Fall back to loading draft if no submission exists
            const draftService =
              this.mode === 'self-assessment'
                ? this.selfAssessmentDraftService
                : this.formDraftService;
            draftService.loadDraft(this.form.uuid, this.hotel?.uuid).subscribe({
              next: (draft) => {
                if (draft && draft.data) {
                  this.loadDraftData(draft);
                }
              },
            });
          }
        },
        error: (error) => {
          console.error(
            'Error loading submission for variance resolution:',
            error,
          );
          // Fall back to draft on error
          const draftService =
            this.mode === 'self-assessment'
              ? this.selfAssessmentDraftService
              : this.formDraftService;
          draftService.loadDraft(this.form.uuid, this.hotel?.uuid).subscribe({
            next: (draft) => {
              if (draft && draft.data) {
                this.loadDraftData(draft);
              }
            },
          });
        },
      });
  }

  loadSubmissionDataIntoForm(submission: any): void {
    console.log('Loading submission data into form:', submission);

    // Convert submission responses to the same format as draft formValues
    const formValues: Record<string, any> = {};

    if (submission.responses && Array.isArray(submission.responses)) {
      submission.responses.forEach((response: any) => {
        if (response.field && response.field.uuid) {
          // Parse the value if it's a JSON string (for complex field types)
          let value = response.value;
          if (typeof value === 'string') {
            try {
              // Try to parse if it looks like JSON
              if (value.startsWith('[') || value.startsWith('{')) {
                value = JSON.parse(value);
              }
            } catch (e) {
              // Not JSON, keep as string
            }
          }
          formValues[response.field.uuid] = value;
        }
      });
    }

    console.log('Extracted form values from submission:', formValues);

    // Load section scores if available (same format as draft)
    if (submission.sectionScores && Array.isArray(submission.sectionScores)) {
      this.completedSectionScores = submission.sectionScores.map(
        (score: any) => ({
          sectionId: 0,
          sectionUuid: score.sectionUuid,
          sectionTitle: score.sectionTitle || '',
          score: score.score || 0,
          maxPossible: score.maxPossible || 0,
          percentage: score.percentage || 0,
        }),
      );
      console.log('Loaded section scores:', this.completedSectionScores);
      this.updateProgressDisplay();
    }

    // Set running totals if available
    if (submission.totalScore !== undefined) {
      this.runningTotalScore = submission.totalScore;
    }
    if (submission.maxPossibleScore !== undefined) {
      this.runningMaxScore = submission.maxPossibleScore;
    }

    // Use the same form restoration logic as draft loading
    // This ensures proper binding to Angular FormGroup controls
    if (Object.keys(formValues).length > 0) {
      console.log(
        'Attempting to restore form values from submission:',
        formValues,
      );

      // Try to restore immediately first
      this.restoreFormValues(formValues);

      // Retry after a delay to handle async form initialization
      setTimeout(() => {
        console.log('Retrying form restoration after delay...');
        this.restoreFormValues(formValues);
      }, 200);

      // Force update UI components after an additional delay (for checkboxes)
      setTimeout(() => {
        // console.log('Forcing UI update for checkbox components...');
        this.forceCheckboxUpdate(formValues);
      }, 1000);

      // Additional update for stubborn checkbox components
      setTimeout(() => {
        this.forceCheckboxUpdate(formValues);
      }, 2000);
    }

    // Mark form as pristine since we just loaded existing data
    this.formGroup.markAsPristine();

    console.log('Submission data successfully loaded into form');
  }

  // NOTE: These methods are deprecated - self-assessment now uses draft service
  // async initializeSelfAssessment(): Promise<void> {
  //   ... method commented out ...
  // }
  // async loadSelfAssessmentDraft(selfAssessmentUuid: string): Promise<void> {
  //   ... method commented out ...
  // }

  loadDraftData(draft: any): void {
    console.log('Loading draft data:', draft);

    // Handle API response wrapper - extract the actual draft data
    const actualDraft = draft.data || draft;
    console.log('Actual draft data:', actualDraft);

    if (actualDraft.formData) {
      try {
        const parsedData: FormDraftData = JSON.parse(actualDraft.formData);

        console.log('parsedData from draft:', parsedData);

        if (parsedData.sectionScores) {
          this.completedSectionScores = parsedData.sectionScores.map(
            (score) => ({
              sectionId: 0,
              sectionUuid: score.sectionUuid,
              sectionTitle: '',
              score: score.score,
              maxPossible: score.maxPossible,
              percentage: score.percentage,
            }),
          );
          this.updateProgressDisplay();
        }

        if (parsedData.formValues) {
          console.log(
            'Attempting to restore form values:',
            parsedData.formValues,
          );

          // Try to restore immediately first
          this.restoreFormValues(parsedData.formValues);

          setTimeout(() => {
            console.log('Retrying form restoration after delay...');
            this.restoreFormValues(parsedData.formValues);
          }, 200);

          // Force update UI components after an additional delay
          setTimeout(() => {
            // console.log('Forcing UI update for checkbox components...');
            this.forceCheckboxUpdate(parsedData.formValues);
          }, 500);
        }

        // Restore current section and navigate to it
        if (parsedData.currentSectionIndex !== undefined) {
          this.currentSectionIndex = parsedData.currentSectionIndex;
          this.currentSection = this.getProcessedSection(
            this.currentSectionIndex,
          );

          // Navigate to the saved step after a short delay
          setTimeout(() => {
            if (this.stepper && this.currentSectionIndex > 0) {
              this.stepper.selectedIndex = this.currentSectionIndex;
            }

            // Force update checkbox components after navigation
            setTimeout(() => {
              this.forceCheckboxUpdate(parsedData.formValues);
            }, 200);
          }, 100);
        }

        // Mark form as pristine since we just loaded saved data
        this.formGroup.markAsPristine();
      } catch (e) {
        console.error('Error parsing draft formData:', e);
      }
    }
  }

  private restoreFormValues(formValues: Record<string, any>): void {
    let restoredCount = 0;
    let skippedCount = 0;

    Object.keys(formValues).forEach((key) => {
      // Find the field by UUID since formValues keys are field UUIDs
      const field = this.findFieldByUuid(key);
      if (field) {
        // Get the correct control name using getFieldId
        const controlName = this.getFieldId(field);
        const control = this.formGroup.get(controlName);
        if (control) {
          let value = formValues[key];

          // Special handling for checkbox fields
          if (field.fieldType === FieldType.CHECKBOX) {
            // Single checkbox (no options) - expects boolean
            if (!field.options || field.options.length === 0) {
              // Convert array ["true"] or "true" to boolean
              if (Array.isArray(value)) {
                value =
                  value.length > 0 &&
                  (value[0] === 'true' || value[0] === true);
              } else if (typeof value === 'string') {
                value = value === 'true';
              } else if (typeof value === 'boolean') {
                // Already boolean, keep as is
                value = value;
              }
              console.log(
                `✓ Converted single checkbox ${controlName} (UUID: ${key}) to boolean:`,
                value,
              );
            }
            // Multi-checkbox (has options) - expects array
            else {
              if (!Array.isArray(value)) {
                // If not an array, wrap it
                value = value ? [value] : [];
              }
              // Map labels to values for checkbox options
              value = value.map((label: string) => {
                const option = field.options!.find(
                  (opt) => opt.label === label || opt.value === label,
                );
                return option ? option.value : label;
              });
              console.log(
                `✓ Mapped multi-checkbox ${controlName} (UUID: ${key}) values:`,
                value,
              );
            }
          }
          // Map display labels back to option values for other fields with options
          else if (field.options && field.options.length > 0) {
            if (Array.isArray(value)) {
              // For multi-select, map each label to its value
              value = value.map((label: string) => {
                const option = field.options!.find(
                  (opt) => opt.label === label || opt.value === label,
                );
                return option ? option.value : label;
              });
            } else if (typeof value === 'string') {
              // For single select/radio, find the option by label or value
              const option = field.options.find(
                (opt) => opt.label === value || opt.value === value,
              );
              if (option) {
                value = option.value;
              }
            }
          }

          // Handle different types of form values
          if (value !== null && value !== undefined) {
            // Use emitEvent: true for checkbox fields to ensure component updates
            const emitEvent = field.fieldType === FieldType.CHECKBOX;

            // For arrays, always set them
            if (Array.isArray(value)) {
              control.setValue(value, { emitEvent });
              console.log(
                `✓ Restored array field ${controlName} (UUID: ${key}):`,
                value,
                'Control after setValue:',
                control.value,
              );
              restoredCount++;
            } else if (value !== '' && value !== false) {
              // Include false for boolean checkboxes
              control.setValue(value, { emitEvent });
              console.log(
                `✓ Restored field ${controlName} (UUID: ${key}):`,
                value,
              );
              restoredCount++;
            } else if (
              field.fieldType === FieldType.CHECKBOX &&
              value === false
            ) {
              // Explicitly handle unchecked boolean checkboxes
              control.setValue(false, { emitEvent });
              console.log(
                `✓ Restored unchecked checkbox ${controlName} (UUID: ${key})`,
              );
              restoredCount++;
            } else {
              console.log(
                `- Skipped empty field ${controlName} (UUID: ${key})`,
              );
              skippedCount++;
            }

            // Force change detection for checkbox components
            if (field.fieldType === FieldType.CHECKBOX) {
              this.cdr.detectChanges();
            }
          } else {
            console.log(
              `- Skipped null/undefined field ${controlName} (UUID: ${key})`,
            );
            skippedCount++;
          }
        } else {
          console.warn(
            `✗ Form control not found for field: ${controlName} (UUID: ${key})`,
          );
          skippedCount++;
        }
      } else {
        console.warn(`✗ Field not found for UUID: ${key}`);
        skippedCount++;
      }
    });

    console.log(
      `Form restoration complete: ${restoredCount} restored, ${skippedCount} skipped`,
    );

    // Force change detection to update the UI
    setTimeout(() => {
      this.formGroup.updateValueAndValidity();
    }, 50);
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
    this.saveNow();
    this.router.navigate(['/forms']);
  }

  discardDraft(): void {
    if (
      confirm(
        'Are you sure you want to discard this draft? This cannot be undone.',
      )
    ) {
      const currentDraftUuid = this.formDraftService.getCurrentDraftUuid();
      if (currentDraftUuid) {
        this.formDraftService.deleteDraft(currentDraftUuid).subscribe({
          next: () => {
            console.log('Draft discarded successfully');
            this.resetForm();
          },
          error: (error) => {
            console.error('Error discarding draft:', error);
          },
        });
      } else {
        this.resetForm();
      }
    }
  }

  setupAutoSave(): void {
    // Unsubscribe from previous form change subscription
    if (this.formChangeSubscription) {
      this.formChangeSubscription.unsubscribe();
    }

    // Subscribe to form value changes for auto-save and conditional logic evaluation
    // Add debouncing to prevent excessive evaluations
    this.formChangeSubscription = this.formGroup.valueChanges
      .pipe(
        debounceTime(800), // Increased from 300ms to 800ms for better performance
        distinctUntilChanged(), // Only process if value actually changed
      )
      .subscribe(() => {
        // Evaluate conditional logic on form changes
        if (this.conditionalLogicService) {
          this.evaluateConditionalLogic();
        }

        if (this.formGroup.dirty) {
          this.triggerAutoSave();
        }
      });
  }

  triggerAutoSave(): void {
    if (!this.form?.uuid) return;

    this.updateSectionScore();

    // Use different draft service based on mode
    const draftService =
      this.mode === 'self-assessment'
        ? this.selfAssessmentDraftService
        : this.formDraftService;

    const completionPercentage = draftService.calculateCompletionPercentage(
      this.currentSectionIndex,
      this.totalSections,
      this.completedSectionScores,
    );

    const draftData: FormDraftData = {
      formValues: this.formGroup.value,
      sectionScores: this.completedSectionScores.map((score) => ({
        sectionUuid: score.sectionUuid,
        score: score.score,
        maxPossible: score.maxPossible,
        percentage: score.percentage,
      })),
      currentSectionIndex: this.currentSectionIndex,
      completionPercentage,
      totalSections: this.totalSections,
    };

    const draft = draftService.createDraftData(
      this.form.uuid,
      this.currentSectionIndex,
      draftData,
      this.hotel?.uuid,
      completionPercentage,
      this.totalSections,
    );

    draftService.triggerAutoSave(draft);
  }

  saveSelfAssessmentDraft(): void {
    if (!this.selfAssessmentUuid || !this.form) {
      console.warn('Cannot save self-assessment draft: missing UUID');
      return;
    }

    // Gather all field responses from the form
    const responses: any[] = [];

    this.form.sections.forEach((section: FormSection) => {
      this.gatherFieldResponses(section, responses);
    });

    console.log('Saving self-assessment draft with responses:', responses);

    // Save draft to backend
    this.selfAssessmentService
      .saveDraft(this.selfAssessmentUuid, responses)
      .subscribe({
        next: (result) => {
          console.log('Self-assessment draft saved successfully');
        },
        error: (error) => {
          console.error('Error saving self-assessment draft:', error);
        },
      });
  }

  private gatherFieldResponses(section: FormSection, responses: any[]): void {
    section.fields.forEach((field: FormField) => {
      const fieldId = this.getFieldId(field);
      const value = this.formGroup.get(fieldId)?.value;

      if (value !== null && value !== undefined && value !== '') {
        responses.push({
          fieldUuid: field.uuid,
          value:
            typeof value === 'object' ? JSON.stringify(value) : String(value),
        });
      }
    });

    // Recursively process subsections
    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach((subsection: FormSection) => {
        this.gatherFieldResponses(subsection, responses);
      });
    }
  }

  saveNow(): void {
    if (!this.form?.uuid) return;

    this.updateSectionScore();

    const completionPercentage =
      this.formDraftService.calculateCompletionPercentage(
        this.currentSectionIndex,
        this.totalSections,
        this.completedSectionScores,
      );

    const draftData: FormDraftData = {
      formValues: this.formGroup.value,
      sectionScores: this.completedSectionScores.map((score) => ({
        sectionUuid: score.sectionUuid,
        score: score.score,
        maxPossible: score.maxPossible,
        percentage: score.percentage,
      })),
      currentSectionIndex: this.currentSectionIndex,
      completionPercentage,
      totalSections: this.totalSections,
    };

    const draft = this.formDraftService.createDraftData(
      this.form.uuid,
      this.currentSectionIndex,
      draftData,
      this.hotel?.uuid,
      completionPercentage,
      this.totalSections,
    );

    this.formDraftService.saveNow(draft).subscribe({
      next: (response) => {
        console.log('Draft saved manually:', response);
        this.formGroup.markAsPristine();
      },
      error: (error) => {
        console.error('Error saving draft:', error);
      },
    });
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
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (this.formChangeSubscription) {
      this.formChangeSubscription.unsubscribe();
    }

    // Reset draft service
    this.formDraftService.reset();
  }

  private rebuildSectionHierarchy(flatSections: any[]): any[] {
    if (!flatSections || flatSections.length === 0) {
      return [];
    }

    const sectionsMap = new Map();
    flatSections.forEach((section) => {
      const sectionCopy = { ...section, subsections: [] };
      sectionsMap.set(section.uuid, sectionCopy);
    });

    const topLevelSections: any[] = [];

    flatSections.forEach((section) => {
      const sectionCopy = sectionsMap.get(section.uuid);

      if (
        section.parentSectionUuid &&
        sectionsMap.has(section.parentSectionUuid)
      ) {
        const parentSection = sectionsMap.get(section.parentSectionUuid);
        parentSection.subsections.push(sectionCopy);
      } else if (!section.parentSectionUuid || section.sectionLevel === 0) {
        topLevelSections.push(sectionCopy);
      }
    });

    const sortedTopLevelSections = topLevelSections.sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );

    const sortSubsections = (sections: any[]) => {
      sections.forEach((section) => {
        if (section.subsections && section.subsections.length > 0) {
          section.subsections.sort(
            (a: any, b: any) => a.orderIndex - b.orderIndex,
          );
          sortSubsections(section.subsections);
        }
      });
    };

    sortSubsections(sortedTopLevelSections);

    return sortedTopLevelSections;
  }

  private getAllSectionsFlattened(): FormSection[] {
    // Return cached result if available
    if (this.sectionsFlattenedCache !== null) {
      return this.sectionsFlattenedCache;
    }

    if (!this.form || !this.form.sections) return [];

    const allSections: FormSection[] = [];

    this.form.sections.forEach((section) => {
      if (section.fields && section.fields.length > 0) {
        allSections.push({
          ...section,
          displayLevel: 0,
          displayTitle: section.title,
        } as FormSection);
      }

      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection) => {
          allSections.push({
            ...subsection,
            displayLevel: 1,
            displayTitle: subsection.title,
            parentTitle: section.title,
          } as FormSection);
        });
      } else if (!section.fields || section.fields.length === 0) {
        allSections.push({
          ...section,
          displayLevel: 0,
          displayTitle: section.title,
        } as FormSection);
      }
    });

    // Cache the result
    this.sectionsFlattenedCache = allSections;
    return allSections;
  }

  getSectionPath(section: FormSection): string {
    if (!section) return '';

    if (section.parentSectionUuid && section.displayLevel) {
      return section.parentTitle || '';
    }

    return '';
  }

  onMultiCheckboxChange(field: FormField, event: any): void {}

  forceCheckboxUpdate(formValues: Record<string, any>): void {
    // console.log('Forcing checkbox updates with values:', formValues);

    // Find all checkbox fields and manually trigger their writeValue
    Object.keys(formValues).forEach((key) => {
      const rawValue = formValues[key];

      // Find the field by UUID to check if it's a checkbox field
      const field = this.findFieldByUuid(key);
      if (field && field.fieldType === FieldType.CHECKBOX) {
        const controlName = this.getFieldId(field);
        let value = rawValue;

        // Single checkbox (no options) - expects boolean
        if (!field.options || field.options.length === 0) {
          // Convert array ["true"] or "true" to boolean
          if (Array.isArray(rawValue)) {
            value =
              rawValue.length > 0 &&
              (rawValue[0] === 'true' || rawValue[0] === true);
          } else if (typeof rawValue === 'string') {
            value = rawValue === 'true';
          } else if (typeof rawValue === 'boolean') {
            value = rawValue;
          }
        }
        // Multi-checkbox (has options) - expects array
        else {
          if (!Array.isArray(rawValue)) {
            value = rawValue ? [rawValue] : [];
          } else {
            // Map labels to values for checkbox options
            value = rawValue.map((label: string) => {
              const option = field.options!.find(
                (opt) => opt.label === label || opt.value === label,
              );
              return option ? option.value : label;
            });
          }
        }

        console.log(
          `Forcing update for checkbox field ${controlName} (UUID: ${key}) with value:`,
          value,
        );
        const control = this.formGroup.get(controlName);
        if (control) {
          // Force the control to emit value changes to trigger writeValue on components
          control.setValue(value, { emitEvent: true });
          control.updateValueAndValidity();
          // Force change detection for components using OnPush
          this.cdr.detectChanges();
        }
      }
    });

    // Also trigger change detection
    setTimeout(() => {
      this.formGroup.updateValueAndValidity();
    }, 50);
  }

  processFields(fields: FormField[]): void {
    fields.forEach((field) => {
      const validators = [];
      // Make all fields required
      if (true) {
        if (
          field.fieldType === FieldType.CHECKBOX &&
          field.options &&
          field.options.length > 0
        ) {
          validators.push((control: FormControl) => {
            return Array.isArray(control.value) && control.value.length > 0
              ? null
              : { required: true };
          });
        } else {
          validators.push(Validators.required);
        }
      }

      if (field.fieldType === FieldType.EMAIL) {
        validators.push(Validators.email);
      }

      if (field.validationRules) {
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
          console.error('Error parsing validation rules:', e);
        }
      }

      let defaultValue: any = '';
      if (
        field.fieldType === FieldType.CHECKBOX &&
        field.options &&
        field.options.length > 0
      ) {
        defaultValue = [];
      } else if (field.fieldType === FieldType.CHECKBOX) {
        defaultValue = false;
      } else if (
        field.fieldType === FieldType.NUMBER ||
        field.fieldType === FieldType.RATING
      ) {
        defaultValue = null;
      }

      // Add form control for the main field
      this.formGroup.addControl(
        `field_${field.id}`,
        new FormControl(defaultValue, validators),
      );

      // Add form control for comments (not required, defaults to 'N/A')
      this.formGroup.addControl(
        `field_${field.id}_comments`,
        new FormControl('N/A', []), // No validators for comments, default to 'N/A'
      );
    });
  }

  gatherAllResponses(
    sections: FormSection[],
    responses: { fieldUuid: string; value: string; comments?: string }[],
  ): void {
    if (!sections || sections.length === 0) return;

    sections.forEach((section) => {
      section.fields.forEach((field) => {
        const fieldId = this.getFieldId(field);
        const value = this.formGroup.get(fieldId)?.value;
        const commentsValue =
          this.formGroup.get(`${fieldId}_comments`)?.value || 'N/A';

        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((val) => {
              responses.push({
                fieldUuid: field.uuid!,
                value: val.toString(),
                comments: commentsValue,
              });
            });
          } else {
            if (
              field.fieldType === FieldType.CHECKBOX &&
              typeof value === 'boolean'
            ) {
              if (value) {
                responses.push({
                  fieldUuid: field.uuid!,
                  value: 'true',
                  comments: commentsValue,
                });
              }
            } else {
              responses.push({
                fieldUuid: field.uuid!,
                value: value.toString(),
                comments: commentsValue,
              });
            }
          }
        }
      });

      if (section.subsections && section.subsections.length > 0) {
        this.gatherAllResponses(section.subsections, responses);
      }
    });
  }

  forceLoadingComplete(): void {
    this.isLoading = false;
    console.log('Loading state manually reset');
  }

  onStepChange(event: any): void {
    this.currentSectionIndex = event.selectedIndex;
    this.currentSection = this.getProcessedSection(this.currentSectionIndex);
    console.log('Current Section:', this.currentSection);
    this.updateSectionScore();
    // Auto-save when changing sections
    this.triggerAutoSave();
    this.scrollToTop();
  }

  goToNextSection(): void {
    this.stepper.next();
  }

  goToPreviousSection(): void {
    this.stepper.previous();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.formGroup.controls).forEach((key) => {
      this.formGroup.get(key)?.markAsTouched();
    });
  }

  getInvalidControls(): string[] {
    const invalidControls: string[] = [];
    Object.keys(this.formGroup.controls).forEach((key) => {
      const control = this.formGroup.get(key);
      if (control && control.invalid) {
        invalidControls.push(key);
      }
    });
    return invalidControls;
  }

  mapResponses(results) {
    return results.filter((a) => a.status === 'Approved');
  }

  // Conditional logic methods
  evaluateConditionalLogic(): void {
    if (!this.form || !this.conditionalLogicService) return;

    // Cache fields with conditional logic on first call
    if (!this.fieldsWithConditionalLogicCache) {
      const allFields = this.getAllFields();
      this.fieldsWithConditionalLogicCache = allFields.filter((f) => {
        if (!f.conditionalLogic) return false;

        const logic = f.conditionalLogic as any;

        if (typeof logic === 'string') {
          return logic !== '[]' && logic.trim() !== '';
        }

        if (Array.isArray(logic)) {
          return logic.length > 0;
        }

        return false;
      });
    }

    // Skip evaluation if no fields have conditional logic
    if (this.fieldsWithConditionalLogicCache.length === 0) {
      return;
    }

    // Get current form values mapped by field UUID
    const fieldValues: Record<string, any> = {};

    // Collect all fields with their UUIDs and current values
    this.getAllFields().forEach((field) => {
      if (field.uuid) {
        const fieldId = this.getFieldId(field);
        const control = this.formGroup.get(fieldId);
        if (control) {
          fieldValues[field.uuid] = control.value;
        }
      }
    });

    const allFieldsWithParsedLogic = this.getAllFields().map((field) => {
      const fieldCopy = { ...field };

      // Use cached parsed conditional logic if available
      if (field.conditionalLogic) {
        if (typeof field.conditionalLogic === 'string') {
          const cacheKey = `field_${field.uuid}`;
          if (this.parsedConditionalLogicCache.has(cacheKey)) {
            fieldCopy.conditionalLogic =
              this.parsedConditionalLogicCache.get(cacheKey);
          } else {
            try {
              const parsed = JSON.parse(field.conditionalLogic);
              this.parsedConditionalLogicCache.set(cacheKey, parsed);
              fieldCopy.conditionalLogic = parsed;
            } catch (error) {
              console.error(
                'Error parsing conditional logic for field:',
                field.label,
                error,
              );
              fieldCopy.conditionalLogic = [];
              this.parsedConditionalLogicCache.set(cacheKey, []);
            }
          }
        } else if (Array.isArray(field.conditionalLogic)) {
          // Already parsed
          fieldCopy.conditionalLogic = field.conditionalLogic;
        } else {
          fieldCopy.conditionalLogic = [];
        }
      }

      return fieldCopy;
    });

    console.log('Field values for conditional logic:', fieldValues);
    console.log(
      'Fields with conditional logic:',
      allFieldsWithParsedLogic.filter(
        (f) =>
          f.conditionalLogic &&
          Array.isArray(f.conditionalLogic) &&
          f.conditionalLogic.length > 0,
      ),
    );

    // Evaluate conditional logic using the service
    const evaluation = this.conditionalLogicService.evaluateAllConditionalLogic(
      allFieldsWithParsedLogic,
      fieldValues,
    );

    console.log('Conditional logic evaluation result:', evaluation);

    // Update component state
    this.fieldVisibility = { ...evaluation.fieldVisibility };
    this.fieldRequiredStatus = { ...evaluation.fieldRequiredStatus };
    this.sectionVisibility = { ...evaluation.sectionVisibility };

    // Update form control validators based on conditional requirements
    this.updateFormValidators();

    // Clear validation errors for hidden fields
    this.clearHiddenFieldErrors();

    // Update flattened sections to exclude invisible sections
    this.updateVisibleFlattenedSections();

    if (this.isDebugMode) {
      console.log('Conditional logic evaluation:', {
        fieldValues,
        fieldVisibility: this.fieldVisibility,
        fieldRequiredStatus: this.fieldRequiredStatus,
        sectionVisibility: this.sectionVisibility,
      });
    }
  }

  getAllFields(): FormField[] {
    // Return cached result if available
    if (this.allFieldsCache !== null) {
      return this.allFieldsCache;
    }

    const allFields: FormField[] = [];

    if (!this.form?.sections) return allFields;

    const collectFields = (sections: FormSection[]) => {
      sections.forEach((section) => {
        if (section.fields) {
          allFields.push(...section.fields);
        }
        if (section.subsections) {
          collectFields(section.subsections);
        }
      });
    };

    collectFields(this.form.sections);

    // Cache the result
    this.allFieldsCache = allFields;
    return allFields;
  }

  updateFormValidators(): void {
    this.getAllFields().forEach((field) => {
      if (!field.uuid) return;

      const fieldId = this.getFieldId(field);
      const control = this.formGroup.get(fieldId);

      if (!control) return;

      // Check if field is visible - hidden fields should not be required
      const isFieldVisible = this.fieldVisibility[field.uuid] !== false;

      // Check if field should be required based on conditional logic
      const isConditionallyRequired = this.fieldRequiredStatus[field.uuid];
      const isOriginallyRequired = field.required;
      const shouldBeRequired =
        isFieldVisible &&
        (isConditionallyRequired !== undefined
          ? isConditionallyRequired
          : isOriginallyRequired);

      // Rebuild validators
      const validators = [];

      if (shouldBeRequired) {
        if (
          field.fieldType === FieldType.CHECKBOX &&
          field.options &&
          field.options.length > 0
        ) {
          validators.push((control: FormControl) => {
            return Array.isArray(control.value) && control.value.length > 0
              ? null
              : { required: true };
          });
        } else {
          validators.push(Validators.required);
        }
      }

      // Add other validators (email, validation rules, etc.)
      if (field.fieldType === FieldType.EMAIL) {
        validators.push(Validators.email);
      }

      // Apply validation rules
      if (field.validationRules) {
        try {
          const rules = JSON.parse(field.validationRules);
          if (rules.minLength)
            validators.push(Validators.minLength(rules.minLength));
          if (rules.maxLength)
            validators.push(Validators.maxLength(rules.maxLength));
          if (rules.min !== undefined)
            validators.push(Validators.min(rules.min));
          if (rules.max !== undefined)
            validators.push(Validators.max(rules.max));
          if (rules.pattern) validators.push(Validators.pattern(rules.pattern));
        } catch (e) {
          console.error('Error parsing validation rules:', e);
        }
      }

      // Update the control's validators
      control.setValidators(validators.length > 0 ? validators : null);
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  isFieldVisible(field: FormField): boolean {
    if (!field.uuid) return true;

    // Check if field itself is visible
    const isFieldVisible = this.fieldVisibility[field.uuid] !== false;

    // Check if field's section is visible
    const fieldSection = this.findFieldSection(field);
    const isSectionVisible = fieldSection?.uuid
      ? this.sectionVisibility[fieldSection.uuid] !== false
      : true;

    // Field is visible only if both field and section are visible
    return isFieldVisible && isSectionVisible;
  }

  isSectionVisible(section: FormSection): boolean {
    if (!section.uuid) return true;

    // Check conditional visibility
    const conditionalVisibility = this.sectionVisibility[section.uuid];

    // If no conditional logic affects this section, it's visible by default
    return conditionalVisibility !== false;
  }

  isLastVisibleSection(index: number): boolean {
    // Check if there are any visible sections after this index
    for (let i = index + 1; i < this.flattenedSections.length; i++) {
      if (this.isSectionVisible(this.flattenedSections[i])) {
        return false; // Found a visible section after this one
      }
    }
    return true; // No visible sections after this one
  }

  hasNextVisibleSection(index: number): boolean {
    // Check if there are any visible sections after this index
    for (let i = index + 1; i < this.flattenedSections.length; i++) {
      if (this.isSectionVisible(this.flattenedSections[i])) {
        return true; // Found a visible section after this one
      }
    }
    return false; // No visible sections after this one
  }

  isFieldRequired(field: FormField): boolean {
    if (!field.uuid) return field.required;

    // Check if field itself is visible
    const isFieldVisible = this.fieldVisibility[field.uuid] !== false;

    // Check if field's section is visible
    const fieldSection = this.findFieldSection(field);
    const isSectionVisible = fieldSection?.uuid
      ? this.sectionVisibility[fieldSection.uuid] !== false
      : true;

    // Hidden fields (or fields in hidden sections) are never required
    const isVisible = isFieldVisible && isSectionVisible;
    if (!isVisible) return false;

    // Check conditional requirement status
    const conditionalRequired = this.fieldRequiredStatus[field.uuid];

    // If conditional logic affects this field, use that; otherwise all visible fields are required
    // (matching the logic in processFields where all fields get required validators)
    // Make all visible fields required by default
    return conditionalRequired !== undefined ? conditionalRequired : true;
  }

  clearHiddenFieldErrors(): void {
    let hasChanges = false;

    this.getAllFields().forEach((field) => {
      if (!field.uuid) return;

      // Check if field is directly hidden
      const isFieldVisible = this.fieldVisibility[field.uuid] !== false;

      // Also check if the field's section is hidden
      const fieldSection = this.findFieldSection(field);
      const isSectionVisible = fieldSection?.uuid
        ? this.sectionVisibility[fieldSection.uuid] !== false
        : true;

      // Field is hidden if either the field itself or its section is hidden
      const isVisible = isFieldVisible && isSectionVisible;

      if (!isVisible) {
        const fieldId = this.getFieldId(field);
        const control = this.formGroup.get(fieldId);
        if (control) {
          // Clear validation errors for hidden fields
          if (control.errors) {
            control.setErrors(null);
            hasChanges = true;
          }
          control.markAsUntouched();
          control.markAsPristine();
          // Clear the value as well for hidden fields
          control.setValue(null, { emitEvent: false });
        }
      }
    });

    // Recalculate form validity after clearing hidden field errors
    if (hasChanges) {
      this.formGroup.updateValueAndValidity({ emitEvent: false });
    }
  }

  canSubmitForm(): boolean {
    // Check if any visible required fields are invalid
    const visibleFields = this.getAllFields().filter((field) => {
      if (!field.uuid) return true;

      // Check if field itself is visible
      const isFieldVisible = this.fieldVisibility[field.uuid] !== false;

      // Check if field's section is visible
      const fieldSection = this.findFieldSection(field);
      const isSectionVisible = fieldSection?.uuid
        ? this.sectionVisibility[fieldSection.uuid] !== false
        : true;

      // Field is visible only if both field and section are visible
      return isFieldVisible && isSectionVisible;
    });

    for (const field of visibleFields) {
      const fieldId = this.getFieldId(field);
      const control = this.formGroup.get(fieldId);

      if (!control) continue;

      // Check if field is required and invalid
      const isRequired = this.isFieldRequired(field);
      if (isRequired && control.invalid) {
        return false;
      }
    }

    return !this.isSubmitting;
  }

  getFormErrors(): Array<{
    field: string;
    error: any;
    visible: boolean;
    required: boolean;
    section?: string;
    sectionVisible?: boolean;
  }> {
    const errors: Array<{
      field: string;
      error: any;
      visible: boolean;
      required: boolean;
      section?: string;
      sectionVisible?: boolean;
    }> = [];

    Object.keys(this.formGroup.controls).forEach((key) => {
      const control = this.formGroup.get(key);
      if (control && control.errors) {
        // Find the field info
        const field = this.getAllFields().find(
          (f) => this.getFieldId(f) === key,
        );
        const isFieldVisible = field?.uuid
          ? this.fieldVisibility[field.uuid] !== false
          : true;
        const isRequired = field ? this.isFieldRequired(field) : false;

        // Check section visibility
        const fieldSection = field ? this.findFieldSection(field) : null;
        const isSectionVisible = fieldSection?.uuid
          ? this.sectionVisibility[fieldSection.uuid] !== false
          : true;

        errors.push({
          field: field ? `${field.label} (${key})` : key,
          error: control.errors,
          visible: isFieldVisible && isSectionVisible,
          required: isRequired,
          section: fieldSection?.title,
          sectionVisible: isSectionVisible,
        });
      }
    });

    return errors;
  }

  validateFormCompletion(): ValidationDialogData {
    const unansweredFields: UnansweredField[] = [];
    let totalVisibleFields = 0;
    let answeredFields = 0;

    console.log('=== Starting form completion validation ===');

    // Get section index mapping for navigation
    const sectionIndexMap = new Map<string, number>();
    this.flattenedSections.forEach((section, index) => {
      if (section.uuid) {
        sectionIndexMap.set(section.uuid, index);
      }
    });

    const allFields = this.getAllFields();
    console.log('Total fields found:', allFields.length);

    allFields.forEach((field) => {
      const isVisible = this.isFieldVisible(field);
      const isRequired = this.isFieldRequired(field);

      console.log(`Field "${field.label}" (${field.uuid}):`, {
        visible: isVisible,
        required: isRequired,
        fieldType: field.fieldType,
      });

      // Skip hidden fields
      if (!isVisible) {
        console.log(`  -> Skipping hidden field: ${field.label}`);
        return;
      }

      totalVisibleFields++;

      const fieldId = this.getFieldId(field);
      const control = this.formGroup.get(fieldId) as FormControl;
      const controlValue = control ? control.value : null;
      const isAnswered = this.isFieldAnswered(field, control);

      console.log(
        `  -> Field value: "${controlValue}", isAnswered: ${isAnswered}`,
      );

      if (isAnswered) {
        answeredFields++;
      } else if (isRequired) {
        // Find which section this field belongs to
        const fieldSection = this.findFieldSection(field);
        const sectionIndex = fieldSection
          ? sectionIndexMap.get(fieldSection.uuid) || 0
          : 0;

        console.log(
          `  -> Adding to unanswered fields (required but not answered)`,
        );

        unansweredFields.push({
          fieldId: fieldId,
          fieldLabel: field.label,
          sectionTitle: fieldSection?.title || 'Unknown Section',
          sectionIndex: sectionIndex,
          required: true,
        });
      }
    });

    console.log('=== Validation summary ===');
    console.log('Total visible fields:', totalVisibleFields);
    console.log('Answered fields:', answeredFields);
    console.log('Unanswered required fields:', unansweredFields.length);

    return {
      unansweredFields,
      totalFields: totalVisibleFields,
      answeredFields,
    };
  }

  private isFieldAnswered(
    field: FormField,
    control: FormControl | null,
  ): boolean {
    if (!control) return false;

    const value = control.value;

    // Handle different field types
    switch (field.fieldType) {
      case FieldType.CHECKBOX:
        if (field.options && field.options.length > 0) {
          // Multi-checkbox: check if array has items
          return Array.isArray(value) && value.length > 0;
        } else {
          // Single checkbox: check if true
          return value === true;
        }
      case FieldType.SELECT:
      case FieldType.RADIO:
        return value !== null && value !== undefined && value !== '';
      case FieldType.NUMBER:
      case FieldType.RATING:
        return value !== null && value !== undefined && value !== '';
      case FieldType.TEXT:
      case FieldType.TEXTAREA:
      case FieldType.EMAIL:
      default:
        return (
          value !== null &&
          value !== undefined &&
          value.toString().trim() !== ''
        );
    }
  }

  private findFieldSection(field: FormField): FormSection | null {
    const findInSections = (sections: FormSection[]): FormSection | null => {
      for (const section of sections) {
        if (
          section.fields &&
          section.fields.some((f) => f.uuid === field.uuid)
        ) {
          return section;
        }
        if (section.subsections) {
          const found = findInSections(section.subsections);
          if (found) return found;
        }
      }
      return null;
    };

    return this.form ? findInSections(this.form.sections) : null;
  }

  onValidationDialogResult(result: ValidationDialogResult): void {
    this.showValidationDialog = false;

    if (result.action === 'navigate' && result.sectionIndex !== undefined) {
      this.navigateToSection(result.sectionIndex);
    } else if (result.action === 'submit') {
      this.performSubmission();
    }
  }

  navigateToSection(sectionIndex: number): void {
    if (
      this.stepper &&
      sectionIndex >= 0 &&
      sectionIndex < this.totalSections
    ) {
      this.currentSectionIndex = sectionIndex;
      this.currentSection = this.getProcessedSection(sectionIndex);
      this.stepper.selectedIndex = sectionIndex;
    }
  }

  updateVisibleFlattenedSections(): void {
    // Get all sections (including invisible ones) - keep this for navigation purposes
    const allSections = this.getAllSectionsFlattened();

    console.log('Section visibility update:', {
      allSections: allSections.length,
      sectionVisibility: this.sectionVisibility,
      hiddenSections: allSections
        .filter((s) => !this.isSectionVisible(s))
        .map((s) => ({
          uuid: s.uuid,
          title: s.title,
          visible: this.isSectionVisible(s),
        })),
    });

    // Keep all sections in flattened array to maintain positions and indices
    // The UI components should use isSectionVisible() to determine what to display
    this.flattenedSections = allSections;

    // If current section is now hidden, navigate to the next visible section
    if (this.currentSection && !this.isSectionVisible(this.currentSection)) {
      console.log(
        'Current section is now hidden, navigating to next visible section',
      );

      // Find next visible section starting from current index
      let nextVisibleIndex = this.currentSectionIndex + 1;
      while (
        nextVisibleIndex < this.flattenedSections.length &&
        !this.isSectionVisible(this.flattenedSections[nextVisibleIndex])
      ) {
        nextVisibleIndex++;
      }

      // If no visible section found ahead, search backwards
      if (nextVisibleIndex >= this.flattenedSections.length) {
        nextVisibleIndex = this.currentSectionIndex - 1;
        while (
          nextVisibleIndex >= 0 &&
          !this.isSectionVisible(this.flattenedSections[nextVisibleIndex])
        ) {
          nextVisibleIndex--;
        }
      }

      // If still no visible section found, go to first visible section
      if (
        nextVisibleIndex < 0 ||
        nextVisibleIndex >= this.flattenedSections.length
      ) {
        nextVisibleIndex = this.flattenedSections.findIndex((s) =>
          this.isSectionVisible(s),
        );
      }

      if (nextVisibleIndex >= 0) {
        this.currentSectionIndex = nextVisibleIndex;
        this.currentSection = this.getProcessedSection(nextVisibleIndex);

        // Update stepper to show the next visible section
        if (this.stepper) {
          setTimeout(() => {
            this.stepper.selectedIndex = nextVisibleIndex;
          }, 100);
        }
      }
    }
  }
}
