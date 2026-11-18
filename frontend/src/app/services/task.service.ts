import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Task, TaskPriority, TaskCategory, TaskStatus, TaskStats } from '../models/task.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private toastService = inject(ToastService);
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
      dueDate: '2026-11-14', // Overdue
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
      dueDate: '2026-11-12', // Overdue
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

  // Core state Signal
  tasks = signal<Task[]>(this.loadTasks());

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
    // Automatically save state on change
    effect(() => {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks()));
      } catch (e) {
        console.error('Failed to save tasks', e);
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

  addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>): Task {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: taskData.status === 'Completed',
      createdAt: new Date().toISOString(),
    };

    this.tasks.update((prev) => [newTask, ...prev]);
    this.toastService.show(`Task "${newTask.title}" created successfully!`, 'success');
    this.closeModal();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): void {
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
    this.toastService.show('Task updated successfully!', 'success');
    this.closeModal();
  }

  deleteTask(id: string): void {
    const target = this.tasks().find((t) => t.id === id);
    this.tasks.update((prev) => prev.filter((t) => t.id !== id));
    this.toastService.show(target ? `Deleted "${target.title}"` : 'Task deleted', 'info');
  }

  toggleComplete(id: string): void {
    this.tasks.update((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          return {
            ...t,
            completed: nextState,
            status: nextState ? 'Completed' : 'Pending',
          };
        }
        return t;
      })
    );
  }

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
    this.toastService.show(`Status updated to ${newStatus}`, 'info');
  }

  resetTasks(): void {
    this.tasks.set(this.initialTasks);
    this.toastService.show('Tasks reset to default sample dataset', 'info');
  }

  clearCompleted(): void {
    const count = this.tasks().filter((t) => t.status === 'Completed').length;
    if (count === 0) {
      this.toastService.show('No completed tasks to clear', 'info');
      return;
    }
    this.tasks.update((prev) => prev.filter((t) => t.status !== 'Completed'));
    this.toastService.show(`Cleared ${count} completed task(s)`, 'info');
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

