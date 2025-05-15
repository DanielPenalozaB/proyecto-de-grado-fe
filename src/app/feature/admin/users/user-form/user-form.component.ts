import { UbDialogCloseDirective } from '@/components/ui/dialog';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface UserFormData {
  id?: number | null;
  name: string;
  email: string;
  role?: string;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UbDialogCloseDirective
  ],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="grid gap-2">
        <label for="name" class="text-sm font-medium">Nombre</label>
        <input
          type="text"
          id="name"
          formControlName="name"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="text-red-500 text-xs">
          Se requiere un nombre
        </div>
      </div>
      <div class="grid gap-2">
        <label for="email" class="text-sm font-medium">Email</label>
        <input
          type="email"
          id="email"
          formControlName="email"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="text-red-500 text-xs">
          Se requiere un email v&aacute;lido
        </div>
      </div>
      <div class="grid gap-2">
        <label for="role" class="text-sm font-medium">Rol</label>
        <select
          id="role"
          formControlName="role"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Selecciona un rol</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderador</option>
          <option value="citizen">Ciudadano</option>
        </select>
      </div>
      <div class="flex justify-end gap-2 pt-4">
        <button
          type="button"
          ubDialogClose
          class="px-3 py-1 h-8 border rounded-md text-sm font-medium bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          ubDialogClose
          type="submit"
          [disabled]="userForm.invalid"
          class="px-3 py-1 h-8 border rounded-md text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-900"
        >
          {{ isEditMode ? 'Actualizar' : 'Crear' }}
        </button>
      </div>
    </form>
  `
})
export class UserFormComponent implements OnInit {
  @Input() user: UserFormData = { name: '', email: '' };
  @Input() isEditMode = false;
  @Output() userSubmitted = new EventEmitter<UserFormData>();
  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['']
    });
  }

  ngOnInit(): void {
    this.userForm.patchValue(this.user);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      // For create operations, remove the id completely
      if (!this.isEditMode || !formData.id) {
        delete formData.id;
      }

      this.userSubmitted.emit(formData);
    }
  }
}