import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { PriorityBadgeComponent } from '../priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { CategoryBadgeComponent } from '../category-badge/category-badge.component';
import { FormatDueDatePipe } from '../../../pipes/time-ago.pipe';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
    PriorityBadgeComponent,
    StatusBadgeComponent,
    CategoryBadgeComponent,
    FormatDueDatePipe,
  ],
  template: `
    <div
      class="group bg-white rounded-xl border p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-md"
      [ngClass]="{
        'bg-gray-50/50 border-gray-200 opacity-80': task.status === 'Completed',
        'border-rose-200/80 hover:border-rose-300': isOverdue && task.status !== 'Completed',
        'border-gray-200 hover:border-[#5243E4]/30': !isOverdue && task.status !== 'Completed'
      }"
    >
      <div class="flex items-start gap-3.5">
        <!-- Checkbox -->
        <button
          type="button"
          (click)="onToggleComplete()"
          class="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer"
          [ngClass]="
            task.completed
              ? 'bg-[#5243E4] border-[#5243E4] text-white'
              : 'border-gray-300 hover:border-[#5243E4] bg-white'
          "
          [attr.aria-label]="task.completed ? 'Mark pending' : 'Mark completed'"
        >
          @if (task.completed) {
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
            </svg>
          }
        </button>

        <!-- Center Content -->
        <div class="flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
            <h3
              class="text-sm sm:text-base font-semibold text-[#1E1B4B] tracking-tight leading-snug transition-colors"
              [ngClass]="{
                'line-through text-gray-400': task.completed,
                'group-hover:text-[#5243E4]': !task.completed
              }"
            >
              {{ task.title }}
            </h3>

            <!-- Actions Toolbar -->
            <div class="flex items-center gap-1 shrink-0 self-end sm:self-auto pt-1 sm:pt-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                (click)="onEdit()"
                class="p-1.5 text-gray-400 hover:text-[#5243E4] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                title="Edit Task"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                type="button"
                (click)="onDelete()"
                class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete Task"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Description -->
          @if (task.description) {
            <p
              class="text-xs sm:text-sm mt-1 leading-relaxed"
              [ngClass]="task.completed ? 'text-gray-400' : 'text-gray-600'"
            >
              {{ task.description }}
            </p>
          }

          <!-- Metadata Badges Row -->
          <div class="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-gray-100">
            <!-- Interactive Status Badge -->
            <app-status-badge
              [status]="task.status"
              [interactive]="true"
              (statusChange)="onStatusChange($event)"
            />

            <!-- Priority Badge -->
            <app-priority-badge [priority]="task.priority" size="xs" />

            <!-- Category Badge -->
            <app-category-badge [category]="task.category" size="xs" />

            <!-- Due Date Badge -->
            <div
              class="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-md font-medium"
              [ngClass]="
                isOverdue
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'text-gray-500 bg-gray-50 border border-gray-200'
              "
            >
              @if (isOverdue) {
                <svg class="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                  <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"></line>
                </svg>
                <span>Overdue: {{ task.dueDate | formatDueDate }}</span>
              } @else {
                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6" stroke-width="2"></line>
                  <line x1="8" y1="2" x2="8" y2="6" stroke-width="2"></line>
                  <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"></line>
                </svg>
                <span>Due: {{ task.dueDate | formatDueDate }}</span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;

  private taskService = inject(TaskService);

  get isOverdue(): boolean {
    return this.taskService.isOverdue(this.task);
  }

  onToggleComplete(): void {
    this.taskService.toggleComplete(this.task.id);
  }

  onStatusChange(status: TaskStatus): void {
    this.taskService.updateStatus(this.task.id, status);
  }

  onEdit(): void {
    this.taskService.openEditModal(this.task);
  }

  onDelete(): void {
    this.taskService.deleteTask(this.task.id);
  }
}

