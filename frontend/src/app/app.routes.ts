import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { TaskListComponent } from './components/pages/task-list/task-list.component';
import { CategoriesComponent } from './components/pages/categories/categories.component';
import { SettingsComponent } from './components/pages/settings/settings.component';
import { LoginComponent } from './components/pages/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'tasks', component: TaskListComponent, canActivate: [authGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
