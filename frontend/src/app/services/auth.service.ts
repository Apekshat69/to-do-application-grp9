import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private toastService = inject(ToastService);

  private readonly AUTH_KEY = 'taskflow_ng_auth';
  private readonly USER_KEY = 'taskflow_ng_user';
  private readonly USERS_LIST_KEY = 'taskflow_ng_registered_users';

  private defaultUser: User = {
    id: 'user-1',
    name: 'Alex',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@taskflow.dev',
    role: 'user',
    title: 'Frontend Developer',
    department: 'Engineering',
    status: 'Active',
    joinedDate: 'Jan 15, 2026',
    avatar: 'A',
  };

  private defaultAdmin: User = {
    id: 'admin-1',
    name: 'Admin',
    fullName: 'TaskFlow Administrator',
    email: 'admin@taskflow.dev',
    role: 'admin',
    title: 'System Administrator',
    department: 'Operations',
    status: 'Active',
    joinedDate: 'Oct 01, 2025',
    avatar: 'AD',
  };

  currentUser = signal<User>(this.loadUser());
  isAuthenticated = signal<boolean>(this.loadAuth());
  registeredUsers = signal<User[]>(this.loadRegisteredUsers());

  // Computed role checks
  isAdmin = computed(() => this.isAuthenticated() && this.currentUser()?.role === 'admin');
  isUser = computed(() => this.isAuthenticated() && this.currentUser()?.role === 'user');

  constructor() {
    // Automatically persist state changes to localStorage
    effect(() => {
      try {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(this.isAuthenticated()));
        localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser()));
        localStorage.setItem(this.USERS_LIST_KEY, JSON.stringify(this.registeredUsers()));
      } catch (e) {
        console.error('Failed to save auth state', e);
      }
    });
  }

  private loadAuth(): boolean {
    try {
      const saved = localStorage.getItem(this.AUTH_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  }

  private loadUser(): User {
    try {
      const saved = localStorage.getItem(this.USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return this.defaultUser;
  }

  private loadRegisteredUsers(): User[] {
    try {
      const saved = localStorage.getItem(this.USERS_LIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [this.defaultUser];
  }

  private registerUserIfNew(user: User): void {
    this.registeredUsers.update((prev) => {
      if (!prev.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
        return [...prev, user];
      }
      return prev;
    });
  }

  // Standard User Login
  login(email: string, password?: string, fullName?: string): boolean {
    const derivedName = fullName ? fullName.split(' ')[0] : email.split('@')[0];
    const user: User = {
      id: `user-${Date.now()}`,
      name: derivedName || 'Alex',
      fullName: fullName || email.split('@')[0] || 'Alex Morgan',
      email: email,
      role: 'user',
      title: 'Frontend Developer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: 'Jan 15, 2026',
      avatar: (derivedName || 'A')[0].toUpperCase(),
    };

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    this.registerUserIfNew(user);
    this.toastService.show(`Welcome back, ${user.name}!`, 'success');
    this.router.navigate(['/dashboard']);
    return true;
  }

  // Dedicated Admin Login
  loginAdmin(email: string, password?: string, fullName?: string): boolean {
    const adminUser: User = {
      ...this.defaultAdmin,
      email: email || 'admin@taskflow.dev',
      fullName: fullName || 'TaskFlow Administrator',
      role: 'admin',
    };

    this.currentUser.set(adminUser);
    this.isAuthenticated.set(true);
    this.toastService.show('Admin authentication successful! Access granted.', 'success');
    this.router.navigate(['/admin/dashboard']);
    return true;
  }

  signup(fullName: string, email: string, password?: string): boolean {
    const firstName = fullName.trim().split(' ')[0] || 'User';
    const user: User = {
      id: `user-${Date.now()}`,
      name: firstName,
      fullName: fullName.trim(),
      email: email.trim(),
      role: 'user',
      title: 'Product Member',
      department: 'Product',
      status: 'Active',
      joinedDate: 'Nov 19, 2026',
      avatar: firstName[0].toUpperCase(),
    };

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    this.registerUserIfNew(user);
    this.toastService.show(`Account created! Welcome, ${firstName}.`, 'success');
    this.router.navigate(['/dashboard']);
    return true;
  }

  logout(redirectRoute?: string): void {
    const target = redirectRoute || (this.isAdmin() ? '/admin/login' : '/login');
    this.isAuthenticated.set(false);
    this.toastService.show('You have been logged out.', 'info');
    this.router.navigate([target]);
  }

  updateProfile(name: string, email: string, role: string): void {
    this.currentUser.update((u) => ({
      ...u,
      fullName: name,
      name: name.split(' ')[0],
      email,
      title: role,
      avatar: name[0].toUpperCase(),
    }));
    this.toastService.show('Profile updated successfully!', 'success');
  }
}
