import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Backdrop -->
    @if (isOpen) {
      <div
        class="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        (click)="close.emit()"
      ></div>
    }

    <!-- Sidebar Container (Clean Light Theme) -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto"
      [ngClass]="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex flex-col h-full overflow-y-auto no-scrollbar">
        <!-- Brand Header with Official TaskFlow Logo & Admin Pill -->
        <div class="p-4 px-5 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <a routerLink="/admin/dashboard" class="block">
              <img
                src="assets/images/taskflow-logo.png"
                alt="TaskFlow - Organize. Achieve. Connect."
                class="h-10 sm:h-11 w-auto object-contain select-none"
              />
            </a>
            <span class="text-[10px] uppercase font-bold tracking-wider text-[#5243E4] bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 shrink-0">
              Admin
            </span>
          </div>

          <button
            type="button"
            (click)="close.emit()"
            class="lg:hidden p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <div class="p-3 space-y-1 mt-2">
          <p class="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Admin Management
          </p>

          <!-- Admin Dashboard -->
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-purple-50 text-[#5243E4] font-bold"
            (click)="close.emit()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke-width="2"></rect>
              </svg>
              <span>Dashboard</span>
            </div>
          </a>

          <!-- User Management -->
          <a
            routerLink="/admin/users"
            routerLinkActive="bg-purple-50 text-[#5243E4] font-bold"
            (click)="close.emit()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <span>User Management</span>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-[#5243E4]">
              {{ adminService.adminStats().totalUsers }}
            </span>
          </a>

          <!-- Task Monitoring -->
          <a
            routerLink="/admin/tasks"
            routerLinkActive="bg-purple-50 text-[#5243E4] font-bold"
            (click)="close.emit()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <span>Task Monitoring</span>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-[#5243E4]">
              {{ adminService.adminStats().totalTasks }}
            </span>
          </a>

          <!-- Analytics & Progress -->
          <a
            routerLink="/admin/analytics"
            routerLinkActive="bg-purple-50 text-[#5243E4] font-bold"
            (click)="close.emit()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span>Analytics</span>
            </div>
          </a>
        </div>

        <!-- Switch to User Workspace Section -->
        <div class="p-3 pt-4 border-t border-gray-100 mt-2">
          <p class="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Workspace Switch
          </p>
          <a
            routerLink="/dashboard"
            (click)="close.emit()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-[#5243E4] bg-purple-50/80 hover:bg-purple-100 transition-colors border border-purple-200/80 mt-1"
          >
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              <span>User Workspace</span>
            </div>
            <span class="text-[10px] text-purple-600 font-bold">&rarr;</span>
          </a>
        </div>

        <!-- Admin Profile Footer & Sign Out -->
        <div class="mt-auto p-4 border-t border-gray-100 space-y-3">
          <div class="flex items-center justify-between px-1 pt-1">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-xl bg-purple-100 text-[#5243E4] font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200">
                AD
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-[#1E1B4B] truncate">{{ authService.currentUser().fullName }}</p>
                <p class="text-[10px] text-gray-400 truncate">{{ authService.currentUser().email }}</p>
              </div>
            </div>

            <button
              type="button"
              (click)="authService.logout('/admin/login')"
              class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Admin Sign Out"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class AdminSidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  authService = inject(AuthService);
  adminService = inject(AdminService);
}
