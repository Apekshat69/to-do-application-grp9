import { Component, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { TaskPriority, TaskCategory, TaskStatus } from '../../../models/task.model';

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (taskService.isModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          (click)="onClose()"
        ></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/60">
              <div>
                <h2 class="text-base font-bold text-[#1E1B4B]">
                  {{ isEditing ? 'Edit Task' : 'Create New Task' }}
                </h2>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ isEditing ? 'Update task attributes and status' : 'Add a new item to your task backlog' }}
                </p>
              </div>
              <button
                type="button"
                (click)="onClose()"
                class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Reactive Form -->
            <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
              <!-- Task Title -->
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">
                  Task Title <span class="text-[#5243E4]">*</span>
                </label>
                <input
                  type="text"
                  formControlName="title"
                  placeholder="e.g. Complete quarterly performance report"
                  class="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none transition-all"
                  [ngClass]="{
                    'border-rose-400 focus:ring-2 focus:ring-rose-100': titleControl?.invalid && (titleControl?.touched || submitted),
                    'border-gray-200 focus:border-[#5243E4] focus:ring-2 focus:ring-[#5243E4]/15': !titleControl?.invalid || (!titleControl?.touched && !submitted)
                  }"
                  autofocus
                />
                @if (titleControl?.invalid && (titleControl?.touched || submitted)) {
                  <p class="text-rose-500 text-xs mt-1 font-medium">
                    @if (titleControl?.errors?.['required']) {
                      Task title is required
                    } @else if (titleControl?.errors?.['minlength']) {
                      Title must be at least 2 characters
                    }
                  </p>
                }
              </div>

              <!-- Description -->
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">
                  Description <span class="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  formControlName="description"
                  rows="3"
                  placeholder="Add details, background notes, or checklist steps..."
                  class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#5243E4] focus:ring-2 focus:ring-[#5243E4]/15 focus:outline-none bg-white transition-all resize-none"
                ></textarea>
              </div>

              <!-- Due Date & Priority Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Due Date -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    formControlName="dueDate"
                    class="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#5243E4] focus:outline-none bg-white"
                  />
                </div>

                <!-- Priority -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5">Priority</label>
                  <div class="flex items-center gap-1.5">
                    @for (p of priorityOptions; track p) {
                      <button
                        type="button"
                        (click)="taskForm.patchValue({ priority: p })"
                        class="flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                        [ngClass]="
                          taskForm.value.priority === p
                            ? 'bg-[#5243E4] text-white border-[#5243E4] shadow-xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        "
                      >
                        {{ p }}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Category & Status Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <!-- Category -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5">Category</label>
                  <select
                    formControlName="category"
                    class="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#5243E4] focus:outline-none bg-white cursor-pointer"
                  >
                    @for (c of categoryOptions; track c) {
                      <option [value]="c">{{ c }}</option>
                    }
                  </select>
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5">Status</label>
                  <select
                    formControlName="status"
                    class="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#5243E4] focus:outline-none bg-white cursor-pointer"
                  >
                    @for (s of statusOptions; track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Modal Footer Actions -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  (click)="onClose()"
                  class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-5 py-2 text-xs font-bold bg-[#5243E4] hover:bg-[#4332D4] text-white rounded-xl shadow-button transition-all cursor-pointer"
                >
                  {{ isEditing ? 'Save Changes' : 'Create Task' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export class TaskFormModalComponent implements OnInit {
  taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  taskForm!: FormGroup;
  submitted = false;

  priorityOptions: TaskPriority[] = ['Low', 'Medium', 'High'];
  categoryOptions: TaskCategory[] = ['Work', 'Personal', 'Study', 'Other'];
  statusOptions: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

  get isEditing(): boolean {
    return !!this.taskService.editingTask();
  }

  get titleControl() {
    return this.taskForm.get('title');
  }

  constructor() {
    this.initForm();

    // Effect to update form values when modal opens or editingTask changes
    effect(() => {
      const task = this.taskService.editingTask();
      const isOpen = this.taskService.isModalOpen();

      if (isOpen) {
        this.submitted = false;
        if (task) {
          this.taskForm.patchValue({
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate || this.taskService.getTodayString(),
            priority: task.priority || 'Medium',
            category: task.category || 'Work',
            status: task.status || 'Pending',
          });
        } else {
          this.taskForm.reset({
            title: '',
            description: '',
            dueDate: this.taskService.getTodayString(),
            priority: 'Medium',
            category: this.taskService.defaultModalCategory(),
            status: 'Pending',
          });
        }
      }
    });
  }

  ngOnInit(): void {}

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      dueDate: [this.taskService.getTodayString(), Validators.required],
      priority: ['Medium', Validators.required],
      category: ['Work', Validators.required],
      status: ['Pending', Validators.required],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.taskForm.invalid) {
      return;
    }

    const val = this.taskForm.value;
    const editing = this.taskService.editingTask();

    if (editing) {
      this.taskService.updateTask(editing.id, {
        title: val.title.trim(),
        description: val.description?.trim() || '',
        dueDate: val.dueDate,
        priority: val.priority,
        category: val.category,
        status: val.status,
      });
    } else {
      this.taskService.addTask({
        title: val.title.trim(),
        description: val.description?.trim() || '',
        dueDate: val.dueDate,
        priority: val.priority,
        category: val.category,
        status: val.status,
      });
    }
  }

  onClose(): void {
    this.taskService.closeModal();
  }
}

