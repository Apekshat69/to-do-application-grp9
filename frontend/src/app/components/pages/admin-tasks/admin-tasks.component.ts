import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { Task, TaskPriority, TaskStatus } from '../../../models/task.model';
import { PriorityBadgeComponent } from '../../tasks/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '../../tasks/status-badge/status-badge.component';
import { FormatDueDatePipe } from '../../../pipes/time-ago.pipe';

@Component({
  selector: 'app-admin-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PriorityBadgeComponent,
    StatusBadgeComponent,
    FormatDueDatePipe,
  ],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <!-- Admin Task Monitoring Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-gray-200/90 shadow-xs">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              Task Monitoring
            </span>
            <span class="text-xs text-gray-400">• Cross-User Activity</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
            All Monitored Tasks
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">
            Audit and manage tasks across all team members, update progress statuses, and detect overdue bottlenecks.
          </p>
        </div>

        <!-- Quick Summary Pills -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700">
            Total: <span class="font-bold text-[#5243E4]">{{ adminService.adminStats().totalTasks }}</span>
          </div>
          <div class="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            Overdue: <span class="font-bold">{{ adminService.adminStats().overdueTasks }}</span>
          </div>
          <div class="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700">
            Completed: <span class="font-bold">{{ adminService.adminStats().completedTasks }}</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs space-y-3 sm:space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          <!-- Search Input (md:col-span-4) -->
          <div class="md:col-span-4 relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by title, description or assignee..."
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5243E4] focus:bg-white transition-all"
            />
            @if (searchQuery) {
              <button
                type="button"
                (click)="searchQuery = ''"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            }
          </div>

          <!-- User Filter (md:col-span-3) -->
          <div class="md:col-span-3">
            <select
              [(ngModel)]="selectedUserId"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-[#5243E4] transition-all cursor-pointer"
            >
              <option value="ALL">All Assignees ({{ adminService.users().length }} users)</option>
              @for (user of adminService.users(); track user.id) {
                <option [value]="user.id">{{ user.fullName }}{{ user.department ? ' (' + user.department + ')' : '' }}</option>
              }
            </select>
          </div>

          <!-- Status Filter (md:col-span-2) -->
          <div class="md:col-span-2">
            <select
              [(ngModel)]="selectedStatus"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-[#5243E4] transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <!-- Priority Filter (md:col-span-2) -->
          <div class="md:col-span-2">
            <select
              [(ngModel)]="selectedPriority"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-[#5243E4] transition-all cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <!-- Reset Filters (md:col-span-1) -->
          <div class="md:col-span-1 flex justify-end">
            <button
              type="button"
              (click)="resetFilters()"
              title="Reset all filters"
              class="p-2 text-gray-500 hover:text-[#5243E4] hover:bg-purple-50 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Monitored Tasks Table -->
      <div class="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-200/90 text-gray-500 uppercase tracking-wider font-bold text-[11px]">
                <th class="py-3.5 px-4 sm:px-6">Task Title & Details</th>
                <th class="py-3.5 px-4">Assigned To</th>
                <th class="py-3.5 px-3 text-center">Priority</th>
                <th class="py-3.5 px-4">Due Date</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (task of filteredTasks(); track task.id) {
                <tr class="hover:bg-purple-50/20 transition-colors">
                  <!-- Task Title & Description -->
                  <td class="py-3.5 px-4 sm:px-6 max-w-sm">
                    <div class="flex items-start gap-2">
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="font-bold text-[#1E1B4B] text-xs sm:text-sm">
                            {{ task.title }}
                          </p>
                          @if (adminService.isOverdue(task)) {
                            <span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 shrink-0">
                              Overdue
                            </span>
                          }
                        </div>
                        @if (task.description) {
                          <p class="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {{ task.description }}
                          </p>
                        }
                      </div>
                    </div>
                  </td>

                  <!-- Assigned User -->
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-lg bg-purple-100 text-[#5243E4] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {{ task.userAvatar || (task.userName ? task.userName[0] : 'U') }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-semibold text-gray-800 text-xs truncate">
                          {{ task.userName || 'Unassigned' }}
                        </p>
                        <p class="text-[10px] text-gray-400 truncate">
                          {{ task.userEmail || '' }}
                        </p>
                      </div>
                    </div>
                  </td>

                  <!-- Priority Badge -->
                  <td class="py-3.5 px-3 text-center">
                    <app-priority-badge [priority]="task.priority" size="xs" />
                  </td>

                  <!-- Due Date -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span
                      class="text-xs font-medium"
                      [ngClass]="adminService.isOverdue(task) ? 'text-rose-600 font-bold' : 'text-gray-600'"
                    >
                      {{ task.dueDate | formatDueDate }}
                    </span>
                  </td>

                  <!-- Interactive Status Badge -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <app-status-badge
                      [status]="task.status"
                      [interactive]="true"
                      (statusChange)="onStatusChange(task, $event)"
                    />
                  </td>

                  <!-- Actions (Delete) -->
                  <td class="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      (click)="onDeleteTask(task)"
                      title="Delete task from system"
                      class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-12 text-center text-gray-400">
                    <svg class="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p class="text-sm font-semibold text-gray-600">No monitored tasks found</p>
                    <p class="text-xs text-gray-400">Try adjusting your filters or search keywords.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminTasksComponent {
  adminService = inject(AdminService);
  toastService = inject(ToastService);

  searchQuery = '';
  selectedUserId = 'ALL';
  selectedStatus = 'ALL';
  selectedPriority = 'ALL';

  filteredTasks = computed<Task[]>(() => {
    const all = this.adminService.tasks();
    const query = this.searchQuery.trim().toLowerCase();
    const userId = this.selectedUserId;
    const status = this.selectedStatus;
    const priority = this.selectedPriority;

    return all.filter((task) => {
      const matchesUser = userId === 'ALL' || task.userId === userId;
      const matchesStatus = status === 'ALL' || task.status === status;
      const matchesPriority = priority === 'ALL' || task.priority === priority;
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.userName && task.userName.toLowerCase().includes(query));

      return matchesUser && matchesStatus && matchesPriority && matchesQuery;
    });
  });

  onStatusChange(task: Task, newStatus: TaskStatus): void {
    this.adminService.updateTaskStatus(task.id, newStatus);
    this.toastService.show(`Task status updated to "${newStatus}"`, 'success');
  }

  onDeleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      this.adminService.deleteTask(task.id);
      this.toastService.show('Task deleted successfully', 'info');
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedUserId = 'ALL';
    this.selectedStatus = 'ALL';
    this.selectedPriority = 'ALL';
  }
}
