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

  private initialTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Finish project report',
      description: 'Compile quarterly performance metrics, frontend benchmarks, and deliverables summary.',
      dueDate: '2026-11-18',
      priority: 'High',
      category: 'Work',
      status: 'In Progress',
      completed: false,
      createdAt: '2026-11-16T09:00:00Z',
    },
    {
      id: 'task-2',
      title: 'Study Angular 20 & signals architecture',
      description: 'Review standalone component tree, signal stores, reactive forms, and routing guards.',
      dueDate: '2026-11-18',
      priority: 'Medium',
      category: 'Study',
      status: 'Completed',
      completed: true,
      createdAt: '2026-11-15T11:30:00Z',
    },
    {
      id: 'task-3',
      title: 'Go for a 30-minute evening walk',
      description: 'Refresh and take a break around the community park after the afternoon sprint.',
      dueDate: '2026-11-19',
      priority: 'Low',
      category: 'Personal',
      status: 'Pending',
      completed: false,
      createdAt: '2026-11-17T14:20:00Z',
    },
    {
      id: 'task-4',
      title: 'Read Chapter 4 of Atomic Habits',
      description: 'Focus on habit stacking and environmental cues for high productivity.',
      dueDate: '2026-11-14',
      priority: 'Low',
      category: 'Personal',
      status: 'Pending',
      completed: false,
      createdAt: '2026-11-10T10:00:00Z',
    },
    {
      id: 'task-5',
      title: 'Plan sprint deliverables',
      description: 'Map out roadmap milestones, team priorities, and ticket estimates.',
      dueDate: '2026-11-20',
      priority: 'Medium',
      category: 'Work',
      status: 'Pending',
      completed: false,
      createdAt: '2026-11-17T16:45:00Z',
    },
    {
      id: 'task-6',
      title: 'Review team pull requests',
      description: 'Inspect UI component refactoring, accessibility labels, and responsive layout styling.',
      dueDate: '2026-11-18',
      priority: 'High',
      category: 'Work',
      status: 'Completed',
      completed: true,
      createdAt: '2026-11-17T08:30:00Z',
    },
    {
      id: 'task-7',
      title: 'Data Structures practice set',
      description: 'Solve 3 graph traversal and dynamic programming algorithmic challenges.',
      dueDate: '2026-11-21',
      priority: 'Medium',
      category: 'Study',
      status: 'In Progress',
      completed: false,
      createdAt: '2026-11-16T18:00:00Z',
    },
    {
      id: 'task-8',
      title: 'Doctor annual health checkup',
      description: 'Routine general wellness exam and prescription renewal at Central Clinic.',
      dueDate: '2026-11-12',
      priority: 'High',
      category: 'Other',
      status: 'Pending',
      completed: false,
      createdAt: '2026-11-08T12:00:00Z',
    },
    {
      id: 'task-9',
      title: 'Clean workspace desk setup',
      description: 'Organize monitor cables, wipe keyboard, and declutter physical notebooks.',
      dueDate: '2026-11-19',
      priority: 'Low',
      category: 'Other',
      status: 'Completed',
      completed: true,
      createdAt: '2026-11-17T19:15:00Z',
    },
    {
      id: 'task-10',
      title: 'Prepare demo architecture presentation',
      description: 'Synthesize architecture diagrams, feature flowcharts, and component hierarchy.',
      dueDate: '2026-11-22',
      priority: 'High',
      category: 'Work',
      status: 'In Progress',
      completed: false,
      createdAt: '2026-11-18T09:30:00Z',
    },
  ];

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
    // Automatically persist state changes to localStorage as offline cache
    effect(() => {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks()));
      } catch (e) {
        console.error('Failed to save tasks to cache', e);
      }
    });

    // Auto-fetch from backend whenever user is authenticated
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.fetchTasks();
      }
    });
  }

  private loadTasks(): Task[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
    }
    return this.initialTasks;
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

  // API: Fetch Tasks (GET /api/tasks)
  fetchTasks(): void {
    this.isLoading.set(true);
    this.http.get<TaskResponse>(this.API_URL).subscribe({
      next: (res) => {
        if (res.tasks && Array.isArray(res.tasks)) {
          this.tasks.set(res.tasks);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.warn('[TaskService] Backend fetch failed, utilizing cached state:', err.message);
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
        const newTask = res.task || {
          ...taskData,
          id: `task-${Date.now()}`,
          completed: taskData.status === 'Completed',
          createdAt: new Date().toISOString(),
        };

        this.tasks.update((prev) => [newTask, ...prev]);
        this.toastService.show(res.message || `Task "${newTask.title}" created successfully!`, 'success');
        this.closeModal();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errMsg = err.error?.message || 'Failed to create task on backend. Saved to local cache.';
        this.toastService.show(errMsg, 'error');

        // Local fallback if server unreachable
        const fallbackTask: Task = {
          ...taskData,
          id: `task-${Date.now()}`,
          completed: taskData.status === 'Completed',
          createdAt: new Date().toISOString(),
        };
        this.tasks.update((prev) => [fallbackTask, ...prev]);
        this.closeModal();
      },
    });
  }

  // API: Update Task (PUT /api/tasks/:id)
  updateTask(id: string, updates: Partial<Task>): void {
    this.isLoading.set(true);

    this.http.put<TaskResponse>(`${this.API_URL}/${id}`, updates).subscribe({
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
        const errMsg = err.error?.message || 'Failed to update task on backend. Updated locally.';
        this.toastService.show(errMsg, 'error');

        // Local fallback
        this.tasks.update((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              const merged = { ...t, ...updates };
              if (updates.status) {
                merged.completed = updates.status === 'Completed';
              }
              return merged;
            }
            return t;
          })
        );
        this.closeModal();
      },
    });
  }

  // API: Delete Task (DELETE /api/tasks/:id)
  deleteTask(id: string): void {
    const target = this.tasks().find((t) => t.id === id);

    this.http.delete<TaskResponse>(`${this.API_URL}/${id}`).subscribe({
      next: (res) => {
        this.tasks.update((prev) => prev.filter((t) => t.id !== id));
        this.toastService.show(res.message || (target ? `Deleted "${target.title}"` : 'Task deleted'), 'info');
      },
      error: () => {
        // Fallback local deletion
        this.tasks.update((prev) => prev.filter((t) => t.id !== id));
        this.toastService.show(target ? `Deleted "${target.title}" (local cache)` : 'Task deleted', 'info');
      },
    });
  }

  // API: Toggle Complete (PATCH /api/tasks/:id/toggle)
  toggleComplete(id: string): void {
    const target = this.tasks().find((t) => t.id === id);
    const nextCompleted = target ? !target.completed : true;

    // Optimistic UI update
    this.tasks.update((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'Completed' : 'Pending',
          };
        }
        return t;
      })
    );

    this.http.patch<TaskResponse>(`${this.API_URL}/${id}/toggle`, {}).subscribe({
      next: (res) => {
        if (res.task) {
          this.tasks.update((prev) => prev.map((t) => (t.id === id ? res.task! : t)));
        }
      },
      error: () => {
        // Optimistic UI already handled locally
      },
    });
  }

  // API: Update Status (PATCH /api/tasks/:id/status)
  updateStatus(id: string, newStatus: TaskStatus): void {
    this.tasks.update((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            status: newStatus,
            completed: newStatus === 'Completed',
          };
        }
        return t;
      })
    );

    this.http.patch<TaskResponse>(`${this.API_URL}/${id}/status`, { status: newStatus }).subscribe({
      next: (res) => {
        if (res.task) {
          this.tasks.update((prev) => prev.map((t) => (t.id === id ? res.task! : t)));
        }
        this.toastService.show(`Status updated to ${newStatus}`, 'info');
      },
      error: () => {
        this.toastService.show(`Status updated to ${newStatus} (cached)`, 'info');
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
          this.tasks.set(this.initialTasks);
        }
        this.toastService.show(res.message || 'Tasks reset to default sample dataset', 'info');
      },
      error: () => {
        this.tasks.set(this.initialTasks);
        this.toastService.show('Tasks reset to default sample dataset', 'info');
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
      error: () => {
        this.tasks.update((prev) => prev.filter((t) => t.status !== 'Completed'));
        this.toastService.show(`Cleared ${count} completed task(s)`, 'info');
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
