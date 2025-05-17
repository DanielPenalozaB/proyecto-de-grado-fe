import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { CitiesComponent } from './admin/cities/cities.component';
import { GuidesComponent } from './admin/guides/guides.component';
import { ModulesComponent } from './admin/modules/modules.component';
import { QuestionsComponent } from './admin/questions/questions.component';
import { UsersComponent } from './admin/users/users.component';

export const routes: Routes = [
  { path: 'admin', component: AdminComponent },
  { path: 'admin/users', component: UsersComponent },
  { path: 'admin/cities', component: CitiesComponent },
  { path: 'admin/guides', component: GuidesComponent },
  { path: 'admin/modules', component: ModulesComponent },
  { path: 'admin/questions', component: QuestionsComponent },
];
