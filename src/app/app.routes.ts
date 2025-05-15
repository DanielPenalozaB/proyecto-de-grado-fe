import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { UsersComponent } from './admin/users/users.component';

export const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: 'admin/users', component: UsersComponent },
  { path: 'admin/cities', component: UsersComponent },
  { path: 'admin/guides', component: UsersComponent },
  { path: 'admin/modules', component: UsersComponent },
];
