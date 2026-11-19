export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskCategory = 'Work' | 'Personal' | 'Study' | 'Other';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD format
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  completed: boolean;
  createdAt: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  today: number;
  progressPercentage: number;
}

export interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  overallCompletionRate: number;
}
