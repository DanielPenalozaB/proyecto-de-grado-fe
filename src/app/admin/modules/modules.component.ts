import { ModuleFormComponent, ModuleFormData } from '@/app/feature/admin/modules/module-form/module-form.component';
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
import { Module, ModuleStatus } from './modules.interface';
import { ModuleSearchParams, ModulesService } from './modules.service';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContentLayoutComponent,
    TableComponent,
    LucideAngularModule,
    ModuleFormComponent,
    UbDialogContentDirective,
    UbDialogDescriptionDirective,
    UbDialogFooterDirective,
    UbDialogHeaderDirective,
    UbDialogTitleDirective,
    UbDialogCloseDirective
  ],
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit, OnDestroy {
  @ViewChild('createDialog', { static: true }) createDialogTpl!: TemplateRef<unknown>;
  @ViewChild('editDialog', { static: true }) editDialogTpl!: TemplateRef<unknown>;
  @ViewChild('deleteDialog', { static: true }) deleteDialogTpl!: TemplateRef<unknown>;
  @ViewChild('createModuleForm') createModuleForm!: ModuleFormComponent;
  @ViewChild('editModuleForm') editModuleForm!: ModuleFormComponent;

  readonly Search = Search;
  readonly FunnelX = FunnelX;

  modules: Module[] = [];
  loading = false;
  currentModule: ModuleFormData = {
    id: undefined,
    name: '',
    description: '',
    order: 1,
    points: 0,
    status: ModuleStatus.DRAFT,
    guideId: 0
  };

  searchSubject = new Subject<string>();
  searchTerm = '';
  filterParams: ModuleSearchParams = {};

  sortableFields: Record<string, string> = {
    'name': 'Nombre',
    'order': 'Orden',
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
      key: 'order',
      label: 'Orden',
      type: 'badge',
      format: (value: unknown) => value ? `#${value}` : 'N/A'
    },
    {
      key: 'points',
      label: 'Puntos',
      type: 'badge',
      format: (value: unknown) => value ? `${value} pts` : 'N/A'
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'badge',
      format: <ModuleStatus>(value: ModuleStatus) => {
        switch (value) {
          case ModuleStatus.DRAFT: return 'Borrador';
          case ModuleStatus.PUBLISHED: return 'Publicado';
          case ModuleStatus.ARCHIVED: return 'Archivado';
          default: return 'N/A';
        }
      }
    },
    {
      key: 'guideId',
      label: 'ID Guía',
      format: (value: unknown) => {
        if (!value) return 'N/A';
        const guideId = value as number;
        return `<a href="/admin/guides/${guideId}" class="text-teal-500 hover:text-teal-600 hover:underline">#${guideId}</a>`;
      }
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

  tableActions: TableAction<Module>[] = [
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
      label: 'Crear módulo',
      icon: Plus,
      action: () => this.openCreateDialog(),
      style: 'bg-primary text-primary-foreground hover:bg-primary/90'
    }
  ];

  constructor(
    private modulesService: ModulesService,
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

    this.loadModules();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadModules(): void {
    this.loading = true;

    const params: ModuleSearchParams = {
      ...this.filterParams,
      page: this.pagination.page,
      limit: this.pagination.limit
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    this.modulesService.getModules(params).subscribe({
      next: (response) => {
        this.modules = response.data;
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
        toast.error('Error al obtener los módulos. Por favor, inténtalo de nuevo.');
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
      this.filterParams.sortBy = column as ModuleSearchParams['sortBy'];
      this.filterParams.sortDirection = 'ASC';
    }

    this.pagination.page = 1;
    this.loadModules();
  }

  resetFilters(): void {
    this.filterParams = {};
    this.searchTerm = '';
    this.pagination.page = 1;
    this.loadModules();
    toast.success('Filtros restablecidos');
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadModules();
  }

  openCreateDialog(): void {
    this.currentModule = {
      id: undefined,
      name: '',
      description: '',
      order: 1,
      points: 0,
      status: ModuleStatus.DRAFT,
      guideId: 0
    };
    this.dialogService.open(this.createDialogTpl);
  }

  openEditDialog(module: Module): void {
    this.currentModule = { ...module };
    this.dialogService.open(this.editDialogTpl);
  }

  openDeleteDialog(module: Module): void {
    this.currentModule = { ...module };
    this.dialogService.open(this.deleteDialogTpl);
  }

  onCreateModule(moduleData: ModuleFormData): void {
    this.loading = true;
    this.modulesService.createModule(moduleData).subscribe({
      next: (response) => {
        this.modules = [response.data, ...this.modules];
        this.pagination.total++;
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Módulo creado exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al crear el módulo. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onUpdateModule(moduleData: ModuleFormData): void {
    if (!moduleData.id) return;

    this.loading = true;
    this.modulesService.updateModule(moduleData.id, moduleData).subscribe({
      next: (response) => {
        this.modules = this.modules.map(m =>
          m.id === response.data.id ? response.data : m
        );
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Módulo actualizado exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al actualizar el módulo. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onDeleteModule(moduleData: ModuleFormData): void {
    if (!moduleData.id) {
      toast.error('No se puede eliminar el módulo: ID no válido');
      return;
    }

    this.loading = true;
    this.dialogService.close();

    this.modulesService.deleteModule(moduleData.id).subscribe({
      next: (response) => {
        this.modules = this.modules.filter(m => m.id !== moduleData.id);
        this.pagination.total--;
        toast.success(response.message || 'Módulo eliminado exitosamente');
        this.loading = false;
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al eliminar el módulo. Por favor, inténtalo de nuevo.');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAction(event: { action: string; row: Module }): void {
    if (event.action === 'Editar') {
      this.openEditDialog(event.row);
    } else if (event.action === 'Eliminar') {
      this.openDeleteDialog(event.row);
    }
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadModules();
  }

  onPageSizeChange(size: number): void {
    this.pagination.limit = size;
    this.pagination.page = 1;
    this.loadModules();
  }
}