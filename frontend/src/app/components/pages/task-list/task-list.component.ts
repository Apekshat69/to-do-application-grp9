import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { Task, TaskPriority, TaskCategory, TaskStatus } from '../../../models/task.model';
import { TaskCardComponent } from '../../tasks/task-card/task-card.component';

type OrganizationFilter = 'all' | 'today' | 'upcoming' | 'completed' | 'pending' | 'overdue';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent],
  template: `
    <div class="space-y-6 animate-in fade-in duration-200">
      <!-- 6 Task Organization Tabs -->
      <div class="flex flex-wrap items-center gap-2 border-b border-gray-200/90 pb-4">
        @for (tab of organizationTabs; track tab.id) {
          <button
            type="button"
            (click)="activeOrgTab.set(tab.id)"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            [ngClass]="
              activeOrgTab() === tab.id
                ? 'bg-[#5243E4] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200/90 hover:bg-gray-50'
            "
          >
            <span>{{ tab.label }}</span>
            <span
              class="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
              [ngClass]="activeOrgTab() === tab.id ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'"
            >
              {{ getOrgTabCount(tab.id) }}
            </span>
          </button>
        }
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Live Search Input -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke-width="2"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2"></line>
            </svg>
          </div>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search tasks by title or description..."
            class="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:border-[#5243E4] focus:outline-none transition-all"
          />
          @if (searchQuery()) {
            <button
              type="button"
              (click)="searchQuery.set('')"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          }
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <!-- Priority Filter -->
          <select
            [ngModel]="selectedPriority()"
            (ngModelChange)="selectedPriority.set($event)"
            class="px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:border-[#5243E4] focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <!-- Category Filter -->
          <select
            [ngModel]="selectedCategory()"
            (ngModelChange)="selectedCategory.set($event)"
            class="px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:border-[#5243E4] focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Study">Study</option>
            <option value="Other">Other</option>
          </select>

          <!-- Status Filter -->
          <select
            [ngModel]="selectedStatus()"
            (ngModelChange)="selectedStatus.set($event)"
            class="px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:border-[#5243E4] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <!-- Sort Options -->
          <select
            [ngModel]="sortBy()"
            (ngModelChange)="sortBy.set($event)"
            class="px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:border-[#5243E4] focus:outline-none cursor-pointer"
          >
            <option value="dueDateAsc">Due Date (Earliest)</option>
            <option value="dueDateDesc">Due Date (Latest)</option>
            <option value="priorityDesc">Priority (High to Low)</option>
            <option value="titleAsc">Title (A-Z)</option>
          </select>

          <!-- Reset Button -->
          @if (hasActiveFilters()) {
            <button
              type="button"
              (click)="resetFilters()"
              class="p-2 text-gray-400 hover:text-[#5243E4] hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
              title="Reset All Filters"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          }
        </div>
      </div>

      <!-- Results Summary Counter -->
      <div class="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
        <span>
          Showing <span class="font-bold text-[#1E1B4B]">{{ filteredTasks().length }}</span> of {{ taskService.tasks().length }} tasks
        </span>
        @if (hasActiveFilters()) {
          <span class="text-[#5243E4] font-semibold">Filtered results</span>
        }
      </div>

      <!-- Task Cards List -->
      <div class="space-y-3">
        @for (task of filteredTasks(); track task.id) {
          <app-task-card [task]="task" />
        }

        @if (filteredTasks().length === 0) {
          <div class="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-3">
            <div class="w-12 h-12 rounded-xl bg-purple-50 text-[#5243E4] flex items-center justify-center mx-auto">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke-width="2"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2"></line>
              </svg>
            </div>
            <h3 class="text-sm font-bold text-gray-800">No tasks found</h3>
            <p class="text-xs text-gray-500 max-w-sm mx-auto">
              @if (hasActiveFilters()) {
                No tasks match your chosen filters or search query. Try clearing or relaxing some filters.
              } @else {
                Your task list in this tab is empty. Click "+ Add Task" to create one.
              }
            </p>
            <div class="pt-2 flex justify-center gap-2">
              @if (hasActiveFilters()) {
                <button
                  type="button"
                  (click)="resetFilters()"
                  class="px-4 py-2 text-xs font-bold text-[#5243E4] bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              } @else {
                <button
                  type="button"
                  (click)="taskService.openCreateModal()"
                  class="px-4 py-2 text-xs font-bold text-white bg-[#5243E4] hover:bg-[#4332D4] rounded-xl shadow-button transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span>Create Task</span>
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class TaskListComponent implements OnInit {
  taskService = inject(TaskService);
  private route = inject(ActivatedRoute);

  activeOrgTab = signal<OrganizationFilter>('all');
  searchQuery = signal<string>('');
  selectedPriority = signal<string>('all');
  selectedCategory = signal<string>('all');
  selectedStatus = signal<string>('all');
  sortBy = signal<string>('dueDateAsc');

  organizationTabs: { id: OrganizationFilter; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'today', label: "Today's Tasks" },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'overdue', label: 'Overdue' },
  ];

  ngOnInit(): void {
    // Check if category or tab was passed via query params
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      if (params['tab']) {
        this.activeOrgTab.set(params['tab']);
      }
    });
  }

  getOrgTabCount(tab: OrganizationFilter): number {
    const all = this.taskService.tasks();
    switch (tab) {
      case 'all':
        return all.length;
      case 'today':
        return all.filter((t) => this.taskService.isToday(t)).length;
      case 'upcoming':
        return all.filter((t) => this.taskService.isUpcoming(t)).length;
      case 'completed':
        return all.filter((t) => t.status === 'Completed').length;
      case 'pending':
        return all.filter((t) => t.status === 'Pending').length;
      case 'overdue':
        return all.filter((t) => this.taskService.isOverdue(t)).length;
    }
  }

  hasActiveFilters = computed(() => {
    return (
      this.activeOrgTab() !== 'all' ||
      this.searchQuery().trim() !== '' ||
      this.selectedPriority() !== 'all' ||
      this.selectedCategory() !== 'all' ||
      this.selectedStatus() !== 'all'
    );
  });

  filteredTasks = computed(() => {
    const all = this.taskService.tasks();
    const tab = this.activeOrgTab();
    const query = this.searchQuery().toLowerCase().trim();
    const priority = this.selectedPriority();
    const category = this.selectedCategory();
    const status = this.selectedStatus();
    const sort = this.sortBy();

    const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

    return all
      .filter((t) => {
        // Tab filter
        if (tab === 'today' && !this.taskService.isToday(t)) return false;
        if (tab === 'upcoming' && !this.taskService.isUpcoming(t)) return false;
        if (tab === 'completed' && t.status !== 'Completed') return false;
        if (tab === 'pending' && t.status !== 'Pending') return false;
        if (tab === 'overdue' && !this.taskService.isOverdue(t)) return false;

        // Priority filter
        if (priority !== 'all' && t.priority !== priority) return false;

        // Category filter
        if (category !== 'all' && t.category !== category) return false;

        // Status filter
        if (status !== 'all' && t.status !== status) return false;

        // Search query
        if (query) {
          const inTitle = t.title.toLowerCase().includes(query);
          const inDesc = t.description?.toLowerCase().includes(query);
          if (!inTitle && !inDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === 'dueDateAsc') {
          return (a.dueDate || '').localeCompare(b.dueDate || '');
        }
        if (sort === 'dueDateDesc') {
          return (b.dueDate || '').localeCompare(a.dueDate || '');
        }
        if (sort === 'priorityDesc') {
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        }
        if (sort === 'titleAsc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  });

  resetFilters(): void {
    this.activeOrgTab.set('all');
    this.searchQuery.set('');
    this.selectedPriority.set('all');
    this.selectedCategory.set('all');
    this.selectedStatus.set('all');
    this.sortBy.set('dueDateAsc');
  }
}

