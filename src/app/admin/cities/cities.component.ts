import { CityFormComponent, CityFormData } from '@/app/feature/admin/cities/city-form.component';
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
import { FunnelX, LucideAngularModule, MapPin, Plus, Search, Trash2 } from 'lucide-angular';
import { toast } from "ngx-sonner";
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ContentLayoutComponent } from '../../shared/layout/content-layout/content-layout.component';
import { TableComponent } from "../../shared/ui/table/table.component";
import { Pagination, TableAction, TableColumn } from '../../shared/ui/table/table.interfaces';
import { City, Languages } from './cities.interface';
import { CitiesService, CitySearchParams } from './cities.service';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContentLayoutComponent,
    TableComponent,
    LucideAngularModule,
    CityFormComponent,
    UbDialogContentDirective,
    UbDialogDescriptionDirective,
    UbDialogFooterDirective,
    UbDialogHeaderDirective,
    UbDialogTitleDirective,
    UbDialogCloseDirective
  ],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.css']
})
export class CitiesComponent implements OnInit, OnDestroy {
  @ViewChild('createDialog', { static: true }) createDialogTpl!: TemplateRef<unknown>;
  @ViewChild('editDialog', { static: true }) editDialogTpl!: TemplateRef<unknown>;
  @ViewChild('deleteDialog', { static: true }) deleteDialogTpl!: TemplateRef<unknown>;

  readonly Search = Search;
  readonly FunnelX = FunnelX;
  readonly MapPin = MapPin;

  cities: City[] = [];
  loading = false;
  currentCity: CityFormData = { name: '' };

  searchSubject = new Subject<string>();
  searchTerm = '';
  filterParams: CitySearchParams = {};

  sortableFields: Record<string, string> = {
    'name': 'Nombre',
    'rainfall': 'Pluviosidad',
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
      key: 'rainfall',
      label: 'Pluviosidad (mm)',
      type: 'badge',
      format: (value: unknown) => value ? `${value} mm` : 'N/A'
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

  tableActions: TableAction<City>[] = [
    {
      label: 'Editar',
      icon: MapPin,
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
      label: 'Crear ciudad',
      icon: Plus,
      action: () => this.openCreateDialog(),
      style: 'bg-primary text-primary-foreground hover:bg-primary/90'
    }
  ];

  constructor(
    private citiesService: CitiesService,
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

    this.loadCities();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadCities(): void {
    this.loading = true;

    const params: CitySearchParams = {
      ...this.filterParams,
      page: this.pagination.page,
      limit: this.pagination.limit
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    this.citiesService.getCities(params).subscribe({
      next: (response) => {
        this.cities = response.data;
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
        toast.error('Error al obtener las ciudades. Por favor, inténtalo de nuevo.');
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
      this.filterParams.sortBy = column as CitySearchParams['sortBy'];
      this.filterParams.sortDirection = 'ASC';
    }

    this.pagination.page = 1;
    this.loadCities();
  }

  resetFilters(): void {
    this.filterParams = {};
    this.searchTerm = '';
    this.pagination.page = 1;
    this.loadCities();
    toast.success('Filtros restablecidos');
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadCities();
  }

  openCreateDialog(): void {
    this.currentCity = { name: '' };
    this.dialogService.open(this.createDialogTpl);
  }

  openEditDialog(city: City): void {
    this.currentCity = { ...city };
    this.dialogService.open(this.editDialogTpl);
  }

  openDeleteDialog(city: City): void {
    this.currentCity = { ...city };
    this.dialogService.open(this.deleteDialogTpl);
  }

  onCreateCity(cityData: CityFormData): void {
    this.loading = true;
    this.citiesService.createCity(cityData).subscribe({
      next: (response) => {
        this.cities = [response.data, ...this.cities];
        this.pagination.total++;
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Ciudad creada exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al crear la ciudad. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onUpdateCity(cityData: CityFormData): void {
    if (!cityData.id) return;

    this.loading = true;
    this.citiesService.updateCity(cityData.id, cityData).subscribe({
      next: (response) => {
        this.cities = this.cities.map(c =>
          c.id === response.data.id ? response.data : c
        );
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Ciudad actualizada exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al actualizar la ciudad. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onDeleteCity(cityData: CityFormData): void {
    if (!cityData.id) {
      toast.error('No se puede eliminar la ciudad: ID no válido');
      return;
    }

    this.loading = true;
    this.dialogService.close();

    this.citiesService.deleteCity(cityData.id).subscribe({
      next: (response) => {
        this.cities = this.cities.filter(c => c.id !== cityData.id);
        this.pagination.total--;
        toast.success(response.message || 'Ciudad eliminada exitosamente');
        this.loading = false;
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al eliminar la ciudad. Por favor, inténtalo de nuevo.');
        console.error(err);
        this.loading = false;
      }
    });
  }

  onAction(event: { action: string; row: City }): void {
    if (event.action === 'Editar') {
      this.openEditDialog(event.row);
    } else if (event.action === 'Eliminar') {
      this.openDeleteDialog(event.row);
    }
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadCities();
  }

  onPageSizeChange(size: number): void {
    this.pagination.limit = size;
    this.pagination.page = 1;
    this.loadCities();
  }
}