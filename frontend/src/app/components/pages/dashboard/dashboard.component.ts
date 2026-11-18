import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { TaskCardComponent } from '../../tasks/task-card/task-card.component';
import { PriorityBadgeComponent } from '../../tasks/priority-badge/priority-badge.component';
import { CategoryBadgeComponent } from '../../tasks/category-badge/category-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TaskCardComponent,
    PriorityBadgeComponent,
    CategoryBadgeComponent,
  ],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <!-- Welcome Heading Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] tracking-tight flex items-center gap-2">
            <span>Welcome back, {{ authService.currentUser().name }}!</span>
            <span>👋</span>
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">
            You have
            <span class="font-bold text-[#5243E4]">
              {{ taskService.stats().inProgress + taskService.stats().pending }} active tasks
            </span>
            in your backlog.
          </p>
        </div>

        <button
          type="button"
          (click)="taskService.openCreateModal()"
          class="self-start sm:self-auto px-4 py-2.5 bg-[#5243E4] hover:bg-[#4332D4] active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-button flex items-center gap-2 transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Quick Add Task</span>
        </button>
      </div>

      <!-- 4 Summary Stat Cards + Overdue Banner -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <!-- Total Tasks -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:border-purple-200 transition-all flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-[#5243E4] flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <div>
            <span class="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] block leading-none">
              {{ taskService.stats().total }}
            </span>
            <span class="text-xs font-semibold text-gray-500 mt-1 block">Total Tasks</span>
          </div>
        </div>

        <!-- In Progress -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:border-purple-200 transition-all flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-50/80 text-[#5243E4] flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2.2"></circle>
              <polyline points="12 6 12 12 16 14" stroke-width="2.2"></polyline>
            </svg>
          </div>
          <div>
            <span class="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] block leading-none">
              {{ taskService.stats().inProgress }}
            </span>
            <span class="text-xs font-semibold text-gray-500 mt-1 block">In Progress</span>
          </div>
        </div>

        <!-- Pending Tasks -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:border-amber-200 transition-all flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke-width="2.2" stroke-dasharray="4 4"></circle>
            </svg>
          </div>
          <div>
            <span class="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] block leading-none">
              {{ taskService.stats().pending }}
            </span>
            <span class="text-xs font-semibold text-gray-500 mt-1 block">Pending Tasks</span>
          </div>
        </div>

        <!-- Completed Tasks -->
        <div class="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:border-emerald-200 transition-all flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <span class="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] block leading-none">
              {{ taskService.stats().completed }}
            </span>
            <span class="text-xs font-semibold text-gray-500 mt-1 block">Completed</span>
          </div>
        </div>
      </div>

      <!-- Overall Completion Progress -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 class="text-sm sm:text-base font-bold text-[#1E1B4B]">
              Overall Completion Progress
            </h3>
            <p class="text-xs text-gray-500">
              {{ taskService.stats().completed }} of {{ taskService.stats().total }} tasks completed across all categories
            </p>
          </div>
          <span class="text-lg sm:text-xl font-extrabold text-[#5243E4]">
            {{ taskService.stats().progressPercentage }}%
          </span>
        </div>

        <div class="w-full h-3 bg-purple-100/70 rounded-full overflow-hidden p-0.5">
          <div
            class="h-full bg-gradient-to-r from-[#6355F4] to-[#4E37E4] rounded-full transition-all duration-500 ease-out"
            [style.width.%]="taskService.stats().progressPercentage"
          ></div>
        </div>
      </div>

      <!-- Two-Column Grid: Today's & Recent Tasks (Left) & Upcoming Deadlines (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <!-- Left: Today's & Recent Tasks (7 cols) -->
        <section class="lg:col-span-7 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-[#1E1B4B] flex items-center gap-2">
              <svg class="w-5 h-5 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6" stroke-width="2"></line>
                <line x1="8" y1="2" x2="8" y2="6" stroke-width="2"></line>
                <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"></line>
              </svg>
              <span>Today's &amp; Recent Tasks</span>
            </h3>
            <a
              routerLink="/tasks"
              class="text-xs font-bold text-[#5243E4] hover:text-[#4332D4] flex items-center gap-1 group transition-colors"
            >
              <span>View All</span>
              <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>

          <div class="space-y-3">
            @for (task of recentTasks(); track task.id) {
              <app-task-card [task]="task" />
            }

            @if (recentTasks().length === 0) {
              <div class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-6 space-y-2">
                <p class="text-xs text-gray-500 font-medium">No tasks recorded yet.</p>
                <button
                  type="button"
                  (click)="taskService.openCreateModal()"
                  class="text-xs font-bold text-[#5243E4] hover:underline cursor-pointer"
                >
                  + Create your first task
                </button>
              </div>
            }
          </div>
        </section>

        <!-- Right: Upcoming Deadlines & Overdue Tasks (5 cols) -->
        <section class="lg:col-span-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-[#1E1B4B] flex items-center gap-2">
              <svg class="w-5 h-5 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                <polyline points="12 6 12 12 16 14" stroke-width="2"></polyline>
              </svg>
              <span>Upcoming &amp; Deadlines</span>
            </h3>

            @if (taskService.stats().overdue > 0) {
              <span class="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {{ taskService.stats().overdue }} Overdue
              </span>
            }
          </div>

          <div class="bg-white rounded-2xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
            @for (task of upcomingTasks(); track task.id) {
              <div
                (click)="taskService.openEditModal(task)"
                class="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer group flex items-start justify-between gap-3"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-xs sm:text-sm font-semibold text-[#1E1B4B] group-hover:text-[#5243E4] transition-colors truncate">
                    {{ task.title }}
                  </p>
                  <div class="flex items-center gap-2 mt-1.5">
                    <span
                      class="text-[11px] font-medium flex items-center gap-1"
                      [ngClass]="taskService.isOverdue(task) ? 'text-rose-600 font-bold' : 'text-gray-500'"
                    >
                      @if (taskService.isOverdue(task)) {
                        <span>⚠️ Overdue ({{ task.dueDate }})</span>
                      } @else {
                        <span>Due: {{ task.dueDate }}</span>
                      }
                    </span>
                    <app-category-badge [category]="task.category" size="xs" />
                  </div>
                </div>

                <div class="shrink-0">
                  <app-priority-badge [priority]="task.priority" size="xs" />
                </div>
              </div>
            }

            @if (upcomingTasks().length === 0) {
              <div class="p-8 text-center text-xs text-gray-500">
                All caught up! No pending tasks with upcoming deadlines.
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  taskService = inject(TaskService);
  authService = inject(AuthService);

  recentTasks = computed(() => this.taskService.tasks().slice(0, 4));

  upcomingTasks = computed(() =>
    this.taskService
      .tasks()
      .filter((t) => t.status !== 'Completed')
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
      .slice(0, 5)
  );
}

