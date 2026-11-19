import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white border-b border-gray-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-20">
      <div class="flex items-center justify-between gap-4">
        <!-- Left: Hamburger & Page Title -->
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
            <h1 class="text-lg sm:text-xl font-extrabold text-[#1E1B4B] tracking-tight leading-tight">
              {{ pageTitle }}
            </h1>
            <p class="text-xs text-gray-400 hidden sm:block">
              {{ pageSubtitle }}
            </p>
          </div>
        </div>

        <!-- Right: Date, Quick Add & Profile -->
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Date Pill -->
          <div class="hidden md:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-medium">
            <svg class="w-3.5 h-3.5 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6" stroke-width="2"></line>
              <line x1="8" y1="2" x2="8" y2="6" stroke-width="2"></line>
              <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"></line>
            </svg>
            <span>{{ todayFormatted }}</span>
          </div>

          <!-- Quick Add Task Button -->
          <button
            type="button"
            (click)="taskService.openCreateModal()"
            class="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#5243E4] hover:bg-[#4332D4] active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-button transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" d="M12 4v16m8-8H4"></path>
            </svg>
            <span class="hidden sm:inline">Add Task</span>
          </button>

          <!-- Profile Menu -->
          <div class="relative pl-2 border-l border-gray-200">
            <button
              type="button"
              (click)="isProfileMenuOpen = !isProfileMenuOpen"
              class="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none"
            >
              <div class="w-8 h-8 rounded-xl bg-purple-100 text-[#5243E4] font-bold text-xs flex items-center justify-center border border-purple-200">
                {{ authService.currentUser().avatar || 'A' }}
              </div>
              <div class="hidden xl:block text-left">
                <span class="text-xs font-bold text-gray-800 block leading-tight">
                  {{ authService.currentUser().fullName }}
                </span>
                <span class="text-[10px] text-gray-400 leading-tight block">
                  {{ authService.currentUser().role }}
                </span>
              </div>
              <svg class="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            @if (isProfileMenuOpen) {
              <div
                class="fixed inset-0 z-30"
                (click)="isProfileMenuOpen = false"
              ></div>
              <div class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div class="px-3 py-2 border-b border-gray-100 mb-1">
                  <p class="text-xs font-bold text-gray-800">{{ authService.currentUser().fullName }}</p>
                  <p class="text-[11px] text-gray-400 truncate">{{ authService.currentUser().email }}</p>
                </div>

                <a
                  (click)="isProfileMenuOpen = false; router.navigate(['/settings'])"
                  class="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-[#5243E4] rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" stroke-width="2"></circle>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
                  </svg>
                  <span>Account Settings</span>
                </a>

                @if (authService.isAdmin()) {
                  <a
                    (click)="isProfileMenuOpen = false; router.navigate(['/admin/overview'])"
                    class="w-full text-left px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span>Switch to Admin Console</span>
                  </a>
                }

                <button
                  type="button"
                  (click)="isProfileMenuOpen = false; authService.logout()"
                  class="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Output() openSidebar = new EventEmitter<void>();

  taskService = inject(TaskService);
  authService = inject(AuthService);
  router = inject(Router);

  isProfileMenuOpen = false;
  pageTitle = 'Dashboard';
  pageSubtitle = 'Monitor your task progression, upcoming deadlines and daily focus.';

  todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  constructor() {
    this.updateTitleByUrl(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateTitleByUrl(event.urlAfterRedirects || event.url);
      });
  }

  private updateTitleByUrl(url: string): void {
    if (url.includes('/tasks')) {
      this.pageTitle = 'My Tasks';
      this.pageSubtitle = 'Organize, filter, search, and manage your complete task backlog.';
    } else if (url.includes('/categories')) {
      this.pageTitle = 'Task Categories';
      this.pageSubtitle = 'Browse tasks categorized by project domain and life context.';
    } else if (url.includes('/settings')) {
      this.pageTitle = 'Settings';
      this.pageSubtitle = 'Manage your preferences and workspace configurations.';
    } else {
      this.pageTitle = 'Dashboard';
      this.pageSubtitle = 'Monitor your task progression, upcoming deadlines and daily focus.';
    }
  }
}

