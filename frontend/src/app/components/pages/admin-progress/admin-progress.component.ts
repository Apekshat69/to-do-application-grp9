import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { StatusBadgeComponent } from '../../tasks/status-badge/status-badge.component';
import { FormatDueDatePipe } from '../../../pipes/time-ago.pipe';
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-admin-progress',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    FormatDueDatePipe,
  ],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-gray-200/90 shadow-xs">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Analytics & Performance
            </span>
            <span class="text-xs text-gray-400">• Cross-Team Velocity</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
            Overall Organizational Progress
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">
            Visual metrics, status breakdowns, individual member velocity, and deadline risks.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a
            routerLink="/admin/tasks"
            class="px-4 py-2 bg-[#5243E4] hover:bg-[#4332D4] text-white rounded-xl text-xs font-bold shadow-button flex items-center gap-2 transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span>Manage All Tasks</span>
          </a>
        </div>
      </div>

      <!-- Top Summary Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <!-- Completion Rate Hero Card -->
        <div class="bg-gradient-to-br from-[#5243E4] to-indigo-700 text-white rounded-3xl p-6 shadow-lg shadow-purple-600/20 relative overflow-hidden flex flex-col justify-between">
          <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-purple-200 block mb-1">System Completion Rate</span>
            <div class="flex items-baseline gap-2">
              <span class="text-4xl sm:text-5xl font-black">{{ stats().overallCompletionRate }}%</span>
              <span class="text-xs text-purple-200 font-semibold">of organization tasks completed</span>
            </div>
          </div>

          <div class="mt-6 space-y-2">
            <div class="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                class="h-full bg-white rounded-full transition-all duration-700"
                [style.width.%]="stats().overallCompletionRate"
              ></div>
            </div>
            <div class="flex items-center justify-between text-xs text-purple-200">
              <span>{{ stats().completedTasks }} completed</span>
              <span>{{ stats().totalTasks }} total assigned</span>
            </div>
          </div>
        </div>

        <!-- Task Velocity & Status Breakdown Card -->
        <div class="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Status Distribution</span>
            <h3 class="text-lg font-extrabold text-[#1E1B4B]">Work Breakdown</h3>
          </div>

          <!-- Multi-segment Progress Bar -->
          <div class="space-y-3 my-4">
            <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                class="bg-emerald-500 h-full transition-all"
                [style.width.%]="statusPercentage('Completed')"
                title="Completed"
              ></div>
              <div
                class="bg-[#5243E4] h-full transition-all"
                [style.width.%]="statusPercentage('In Progress')"
                title="In Progress"
              ></div>
              <div
                class="bg-slate-300 h-full transition-all"
                [style.width.%]="statusPercentage('Pending')"
                title="Pending"
              ></div>
            </div>

            <!-- Legend -->
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                <span class="text-emerald-700 font-extrabold block text-sm">{{ stats().completedTasks }}</span>
                <span class="text-[10px] text-emerald-800 font-medium">Completed</span>
              </div>
              <div class="bg-purple-50 p-2 rounded-xl border border-purple-100">
                <span class="text-[#5243E4] font-extrabold block text-sm">{{ stats().inProgressTasks }}</span>
                <span class="text-[10px] text-purple-800 font-medium">In Progress</span>
              </div>
              <div class="bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span class="text-slate-700 font-extrabold block text-sm">{{ stats().pendingTasks }}</span>
                <span class="text-[10px] text-slate-500 font-medium">Pending</span>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-gray-400">
            Updated in real-time across {{ stats().totalUsers }} team members.
          </p>
        </div>

        <!-- Priority Workload Breakdown Card -->
        <div class="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Priority Load</span>
            <h3 class="text-lg font-extrabold text-[#1E1B4B]">Priority Tiers</h3>
          </div>

          <div class="space-y-2.5 my-3">
            <!-- High Priority -->
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-rose-700">High Priority</span>
                <span class="text-gray-700">{{ priorityCounts().high }} tasks</span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-rose-500 rounded-full"
                  [style.width.%]="priorityPercentage('High')"
                ></div>
              </div>
            </div>

            <!-- Medium Priority -->
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-amber-700">Medium Priority</span>
                <span class="text-gray-700">{{ priorityCounts().medium }} tasks</span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-amber-500 rounded-full"
                  [style.width.%]="priorityPercentage('Medium')"
                ></div>
              </div>
            </div>

            <!-- Low Priority -->
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-emerald-700">Low Priority</span>
                <span class="text-gray-700">{{ priorityCounts().low }} tasks</span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-emerald-500 rounded-full"
                  [style.width.%]="priorityPercentage('Low')"
                ></div>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-gray-400">
            {{ priorityCounts().high }} urgent items currently tracked in the queue.
          </p>
        </div>
      </div>

      <!-- Overdue Tasks Warning Section -->
      @if (overdueTasks().length > 0) {
        <div class="bg-rose-50/60 border border-rose-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-sm sm:text-base font-extrabold text-rose-900">
                  Overdue Tasks Requiring Attention ({{ overdueTasks().length }})
                </h3>
                <p class="text-xs text-rose-700">
                  These tasks have passed their target completion deadline without being marked completed.
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (task of overdueTasks(); track task.id) {
              <div class="bg-white rounded-xl p-3.5 border border-rose-200 shadow-2xs flex flex-col justify-between gap-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="font-bold text-gray-900 text-xs sm:text-sm truncate">{{ task.title }}</p>
                    <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">{{ task.description }}</p>
                  </div>
                  <span class="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                    Overdue
                  </span>
                </div>

                <div class="flex items-center justify-between text-xs pt-2 border-t border-gray-100 mt-1">
                  <div class="flex items-center gap-1.5 text-gray-600">
                    <div class="w-5 h-5 rounded-md bg-purple-100 text-[#5243E4] font-bold text-[10px] flex items-center justify-center">
                      {{ task.userAvatar || 'U' }}
                    </div>
                    <span class="text-[11px] font-medium">{{ task.userName }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-[11px] text-rose-600 font-semibold">Due {{ task.dueDate | formatDueDate }}</span>
                    <app-status-badge
                      [status]="task.status"
                      [interactive]="true"
                      (statusChange)="adminService.updateTaskStatus(task.id, $event)"
                    />
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Individual User Progress Comparison Section -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-extrabold text-[#1E1B4B]">
              Team Member Progress Comparison
            </h3>
            <p class="text-xs text-gray-500">
              Individual task completion rates and active workload distribution.
            </p>
          </div>
          <span class="text-xs font-semibold text-gray-400">
            {{ adminService.users().length }} Team Members
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (item of adminService.userTaskStats(); track item.user.id) {
            <div class="bg-gray-50/60 hover:bg-white rounded-2xl p-4 border border-gray-200/80 hover:border-purple-200 transition-all shadow-xs">
              <!-- User Header -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-9 h-9 rounded-xl bg-purple-100 text-[#5243E4] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {{ item.user.avatar || item.user.name[0] }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-gray-900 text-xs sm:text-sm truncate">{{ item.user.fullName }}</p>
                    <p class="text-[11px] text-gray-400 truncate">{{ item.user.department }}</p>
                  </div>
                </div>

                <span class="text-xs font-extrabold text-[#5243E4] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {{ item.progressPercentage }}%
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  class="h-full bg-gradient-to-r from-purple-500 to-[#5243E4] rounded-full transition-all duration-300"
                  [style.width.%]="item.progressPercentage"
                ></div>
              </div>

              <!-- Task Counts Breakdown -->
              <div class="grid grid-cols-3 gap-2 text-center text-[11px] pt-2 border-t border-gray-100">
                <div>
                  <span class="font-bold text-emerald-700 block">{{ item.completedTasks }}</span>
                  <span class="text-[10px] text-gray-400">Completed</span>
                </div>
                <div>
                  <span class="font-bold text-purple-700 block">{{ item.inProgressTasks }}</span>
                  <span class="text-[10px] text-gray-400">In Prog</span>
                </div>
                <div>
                  <span class="font-bold text-slate-600 block">{{ item.pendingTasks }}</span>
                  <span class="text-[10px] text-gray-400">Pending</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminProgressComponent {
  adminService = inject(AdminService);

  stats = this.adminService.adminStats;

  overdueTasks = computed<Task[]>(() => {
    return this.adminService.tasks().filter((t) => this.adminService.isOverdue(t));
  });

  priorityCounts = computed(() => {
    const tasks = this.adminService.tasks();
    return {
      high: tasks.filter((t) => t.priority === 'High').length,
      medium: tasks.filter((t) => t.priority === 'Medium').length,
      low: tasks.filter((t) => t.priority === 'Low').length,
    };
  });

  statusPercentage(status: string): number {
    const total = this.stats().totalTasks;
    if (total === 0) return 0;
    if (status === 'Completed') return Math.round((this.stats().completedTasks / total) * 100);
    if (status === 'In Progress') return Math.round((this.stats().inProgressTasks / total) * 100);
    if (status === 'Pending') return Math.round((this.stats().pendingTasks / total) * 100);
    return 0;
  }

  priorityPercentage(priority: 'High' | 'Medium' | 'Low'): number {
    const total = this.stats().totalTasks;
    if (total === 0) return 0;
    const counts = this.priorityCounts();
    if (priority === 'High') return Math.round((counts.high / total) * 100);
    if (priority === 'Medium') return Math.round((counts.medium / total) * 100);
    if (priority === 'Low') return Math.round((counts.low / total) * 100);
    return 0;
  }
}
