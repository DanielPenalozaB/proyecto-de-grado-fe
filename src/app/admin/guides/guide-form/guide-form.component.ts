import { ButtonComponent } from '@/app/shared/ui/button/button.component';
import { LabelComponent } from '@/app/shared/ui/label/label.component';
import { SelectComponent, SelectOption } from '@/app/shared/ui/select/select.component';
import { Languages } from '@/common/common.interface';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GuideDifficulty, GuideStatus } from '../guides.interface';

export interface GuideFormData {
  id?: number;
  name: string;
  description: string;
  difficulty: GuideDifficulty;
  estimatedDuration: number;
  status: GuideStatus;
  language: Languages;
  points: number;
}

@Component({
  selector: 'app-guide-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LabelComponent,
    SelectComponent
  ],
  templateUrl: './guide-form.component.html',
})
export class GuideFormComponent implements OnInit {
  @Input() guide: GuideFormData | null = null;
  @Input() isEditMode = false;
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<GuideFormData>();
  @Output() formCancel = new EventEmitter<void>();

  form: FormGroup;

  difficultyOptions: SelectOption[] = [
    { value: GuideDifficulty.BEGINNER, label: 'Principiante' },
    { value: GuideDifficulty.INTERMEDIATE, label: 'Intermedio' },
    { value: GuideDifficulty.ADVANCED, label: 'Avanzado' }
  ];

  statusOptions: SelectOption[] = [
    { value: GuideStatus.DRAFT, label: 'Borrador' },
    { value: GuideStatus.PUBLISHED, label: 'Publicado' },
    { value: GuideStatus.ARCHIVED, label: 'Archivado' }
  ];

  languageOptions: SelectOption[] = [
    { value: Languages.ES, label: 'Español' },
    { value: Languages.EN, label: 'English' }
  ];

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    if (this.guide) {
      this.form.patchValue(this.guide);
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: [GuideDifficulty.BEGINNER, [Validators.required]],
      estimatedDuration: [0, [Validators.required, Validators.min(1)]],
      status: [GuideStatus.DRAFT, [Validators.required]],
      language: [Languages.ES, [Validators.required]],
      points: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formData: GuideFormData = {
        ...this.form.value,
        ...(this.isEditMode && this.guide?.id && { id: this.guide.id })
      };
      this.formSubmit.emit(formData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  // Method to submit form programmatically (for compatibility with existing code)
  submitForm(): void {
    this.onSubmit();
  }
}