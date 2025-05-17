import { UserFormComponent, UserFormData } from '@/app/feature/admin/users/user-form/user-form.component';
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
import { FunnelX, LucideAngularModule, Search, UserPen, UserRoundPlus, UserRoundX } from 'lucide-angular';
import { toast } from "ngx-sonner";
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ContentLayoutComponent } from '../../shared/layout/content-layout/content-layout.component';
import { TableComponent } from "../../shared/ui/table/table.component";
import { Pagination, TableAction, TableColumn } from '../../shared/ui/table/table.interfaces';
import { User } from './users.interface';
import { UserSearchParams, UsersService } from './users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContentLayoutComponent,
    TableComponent,
    LucideAngularModule,
    UserFormComponent,
    UbDialogContentDirective,
    UbDialogDescriptionDirective,
    UbDialogFooterDirective,
    UbDialogHeaderDirective,
    UbDialogTitleDirective,
    UbDialogCloseDirective
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  @ViewChild('createDialog', { static: true }) createDialogTpl!: TemplateRef<unknown>;
  @ViewChild('editDialog', { static: true }) editDialogTpl!: TemplateRef<unknown>;
  @ViewChild('deleteDialog', { static: true }) deleteDialogTpl!: TemplateRef<unknown>;
  @ViewChild('createUserForm') createUserForm!: UserFormComponent;
  @ViewChild('editUserForm') editUserForm!: UserFormComponent;

  readonly Search = Search;
  readonly FunnelX = FunnelX;

  users: User[] = [];
  loading = false;
  currentUser: UserFormData = { name: '', email: '' };

  searchSubject = new Subject<string>();

  // Search and filter parameters
  searchTerm = '';
  filterParams: UserSearchParams = {
    role: ''
  };

  // Define roles for the dropdown
  roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'admin', label: 'Administrador' },
    { value: 'moderator', label: 'Moderador' },
    { value: 'citizen', label: 'Ciudadano' }
  ];

  // Sortable fields
  sortableFields: Record<string, string> = {
    'name': 'Nombre',
    'email': 'Email',
    'role': 'Rol',
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
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Rol',
      type: 'badge',
      format: (value: unknown) => {
        const role = value as string;
        switch (role) {
          case 'admin': return 'Administrador';
          case 'moderator': return 'Moderador';
          case 'citizen': return 'Ciudadano';
          default: return role;
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

  tableActions: TableAction<User>[] = [
    {
      label: 'Editar',
      icon: UserPen,
      action: (row) => this.openEditDialog(row),
      style: 'text-primary-600 hover:text-primary-900'
    },
    {
      label: 'Eliminar',
      icon: UserRoundX,
      action: (row) => this.openDeleteDialog(row),
      style: 'text-red-600 hover:text-red-900'
    }
  ];

  contentActions = [
    {
      label: 'Crear usuario',
      icon: UserRoundPlus,
      action: () => this.openCreateDialog(),
      style: 'bg-primary text-primary-foreground hover:bg-primary/90'
    }
  ];

  constructor(
    private usersService: UsersService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(400), // 400ms debounce time
      distinctUntilChanged() // Only emit if value changed
    ).subscribe((searchTerm: string) => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });

    this.loadUsers();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.searchSubject.complete();
  }

  /**
   * Load users with current pagination, sorting and filtering parameters
   */
  loadUsers(): void {
    this.loading = true;

    const params: UserSearchParams = {
      ...this.filterParams,
      page: this.pagination.page,
      limit: this.pagination.limit
    };

    // Add search term if it exists
    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    this.usersService.getUsers(params).subscribe({
      next: (response) => {
        this.users = response.data;
        // Update pagination
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
        toast.error('Error al obtener los usuarios. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  /**
   * Handle column sorting
   */
  onSort(column: string): void {
    // If already sorting by this column, toggle direction
    if (this.filterParams.sortBy === column) {
      this.filterParams.sortDirection =
        this.filterParams.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      // New sort column
      this.filterParams.sortBy = column as UserSearchParams['sortBy'];
      this.filterParams.sortDirection = 'ASC';
    }

    // Reset to first page when sorting changes
    this.pagination.page = 1;
    this.loadUsers();
  }

  /**
   * Reset all filters and reload
   */
  resetFilters(): void {
    this.filterParams = { role: '' };
    this.searchTerm = '';
    this.pagination.page = 1;
    this.loadUsers();
    toast.success('Filtros restablecidos');
  }

  /**
   * Apply search and filters
   */
  applyFilters(): void {
    this.pagination.page = 1;
    this.loadUsers();
  }

  /**
   * Get role display name from role value
   */
  getRoleName(roleValue: string): string {
    if (!roleValue) return 'Todos los roles';
    const role = this.roleOptions.find(r => r.value.toLowerCase() === roleValue.toLowerCase());
    return role ? role.label : roleValue;
  }

  openCreateDialog(): void {
    this.currentUser = { name: '', email: '', role: '' };
    this.dialogService.open(this.createDialogTpl);
  }

  openEditDialog(user: User): void {
    this.currentUser = { ...user };
    this.dialogService.open(this.editDialogTpl);
  }

  openDeleteDialog(user: User): void {
    this.currentUser = { ...user };
    this.dialogService.open(this.deleteDialogTpl);
  }

  onCreateUser(userData: UserFormData): void {
    this.loading = true;
    const createData = { ...userData };
    delete createData.id;

    this.usersService.createUser(createData).subscribe({
      next: (response) => {
        // Insert the new user at the top of the list
        this.users = [response.data, ...this.users];
        this.pagination.total++;
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Usuario creado exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al crear el usuario. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onUpdateUser(userData: UserFormData): void {
    if (!userData.id) return;

    this.loading = true;
    this.usersService.updateUser(userData.id, userData).subscribe({
      next: (response) => {
        // Update the user in the list
        this.users = this.users.map(u =>
          u.id === response.data.id ? response.data : u
        );
        this.dialogService.close();
        this.loading = false;
        toast.success(response.message || 'Usuario actualizado exitosamente');
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al actualizar el usuario. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onDeleteUser(userData: UserFormData): void {
    if (!userData.id) {
      toast.error('No se puede eliminar el usuario: ID no válido');
      return;
    }

    this.loading = true;
    this.dialogService.close(); // Close the dialog immediately

    this.usersService.deleteUser(userData.id).subscribe({
      next: (response) => {
        this.users = this.users.filter(u => u.id !== userData.id);
        this.pagination.total--;
        toast.success(response.message || 'Usuario eliminado exitosamente');
        this.loading = false;
      },
      error: (err) => {
        toast.error(err.error?.message || 'Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
        console.error(err);
        this.loading = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogService.close();
  }

  onAction(event: { action: string; row: User }): void {
    if (event.action === 'Editar') {
      this.openEditDialog(event.row);
    } else if (event.action === 'Eliminar') {
      this.openDeleteDialog(event.row);
    }
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pagination.limit = size;
    this.pagination.page = 1;
    this.loadUsers();
  }
}