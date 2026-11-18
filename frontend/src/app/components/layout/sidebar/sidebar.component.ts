import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { TaskCategory } from '../../../models/task.model';

@Component({
  selector: 'app-sidebar',
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

    <!-- Sidebar Container -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto"
      [ngClass]="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex flex-col h-full overflow-y-auto no-scrollbar">
        <!-- Brand Header -->
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-[#5243E4] flex items-center justify-center text-white shadow-md shadow-[#5243E4]/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span class="text-xl font-extrabold tracking-tight text-[#1E1B4B]">
              Task<span class="text-[#5243E4]">Flow</span>
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

        <!-- Quick Add Task Button -->
        <div class="px-4 pt-4 pb-2">
          <button
            type="button"
            (click)="onOpenCreate()"
            class="w-full py-2.5 px-3 bg-[#5243E4] hover:bg-[#4332D4] active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-button flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Create New Task</span>
          </button>
        </div>

        <!-- Main Navigation Links -->
        <div class="p-3 space-y-1">
          <p class="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Menu
          </p>

          <!-- Dashboard -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-purple-50 text-[#5243E4] font-bold"
            (click)="onNavClick()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke-width="2"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke-width="2"></rect>
              </svg>
              <span>Dashboard</span>
            </div>
          </a>

          <!-- My Tasks -->
          <a
            routerLink="/tasks"
            routerLinkActive="bg-purple-50 text-[#5243E4] font-bold"
            (click)="onNavClick()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              <span>My Tasks</span>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-[#5243E4]">
              {{ taskService.stats().total }}
            </span>
          </a>

          <!-- Categories -->
          <a
            routerLink="/categories"
            routerLinkActive="bg-purple-50 text-[#5243E4] font-bold"
            (click)="onNavClick()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
              <span>Categories</span>
            </div>
          </a>

          <!-- Settings -->
          <a
            routerLink="/settings"
            routerLinkActive="bg-purple-50 text-[#5243E4] font-bold"
            (click)="onNavClick()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" stroke-width="2"></circle>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
              </svg>
              <span>Settings</span>
            </div>
          </a>
        </div>

        <!-- Categories Quick Links -->
        <div className="p-3 pt-2 space-y-1">
          <p class="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Categories
          </p>
          @for (cat of categories; track cat.id) {
            <a
              [routerLink]="['/tasks']"
              [queryParams]="{ category: cat.id }"
              (click)="onNavClick()"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <span class="w-2 h-2 rounded-full" [ngClass]="cat.color"></span>
                <span>{{ cat.label }}</span>
              </div>
              <span class="text-[10px] font-medium text-gray-400 group-hover:text-gray-700">
                {{ getCategoryCount(cat.id) }}
              </span>
            </a>
          }
        </div>

        <!-- Progress Card & User Profile Footer -->
        <div class="mt-auto p-4 border-t border-gray-100 space-y-3">
          <!-- Daily Progress Widget -->
          <div class="bg-[#FAF9FF] border border-purple-100/80 rounded-2xl p-3.5 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-gray-700">Daily Completion</span>
              <span class="text-[#5243E4]">{{ taskService.stats().progressPercentage }}%</span>
            </div>
            <div class="w-full h-2 bg-purple-100/70 rounded-full overflow-hidden">
              <div
                class="h-full bg-[#5243E4] rounded-full transition-all duration-300"
                [style.width.%]="taskService.stats().progressPercentage"
              ></div>
            </div>
            <p class="text-[11px] text-gray-500">
              {{ taskService.stats().completed }} of {{ taskService.stats().total }} tasks completed
            </p>
          </div>

          <!-- User Row with Sign Out -->
          <div class="flex items-center justify-between px-1 pt-1">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-7 h-7 rounded-lg bg-purple-100 text-[#5243E4] font-bold text-xs flex items-center justify-center shrink-0">
                {{ authService.currentUser().avatar || 'A' }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-gray-800 truncate">{{ authService.currentUser().fullName }}</p>
                <p class="text-[10px] text-gray-400 truncate">{{ authService.currentUser().email }}</p>
              </div>
            </div>

            <button
              type="button"
              (click)="authService.logout()"
              class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Sign Out"
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
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  taskService = inject(TaskService);
  authService = inject(AuthService);

  categories: { id: TaskCategory; label: string; color: string }[] = [
    { id: 'Work', label: 'Work', color: 'bg-blue-500' },
    { id: 'Personal', label: 'Personal', color: 'bg-rose-500' },
    { id: 'Study', label: 'Study', color: 'bg-purple-500' },
    { id: 'Other', label: 'Other', color: 'bg-slate-400' },
  ];

  getCategoryCount(category: TaskCategory): number {
    return this.taskService.tasks().filter((t) => t.category === category).length;
  }

  onOpenCreate(): void {
    this.taskService.openCreateModal();
    this.close.emit();
  }

  onNavClick(): void {
    this.close.emit();
  }
}

