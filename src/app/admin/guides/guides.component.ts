import { GuideFormComponent, GuideFormData } from '@/app/feature/admin/guides/guide-form/guide-form.component';
import { Languages } from '@/common/common.interface';
import {
  UbDialogCloseDirective,
  UbDialogContentDirective,
  UbDialogDescriptionDirective,
  UbDialogFooterDirective,
  UbDialogHeaderDirective,
  UbDialogTitleDirective
} from '@/components/ui/dialog';
import { DialogService } from '@/components/ui/dialog.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FunnelX, LucideAngularModule, Plus, Search, Trash2 } from 'lucide-angular';
import { toast } from "ngx-sonner";
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ContentLayoutComponent } from '../../shared/layout/content-layout/content-layout.component';
import { TableComponent } from "../../shared/ui/table/table.component";
import { Pagination, TableAction, TableColumn } from '../../shared/ui/table/table.interfaces';
import { Guide, GuideDifficulty, GuideStatus } from './guides.interface';
import { GuideSearchParams, GuidesService } from './guides.service';

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContentLayoutComponent,
    TableComponent,
    LucideAngularModule,
    GuideFormComponent,
    UbDialogContentDirective,
    UbDialogDescriptionDirective,
    UbDialogFooterDirective,
    UbDialogHeaderDirective,
    UbDialogTitleDirective,
    UbDialogCloseDirective
  ],
  templateUrl: './guides.component.html',
  styleUrls: ['./guides.component.css']
})
export class GuidesComponent implements OnInit, OnDestroy {
  @ViewChild('createDialog', { static: true }) createDialogTpl!: TemplateRef<unknown>;
  @ViewChild('editDialog', { static: true }) editDialogTpl!: TemplateRef<unknown>;
  @ViewChild('deleteDialog', { static: true }) deleteDialogTpl!: TemplateRef<unknown>;
  @ViewChild('createGuideForm') createGuideForm!: GuideFormComponent;
  @ViewChild('editGuideForm') editGuideForm!: GuideFormComponent;

  readonly Search = Search;
  readonly FunnelX = FunnelX;

  guides: Guide[] = [];
  loading = false;
  currentGuide: GuideFormData = {
    name: '',
    description: '',
    difficulty: GuideDifficulty.BEGINNER,
    estimatedDuration: 0,
    status: GuideStatus.DRAFT,
    language: Languages.ES,
    points: 0
  };

  searchSubject = new Subject<string>();
  searchTerm = '';
  filterParams: GuideSearchParams = {};

  sortableFields: Record<string, string> = {
    'name': 'Nombre',
    'difficulty': 'Dificultad',
    'estimatedDuration': 'Duración',
    'points': 'Puntos',
    'createdAt': 'Fecha creación',
    'updatedAt': 'Fecha actualización'
  };

  pagination: Pagination = {
    page: 1,
    limit: 10,
    pageCount: 1,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    {
      key: 'description',
      label: 'Descripción',
      class: 'w-2xs!',
      truncate: true,
    },
    {
      key: 'difficulty',
      label: 'Dificultad',
      type: 'badge',
      format: <GuideDifficulty>(value: GuideDifficulty) => {
        switch (value) {
          case GuideDifficulty.BEGINNER: return 'Principiante';
          case GuideDifficulty.INTERMEDIATE: return 'Intermedio';
          case GuideDifficulty.ADVANCED: return 'Avanzado';
          default: return 'N/A';
        }
      }
    },
    {
      key: 'estimatedDuration',
      label: 'Duración (min)',
      type: 'badge',
      class: 'w-32',
      format: (value: unknown) => value ? `${value} min` : 'N/A'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      format: <GuideStatus>(value: GuideStatus) => {
        switch (value) {
          case GuideStatus.DRAFT: return 'Borrador';
          case GuideStatus.PUBLISHED: return 'Publicado';
          case GuideStatus.ARCHIVED: return 'Archivado';
          default: return 'N/A';
        }
      }
    },
    {
      key: 'language',
      label: 'Idioma',
      format: <Languages>(value: Languages) => {
        switch (value) {
          case Languages.ES: return 'Español';
          case Languages.EN: return 'English';
          default: return 'N/A';
        }
      }
    },
    {
      key: 'points',
      label: 'Puntos',
      type: 'badge',
      class: 'w-24',
      format: (value: unknown) => value ? `${value} pts` : 'N/A'
    },
    {
      key: 'createdAt',
      label: 'Creado',
      type: 'date',
      format: (value: unknown) => new Date(value as string).toLocaleDateString()
    },
    {
      key: 'updatedAt',
      label: 'Modificado',
      type: 'date',
      format: (value: unknown) => new Date(value as string).toLocaleDateString()
    }
  ];

  tableActions: TableAction<Guide>[] = [
    {
      label: 'Editar',
      icon: Plus,
      action: (row) => this.openEditDialog(row),
      style: 'text-primary-600 hover:text-primary-900'
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      action: (row) => this.openDeleteDialog(row),
      style: 'text-red-600 hover:text-red-900'
    }
  ];

  contentActions = [
    {
      label: 'Crear guía',
      icon: Plus,
      action: () => this.openCreateDialog(),
      style: 'bg-primary text-primary-foreground hover:bg-primary/90'
    }
  ];

  constructor(
    private guidesService: GuidesService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((searchTerm: string) => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });

    this.loadGuides();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadGuides(): void {
    this.loading = true;

    const params: GuideSearchParams = {
      ...this.filterParams,
      page: this.pagination.page,
      limit: this.pagination.limit
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    this.guidesService.getGuides(params).subscribe({
      next: (response) => {
        this.guides = response.data;
        if (response.meta) {
          this.pagination = {
            page: response.meta.pagination.page || 1,
            limit: response.meta.pagination.limit || 10,
            pageCount: response.meta.pagination.pageCount || 1,
            total: response.meta.pagination.total || 0,
            hasNextPage: response.meta.pagination.hasNextPage || false,
            hasPreviousPage: response.meta.pagination.hasPreviousPage || false
          };
        }
        this.loading = false;
      },
      error: (err) => {
        toast.error('Error al obtener las guías. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSort(column: string): void {
    if (this.filterParams.sortBy === column) {
      this.filterParams.sortDirection =
        this.filterParams.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.filterParams.sortBy = column as GuideSearchParams['sortBy'];
      this.filterParams.sortDirection = 'ASC';
    }

    this.pagination.page = 1;
    this.loadGuides();
  }

  resetFilters(): void {
    this.filterParams = {};
    this.searchTerm = '';
    this.pagination.page = 1;
    this.loadGuides();
    toast.success('Filtros restablecidos');
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadGuides();
  }

  openCreateDialog(): void {
    this.currentGuide = {
      name: '',
      description: '',
      difficulty: GuideDifficulty.BEGINNER,
      estimatedDuration: 0,
      status: GuideStatus.DRAFT,
      language: Languages.ES,
      points: 0
    };
    this.dialogService.open(this.createDialogTpl);
  }

  openEditDialog(guide: Guide): void {
    this.currentGuide = { ...guide };
    this.dialogService.open(this.editDialogTpl);
  }

  openDeleteDialog(guide: Guide): void {
    this.currentGuide = { ...guide };
    this.dialogService.open(this.deleteDialogTpl);
  }

  onCreateGuide(guideData: GuideFormData): void {
    this.loading = true;
    this.guidesService.createGuide(guideData).subscribe({
      next: (response) => {
        this.guides = [response.data, ...this.guides];
        this.pagination.total++;
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Guía creada exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al crear la guía. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onUpdateGuide(guideData: GuideFormData): void {
    if (!guideData.id) return;

    this.loading = true;
    this.guidesService.updateGuide(guideData.id, guideData).subscribe({
      next: (response) => {
        this.guides = this.guides.map(g =>
          g.id === response.data.id ? response.data : g
        );
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Guía actualizada exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al actualizar la guía. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onDeleteGuide(guideData: GuideFormData): void {
    if (!guideData.id) {
      toast.error('No se puede eliminar la guía: ID no válido');
      return;
    }

    this.loading = true;
    this.dialogService.close();

    this.guidesService.deleteGuide(guideData.id).subscribe({
      next: (response) => {
        this.guides = this.guides.filter(g => g.id !== guideData.id);
        this.pagination.total--;
        toast.success(response.message || 'Guía eliminada exitosamente');
        this.loading = false;
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al eliminar la guía. Por favor, inténtalo de nuevo.');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAction(event: { action: string; row: Guide }): void {
    if (event.action === 'Editar') {
      this.openEditDialog(event.row);
    } else if (event.action === 'Eliminar') {
      this.openDeleteDialog(event.row);
    }
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadGuides();
  }

  onPageSizeChange(size: number): void {
    this.pagination.limit = size;
    this.pagination.page = 1;
    this.loadGuides();
  }
}