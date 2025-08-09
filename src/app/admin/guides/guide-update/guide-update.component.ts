// src/app/admin/guides/guide-update/guide-update.component.ts - Corrected version
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';
import { ContentLayoutComponent } from '../../../shared/layout/content-layout/content-layout.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { GuideFormComponent, GuideFormData } from '../guide-form/guide-form.component';
import { Guide } from '../guides.interface';
import { GuidesService } from '../guides.service';

@Component({
  selector: 'app-guide-update',
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
      [title]="guide ? 'Editar Guía: ' + guide.name : 'Editar Guía'"
      [description]="'Modifica la información de la guía'"
    >
      @if (loadingGuide) {
        <!-- Loading State -->
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span class="ml-3 text-gray-600">Cargando guía...</span>
        </div>
      } @else if (error) {
        <!-- Error State -->
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Error al cargar la guía
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
              <div class="mt-4">
                <div class="-mx-2 -my-1.5 flex">
                  <app-button
                    variant="outline"
                    size="sm"
                    (click)="loadGuide()"
                  >
                    Reintentar
                  </app-button>
                  <app-button
                    variant="outline"
                    size="sm"
                    (click)="goBack()"
                    class="ml-3"
                  >
                    Volver
                  </app-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else if (guide && guideFormData) {
        <!-- Form Content -->
        <div>
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
          <div class="max-w-4xl">
            <app-guide-form
              [guide]="guideFormData"
              [isEditMode]="true"
              [loading]="loadingUpdate"
              (formSubmit)="handleFormSubmit($event)"
              (formCancel)="onCancel()"
            ></app-guide-form>
          </div>
        </div>
      }
    </app-content-layout>
  `
})
export class GuideUpdateComponent implements OnInit, OnDestroy {
  readonly ArrowLeft = ArrowLeft;

  guide: Guide | null = null;
  guideFormData: GuideFormData | null = null;
  loadingGuide = false;
  loadingUpdate = false;
  error: string | null = null;
  private guideId: number | null = null;
  private readonly subscription = new Subscription();

  constructor(
    private readonly guidesService: GuidesService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.guideId = Number(params['id']);
        this.loadGuide();
      } else {
        this.error = 'ID de guía no válido';
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadGuide(): void {
    if (!this.guideId) return;

    this.loadingGuide = true;
    this.error = null;

    const sub = this.guidesService.getGuideById(this.guideId).subscribe({
      next: (response) => {
        this.guide = response.data;
        this.guideFormData = {
          id: this.guide.id,
          name: this.guide.name,
          description: this.guide.description,
          difficulty: this.guide.difficulty,
          estimatedDuration: this.guide.estimatedDuration,
          status: this.guide.status,
          language: this.guide.language,
          points: this.guide.points
        };
        this.loadingGuide = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar la guía';
        this.loadingGuide = false;
      }
    });

    this.subscription.add(sub);
  }

  // Use a specific handler method to ensure proper typing
  handleFormSubmit(guideData: GuideFormData): void {
    this.onUpdateGuide(guideData);
  }

  onUpdateGuide(guideData: GuideFormData): void {
    if (!this.guideId || !guideData.id) return;

    this.loadingUpdate = true;

    // Transform data to match backend DTO
    const updateDto = {
      name: guideData.name,
      description: guideData.description,
      difficulty: guideData.difficulty,
      estimatedDuration: guideData.estimatedDuration,
      status: guideData.status,
      language: guideData.language,
      totalPoints: guideData.points // Note: backend expects 'totalPoints', not 'points'
    };

    const sub = this.guidesService.updateGuide(guideData.id, updateDto).subscribe({
      next: (response) => {
        toast.success(response.message || 'Guía actualizada exitosamente');
        this.router.navigate(['/admin/guides']);
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al actualizar la guía. Por favor, inténtalo de nuevo.';
        toast.error(errorMessage);
        this.loadingUpdate = false;
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