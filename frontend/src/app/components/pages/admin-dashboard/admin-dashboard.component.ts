import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, MonthlyActivityPoint, StatusSlice } from '../../../services/admin.service';
import { PriorityBadgeComponent } from '../../tasks/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '../../tasks/status-badge/status-badge.component';
import { FormatDueDatePipe } from '../../../pipes/time-ago.pipe';
import { Task, TaskStatus } from '../../../models/task.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PriorityBadgeComponent,
    StatusBadgeComponent,
    FormatDueDatePipe,
  ],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <!-- Admin Welcome Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-gray-200/90 shadow-xs">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-[#5243E4]">
              Centralized Administration
            </span>
            <span class="text-xs text-gray-400">• Real-Time System Analytics</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
            Admin Monitoring Dashboard
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">
            Tracking <span class="font-bold text-[#5243E4]">{{ stats().totalUsers }} registered member{{ stats().totalUsers === 1 ? '' : 's' }}</span> and <span class="font-bold text-[#5243E4]">{{ stats().totalTasks }} total organization task{{ stats().totalTasks === 1 ? '' : 's' }}</span>.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <a
            routerLink="/admin/tasks"
            class="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#5243E4] rounded-xl text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span>Monitor Tasks</span>
          </a>

          <a
            routerLink="/admin/users"
            class="px-3.5 py-2 bg-[#5243E4] hover:bg-[#4332D4] active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-button flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <span>Manage Users</span>
          </a>
        </div>
      </div>

      <!-- 1. Dashboard Overview: 6 Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <!-- Total Users -->
        <div class="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs hover:border-purple-200 transition-all">
          <div class="w-9 h-9 rounded-xl bg-purple-50 text-[#5243E4] flex items-center justify-center mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <span class="text-2xl font-extrabold text-[#1E1B4B] block leading-none">
            {{ stats().totalUsers }}
          </span>
          <span class="text-[11px] font-semibold text-gray-500 mt-1 block">Registered Users</span>
        </div>

        <!-- Total Tasks -->
        <div class="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs hover:border-purple-200 transition-all">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <span class="text-2xl font-extrabold text-[#1E1B4B] block leading-none">
            {{ stats().totalTasks }}
          </span>
          <span class="text-[11px] font-semibold text-gray-500 mt-1 block">Total Tasks</span>
        </div>

        <!-- Pending Tasks -->
        <div class="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke-width="2" stroke-dasharray="3 3"></circle>
            </svg>
          </div>
          <span class="text-2xl font-extrabold text-[#1E1B4B] block leading-none">
            {{ stats().pendingTasks }}
          </span>
          <span class="text-[11px] font-semibold text-gray-500 mt-1 block">Pending Tasks</span>
        </div>

        <!-- In Progress -->
        <div class="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs hover:border-purple-200 transition-all">
          <div class="w-9 h-9 rounded-xl bg-purple-50 text-[#5243E4] flex items-center justify-center mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
              <polyline points="12 6 12 12 16 14" stroke-width="2"></polyline>
            </svg>
          </div>
          <span class="text-2xl font-extrabold text-[#1E1B4B] block leading-none">
            {{ stats().inProgressTasks }}
          </span>
          <span class="text-[11px] font-semibold text-gray-500 mt-1 block">In Progress</span>
        </div>

        <!-- Completed Tasks -->
        <div class="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs hover:border-emerald-200 transition-all">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <span class="text-2xl font-extrabold text-[#1E1B4B] block leading-none">
            {{ stats().completedTasks }}
          </span>
          <span class="text-[11px] font-semibold text-gray-500 mt-1 block">Completed</span>
        </div>

        <!-- Overall Completion Rate -->
        <div class="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs hover:border-purple-200 transition-all">
          <div class="w-9 h-9 rounded-xl bg-purple-100 text-[#5243E4] flex items-center justify-center mb-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <span class="text-2xl font-extrabold text-[#5243E4] block leading-none">
            {{ stats().overallCompletionRate }}%
          </span>
          <span class="text-[11px] font-semibold text-gray-500 mt-1 block">Completion Rate</span>
        </div>
      </div>

      <!-- 2. Charts Section: Activity Chart (Left) & Task Status Doughnut Chart (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <!-- Monthly Task Activity Bar Chart (7 Cols) -->
        <div class="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 class="text-base font-extrabold text-[#1E1B4B] flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span>Monthly Task Activity</span>
                </h3>
                <p class="text-xs text-gray-400">Created vs. completed task volume derived from real application activity.</p>
              </div>

              <!-- Legend -->
              <div class="flex items-center gap-3 text-xs">
                <span class="inline-flex items-center gap-1.5 font-medium text-gray-600">
                  <span class="w-2.5 h-2.5 rounded-sm bg-[#5243E4]"></span>
                  <span>Created</span>
                </span>
                <span class="inline-flex items-center gap-1.5 font-medium text-gray-600">
                  <span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                  <span>Completed</span>
                </span>
              </div>
            </div>

            <!-- Chart Visual with Real Data or Clean Empty State -->
            @if (activityPoints().length > 0) {
              <div class="h-56 w-full flex items-end gap-6 sm:gap-8 pt-8 pb-3 px-4 border-b border-gray-100">
                @for (pt of activityPoints(); track pt.month) {
                  <div class="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
                    <!-- Tooltip on Hover -->
                    <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-10">
                      {{ pt.month }}: {{ pt.created }} Created, {{ pt.completed }} Done
                    </div>

                    <!-- Bars Pair -->
                    <div class="w-full flex items-end justify-center gap-1.5 h-full">
                      <!-- Created Bar -->
                      <div
                        class="w-4 sm:w-6 bg-[#5243E4] rounded-t-md hover:bg-[#4332D4] transition-all"
                        [style.height.%]="getBarHeight(pt.created)"
                        title="Created: {{ pt.created }}"
                      ></div>
                      <!-- Completed Bar -->
                      <div
                        class="w-4 sm:w-6 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all"
                        [style.height.%]="getBarHeight(pt.completed)"
                        title="Completed: {{ pt.completed }}"
                      ></div>
                    </div>

                    <!-- Month Label -->
                    <span class="text-[11px] font-bold text-gray-500 mt-2 block">{{ pt.month }}</span>
                  </div>
                }
              </div>
            } @else {
              <!-- Empty State -->
              <div class="py-12 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <svg class="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-xs font-semibold text-gray-600">No monthly activity recorded yet</p>
                <p class="text-[11px] text-gray-400 mt-0.5">Tasks created by users will dynamically populate this chart.</p>
              </div>
            }
          </div>

          <div class="flex items-center justify-between text-[11px] text-gray-400 pt-3">
            <span>Aggregated strictly from real task creation timestamps</span>
            <span class="font-semibold text-purple-600">Real-Time</span>
          </div>
        </div>

        <!-- Task Status Doughnut Chart (5 Cols) -->
        <div class="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-extrabold text-[#1E1B4B] flex items-center gap-2">
                <svg class="w-4 h-4 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"></path>
                </svg>
                <span>Task Status Breakdown</span>
              </h3>
              <span class="text-xs font-bold text-gray-400">{{ doughnut().total }} Total</span>
            </div>

            @if (doughnut().hasData) {
              <!-- Interactive SVG Doughnut Chart -->
              <div class="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
                <div class="relative w-40 h-40 flex items-center justify-center">
                  <!-- SVG Circular Conic Graphic -->
                  <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <!-- Background Ring -->
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" stroke-width="14" />
                    <!-- Slices using dasharray -->
                    @for (slice of computedSlices(); track slice.label) {
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        [attr.stroke]="slice.color"
                        stroke-width="14"
                        [attr.stroke-dasharray]="slice.dashArray"
                        [attr.stroke-dashoffset]="slice.dashOffset"
                        class="transition-all duration-500"
                      />
                    }
                  </svg>

                  <!-- Center metric text -->
                  <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span class="text-2xl font-black text-[#1E1B4B] leading-none">{{ stats().overallCompletionRate }}%</span>
                    <span class="text-[10px] font-semibold text-gray-400 mt-0.5">Completed</span>
                  </div>
                </div>

                <!-- Doughnut Legend & Values -->
                <div class="space-y-2.5 w-full sm:w-auto">
                  @for (slice of doughnut().slices; track slice.label) {
                    <div class="flex items-center justify-between sm:justify-start gap-3 text-xs">
                      <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full" [ngClass]="slice.dotColor"></span>
                        <span class="font-medium text-gray-700">{{ slice.label }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="font-bold text-[#1E1B4B]">{{ slice.count }}</span>
                        <span class="text-[10px] text-gray-400">({{ slice.percentage }}%)</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <!-- Empty State -->
              <div class="py-12 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <svg class="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" stroke-width="1.5"></circle>
                </svg>
                <p class="text-xs font-semibold text-gray-600">No task status data available yet</p>
                <p class="text-[11px] text-gray-400 mt-0.5">Create tasks in the application to see the status doughnut.</p>
              </div>
            }
          </div>

          <p class="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            Real task status counts across all active projects.
          </p>
        </div>
      </div>

      <!-- 3. Task Monitoring Table & User Management Snippet -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <!-- Task Monitoring Table (7 Cols) -->
        <section class="lg:col-span-7 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-[#1E1B4B] flex items-center gap-2">
              <svg class="w-4 h-4 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <span>Task Monitoring Feed</span>
            </h3>

            <a
              routerLink="/admin/tasks"
              class="text-xs font-bold text-[#5243E4] hover:text-[#4332D4] flex items-center gap-1 transition-colors"
            >
              <span>View All Tasks ({{ adminService.tasks().length }})</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>

          <!-- Quick Search Filter for table snippet -->
          <div class="bg-white rounded-2xl border border-gray-200/90 shadow-xs divide-y divide-gray-100 overflow-hidden">
            @for (task of adminService.tasks().slice(0, 5); track task.id) {
              <div class="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <p class="text-xs sm:text-sm font-bold text-[#1E1B4B] truncate">
                      {{ task.title }}
                    </p>
                    @if (adminService.isOverdue(task)) {
                      <span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        Overdue
                      </span>
                    }
                  </div>

                  <div class="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                    <span class="font-medium text-gray-700">Assignee: {{ task.userName || 'Current User' }}</span>
                    <span>•</span>
                    <span>Due: {{ task.dueDate | formatDueDate }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <app-priority-badge [priority]="task.priority" size="xs" />
                  <app-status-badge
                    [status]="task.status"
                    [interactive]="true"
                    (statusChange)="adminService.updateTaskStatus(task.id, $event)"
                  />
                </div>
              </div>
            } @empty {
              <div class="py-8 text-center text-gray-400">
                <p class="text-xs font-semibold">No tasks available in system yet.</p>
                <p class="text-[11px] text-gray-400 mt-0.5">Tasks will appear here once added in the workspace.</p>
              </div>
            }
          </div>
        </section>

        <!-- User Management & Individual Progress (5 Cols) -->
        <section class="lg:col-span-5 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-[#1E1B4B] flex items-center gap-2">
              <svg class="w-4 h-4 text-[#5243E4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <span>User Productivity</span>
            </h3>

            <a
              routerLink="/admin/users"
              class="text-xs font-bold text-[#5243E4] hover:text-[#4332D4] flex items-center gap-1 transition-colors"
            >
              <span>Directory</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200/90 shadow-xs divide-y divide-gray-100 overflow-hidden">
            @for (item of adminService.userTaskStats(); track item.user.id) {
              <div class="p-4 hover:bg-slate-50/60 transition-colors">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-xl bg-purple-100 text-[#5243E4] font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200">
                      {{ item.user.avatar || item.user.name[0] }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-gray-800 truncate">{{ item.user.fullName }}</p>
                      <p class="text-[10px] text-gray-400 truncate">{{ item.user.title || 'Team Member' }} &bull; {{ item.user.department || 'General' }}</p>
                    </div>
                  </div>

                  <span class="text-xs font-extrabold text-[#5243E4]">
                    {{ item.progressPercentage }}%
                  </span>
                </div>

                <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div
                    class="h-full bg-[#5243E4] rounded-full transition-all duration-300"
                    [style.width.%]="item.progressPercentage"
                  ></div>
                </div>

                <div class="flex items-center justify-between text-[10px] text-gray-400 mt-1.5">
                  <span>{{ item.completedTasks }} of {{ item.totalTasks }} completed</span>
                  <span>{{ item.inProgressTasks }} in progress</span>
                </div>
              </div>
            } @empty {
              <div class="py-8 text-center text-gray-400">
                <p class="text-xs font-semibold">No registered users available yet.</p>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {
  adminService = inject(AdminService);

  stats = this.adminService.adminStats;
  activityPoints = this.adminService.monthlyActivity;
  doughnut = this.adminService.statusDoughnut;

  // Calculates bar height percentage based on max activity value
  getBarHeight(val: number): number {
    const points = this.activityPoints();
    if (points.length === 0) return 0;
    const maxVal = Math.max(...points.map((p) => Math.max(p.created, p.completed)), 1);
    return Math.max(Math.round((val / maxVal) * 90), 8); // At least 8% height so bar is visible
  }

  // Pre-calculates SVG circle dasharray and offset for the doughnut chart
  computedSlices = computed(() => {
    const data = this.doughnut();
    if (!data.hasData || data.total === 0) return [];

    const circumference = 2 * Math.PI * 38; // r = 38 => circumference ~ 238.76
    let currentOffset = 0;

    return data.slices.map((slice) => {
      const sliceLength = (slice.percentage / 100) * circumference;
      const res = {
        label: slice.label,
        color: slice.color,
        dashArray: `${sliceLength} ${circumference - sliceLength}`,
        dashOffset: `${-currentOffset}`,
      };
      currentOffset += sliceLength;
      return res;
    });
  });
}
