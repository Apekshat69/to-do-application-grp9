import { Injectable, signal, computed, inject } from '@angular/core';
import { User, UserTaskStats } from '../models/user.model';
import { Task, TaskStatus, AdminStats } from '../models/task.model';
import { TaskService } from './task.service';
import { AuthService } from './auth.service';

export interface MonthlyActivityPoint {
  month: string;
  created: number;
  completed: number;
}

export interface StatusSlice {
  label: TaskStatus;
  count: number;
  percentage: number;
  color: string;
  dotColor: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);

  // Directly leverage real application tasks & users (No mock or fake data generated)
  tasks = computed<Task[]>(() => this.taskService.tasks());
  users = computed<User[]>(() => this.authService.registeredUsers());

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

  // Computed overall admin statistics derived strictly from real application tasks
  adminStats = computed<AdminStats>(() => {
    const taskList = this.tasks();
    const userList = this.users();

    const totalUsers = userList.length;
    const totalTasks = taskList.length;
    const pendingTasks = taskList.filter((t) => t.status === 'Pending').length;
    const inProgressTasks = taskList.filter((t) => t.status === 'In Progress').length;
    const completedTasks = taskList.filter((t) => t.status === 'Completed').length;
    const overdueTasks = taskList.filter((t) => this.isOverdue(t)).length;
    const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalUsers,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      overallCompletionRate,
    };
  });

  // Real task status breakdown for the Doughnut Chart
  statusDoughnut = computed<{ slices: StatusSlice[]; total: number; hasData: boolean }>(() => {
    const list = this.tasks();
    const total = list.length;
    if (total === 0) {
      return { slices: [], total: 0, hasData: false };
    }

    const pending = list.filter((t) => t.status === 'Pending').length;
    const inProgress = list.filter((t) => t.status === 'In Progress').length;
    const completed = list.filter((t) => t.status === 'Completed').length;

    const slices: StatusSlice[] = [
      {
        label: 'Completed',
        count: completed,
        percentage: Math.round((completed / total) * 100),
        color: '#10B981', // emerald-500
        dotColor: 'bg-emerald-500',
      },
      {
        label: 'In Progress',
        count: inProgress,
        percentage: Math.round((inProgress / total) * 100),
        color: '#5243E4', // primary purple
        dotColor: 'bg-[#5243E4]',
      },
      {
        label: 'Pending',
        count: pending,
        percentage: Math.round((pending / total) * 100),
        color: '#94A3B8', // slate-400
        dotColor: 'bg-slate-400',
      },
    ];

    return { slices, total, hasData: true };
  });

  // Real Monthly Activity aggregation from actual task creation dates (No fabricated numbers)
  monthlyActivity = computed<MonthlyActivityPoint[]>(() => {
    const list = this.tasks();
    if (list.length === 0) return [];

    const monthMap = new Map<string, { created: number; completed: number }>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    list.forEach((t) => {
      let d: Date;
      try {
        d = t.createdAt ? new Date(t.createdAt) : new Date();
        if (isNaN(d.getTime())) d = new Date();
      } catch {
        d = new Date();
      }
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const curr = monthMap.get(key) || { created: 0, completed: 0 };
      curr.created += 1;
      if (t.status === 'Completed') {
        curr.completed += 1;
      }
      monthMap.set(key, curr);
    });

    const points: MonthlyActivityPoint[] = [];
    monthMap.forEach((val, month) => {
      points.push({ month, created: val.created, completed: val.completed });
    });

    return points;
  });

  // Computed per-user statistics derived from real user registrations and tasks
  userTaskStats = computed<UserTaskStats[]>(() => {
    const userList = this.users();
    const taskList = this.tasks();

    return userList.map((user) => {
      // Find tasks assigned to this user, or assign to primary user if not explicitly mapped
      const userTasks = taskList.filter((t) => t.userId === user.id || (!t.userId && user.role === 'user'));
      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter((t) => t.status === 'Completed').length;
      const pendingTasks = userTasks.filter((t) => t.status === 'Pending').length;
      const inProgressTasks = userTasks.filter((t) => t.status === 'In Progress').length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        user,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        progressPercentage,
      };
    });
  });

  // Real admin actions modifying real application task state
  updateTaskStatus(taskId: string, newStatus: TaskStatus): void {
    this.taskService.updateTask(taskId, {
      status: newStatus,
      completed: newStatus === 'Completed',
    });
  }

  deleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId);
  }

  getUserTasks(userId: string): Task[] {
    return this.tasks().filter((t) => t.userId === userId || (!t.userId && this.users().find((u) => u.id === userId)?.role === 'user'));
  }
}
