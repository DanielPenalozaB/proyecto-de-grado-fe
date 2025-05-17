import { GuideDifficulty, GuideStatus } from '@/app/admin/guides/guides.interface';
import { Languages } from '@/common/common.interface';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface GuideFormData {
  id?: number | undefined;
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
    ReactiveFormsModule
  ],
  templateUrl: './guide-form.component.html',
  styleUrls: ['./guide-form.component.css']
})
export class GuideFormComponent implements OnInit {
  @Input() guide: GuideFormData = {
    name: '',
    description: '',
    difficulty: GuideDifficulty.BEGINNER,
    estimatedDuration: 0,
    status: GuideStatus.DRAFT,
    language: Languages.ES,
    points: 0
  };
  @Input() isEditMode = false;
  @Output() guideSubmitted = new EventEmitter<GuideFormData>();

  guideForm: FormGroup;
  GuideDifficulty = GuideDifficulty;
  GuideStatus = GuideStatus;
  Languages = Languages;

  constructor(private fb: FormBuilder) {
    this.guideForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      difficulty: [GuideDifficulty.BEGINNER, Validators.required],
      estimatedDuration: [0, [Validators.required, Validators.min(1)]],
      status: [GuideStatus.DRAFT, Validators.required],
      language: [Languages.ES, Validators.required],
      points: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.guideForm.patchValue(this.guide);
  }

  onSubmit(): void {
    if (this.guideForm.valid) {
      const formData = this.guideForm.value;
      if (!this.isEditMode || !formData.id) {
        delete formData.id;
      }
      this.guideSubmitted.emit(formData);
    }
  }

  get form(): FormGroup {
    return this.guideForm;
  }

  submitForm(): void {
    this.onSubmit();
  }
}