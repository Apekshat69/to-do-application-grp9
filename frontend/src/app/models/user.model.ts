export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  fullName: string;
  email: string;
  role: UserRole;
  title?: string;
  department?: string;
  status?: 'Active' | 'Inactive';
  joinedDate?: string;
  avatar?: string;
}

export interface UserTaskStats {
  user: User;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  progressPercentage: number;
}
