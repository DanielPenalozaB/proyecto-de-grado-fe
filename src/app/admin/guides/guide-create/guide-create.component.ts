// src/app/admin/guides/guide-create/guide-create.component.ts - Fixed version
import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';
import { ContentLayoutComponent } from '../../../shared/layout/content-layout/content-layout.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { GuideFormComponent, GuideFormData } from '../guide-form/guide-form.component';
import { GuidesService } from '../guides.service';

@Component({
  selector: 'app-guide-create',
  standalone: true,
  imports: [
    CommonModule,
    ContentLayoutComponent,
    GuideFormComponent,
    ButtonComponent,
    LucideAngularModule
  ],
  template: `
    <app-content-layout
      [title]="'Crear Nueva Guía'"
      [description]="'Añade una nueva guía al sistema con toda la información necesaria'"
    >
      <!-- Back Button -->
      <div class="mb-6">
        <app-button
          variant="outline"
          (click)="goBack()"
          class="inline-flex items-center"
        >
          <lucide-icon [img]="ArrowLeft" class="w-4 h-4 mr-2"></lucide-icon>
          Volver a Guías
        </app-button>
      </div>

      <!-- Form Container -->
      <div class="max-w-4xl p-2">
        <app-guide-form
          [isEditMode]="false"
          [loading]="loading"
          (formSubmit)="onCreateGuide($event)"
          (formCancel)="onCancel()"
        ></app-guide-form>
      </div>
    </app-content-layout>
  `
})
export class GuideCreateComponent implements OnDestroy {
  readonly ArrowLeft = ArrowLeft;
  loading = false;
  private readonly subscription = new Subscription();

  constructor(
    private readonly guidesService: GuidesService,
    private readonly router: Router
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onCreateGuide(guideData: GuideFormData): void {
    this.loading = true;

    // Transform data to match backend DTO
    const createDto = {
      name: guideData.name,
      description: guideData.description,
      difficulty: guideData.difficulty,
      estimatedDuration: guideData.estimatedDuration,
      status: guideData.status,
      language: guideData.language,
      totalPoints: guideData.points // Note: backend expects 'totalPoints', not 'points'
    };

    const sub = this.guidesService.createGuide(createDto).subscribe({
      next: (response) => {
        toast.success(response.message || 'Guía creada exitosamente');
        this.router.navigate(['/admin/guides']);
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al crear la guía. Por favor, inténtalo de nuevo.';
        toast.error(errorMessage);
        this.loading = false;
      }
    });

    this.subscription.add(sub);
  }

  onCancel(): void {
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/admin/guides']);
  }
}