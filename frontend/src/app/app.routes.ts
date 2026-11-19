import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { TaskListComponent } from './components/pages/task-list/task-list.component';
import { CategoriesComponent } from './components/pages/categories/categories.component';
import { SettingsComponent } from './components/pages/settings/settings.component';
import { LoginComponent } from './components/pages/login/login.component';
import { AdminLoginComponent } from './components/pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/pages/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/pages/admin-users/admin-users.component';
import { AdminTasksComponent } from './components/pages/admin-tasks/admin-tasks.component';
import { AdminProgressComponent } from './components/pages/admin-progress/admin-progress.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin/login', component: AdminLoginComponent },

  // User Portal Routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'tasks', component: TaskListComponent, canActivate: [authGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },

  // Admin Portal Routes
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/overview', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'admin/tasks', component: AdminTasksComponent, canActivate: [adminGuard] },
  { path: 'admin/analytics', component: AdminProgressComponent, canActivate: [adminGuard] },
  { path: 'admin/progress', redirectTo: 'admin/analytics', pathMatch: 'full' },

  { path: '**', redirectTo: 'dashboard' },
];
