import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FieldType, Form, FormField, FormSection } from '../types';
import { FormService } from '../services/form.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TextInputComponent } from 'components/text-field/text-field.component';
import { TextAreaComponent } from 'components/text-area/text-area.component';
import { SelectComponent } from 'components/select/select.component';
import { CheckboxComponent } from 'components/checkbox/checkbox.component';
import { FetcherComponent } from 'components/fetcher/fetcher.component';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom, debounceTime } from 'rxjs';
import { ConditionalLogicComponent } from './conditional-logic.component';
import { ConfirmDialogComponent } from 'components/confirm/confirm.dialog';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  templateUrl: './form-builder.component.html',
  styles: `
    .section-invalid {
      border-color: #f56565;
      box-shadow: 0 0 0 1px #f56565;
    }

    .invalid-field {
      border-color: #f56565 !important;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
  `,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    TextInputComponent,
    TextAreaComponent,
    SelectComponent,
    CheckboxComponent,
    FetcherComponent,
    ConditionalLogicComponent,
    ConfirmDialogComponent,
  ],
})
export class FormBuilderComponent implements OnInit, AfterViewInit {
  formId: string | null = null;
  formBuilderForm: FormGroup;
  fieldTypes = Object.values(FieldType);
  formSubmitted = false;

  // Confirm dialog state
  confirmDialogOpen = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  confirmDialogCallback: (() => void) | null = null;

  // Map fieldTypes to options for app-select
  fieldTypeOptions = this.fieldTypes.map((type) => ({
    id: type,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    label: type.charAt(0).toUpperCase() + type.slice(1),
    value: type,
  }));
  currentForm: Form = {} as Form;

  // Add a debug flag that can be toggled during development
  isDebugMode = false;

  // Store the section UUID to scroll to after view init
  pendingScrollToSection: string | null = null;

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.formBuilderForm = this.fb.group({
      name: ['', Validators.required],
      propertyTypes: ['', Validators.required],
      description: [''],
      sections: this.fb.array([]),
    });
  }

  mapPropertyTypes(types) {
    return types.map((t) => ({
      id: t,
      name: t,
    }));
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.formId = id;
        this.loadForm(this.formId);
      } else {
        this.addSection();
      }
    });

    // Check for highlightSection query parameter
    this.route.queryParamMap.subscribe((queryParams) => {
      const sectionUuid = queryParams.get('highlightSection');
      if (sectionUuid) {
        this.pendingScrollToSection = sectionUuid;
      }
    });

    // initialize validators
    this.initFormValidators();
  }

  ngAfterViewInit(): void {
    // Scroll will be triggered after form data loads in loadForm()
  }

  loadForm(uuid: string): void {
    this.formService.getFormById(uuid).subscribe(
      (response) => {
        this.currentForm = response.data;

        // Rebuild the section hierarchy from the flattened API response
        const hierarchicalSections = this.rebuildSectionHierarchy(
          response.data.sections,
        );

        // Create a structured response with the proper section hierarchy
        const structuredResponse = {
          ...response.data,
          sections: hierarchicalSections,
        };

        // Reset form with loaded data
        this.formBuilderForm = this.fb.group({
          name: [structuredResponse.name, Validators.required],
          description: [structuredResponse.description],
          propertyTypes: [
            structuredResponse.propertyTypes,
            Validators.required,
          ],
          sections: this.fb.array([]),
        });

        // Add sections with the correct hierarchy WITHOUT triggering change detection
        const sectionsArray = this.sections;
        structuredResponse.sections.forEach((section) => {
          const sectionGroup = this.buildLoadedSectionGroup(section);
          // Use emitEvent: false to prevent change detection on every push
          sectionsArray.push(sectionGroup, { emitEvent: false });
        });

        // Manually trigger change detection once after all sections are added
        this.formBuilderForm.updateValueAndValidity();

        // Check if there's a pending scroll to execute after form load
        if (this.pendingScrollToSection) {
          const sectionToScroll = this.pendingScrollToSection;

          // Use requestAnimationFrame for reliable DOM-ready detection
          let frameCount = 0;
          const maxFrames = 60; // Max ~1 second at 60fps

          const waitForDom = () => {
            frameCount++;
            const element = document.getElementById(`section-${sectionToScroll}`);

            if (element) {
              console.log(`✓ Section found after ${frameCount} frames! Scrolling now...`);
              this.scrollToAndHighlightSection(sectionToScroll);
              this.pendingScrollToSection = null;
            } else if (frameCount >= maxFrames) {
              console.warn(`Section not found after ${maxFrames} frames. Attempting scroll anyway...`);
              this.scrollToAndHighlightSection(sectionToScroll);
              this.pendingScrollToSection = null;
            } else {
              requestAnimationFrame(waitForDom);
            }
          };

          requestAnimationFrame(waitForDom);
        }

        // After loading, check the structure for debugging
        setTimeout(() => {
          if (this.isDebugMode) {
            this.logFormStructure();
          }
        }, 500);
      },
      (error) => {
        console.error('Error loading form:', error);
      },
    );
  }

  // Form sections
  get sections(): FormArray<FormGroup> {
    return this.formBuilderForm.get('sections') as FormArray<FormGroup>;
  }

  generateProperUuid(): string {
    return uuidv4();
  }

  addSection(): void {
    // Generate a temporary UUID for new sections
    const tempUuid = this.generateProperUuid();

    this.sections.push(
      this.fb.group({
        title: ['New Section', Validators.required],
        orderIndex: [this.sections.length],
        weight: [1.0], // Default weight
        maxScore: [null],
        sectionLevel: [0], // Top-level section
        uuid: [tempUuid], // Add temporary UUID for reference
        fields: this.fb.array([]),
        subsections: this.fb.array([]),
      }),
    );

    if (this.isDebugMode) {
      console.log('Added new section. Total sections:', this.sections.length);
    }
  }

  /**
   * Builds a section FormGroup without adding it to the form (for performance)
   * This allows us to build the entire structure first, then add everything at once
   */
  buildLoadedSectionGroup(section: FormSection): FormGroup {
    const sectionGroup = this.fb.group({
      id: [section.id],
      uuid: [section.uuid],
      title: [section.title, Validators.required],
      orderIndex: [section.orderIndex],
      weight: [section.weight || 1.0],
      maxScore: [section.maxScore],
      sectionLevel: [section.sectionLevel || 0],
      fields: this.fb.array([]),
      subsections: this.fb.array([]),
    });

    // Add fields WITHOUT emitting events
    const fieldsArray = sectionGroup.get('fields') as FormArray<FormGroup>;
    if (section.fields && section.fields.length > 0) {
      const sortedFields = [...section.fields].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );
      sortedFields.forEach((field) => {
        const fieldGroup = this.createFieldGroup(field);

        // Add options if any
        if (
          field.options &&
          field.options.length > 0 &&
          (field.fieldType === FieldType.SELECT ||
            field.fieldType === FieldType.RADIO ||
            field.fieldType === FieldType.CHECKBOX)
        ) {
          const optionsArray = fieldGroup.get(
            'options',
          ) as FormArray<FormGroup>;
          const sortedOptions = [...field.options].sort(
            (a, b) => a.orderIndex - b.orderIndex,
          );
          sortedOptions.forEach((option) => {
            optionsArray.push(
              this.fb.group({
                id: [option.id],
                uuid: [option.uuid],
                label: [option.label, Validators.required],
                value: [option.value, Validators.required],
                orderIndex: [option.orderIndex],
                score: [option.score || 0],
              }),
              { emitEvent: false }
            );
          });
        }

        fieldsArray.push(fieldGroup, { emitEvent: false });
      });
    }

    // Add subsections recursively
    if (section.subsections && section.subsections.length > 0) {
      const subsectionsArray = sectionGroup.get(
        'subsections',
      ) as FormArray<FormGroup>;
      const sortedSubsections = [...section.subsections].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );

      if (this.isDebugMode) {
        console.log(
          `Adding ${sortedSubsections.length} subsections for section ${section.title}`,
        );
      }

      sortedSubsections.forEach((subsection) => {
        const subsectionGroup = this.buildLoadedSubsectionGroup(subsection);
        subsectionGroup.patchValue(
          { parentSectionUuid: section.uuid },
          { emitEvent: false }
        );
        subsectionsArray.push(subsectionGroup, { emitEvent: false });
      });
    }

    return sectionGroup;
  }

  /**
   * Legacy method - kept for compatibility
   * Use buildLoadedSectionGroup for better performance
   */
  addLoadedSection(section: FormSection): void {
    const sectionGroup = this.buildLoadedSectionGroup(section);
    this.sections.push(sectionGroup);
  }

  /**
   * Builds a subsection FormGroup without emitting events (for performance)
   */
  buildLoadedSubsectionGroup(subsection: FormSection): FormGroup {
    if (this.isDebugMode) {
      console.log('Loading subsection:', subsection.title);
    }

    const subsectionGroup = this.fb.group({
      id: [subsection.id],
      uuid: [subsection.uuid],
      title: [subsection.title, Validators.required],
      orderIndex: [subsection.orderIndex],
      weight: [subsection.weight || 1.0],
      maxScore: [subsection.maxScore],
      sectionLevel: [subsection.sectionLevel || 1],
      parentSectionUuid: [
        subsection.parentSection?.uuid || subsection.parentSectionUuid,
      ],
      fields: this.fb.array([]),
      subsections: this.fb.array([]),
    });

    // Add fields WITHOUT emitting events
    const fieldsArray = subsectionGroup.get('fields') as FormArray<FormGroup>;
    if (subsection.fields && subsection.fields.length > 0) {
      const sortedFields = [...subsection.fields].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );
      sortedFields.forEach((field) => {
        const fieldGroup = this.createFieldGroup(field);

        // Add options with scores
        if (
          field.options &&
          field.options.length > 0 &&
          this.fieldNeedsOptions(field.fieldType)
        ) {
          const optionsArray = fieldGroup.get(
            'options',
          ) as FormArray<FormGroup>;
          const sortedOptions = [...field.options].sort(
            (a, b) => a.orderIndex - b.orderIndex,
          );
          sortedOptions.forEach((option) => {
            optionsArray.push(
              this.fb.group({
                id: [option.id],
                uuid: [option.uuid],
                label: [option.label, Validators.required],
                value: [option.value, Validators.required],
                orderIndex: [option.orderIndex],
                score: [option.score || 0],
              }),
              { emitEvent: false }
            );
          });
        }

        fieldsArray.push(fieldGroup, { emitEvent: false });
      });
    }

    // Handle nested subsections if any
    if (subsection.subsections && subsection.subsections.length > 0) {
      const nestedSubsectionsArray = subsectionGroup.get(
        'subsections',
      ) as FormArray<FormGroup>;
      const sortedNestedSubsections = [...subsection.subsections].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );

      if (this.isDebugMode) {
        console.log(
          `Adding ${sortedNestedSubsections.length} nested subsections for subsection ${subsection.title}`,
        );
      }

      sortedNestedSubsections.forEach((nestedSubsection) => {
        const nestedGroup = this.buildLoadedSubsectionGroup(nestedSubsection);
        nestedGroup.patchValue({
          parentSectionUuid: subsection.uuid,
          sectionLevel: (subsection.sectionLevel || 1) + 1,
        }, { emitEvent: false });
        nestedSubsectionsArray.push(nestedGroup, { emitEvent: false });
      });
    }

    return subsectionGroup;
  }

  /**
   * Legacy method - kept for compatibility
   * Use buildLoadedSubsectionGroup for better performance
   */
  addLoadedSectionAsSubsection(subsection: FormSection): FormGroup {
    return this.buildLoadedSubsectionGroup(subsection);
  }

  removeSection(index: number): void {
    const section = this.sections.at(index);
    const sectionTitle = section.get('title')?.value || 'this section';

    this.showConfirmDialog(
      'Delete Section',
      `Are you sure you want to delete "${sectionTitle}"? This will also delete all fields and subsections within it. This action cannot be undone.`,
      () => {
        this.sections.removeAt(index);
        // Update orderIndex values
        for (let i = 0; i < this.sections.length; i++) {
          this.sections.at(i).get('orderIndex')?.setValue(i);
        }
      },
    );
  }

  // Fields
  getFields(sectionIndex: number): FormArray<FormGroup> {
    return this.sections.at(sectionIndex).get('fields') as FormArray<FormGroup>;
  }

  addField(sectionIndex: number): void {
    const fields = this.getFields(sectionIndex);
    fields.push(
      this.fb.group({
        label: ['New Field', Validators.required],
        fieldType: [FieldType.TEXT, Validators.required],
        required: [true], // Default to checked/required
        placeholder: [''],
        helpText: [''],
        orderIndex: [fields.length],
        validationRules: ['{}'],
        options: this.fb.array([]),
        conditionalLogic: this.fb.array([]),
      }),
    );
  }

  // Add field at specific position
  insertFieldAt(sectionIndex: number, insertIndex: number): void {
    const fields = this.getFields(sectionIndex);
    const newField = this.fb.group({
      label: ['New Field', Validators.required],
      fieldType: [FieldType.TEXT, Validators.required],
      required: [true],
      placeholder: [''],
      helpText: [''],
      orderIndex: [insertIndex],
      validationRules: ['{}'],
      options: this.fb.array([]),
      conditionalLogic: this.fb.array([]),
      comments: [''], // Add comments field
    });

    // Insert at the specified position
    fields.insert(insertIndex, newField);

    // Update orderIndex for all fields after the inserted position
    this.reorderFields(sectionIndex);
  }

  createFieldGroup(field: FormField): FormGroup {
    const fieldGroup = this.fb.group({
      id: [field.id],
      uuid: [field.uuid],
      label: [field.label, Validators.required],
      fieldType: [field.fieldType, Validators.required],
      required: [field.required],
      placeholder: [field.placeholder || ''],
      helpText: [field.helpText || ''],
      orderIndex: [field.orderIndex],
      validationRules: [field.validationRules || '{}'],
      options: this.fb.array([]),
      conditionalLogic: this.fb.array([]),
    });

    // Load existing conditional logic if present
    if (field.conditionalLogic) {
      try {
        let conditionalLogicData;

        // Parse the conditional logic if it's a string
        if (typeof field.conditionalLogic === 'string') {
          conditionalLogicData = JSON.parse(field.conditionalLogic);
        } else {
          conditionalLogicData = field.conditionalLogic;
        }

        if (Array.isArray(conditionalLogicData)) {
          const conditionalLogicArray = fieldGroup.get(
            'conditionalLogic',
          ) as FormArray;

          conditionalLogicData.forEach((rule) => {
            const ruleGroup = this.fb.group({
              triggerFieldUuid: [rule.triggerFieldUuid, Validators.required],
              operator: [rule.operator, Validators.required],
              value: [rule.value, Validators.required],
              actions: this.fb.array([]),
            });

            // Add actions
            if (rule.actions && Array.isArray(rule.actions)) {
              const actionsArray = ruleGroup.get('actions') as FormArray;
              rule.actions.forEach((action) => {
                const actionGroup = this.fb.group({
                  actionType: [action.actionType, Validators.required],
                  targetFieldUuid: [action.targetFieldUuid || ''],
                  targetSectionUuid: [action.targetSectionUuid || ''],
                  actionValue: [action.actionValue || ''],
                });
                actionsArray.push(actionGroup);
              });
            }

            conditionalLogicArray.push(ruleGroup);
          });
        }
      } catch (error) {
        console.error(
          'Error parsing conditional logic for field:',
          field.label,
          error,
        );
      }
    }

    return fieldGroup;
  }

  removeField(sectionIndex: number, fieldIndex: number): void {
    const field = this.getFields(sectionIndex).at(fieldIndex);
    const fieldLabel = field.get('label')?.value || 'this field';

    this.showConfirmDialog(
      'Delete Field',
      `Are you sure you want to delete "${fieldLabel}"? This action cannot be undone.`,
      () => {
        const fields = this.getFields(sectionIndex);
        fields.removeAt(fieldIndex);
        // Update orderIndex values
        this.reorderFields(sectionIndex);
      },
    );
  }

  // Reorder fields after insertion/deletion to maintain proper orderIndex
  reorderFields(sectionIndex: number): void {
    const fields = this.getFields(sectionIndex);
    for (let i = 0; i < fields.length; i++) {
      fields.at(i).get('orderIndex')?.setValue(i);
    }
  }

  // Options for select, radio, checkbox fields
  getOptions(sectionIndex: number, fieldIndex: number): FormArray<FormGroup> {
    return this.getFields(sectionIndex)
      .at(fieldIndex)
      .get('options') as FormArray<FormGroup>;
  }

  addOption(sectionIndex: number, fieldIndex: number): void {
    const options = this.getOptions(sectionIndex, fieldIndex);
    options.push(
      this.fb.group({
        label: ['Option ' + (options.length + 1), Validators.required],
        value: ['option' + (options.length + 1), Validators.required],
        orderIndex: [options.length],
        score: [0],
      }),
    );

    if (this.formSubmitted) {
      this.validateSectionScores(this.sections);
    }
  }

  removeOption(
    sectionIndex: number,
    fieldIndex: number,
    optionIndex: number,
  ): void {
    const options = this.getOptions(sectionIndex, fieldIndex);
    options.removeAt(optionIndex);
    // Update orderIndex values
    for (let i = 0; i < options.length; i++) {
      options.at(i).get('orderIndex')?.setValue(i);
    }
  }

  fieldNeedsOptions(fieldType: string): boolean {
    return (
      fieldType === FieldType.SELECT ||
      fieldType === FieldType.RADIO ||
      fieldType === FieldType.CHECKBOX
    );
  }

  onFieldTypeChange(sectionIndex: number, fieldIndex: number): void {
    const field = this.getFields(sectionIndex).at(fieldIndex) as FormGroup;
    const fieldType = field.get('fieldType')?.value;

    if (
      this.fieldNeedsOptions(fieldType) &&
      this.getOptions(sectionIndex, fieldIndex).length === 0
    ) {
      // Add default options if field type requires options
      this.addOption(sectionIndex, fieldIndex);
      this.addOption(sectionIndex, fieldIndex);
    }
  }

  // Subsection methods
  getSubsections(sectionIndex: number): FormArray<FormGroup> {
    return this.sections
      .at(sectionIndex)
      .get('subsections') as FormArray<FormGroup>;
  }

  addSubsection(parentSectionIndex: number): void {
    const parentSection = this.sections.at(parentSectionIndex) as FormGroup;
    const subsections = parentSection.get(
      'subsections',
    ) as FormArray<FormGroup>;

    // Generate a temporary UUID for new subsections
    const properUuid = this.generateProperUuid();

    subsections.push(
      this.fb.group({
        title: ['New Subsection', Validators.required],
        orderIndex: [subsections.length],
        weight: [1.0], // Default weight
        maxScore: [null],
        sectionLevel: [1], // Level 1 subsection
        uuid: [properUuid],
        parentSectionUuid: [parentSection.get('uuid')?.value],
        fields: this.fb.array([]),
        subsections: this.fb.array([]),
      }),
    );

    if (this.isDebugMode) {
      console.log('Added subsection to section', parentSectionIndex);
      console.log('Subsection count:', subsections.length);
      console.log('Parent section UUID:', parentSection.get('uuid')?.value);
    }
  }

  removeSubsection(sectionIndex: number, subsectionIndex: number): void {
    const subsection = this.getSubsections(sectionIndex).at(subsectionIndex);
    const subsectionTitle = subsection.get('title')?.value || 'this subsection';

    this.showConfirmDialog(
      'Delete Subsection',
      `Are you sure you want to delete "${subsectionTitle}"? This will also delete all fields within it. This action cannot be undone.`,
      () => {
        const subsections = this.getSubsections(sectionIndex);
        subsections.removeAt(subsectionIndex);

        // Update orderIndex values
        for (let i = 0; i < subsections.length; i++) {
          subsections.at(i).get('orderIndex')?.setValue(i);
        }

        if (this.isDebugMode) {
          console.log(
            'Removed subsection',
            subsectionIndex,
            'from section',
            sectionIndex,
          );
          console.log('Remaining subsections:', subsections.length);
        }
      },
    );
  }

  addFieldToSubsection(sectionIndex: number, subsectionIndex: number): void {
    const subsection = this.getSubsections(sectionIndex).at(
      subsectionIndex,
    ) as FormGroup;
    const fields = subsection.get('fields') as FormArray<FormGroup>;

    fields.push(
      this.fb.group({
        label: ['New Field', Validators.required],
        fieldType: [FieldType.TEXT, Validators.required],
        required: [true], // Default to checked/required
        placeholder: [''],
        helpText: [''],
        orderIndex: [fields.length],
        validationRules: ['{}'],
        options: this.fb.array([]),
        conditionalLogic: this.fb.array([]),
      }),
    );

    if (this.isDebugMode) {
      console.log(
        `Added field to subsection ${subsectionIndex} of section ${sectionIndex}`,
      );
      console.log('Field count:', fields.length);
    }
  }

  // Insert field at specific position in subsection
  insertFieldAtSubsection(
    sectionIndex: number,
    subsectionIndex: number,
    insertIndex: number,
  ): void {
    const subsection = this.getSubsections(sectionIndex).at(
      subsectionIndex,
    ) as FormGroup;
    const fields = subsection.get('fields') as FormArray<FormGroup>;

    const newField = this.fb.group({
      label: ['New Field', Validators.required],
      fieldType: [FieldType.TEXT, Validators.required],
      required: [true],
      placeholder: [''],
      helpText: [''],
      orderIndex: [insertIndex],
      validationRules: ['{}'],
      options: this.fb.array([]),
      conditionalLogic: this.fb.array([]),
      comments: [''], // comments field
    });

    fields.insert(insertIndex, newField);

    // Update orderIndex for all fields after the inserted position
    this.reorderSubsectionFields(sectionIndex, subsectionIndex);
  }

  getSubsectionFields(
    sectionIndex: number,
    subsectionIndex: number,
  ): FormArray<FormGroup> {
    return this.getSubsections(sectionIndex)
      .at(subsectionIndex)
      .get('fields') as FormArray<FormGroup>;
  }

  removeSubsectionField(
    sectionIndex: number,
    subsectionIndex: number,
    fieldIndex: number,
  ): void {
    const field = this.getSubsectionFields(sectionIndex, subsectionIndex).at(
      fieldIndex,
    );
    const fieldLabel = field.get('label')?.value || 'this field';

    this.showConfirmDialog(
      'Delete Field',
      `Are you sure you want to delete "${fieldLabel}"? This action cannot be undone.`,
      () => {
        const fields = this.getSubsectionFields(sectionIndex, subsectionIndex);
        fields.removeAt(fieldIndex);
        // Update orderIndex values
        this.reorderSubsectionFields(sectionIndex, subsectionIndex);
      },
    );
  }

  // Reorder subsection fields after insertion/deletion
  reorderSubsectionFields(sectionIndex: number, subsectionIndex: number): void {
    const fields = this.getSubsectionFields(sectionIndex, subsectionIndex);
    for (let i = 0; i < fields.length; i++) {
      fields.at(i).get('orderIndex')?.setValue(i);
    }
  }

  onSubsectionFieldTypeChange(
    sectionIndex: number,
    subsectionIndex: number,
    fieldIndex: number,
  ): void {
    const field = this.getSubsectionFields(sectionIndex, subsectionIndex).at(
      fieldIndex,
    ) as FormGroup;
    const fieldType = field.get('fieldType')?.value;

    if (
      this.fieldNeedsOptions(fieldType) &&
      this.getSubsectionFieldOptions(sectionIndex, subsectionIndex, fieldIndex)
        .length === 0
    ) {
      // Add default options if field type requires options
      this.addSubsectionFieldOption(sectionIndex, subsectionIndex, fieldIndex);
      this.addSubsectionFieldOption(sectionIndex, subsectionIndex, fieldIndex);
    }
  }

  getSubsectionFieldOptions(
    sectionIndex: number,
    subsectionIndex: number,
    fieldIndex: number,
  ): FormArray<FormGroup> {
    return this.getSubsectionFields(sectionIndex, subsectionIndex)
      .at(fieldIndex)
      .get('options') as FormArray<FormGroup>;
  }

  addSubsectionFieldOption(
    sectionIndex: number,
    subsectionIndex: number,
    fieldIndex: number,
  ): void {
    const options = this.getSubsectionFieldOptions(
      sectionIndex,
      subsectionIndex,
      fieldIndex,
    );
    options.push(
      this.fb.group({
        label: ['Option ' + (options.length + 1), Validators.required],
        value: ['option' + (options.length + 1), Validators.required],
        orderIndex: [options.length],
        score: [0],
      }),
    );

    if (this.formSubmitted) {
      this.validateSectionScores(this.sections);
    }
  }

  removeSubsectionFieldOption(
    sectionIndex: number,
    subsectionIndex: number,
    fieldIndex: number,
    optionIndex: number,
  ): void {
    const options = this.getSubsectionFieldOptions(
      sectionIndex,
      subsectionIndex,
      fieldIndex,
    );
    options.removeAt(optionIndex);
    // Update orderIndex values
    for (let i = 0; i < options.length; i++) {
      options.at(i).get('orderIndex')?.setValue(i);
    }
  }

  // General form navigation methods
  moveUp(array: FormArray<FormGroup>, index: number): void {
    if (index <= 0) return;

    // Swap items
    const item = array.at(index);
    array.removeAt(index);
    array.insert(index - 1, item);

    // Update orderIndex values
    for (let i = 0; i < array.length; i++) {
      array.at(i).get('orderIndex')?.setValue(i);
    }
  }

  moveDown(array: FormArray<FormGroup>, index: number): void {
    if (index >= array.length - 1) return;

    // Swap items
    const item = array.at(index);
    array.removeAt(index);
    array.insert(index + 1, item);

    // Update orderIndex values
    for (let i = 0; i < array.length; i++) {
      array.at(i).get('orderIndex')?.setValue(i);
    }
  }

  // Helper method to process the form and ensure correct parent-child relationships
  processFormBeforeSave(): any {
    const formValue = this.formBuilderForm.value;

    if (this.isDebugMode) {
      console.log('form value', this.formBuilderForm.value);
    }

    // Process each section's subsections
    formValue.sections.forEach((section: any) => {
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((subsection: any) => {
          // Ensure subsection has the correct parent section UUID
          subsection.parentSectionUuid = section.uuid;

          // Set proper section level
          subsection.sectionLevel = 1;

          // Process any nested subsections
          if (subsection.subsections && subsection.subsections.length > 0) {
            this.processNestedSubsections(
              subsection.subsections,
              subsection.uuid,
              2,
            );
          }
        });
      }
    });

    return formValue;
  }

  // Helper method to process nested subsections iteratively to avoid stack overflow
  processNestedSubsections(
    subsections: any[],
    parentUuid: string,
    level: number,
  ): void {
    if (!subsections || subsections.length === 0) return;

    const stack: Array<{ items: any[]; parentUuid: string; level: number }> = [
      { items: subsections, parentUuid, level },
    ];

    while (stack.length > 0) {
      const current = stack.pop()!;
      current.items.forEach((subsection: any) => {
        subsection.parentSectionUuid = current.parentUuid;
        subsection.sectionLevel = current.level;

        if (subsection.subsections && subsection.subsections.length > 0) {
          stack.push({
            items: subsection.subsections,
            parentUuid: subsection.uuid,
            level: current.level + 1,
          });
        }
      });
    }
  }

  // Debug functions for troubleshooting
  logFormStructure(): void {
    const formValue = this.formBuilderForm.value;
    console.log('Current Form Structure:');
    console.log(`Form Name: ${formValue.name}`);
    console.log(`Total Sections: ${formValue.sections.length}`);

    formValue.sections.forEach((section: any, i: number) => {
      console.log(`\nSection ${i + 1}: ${section.title}`);
      console.log(`UUID: ${section.uuid}`);
      console.log(`Fields: ${section.fields?.length || 0}`);

      if (section.subsections && section.subsections.length > 0) {
        console.log(`Subsections: ${section.subsections.length}`);

        section.subsections.forEach((subsection: any, j: number) => {
          console.log(`  Subsection ${j + 1}: ${subsection.title}`);
          console.log(`  UUID: ${subsection.uuid}`);
          console.log(`  Parent UUID: ${subsection.parentSectionUuid}`);
          console.log(`  Level: ${subsection.sectionLevel}`);
          console.log(`  Fields: ${subsection.fields?.length || 0}`);
        });
      }
    });
  }

  // Toggle debug mode
  toggleDebugMode(): void {
    this.isDebugMode = !this.isDebugMode;
    console.log('Debug mode:', this.isDebugMode ? 'ON' : 'OFF');

    if (this.isDebugMode) {
      this.logFormStructure();
    }
  }

  // Test function to verify deletion works properly
  testDeletionFunctionality(): void {
    console.log('=== Testing Deletion Functionality ===');

    // Log current form structure
    const formValue = this.formBuilderForm.value;
    console.log('Current form structure before any deletions:');

    formValue.sections.forEach((section: any, sIndex: number) => {
      console.log(
        `Section ${sIndex}: ${section.title} - ${section.fields?.length || 0} fields`,
      );

      section.fields?.forEach((field: any, fIndex: number) => {
        console.log(
          `  Field ${fIndex}: ${field.label} (orderIndex: ${field.orderIndex})`,
        );
      });

      if (section.subsections?.length > 0) {
        section.subsections.forEach((subsection: any, subIndex: number) => {
          console.log(
            `  Subsection ${subIndex}: ${subsection.title} - ${subsection.fields?.length || 0} fields`,
          );

          subsection.fields?.forEach((field: any, fIndex: number) => {
            console.log(
              `    SubField ${fIndex}: ${field.label} (orderIndex: ${field.orderIndex})`,
            );
          });
        });
      }
    });

    console.log(
      '=== Deletion test completed - check console before/after deleting fields ===',
    );
  }

  getFormErrors(): any {
    const errors = {};
    Object.keys(this.formBuilderForm.controls).forEach((key) => {
      const controlErrors = this.formBuilderForm.get(key).errors;
      if (controlErrors != null) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

  handleSelection(data: any) {
    if (this.isDebugMode) {
      console.log('data', data);
    }
  }

  logHotelTypes(response: Array<string>): void {
    if (this.isDebugMode) {
      console.log('Hotel Types Response:', response);
      console.log(
        'Normalized Options:',
        response.map((option: string) => ({
          label: option || option || option,
          value: option || option || option,
        })),
      );
    }
  }

  private rebuildSectionHierarchy(flatSections: any[]): any[] {
    if (!flatSections || flatSections.length === 0) {
      return [];
    }

    // Create a map of sections by UUID for easy lookup
    const sectionsMap = new Map();
    flatSections.forEach((section) => {
      // Clone the section and prepare a subsections array
      const sectionCopy = { ...section, subsections: [] };
      sectionsMap.set(section.uuid, sectionCopy);
    });

    // Identify top-level sections and build the hierarchy
    const topLevelSections: any[] = [];

    flatSections.forEach((section) => {
      const sectionCopy = sectionsMap.get(section.uuid);

      // If this is a subsection, add it to its parent's subsections array
      if (
        section.parentSectionUuid &&
        sectionsMap.has(section.parentSectionUuid)
      ) {
        const parentSection = sectionsMap.get(section.parentSectionUuid);
        parentSection.subsections.push(sectionCopy);
      }
      // Otherwise, it's a top-level section
      else if (!section.parentSectionUuid || section.sectionLevel === 0) {
        topLevelSections.push(sectionCopy);
      }
    });

    // Sort top-level sections by orderIndex
    return topLevelSections.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  // Method to validate section and subsection max scores with caching optimization
  validateSectionScores(sections: FormArray): boolean {
    // Check cache first to avoid redundant validation
    const cacheKey = sections.value
      .map((s) => `${s.uuid}-${s.maxScore}`)
      .join('|');
    if (this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey)!;
      this.validationErrors = cached.errors;
      return cached.isValid;
    }

    let isValid = true;
    let errorMessages: string[] = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections.at(i) as FormGroup;
      const maxScore = section.get('maxScore')?.value;
      const title = section.get('title')?.value;

      // Validate subsection scores don't exceed section max score
      if (maxScore !== null && maxScore !== '' && maxScore !== undefined) {
        const subsections = section.get('subsections') as FormArray;
        let subsectionMaxSum = 0;

        for (let j = 0; j < subsections.length; j++) {
          const subsectionMaxScore = subsections.at(j).get('maxScore')?.value;
          if (
            subsectionMaxScore !== null &&
            subsectionMaxScore !== '' &&
            subsectionMaxScore !== undefined
          ) {
            subsectionMaxSum += parseFloat(subsectionMaxScore);
          }
        }

        if (subsectionMaxSum > parseFloat(maxScore)) {
          isValid = false;
          errorMessages.push(
            `Section "${title}": Sum of subsection max scores (${subsectionMaxSum}) exceeds section max score (${maxScore})`,
          );

          // Mark section as invalid
          section.get('maxScore')?.setErrors({ invalidMaxScore: true });
        }
      }

      // Recursively validate subsections only if needed
      const subsections = section.get('subsections') as FormArray;
      if (subsections.length > 0) {
        const subsectionsValid = this.validateSectionScores(subsections);
        isValid = isValid && subsectionsValid;
      }

      // Validate field option scores - early exit if no maxScore constraint
      if (maxScore === null || maxScore === '' || maxScore === undefined) {
        continue;
      }

      const fields = section.get('fields') as FormArray;
      for (let j = 0; j < fields.length; j++) {
        const field = fields.at(j) as FormGroup;
        const fieldType = field.get('fieldType')?.value;
        const fieldLabel = field.get('label')?.value;

        if (!this.fieldNeedsOptions(fieldType)) {
          continue;
        }

        const options = field.get('options') as FormArray;
        for (let k = 0; k < options.length; k++) {
          const option = options.at(k) as FormGroup;
          const optionScore = option.get('score')?.value;
          const optionLabel = option.get('label')?.value;

          if (
            optionScore !== null &&
            optionScore !== '' &&
            optionScore !== undefined &&
            parseFloat(optionScore) > parseFloat(maxScore)
          ) {
            isValid = false;
            errorMessages.push(
              `Field "${fieldLabel}" - Option "${optionLabel}": Score (${optionScore}) exceeds section max score (${maxScore})`,
            );

            // Mark option as invalid
            option.get('score')?.setErrors({ exceedsMaxScore: true });
          }
        }
      }
    }

    // Cache the result
    this.validationCache.set(cacheKey, { isValid, errors: errorMessages });

    if (!isValid) {
      this.validationErrors = errorMessages;
    }

    return isValid;
  }

  // Add a property to store validation errors
  validationErrors: string[] = [];

  // Cache for validation results to avoid redundant calculations
  private validationCache = new Map<
    string,
    { isValid: boolean; errors: string[] }
  >();

  // Method to clear validation errors
  clearValidationErrors(): void {
    this.validationErrors = [];
    this.validationCache.clear();
  }

  async saveForm() {
    this.formSubmitted = true;
    this.clearValidationErrors();

    if (this.formBuilderForm.invalid) {
      this.markFormGroupTouched(this.formBuilderForm);
      this.scrollToFirstError();
      return;
    }

    // Validate section scores
    const isValid = this.validateSectionScores(this.sections);
    if (!isValid) {
      this.openValidationErrorDialog();
      return;
    }

    // Continue with your existing save logic
    const processedForm = this.processFormBeforeSave();

    if (this.isDebugMode) {
      console.log('Processed Form Data:', processedForm);
    }

    if (this.formId) {
      const payload = {
        ...processedForm,
        uuid: this.formId,
        id: this.currentForm.id,
      };
      // Update existing form
      this.formService.updateForm(this.formId, payload).subscribe(
        (result) => {
          this.router.navigate(['/manage-forms']);
        },
        (error) => {
          console.error('Error updating form:', error);
        },
      );
    } else {
      // Create new form
      const response = await lastValueFrom(
        this.formService.createForm(processedForm),
      );
      if (this.isDebugMode) {
        console.log('Form created successfully:', response);
      }

      // if (response) {
      //   this.router.navigate(['/manage-forms']);
      // } else {
      //   console.error('Error creating form:');
      // }
    }
  }

  // Helper to mark all controls as touched for validation display
  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.controls[key];

      if (control instanceof FormControl) {
        control.markAsTouched();
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Scroll to the first error with optimized DOM query
  scrollToFirstError(): void {
    setTimeout(() => {
      // Use more specific selector to avoid querying entire document
      const formContainer =
        document.querySelector('.form-builder-container') || document;
      const firstErrorElement = formContainer.querySelector('.ng-invalid');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  }

  // Display validation errors dialog
  openValidationErrorDialog(): void {
    const errorMessage =
      'Please fix the following validation errors:\n\n' +
      this.validationErrors
        .map((error, index) => `${index + 1}. ${error}`)
        .join('\n');

    this.showConfirmDialog(
      'Validation Errors',
      errorMessage,
      () => {}, // No callback action needed - just showing errors
      'OK',
    );
  }

  // Helper method to show confirm dialog
  showConfirmDialog(
    title: string,
    message: string,
    onConfirm: () => void,
    confirmMessage: string = 'CONFIRM',
  ): void {
    this.confirmDialogTitle = title;
    this.confirmDialogMessage = message;
    this.confirmDialogCallback = onConfirm;
    this.confirmDialogOpen = true;
  }

  // Handle confirm dialog close
  onConfirmDialogClose(result: boolean): void {
    this.confirmDialogOpen = false;
  }

  // Handle confirm dialog confirm action
  onConfirmDialogConfirm(): void {
    if (this.confirmDialogCallback) {
      this.confirmDialogCallback();
    }
    this.confirmDialogOpen = false;
    this.confirmDialogCallback = null;
  }

  initFormValidators(): void {
    // Listen for value changes to update validation with debouncing to improve performance
    this.formBuilderForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      if (this.formSubmitted) {
        this.validateSectionScores(this.sections);
      }
    });
  }

  // Helper methods for conditional logic
  getAllAvailableFields(): any[] {
    const allFields: any[] = [];

    this.sections.controls.forEach((section, sectionIndex) => {
      const sectionGroup = section as FormGroup;
      const fields = sectionGroup.get('fields') as FormArray;

      fields.controls.forEach((field, fieldIndex) => {
        const fieldGroup = field as FormGroup;
        allFields.push({
          uuid:
            fieldGroup.get('uuid')?.value ||
            `section-${sectionIndex}-field-${fieldIndex}`,
          label: fieldGroup.get('label')?.value || `Field ${fieldIndex + 1}`,
          sectionTitle: sectionGroup.get('title')?.value,
        });
      });

      // Add subsection fields
      const subsections = sectionGroup.get('subsections') as FormArray;
      subsections?.controls.forEach((subsection, subsectionIndex) => {
        const subsectionGroup = subsection as FormGroup;
        const subsectionFields = subsectionGroup.get('fields') as FormArray;

        subsectionFields?.controls.forEach((field, fieldIndex) => {
          const fieldGroup = field as FormGroup;
          allFields.push({
            uuid:
              fieldGroup.get('uuid')?.value ||
              `section-${sectionIndex}-subsection-${subsectionIndex}-field-${fieldIndex}`,
            label: fieldGroup.get('label')?.value || `Field ${fieldIndex + 1}`,
            sectionTitle: `${sectionGroup.get('title')?.value} > ${subsectionGroup.get('title')?.value}`,
          });
        });
      });
    });

    return allFields;
  }

  getAllAvailableSections(): any[] {
    const allSections: any[] = [];

    this.sections.controls.forEach((section, sectionIndex) => {
      const sectionGroup = section as FormGroup;
      allSections.push({
        uuid: sectionGroup.get('uuid')?.value || `section-${sectionIndex}`,
        title:
          sectionGroup.get('title')?.value || `Section ${sectionIndex + 1}`,
      });

      // Add subsections
      const subsections = sectionGroup.get('subsections') as FormArray;
      subsections?.controls.forEach((subsection, subsectionIndex) => {
        const subsectionGroup = subsection as FormGroup;
        allSections.push({
          uuid:
            subsectionGroup.get('uuid')?.value ||
            `section-${sectionIndex}-subsection-${subsectionIndex}`,
          title: `${sectionGroup.get('title')?.value} > ${subsectionGroup.get('title')?.value}`,
        });
      });
    });

    return allSections;
  }

  // TrackBy functions for optimized change detection in ngFor loops
  trackBySection(index: number, section: any): string {
    return section.get('uuid')?.value || `section-${index}`;
  }

  trackByField(index: number, field: any): string {
    return field.get('uuid')?.value || `field-${index}`;
  }

  trackByOption(index: number, option: any): string {
    return option.get('uuid')?.value || `option-${index}`;
  }

  trackBySubsection(index: number, subsection: any): string {
    return subsection.get('uuid')?.value || `subsection-${index}`;
  }

  /**
   * Scrolls to and highlights a section by UUID
   * Used when navigating from the section scores dialog
   */
  scrollToAndHighlightSection(sectionUuid: string): void {
    // Retry mechanism to wait for DOM to be ready
    let attempts = 0;
    const maxAttempts = 15;
    const retryInterval = 300;

    const tryScroll = () => {
      const element = document.getElementById(`section-${sectionUuid}`);

      if (element) {
        // Scroll to element with smooth behavior
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add highlight classes
        element.classList.add('ring-4', 'ring-red-500', 'ring-offset-2');
        element.style.transition = 'all 0.3s ease-in-out';

        // Remove highlight after 3 seconds
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-red-500', 'ring-offset-2');
        }, 3000);
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(tryScroll, retryInterval);
        } else {
          console.warn(`Section ${sectionUuid} not found after ${maxAttempts} attempts`);
        }
      }
    };

    tryScroll();
  }
}
