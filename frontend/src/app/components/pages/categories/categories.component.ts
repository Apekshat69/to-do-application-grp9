import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../services/task.service';
import { TaskCategory } from '../../../models/task.model';
import { TaskCardComponent } from '../../tasks/task-card/task-card.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  template: `
    <div class="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <!-- 4 Category Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        @for (cat of categories; track cat.id) {
          <div
            (click)="selectCategory(cat.id)"
            class="bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
            [ngClass]="
              selectedCategory() === cat.id
                ? 'border-[#5243E4] ring-2 ring-[#5243E4]/15 bg-purple-50/20'
                : 'border-gray-200/80 hover:border-purple-200'
            "
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" [ngClass]="cat.badgeBg">
                  <span class="text-base">{{ cat.icon }}</span>
                </div>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {{ getCategoryTotal(cat.id) }} tasks
                </span>
              </div>

              <h3 class="text-base font-bold text-[#1E1B4B]">{{ cat.label }}</h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {{ cat.description }}
              </p>
            </div>

            <!-- Stats Footer -->
            <div class="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
              <div class="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                <span>Completed: {{ getCategoryCompleted(cat.id) }}/{{ getCategoryTotal(cat.id) }}</span>
                <span class="text-[#5243E4] font-bold">{{ getCategoryPercentage(cat.id) }}%</span>
              </div>
              <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#5243E4] rounded-full transition-all duration-300"
                  [style.width.%]="getCategoryPercentage(cat.id)"
                ></div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Category Filter Tabs & Actions -->
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-3">
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              (click)="selectedCategory.set('All')"
              class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              [ngClass]="
                selectedCategory() === 'All'
                  ? 'bg-[#5243E4] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              "
            >
              All Categories ({{ taskService.tasks().length }})
            </button>

            @for (cat of categories; track cat.id) {
              <button
                type="button"
                (click)="selectedCategory.set(cat.id)"
                class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                [ngClass]="
                  selectedCategory() === cat.id
                    ? 'bg-[#5243E4] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                "
              >
                {{ cat.label }} ({{ getCategoryTotal(cat.id) }})
              </button>
            }
          </div>

          <button
            type="button"
            (click)="onAddCategoryTask()"
            class="flex items-center gap-1.5 text-xs font-bold text-[#5243E4] hover:text-[#4332D4] px-3 py-1.5 rounded-xl hover:bg-purple-50 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Add Task to {{ selectedCategory() === 'All' ? 'Work' : selectedCategory() }}</span>
          </button>
        </div>

        <!-- Task List -->
        <div class="space-y-3">
          @for (task of categoryTasks(); track task.id) {
            <app-task-card [task]="task" />
          }

          @if (categoryTasks().length === 0) {
            <div class="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center space-y-2">
              <p class="text-xs text-gray-500 font-medium">
                No tasks currently in the {{ selectedCategory() }} category.
              </p>
              <button
                type="button"
                (click)="onAddCategoryTask()"
                class="text-xs font-bold text-[#5243E4] hover:underline cursor-pointer"
              >
                + Add task to {{ selectedCategory() }}
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class CategoriesComponent {
  taskService = inject(TaskService);

  selectedCategory = signal<TaskCategory | 'All'>('All');

  categories = [
    {
      id: 'Work' as TaskCategory,
      label: 'Work',
      description: 'Professional deliverables, sprints, code reviews, and meetings',
      icon: '💼',
      badgeBg: 'bg-blue-50 text-blue-700',
    },
    {
      id: 'Personal' as TaskCategory,
      label: 'Personal',
      description: 'Health, habits, recreation, daily chores, and lifestyle',
      icon: '🧘',
      badgeBg: 'bg-rose-50 text-rose-700',
    },
    {
      id: 'Study' as TaskCategory,
      label: 'Study',
      description: 'Coursework, tutorials, programming challenges, and reading',
      icon: '📚',
      badgeBg: 'bg-purple-50 text-[#5243E4]',
    },
    {
      id: 'Other' as TaskCategory,
      label: 'Other',
      description: 'General miscellaneous tasks and ad-hoc reminders',
      icon: '🏷️',
      badgeBg: 'bg-slate-100 text-slate-700',
    },
  ];

  categoryTasks = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'All') {
      return this.taskService.tasks();
    }
    return this.taskService.tasks().filter((t) => t.category === cat);
  });

  selectCategory(id: TaskCategory): void {
    this.selectedCategory.set(this.selectedCategory() === id ? 'All' : id);
  }

  getCategoryTotal(id: TaskCategory): number {
    return this.taskService.tasks().filter((t) => t.category === id).length;
  }

  getCategoryCompleted(id: TaskCategory): number {
    return this.taskService.tasks().filter((t) => t.category === id && t.status === 'Completed').length;
  }

  getCategoryPercentage(id: TaskCategory): number {
    const total = this.getCategoryTotal(id);
    if (total === 0) return 0;
    return Math.round((this.getCategoryCompleted(id) / total) * 100);
  }

  onAddCategoryTask(): void {
    const cat = this.selectedCategory() === 'All' ? 'Work' : this.selectedCategory();
    this.taskService.openCreateModal(cat as TaskCategory);
  }
}

