import { Component, OnInit } from '@angular/core';
import { LucideAngularModule, UserPen, UserRoundX } from 'lucide-angular';
import { ContentLayoutComponent } from '../../shared/layout/content-layout/content-layout.component';
import { TableComponent } from "../../shared/ui/table/table.component";
import { TableAction, TableColumn } from '../../shared/ui/table/table.interfaces';
import { User } from './users.interface';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users',
  imports: [ContentLayoutComponent, TableComponent, LucideAngularModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;
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
      action: (user: User) => this.editUser(user),
      style: 'text-primary-600 hover:text-primary-900'
    },
    {
      label: 'Delete',
      icon: UserRoundX,
      action: (user: User) => this.deleteUser(user),
      style: 'text-red-600 hover:text-red-900'
    }
  ];

  constructor(private usersService: UsersService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.usersService.getUsers(this.pagination.page, this.pagination.pageSize)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.users = response.data;
          this.pagination = response.meta?.pagination || this.pagination;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load users. Please try again.';
          this.loading = false;
          console.error(err);
        }
      });
  }

  searchUsers(query: string): void {
    this.usersService.searchUsers(query)
      .subscribe({
        next: (response) => {
          this.users = response.data;
          this.pagination = response.meta?.pagination || this.pagination;
        },
        error: (err) => {
          this.error = 'Search failed. Please try again.';
          console.error(err);
        }
      });
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

  onRowSelected(selectedRows: User[]): void {
    console.log('Selected rows:', selectedRows);
  }

  editUser(user: User): void {
    console.log('Editing user:', user);
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.pagination.total--;
        },
        error: (err) => {
          this.error = 'Failed to delete user. Please try again.';
          console.error(err);
        }
      });
    }
  }

  onAction(event: { action: string, row: User }): void {
    if (event.action === 'Edit') {
      this.editUser(event.row);
    } else if (event.action === 'Delete') {
      this.deleteUser(event.row);
    }
  }
}
