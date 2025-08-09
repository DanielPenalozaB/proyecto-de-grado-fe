import { Routes } from '@angular/router';
import { CitiesComponent } from './admin/cities/cities.component';
import { GuideCreateComponent } from './admin/guides/guide-create/guide-create.component';
import { GuideUpdateComponent } from './admin/guides/guide-update/guide-update.component';
import { GuidesComponent } from './admin/guides/guides.component';
import { ModulesComponent } from './admin/modules/modules.component';
import { QuestionsComponent } from './admin/questions/questions.component';
import { UsersComponent } from './admin/users/users.component';
import { authGuard } from './auth/auth.guard';
import { ConfirmEmailComponent } from './auth/confirm-email/confirm-email.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { unauthGuard } from './auth/unauth.guard';
import { CalculatorComponent } from './citizen/calculator/calculator.component';
import { DashboardComponent } from './citizen/dashboard/dashboard.component';
import { GuideViewComponent } from './citizen/guide-view/guide-view.component';
import { MapComponent } from './citizen/map/map.component';
import { NotificationsComponent } from './citizen/notifications/notifications.component';
import { ProfileComponent } from './citizen/profile/profile.component';
import { AdminLayoutComponent } from './shared/layout/admin-layout/admin-layout.component';
import { CitizenLayoutComponent } from './shared/layout/citizen-layout/citizen-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [ unauthGuard ],
    children: [
      { path: 'sign-in', title: 'Iniciar sesión', component: SignInComponent },
      { path: 'sign-up', title: 'Registrarse', component: SignUpComponent },
      { path: 'confirm-email/:token', title: 'Confirmar correo', component: ConfirmEmailComponent },
    ]
  }, {
    path: '',
    component: CitizenLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', title: 'RecoAgua', component: DashboardComponent },
      { path: 'calculator', title: 'Calculadora', component: CalculatorComponent },
      { path: 'map', title: 'Mapa', component: MapComponent },
      { path: 'profile', title: 'Perfil', component: ProfileComponent },
      { path: 'guide/:id', title: 'Guía', component: GuideViewComponent },
      { path: 'notifications', title: 'Notificaciones', component: NotificationsComponent },
    ]
  }, {
    path: 'admin',
    title: 'Dashboard',
    component: AdminLayoutComponent,
    canActivate: [ authGuard ],
    data: { roles: ['admin'] },
    children: [
      { path: 'users', title: 'Usuarios', component: UsersComponent },
      { path: 'cities', title: 'Ciudades', component: CitiesComponent },
      { path: 'guides', title: 'Guías', component: GuidesComponent },
      { path: 'guides/create', component: GuideCreateComponent, title: 'Crear Nueva Guía' },
      { path: 'guides/edit/:id', component: GuideUpdateComponent, title: 'Editar Guía' },
      { path: 'modules', title: 'Módulos', component: ModulesComponent },
      { path: 'questions', title: 'Preguntas', component: QuestionsComponent },
    ]
  },
  { path: '**', redirectTo: '/' }
];
