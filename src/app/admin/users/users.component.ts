import { UserFormComponent, UserFormData } from '@/app/feature/admin/users/user-form/user-form.component';
import { ButtonComponent } from '@/app/shared/ui/button/button.component';
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
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LucideAngularModule, UserPen, UserRoundPlus, UserRoundX } from 'lucide-angular';
import { toast } from "ngx-sonner";
import { ContentLayoutComponent } from '../../shared/layout/content-layout/content-layout.component';
import { TableComponent } from "../../shared/ui/table/table.component";
import { TableAction, TableColumn } from '../../shared/ui/table/table.interfaces';
import { User } from './users.interface';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ContentLayoutComponent,
    TableComponent,
    LucideAngularModule,
    UserFormComponent,
    UbDialogContentDirective,
    UbDialogDescriptionDirective,
    UbDialogFooterDirective,
    UbDialogHeaderDirective,
    UbDialogTitleDirective,
    UbDialogCloseDirective,
    ButtonComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  @ViewChild('createDialog', { static: true }) createDialogTpl!: TemplateRef<unknown>;
  @ViewChild('editDialog', { static: true }) editDialogTpl!: TemplateRef<unknown>;
  @ViewChild('deleteDialog', { static: true }) deleteDialogTpl!: TemplateRef<unknown>;

  users: User[] = [];
  loading = false;
  currentUser: UserFormData = { name: '', email: '' };

  pagination = {
    page: 1,
    pageSize: 10,
    pageCount: 1,
    total: 0
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      type: 'badge'
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      format: (value: unknown) => new Date(value as string).toLocaleDateString()
    }
  ];

  tableActions: TableAction<User>[] = [
    {
      label: 'Edit',
      icon: UserPen,
      action: (row) => this.openEditDialog(row),
      style: 'text-primary-600 hover:text-primary-900'
    },
    {
      label: 'Delete',
      icon: UserRoundX,
      action: (row) => this.openDeleteDialog(row),
      style: 'text-red-600 hover:text-red-900'
    }
  ];

  contentActions = [
    {
      label: 'Create User',
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
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    this.usersService.getUsers(this.pagination.page, this.pagination.pageSize)
      .subscribe({
        next: (response) => {
          this.users = response.data;
          this.pagination = response.meta?.pagination || this.pagination;
          this.loading = false;
        },

        error: (err) => {
          toast.error('Error al obtener los usuarios. Por favor, inténtalo de nuevo.');
          this.loading = false;
          console.error(err);
        }
      });
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
    this.usersService.createUser(userData).subscribe({
      next: (newUser) => {
        this.users = [newUser, ...this.users];
        this.pagination.total++;
        this.dialogService.close();
        this.loading = false;
        toast.success('Usuario creado exitosamente');
      },
      error: (err) => {
        toast.error('Error al crear el usuario. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onUpdateUser(userData: UserFormData): void {
    if (!userData.id) return;

    this.loading = true;
    this.usersService.updateUser(userData.id, userData).subscribe({
      next: (updatedUser) => {
        this.users = this.users.map(u =>
          u.id === updatedUser.id ? updatedUser : u
        );
        this.dialogService.close();
        this.loading = false;
        toast.success('Usuario actualizado exitosamente');
      },
      error: (err) => {
        toast.error('Error al actualizar el usuario. Por favor, inténtalo de nuevo.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  onDeleteUser(userData: UserFormData): void {
    if (!userData.id) return;

    this.usersService.deleteUser(userData.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userData.id);
        this.pagination.total--;
        toast.success('Usuario eliminado exitosamente');
      },
      error: (err) => {
        toast.error('Error al eliminar el usuario. Por favor, inténtalo de nuevo.');
        console.error(err);
      }
    });
  }

  closeDialog(): void {
    this.dialogService.close();
  }

  onAction(event: { action: string; row: User }): void {
    if (event.action === 'Edit') {
      this.openEditDialog(event.row);
    } else if (event.action === 'Delete') {
      this.openDeleteDialog(event.row);
    }
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pagination.pageSize = size;
    this.pagination.page = 1;
    this.loadUsers();
  }
}