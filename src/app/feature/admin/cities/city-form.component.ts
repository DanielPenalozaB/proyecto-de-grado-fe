import { Languages } from '@/common/common.interface';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface CityFormData {
  id?: number | null;
  name: string;
  description?: string;
  rainfall?: number;
  language?: Languages;
}

@Component({
  selector: 'app-city-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <form [formGroup]="cityForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="grid gap-2">
        <label for="name" class="text-sm font-medium">Nombre</label>
        <input
          type="text"
          id="name"
          formControlName="name"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <div *ngIf="cityForm.get('name')?.invalid && cityForm.get('name')?.touched" class="text-red-500 text-xs">
          Se requiere un nombre
        </div>
      </div>
      <div class="grid gap-2">
        <label for="description" class="text-sm font-medium">Descripción</label>
        <textarea
          id="description"
          formControlName="description"
          class="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        ></textarea>
      </div>
      <div class="grid gap-2">
        <label for="rainfall" class="text-sm font-medium">Pluviosidad (mm)</label>
        <input
          type="number"
          id="rainfall"
          formControlName="rainfall"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div class="grid gap-2">
        <label for="language" class="text-sm font-medium">Idioma</label>
        <select
          id="language"
          formControlName="language"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option [value]="undefined">Selecciona un idioma</option>
          <option [value]="Languages.ES">Español</option>
          <option [value]="Languages.EN">English</option>
        </select>
      </div>
    </form>
  `
})
export class CityFormComponent implements OnInit {
  @Input() city: CityFormData = { name: '' };
  @Input() isEditMode = false;
  @Output() citySubmitted = new EventEmitter<CityFormData>();
  cityForm: FormGroup;
  Languages = Languages;

  constructor(private fb: FormBuilder) {
    this.cityForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: [''],
      rainfall: [null],
      language: [undefined]
    });
  }

  ngOnInit(): void {
    this.cityForm.patchValue(this.city);
  }

  onSubmit(): void {
    if (this.cityForm.valid) {
      const formData = this.cityForm.value;
      if (!this.isEditMode || !formData.id) {
        delete formData.id;
      }
      this.citySubmitted.emit(formData);
    }
  }

  get form(): FormGroup {
    return this.cityForm;
  }

  submitForm(): void {
    this.onSubmit();
  }
}