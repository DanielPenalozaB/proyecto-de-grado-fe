import { Routes } from '@angular/router';
import { CitiesComponent } from './admin/cities/cities.component';
import { GuidesComponent } from './admin/guides/guides.component';
import { ModulesComponent } from './admin/modules/modules.component';
import { QuestionsComponent } from './admin/questions/questions.component';
import { UsersComponent } from './admin/users/users.component';
import { authGuard } from './auth/auth.guard';
import { ConfirmEmailComponent } from './auth/confirm-email/confirm-email.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { unauthGuard } from './auth/unauth.guard';
import { CalculatorComponent } from './calculator/calculator.component';
import { DashboardComponent } from './citizen/dashboard/dashboard.component';
import { MapComponent } from './map/map.component';
import { AdminLayoutComponent } from './shared/layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [ unauthGuard ],
    children: [
      { path: 'sign-in', component: SignInComponent },
      { path: 'sign-up', component: SignUpComponent },
      { path: 'confirm-email/:token', component: ConfirmEmailComponent },
    ]
  },
  { path: '', component: DashboardComponent, canActivate: [ authGuard ] },
  { path: 'calculator', component: CalculatorComponent, canActivate: [ authGuard ] },
  { path: 'map', component: MapComponent, canActivate: [ authGuard ] },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [ authGuard ],
    data: { roles: ['admin'] },
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'cities', component: CitiesComponent },
      { path: 'guides', component: GuidesComponent },
      { path: 'modules', component: ModulesComponent },
      { path: 'questions', component: QuestionsComponent },
    ]
  },
  { path: '**', redirectTo: '/' }
];
