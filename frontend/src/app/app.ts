import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { AdminSidebarComponent } from './components/layout/admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from './components/layout/admin-header/admin-header.component';
import { TaskFormModalComponent } from './components/tasks/task-form-modal/task-form-modal.component';
import { ToastComponent } from './components/layout/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    AdminSidebarComponent,
    AdminHeaderComponent,
    TaskFormModalComponent,
    ToastComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  authService = inject(AuthService);
  router = inject(Router);

  isSidebarOpen = false;
  isAdminSidebarOpen = false;

  get isAuthPage(): boolean {
    return this.router.url.includes('/login');
  }

  get isAdminPage(): boolean {
    return this.router.url.startsWith('/admin') && !this.router.url.includes('/login');
  }
}
