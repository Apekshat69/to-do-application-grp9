import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { User, UserTaskStats } from '../../../models/user.model';
import { Task } from '../../../models/task.model';
import { PriorityBadgeComponent } from '../../tasks/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '../../tasks/status-badge/status-badge.component';
import { FormatDueDatePipe } from '../../../pipes/time-ago.pipe';

@Component({
  selector: 'app-admin-users',
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
      <!-- Header with Summary & Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-gray-200/90 shadow-xs">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              User Management
            </span>
            <span class="text-xs text-gray-400">• Team Directory</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
            Registered Users & Productivity
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">
            Track individual performance, assigned workload, and completion rates for all {{ adminService.users().length }} team members.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-3.5 py-2 bg-purple-50 text-[#5243E4] rounded-xl text-xs font-bold border border-purple-100 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span>{{ filteredStats().length }} Users Shown</span>
          </div>
        </div>
      </div>

      <!-- Search & Filtering Controls -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <!-- Search Input -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search users by name, email, or department..."
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

        <!-- Department Filter Dropdown -->
        @if (departments().length > 0) {
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-gray-500 whitespace-nowrap">Department:</label>
            <select
              [(ngModel)]="selectedDepartment"
              class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:border-[#5243E4] transition-all cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              @for (dept of departments(); track dept) {
                <option [value]="dept">{{ dept }}</option>
              }
            </select>
          </div>
        }
      </div>

      <!-- Registered Users Table -->
      <div class="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-200/90 text-gray-500 uppercase tracking-wider font-bold text-[11px]">
                <th class="py-3.5 px-4 sm:px-6">User</th>
                <th class="py-3.5 px-4 hidden md:table-cell">Department</th>
                <th class="py-3.5 px-3 text-center">Assigned</th>
                <th class="py-3.5 px-3 text-center hidden sm:table-cell text-emerald-600">Done</th>
                <th class="py-3.5 px-3 text-center hidden sm:table-cell text-purple-600">In Prog</th>
                <th class="py-3.5 px-3 text-center hidden sm:table-cell text-slate-500">Pending</th>
                <th class="py-3.5 px-4 w-44">Progress</th>
                <th class="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (item of filteredStats(); track item.user.id) {
                <tr class="hover:bg-purple-50/20 transition-colors">
                  <!-- User Column -->
                  <td class="py-3.5 px-4 sm:px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-purple-100 text-[#5243E4] font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {{ item.user.avatar || item.user.name[0] }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-bold text-[#1E1B4B] text-xs sm:text-sm truncate">
                          {{ item.user.fullName }}
                        </p>
                        <p class="text-[11px] text-gray-400 truncate">
                          {{ item.user.email }}
                        </p>
                      </div>
                    </div>
                  </td>

                  <!-- Department Column -->
                  <td class="py-3.5 px-4 hidden md:table-cell">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700">
                      {{ item.user.department }}
                    </span>
                    <p class="text-[10px] text-gray-400 mt-0.5">{{ item.user.title }}</p>
                  </td>

                  <!-- Assigned Tasks Count -->
                  <td class="py-3.5 px-3 text-center font-bold text-gray-800">
                    <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs">
                      {{ item.totalTasks }}
                    </span>
                  </td>

                  <!-- Completed Count -->
                  <td class="py-3.5 px-3 text-center hidden sm:table-cell font-semibold text-emerald-700">
                    {{ item.completedTasks }}
                  </td>

                  <!-- In Progress Count -->
                  <td class="py-3.5 px-3 text-center hidden sm:table-cell font-semibold text-purple-700">
                    {{ item.inProgressTasks }}
                  </td>

                  <!-- Pending Count -->
                  <td class="py-3.5 px-3 text-center hidden sm:table-cell font-semibold text-slate-500">
                    {{ item.pendingTasks }}
                  </td>

                  <!-- Progress Bar Column -->
                  <td class="py-3.5 px-4">
                    <div class="space-y-1">
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="text-gray-400 text-[10px]">{{ item.completedTasks }}/{{ item.totalTasks }}</span>
                        <span class="font-bold text-[#5243E4]">{{ item.progressPercentage }}%</span>
                      </div>
                      <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-purple-500 to-[#5243E4] rounded-full transition-all duration-300"
                          [style.width.%]="item.progressPercentage"
                        ></div>
                      </div>
                    </div>
                  </td>

                  <!-- Actions Column -->
                  <td class="py-3.5 px-4 sm:px-6 text-right">
                    <button
                      type="button"
                      (click)="openUserDetails(item.user)"
                      class="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5243E4] rounded-lg font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="py-12 text-center text-gray-400">
                    <svg class="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <p class="text-sm font-semibold text-gray-600">No users found</p>
                    <p class="text-xs text-gray-400">Try adjusting your search criteria or department filter.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Details Modal -->
      @if (selectedUser) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <!-- Modal Header -->
            <div class="p-5 sm:p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex items-start justify-between">
              <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 rounded-2xl bg-[#5243E4] text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-purple-500/20">
                  {{ selectedUser.avatar || selectedUser.name[0] }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-extrabold text-[#1E1B4B]">
                      {{ selectedUser.fullName }}
                    </h3>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {{ selectedUser.status }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 font-medium">
                    {{ selectedUser.title }} &bull; <span class="text-[#5243E4]">{{ selectedUser.department }}</span>
                  </p>
                  <p class="text-[11px] text-gray-400 mt-0.5">
                    {{ selectedUser.email }} &bull; Member since {{ selectedUser.joinedDate }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="selectedUser = null"
                class="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Modal Content: User Task Breakdown -->
            <div class="p-5 sm:p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              <!-- Stats summary cards for this user -->
              @if (selectedUserStats) {
                <div class="grid grid-cols-4 gap-2.5">
                  <div class="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                    <span class="text-lg font-extrabold text-[#1E1B4B] block leading-none">{{ selectedUserStats.totalTasks }}</span>
                    <span class="text-[10px] text-gray-500 font-medium">Total</span>
                  </div>
                  <div class="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
                    <span class="text-lg font-extrabold text-emerald-600 block leading-none">{{ selectedUserStats.completedTasks }}</span>
                    <span class="text-[10px] text-emerald-700 font-medium">Done</span>
                  </div>
                  <div class="bg-purple-50 rounded-xl p-2.5 text-center border border-purple-100">
                    <span class="text-lg font-extrabold text-[#5243E4] block leading-none">{{ selectedUserStats.inProgressTasks }}</span>
                    <span class="text-[10px] text-purple-700 font-medium">In Prog</span>
                  </div>
                  <div class="bg-purple-100/60 rounded-xl p-2.5 text-center border border-purple-200">
                    <span class="text-lg font-extrabold text-[#5243E4] block leading-none">{{ selectedUserStats.progressPercentage }}%</span>
                    <span class="text-[10px] text-purple-800 font-medium">Rate</span>
                  </div>
                </div>
              }

              <!-- User Assigned Tasks List -->
              <div>
                <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Assigned Tasks ({{ selectedUserTasks.length }})
                </h4>

                <div class="space-y-2.5">
                  @for (task of selectedUserTasks; track task.id) {
                    <div class="p-3.5 bg-gray-50/70 hover:bg-gray-50 border border-gray-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <p class="text-xs sm:text-sm font-bold text-[#1E1B4B] truncate">
                            {{ task.title }}
                          </p>
                          @if (adminService.isOverdue(task)) {
                            <span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 shrink-0">
                              Overdue
                            </span>
                          }
                        </div>
                        @if (task.description) {
                          <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">{{ task.description }}</p>
                        }
                        <p class="text-[11px] text-gray-400 mt-1">
                          Due: {{ task.dueDate | formatDueDate }} &bull; Priority: {{ task.priority }}
                        </p>
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
                    <div class="text-center py-6 text-gray-400">
                      <p class="text-xs">No tasks currently assigned to this user.</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                (click)="selectedUser = null"
                class="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminUsersComponent {
  adminService = inject(AdminService);

  searchQuery = '';
  selectedDepartment = 'ALL';

  departments = computed(() => {
    const depts = new Set<string>();
    this.adminService.users().forEach((u) => {
      if (u.department) depts.add(u.department);
    });
    return Array.from(depts);
  });

  selectedUser: User | null = null;

  filteredStats = computed<UserTaskStats[]>(() => {
    const allStats = this.adminService.userTaskStats();
    const query = this.searchQuery.trim().toLowerCase();
    const dept = this.selectedDepartment;

    return allStats.filter((item) => {
      const matchesDept = dept === 'ALL' || item.user.department === dept;
      const matchesSearch =
        !query ||
        item.user.fullName.toLowerCase().includes(query) ||
        item.user.email.toLowerCase().includes(query) ||
        (item.user.department ? item.user.department.toLowerCase().includes(query) : false) ||
        (item.user.title ? item.user.title.toLowerCase().includes(query) : false);

      return matchesDept && matchesSearch;
    });
  });

  get selectedUserStats(): UserTaskStats | undefined {
    if (!this.selectedUser) return undefined;
    return this.adminService.userTaskStats().find((s) => s.user.id === this.selectedUser!.id);
  }

  get selectedUserTasks(): Task[] {
    if (!this.selectedUser) return [];
    return this.adminService.getUserTasks(this.selectedUser.id);
  }

  openUserDetails(user: User): void {
    this.selectedUser = user;
  }
}
