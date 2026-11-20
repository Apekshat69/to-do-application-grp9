import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, TaskPriority, TaskCategory, TaskStatus, TaskStats } from '../models/task.model';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

interface TaskResponse {
  success: boolean;
  message?: string;
  task?: Task;
  tasks?: Task[];
  stats?: TaskStats;
  deletedCount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  private readonly API_URL = `${environment.apiUrl}/tasks`;
  private readonly STORAGE_KEY = 'taskflow_ng_tasks_v20';

  private initialTasks: Task[] = [];

  // Core state Signals
  tasks = signal<Task[]>(this.loadTasks());
  isLoading = signal<boolean>(false);

  // Modal communication signals
  isModalOpen = signal<boolean>(false);
  editingTask = signal<Task | null>(null);
  defaultModalCategory = signal<TaskCategory>('Work');

  // Computed dynamic stats using Angular Signals
  stats = computed<TaskStats>(() => {
    const list = this.tasks();
    const total = list.length;
    const completed = list.filter((t) => t.status === 'Completed').length;
    const pending = list.filter((t) => t.status === 'Pending').length;
    const inProgress = list.filter((t) => t.status === 'In Progress').length;
    const overdue = list.filter((t) => this.isOverdue(t)).length;
    const today = list.filter((t) => this.isToday(t)).length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      today,
      progressPercentage,
    };
  });

  constructor() {
    // Automatically persist state changes to user-scoped localStorage cache
    effect(() => {
      try {
        const user = this.authService.currentUser();
        if (user?.id) {
          localStorage.setItem(`taskflow_ng_tasks_${user.id}`, JSON.stringify(this.tasks()));
        }
      } catch (e) {
        console.error('Failed to save tasks to cache', e);
      }
    });

    // Auto-fetch from backend whenever user is authenticated, or clear on logout
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      const user = this.authService.currentUser();
      if (isAuth && user?.id) {
        this.fetchTasks();
      } else {
        this.tasks.set([]);
      }
    });
  }

  private loadTasks(): Task[] {
    try {
      const user = this.authService.currentUser();
      if (!user?.id) return [];
      const saved = localStorage.getItem(`taskflow_ng_tasks_${user.id}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
    }
    return [];
  }

  getTodayString(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'Completed') return false;
    return task.dueDate < this.getTodayString();
  }

  isToday(task: Task): boolean {
    return task.dueDate === this.getTodayString();
  }

  isUpcoming(task: Task): boolean {
    if (!task.dueDate || task.status === 'Completed') return false;
    return task.dueDate > this.getTodayString();
  }

  // API: Fetch Tasks (GET /api/tasks or /api/admin/tasks)
  fetchTasks(): void {
    this.isLoading.set(true);
    const url = this.authService.isAdmin()
      ? `${environment.apiUrl}/admin/tasks`
      : this.API_URL;

    this.http.get<TaskResponse>(url).subscribe({
      next: (res) => {
        if (res.tasks && Array.isArray(res.tasks)) {
          this.tasks.set(res.tasks);
        } else {
          this.tasks.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.warn('[TaskService] Backend fetch failed:', err.message);
      },
    });
  }

  // API: Add Task (POST /api/tasks)
  addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>): void {
    this.isLoading.set(true);

    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate || null,
      priority: taskData.priority,
      category: taskData.category,
      status: taskData.status || 'Pending',
    };

    this.http.post<TaskResponse>(this.API_URL, payload).subscribe({
      next: (res) => {
        if (res.task) {
          this.tasks.update((prev) => [res.task!, ...prev]);
          this.toastService.show(res.message || `Task "${res.task.title}" created successfully!`, 'success');
          this.closeModal();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errMsg = err.error?.message || 'Failed to create task on backend.';
        this.toastService.show(errMsg, 'error');
      },
    });
  }

  // API: Update Task (PUT /api/tasks/:id)
  updateTask(id: string, updates: Partial<Task>): void {
    this.isLoading.set(true);

    const isAdmin = this.authService.isAdmin();
    const url = isAdmin && updates.status
      ? `${environment.apiUrl}/admin/tasks/${id}/status`
      : `${this.API_URL}/${id}`;

    const request$ = isAdmin && updates.status
      ? this.http.patch<TaskResponse>(url, { status: updates.status })
      : this.http.put<TaskResponse>(url, updates);

    request$.subscribe({
      next: (res) => {
        const updated = res.task;
        this.tasks.update((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              return updated || { ...t, ...updates };
            }
            return t;
          })
        );
        this.toastService.show(res.message || 'Task updated successfully!', 'success');
        this.closeModal();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errMsg = err.error?.message || 'Failed to update task.';
        this.toastService.show(errMsg, 'error');
      },
    });
  }

  // API: Delete Task (DELETE /api/tasks/:id)
  deleteTask(id: string): void {
    const target = this.tasks().find((t) => t.id === id);
    const url = this.authService.isAdmin()
      ? `${environment.apiUrl}/admin/tasks/${id}`
      : `${this.API_URL}/${id}`;

    this.http.delete<TaskResponse>(url).subscribe({
      next: (res) => {
        this.tasks.update((prev) => prev.filter((t) => t.id !== id));
        this.toastService.show(res.message || (target ? `Deleted "${target.title}"` : 'Task deleted'), 'info');
      },
      error: (err) => {
        const errMsg = err.error?.message || 'Failed to delete task.';
        this.toastService.show(errMsg, 'error');
      },
    });
  }

  // API: Toggle Complete (PATCH /api/tasks/:id/toggle)
  toggleComplete(id: string): void {
    const target = this.tasks().find((t) => t.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    const nextStatus = nextCompleted ? 'Completed' : 'Pending';

    this.http.patch<TaskResponse>(`${this.API_URL}/${id}/toggle`, {}).subscribe({
      next: (res) => {
        if (res.task) {
          this.tasks.update((prev) => prev.map((t) => (t.id === id ? res.task! : t)));
        } else {
          this.tasks.update((prev) =>
            prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted, status: nextStatus } : t))
          );
        }
      },
      error: (err) => {
        const errMsg = err.error?.message || 'Failed to toggle status.';
        this.toastService.show(errMsg, 'error');
      },
    });
  }

  // API: Update Status (PATCH /api/tasks/:id/status)
  updateStatus(id: string, newStatus: TaskStatus): void {
    this.http.patch<TaskResponse>(`${this.API_URL}/${id}/status`, { status: newStatus }).subscribe({
      next: (res) => {
        if (res.task) {
          this.tasks.update((prev) => prev.map((t) => (t.id === id ? res.task! : t)));
        } else {
          this.tasks.update((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: newStatus, completed: newStatus === 'Completed' } : t))
          );
        }
        this.toastService.show(`Status updated to ${newStatus}`, 'info');
      },
      error: (err) => {
        const errMsg = err.error?.message || 'Failed to update status.';
        this.toastService.show(errMsg, 'error');
      },
    });
  }

  // API: Reset Tasks (POST /api/tasks/reset)
  resetTasks(): void {
    this.http.post<TaskResponse>(`${this.API_URL}/reset`, {}).subscribe({
      next: (res) => {
        if (res.tasks) {
          this.tasks.set(res.tasks);
        } else {
          this.tasks.set([]);
        }
        this.toastService.show(res.message || 'Tasks reset', 'info');
      },
      error: (err) => {
        const errMsg = err.error?.message || 'Failed to reset tasks.';
        this.toastService.show(errMsg, 'error');
      },
    });
  }

  // API: Clear Completed (DELETE /api/tasks/completed)
  clearCompleted(): void {
    const count = this.tasks().filter((t) => t.status === 'Completed').length;
    if (count === 0) {
      this.toastService.show('No completed tasks to clear', 'info');
      return;
    }

    this.http.delete<TaskResponse>(`${this.API_URL}/completed`).subscribe({
      next: (res) => {
        this.tasks.update((prev) => prev.filter((t) => t.status !== 'Completed'));
        this.toastService.show(res.message || `Cleared ${count} completed task(s)`, 'info');
      },
      error: (err) => {
        const errMsg = err.error?.message || 'Failed to clear completed tasks.';
        this.toastService.show(errMsg, 'error');
      },
    });
  }

  // Modal helpers
  openCreateModal(defaultCategory: TaskCategory = 'Work'): void {
    this.editingTask.set(null);
    this.defaultModalCategory.set(defaultCategory);
    this.isModalOpen.set(true);
  }

  openEditModal(task: Task): void {
    this.editingTask.set(task);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingTask.set(null);
  }
}
