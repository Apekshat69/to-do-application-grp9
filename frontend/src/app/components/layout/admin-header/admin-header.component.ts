import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white border-b border-gray-200/90 px-4 sm:px-8 py-3.5 sticky top-0 z-20">
      <div class="flex items-center justify-between gap-4">
        <!-- Left: Hamburger & Admin Page Title -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="openSidebar.emit()"
            class="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-lg sm:text-xl font-extrabold text-[#1E1B4B] tracking-tight leading-tight">
                {{ pageTitle }}
              </h1>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                Admin
              </span>
            </div>
            <p class="text-xs text-gray-400 hidden sm:block">
              {{ pageSubtitle }}
            </p>
          </div>
        </div>

        <!-- Right: Status, User Dashboard Shortcut & Admin Menu -->
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Switch to User Dashboard Button -->
          <a
            routerLink="/dashboard"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-[#5243E4] border border-gray-200 hover:border-purple-200 rounded-xl text-xs font-semibold transition-all"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            <span>User View</span>
          </a>

          <!-- Admin Profile Badge with Sign Out -->
          <div class="relative pl-2 border-l border-gray-200">
            <button
              type="button"
              (click)="isMenuOpen = !isMenuOpen"
              class="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none"
            >
              <div class="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                AD
              </div>
              <div class="hidden xl:block text-left">
                <span class="text-xs font-bold text-gray-800 block leading-tight">Administrator</span>
                <span class="text-[10px] text-gray-400 leading-tight block">admin&#64;taskflow.dev</span>
              </div>
              <svg class="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            <!-- Menu Dropdown -->
            @if (isMenuOpen) {
              <div
                class="fixed inset-0 z-30"
                (click)="isMenuOpen = false"
              ></div>
              <div class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div class="px-3 py-2 border-b border-gray-100 mb-1">
                  <p class="text-xs font-bold text-gray-800">TaskFlow Administrator</p>
                  <p class="text-[11px] text-gray-400">admin&#64;taskflow.dev</p>
                </div>

                <a
                  routerLink="/dashboard"
                  (click)="isMenuOpen = false"
                  class="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-[#5243E4] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                  </svg>
                  <span>Go to User Workspace</span>
                </a>

                <button
                  type="button"
                  (click)="isMenuOpen = false; authService.logout('/admin/login')"
                  class="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Admin Sign Out</span>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class AdminHeaderComponent {
  @Output() openSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  router = inject(Router);

  isMenuOpen = false;
  pageTitle = 'Admin Overview';
  pageSubtitle = 'System-wide metrics and user task completion status.';

  constructor() {
    this.updateTitleByUrl(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateTitleByUrl(event.urlAfterRedirects || event.url);
      });
  }

  private updateTitleByUrl(url: string): void {
    if (url.includes('/admin/users')) {
      this.pageTitle = 'User Management';
      this.pageSubtitle = 'Monitor user task distribution, progress, and team member statuses.';
    } else if (url.includes('/admin/tasks')) {
      this.pageTitle = 'Task Monitoring';
      this.pageSubtitle = 'Cross-organization task management and status auditing.';
    } else if (url.includes('/admin/analytics') || url.includes('/admin/progress')) {
      this.pageTitle = 'Analytics & Progress';
      this.pageSubtitle = 'Performance tracking, distribution metrics, and completion statistics.';
    } else {
      this.pageTitle = 'Admin Dashboard';
      this.pageSubtitle = 'System-wide metrics, activity charts, and organization task completion status.';
    }
  }
}
