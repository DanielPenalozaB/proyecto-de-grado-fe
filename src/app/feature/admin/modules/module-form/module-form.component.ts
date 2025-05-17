import { Guide } from '@/app/admin/guides/guides.interface';
import { GuidesService } from '@/app/admin/guides/guides.service';
import { ModuleStatus } from '@/app/admin/modules/modules.interface';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface ModuleFormData {
  id: number | undefined;
  name: string;
  description: string;
  order: number;
  points: number;
  status: ModuleStatus;
  guideId: number;
}

@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './module-form.component.html',
  styleUrls: ['./module-form.component.css']
})
export class ModuleFormComponent implements OnInit {
  @Input() module: ModuleFormData = {
    id: undefined,
    name: '',
    description: '',
    order: 1,
    points: 0,
    status: ModuleStatus.DRAFT,
    guideId: 0
  };
  @Input() isEditMode = false;
  @Output() moduleSubmitted = new EventEmitter<ModuleFormData>();

  moduleForm: FormGroup;
  ModuleStatus = ModuleStatus;
  guides: Guide[] = [];
  loadingGuides = false;

  constructor(
    private fb: FormBuilder,
    private guidesService: GuidesService
  ) {
    this.moduleForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      order: [1, [Validators.required, Validators.min(1)]],
      points: [0, [Validators.required, Validators.min(0)]],
      status: [ModuleStatus.DRAFT, Validators.required],
      guideId: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadGuides();
    this.moduleForm.patchValue(this.module);
  }

  onSubmit(): void {
    if (this.moduleForm.valid) {
      const formData = this.moduleForm.value;
      if (!this.isEditMode || !formData.id) {
        delete formData.id;
      }
      this.moduleSubmitted.emit(formData);
    }
  }

  loadGuides(): void {
    this.loadingGuides = true;
    this.guidesService.getGuides({ limit: 100 }).subscribe({
      next: (response) => {
        this.guides = response.data;
        console.log(this.guides);
        this.loadingGuides = false;
      },
      error: (err) => {
        console.error('Error loading guides', err);
        this.loadingGuides = false;
      }
    });
  }

  get form(): FormGroup {
    return this.moduleForm;
  }

  submitForm(): void {
    this.onSubmit();
  }
}