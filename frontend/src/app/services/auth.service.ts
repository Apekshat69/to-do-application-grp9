import { Injectable, signal, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private toastService = inject(ToastService);

  private readonly AUTH_KEY = 'taskflow_ng_auth';
  private readonly USER_KEY = 'taskflow_ng_user';

  private defaultUser: User = {
    id: 'user-1',
    name: 'Alex',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@taskflow.dev',
    role: 'Frontend Developer',
    avatar: 'A',
  };

  currentUser = signal<User>(this.loadUser());
  isAuthenticated = signal<boolean>(this.loadAuth());

  constructor() {
    // Automatically persist state changes to localStorage
    effect(() => {
      try {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(this.isAuthenticated()));
        localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser()));
      } catch (e) {
        console.error('Failed to save auth state', e);
      }
    });
  }

  private loadAuth(): boolean {
    try {
      const saved = localStorage.getItem(this.AUTH_KEY);
      return saved !== null ? JSON.parse(saved) : true; // Default true for instant usability
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

  login(email: string, password?: string, fullName?: string): boolean {
    const derivedName = fullName ? fullName.split(' ')[0] : email.split('@')[0];
    const user: User = {
      id: `user-${Date.now()}`,
      name: derivedName || 'Alex',
      fullName: fullName || email.split('@')[0] || 'Alex Morgan',
      email: email,
      role: 'Frontend Developer',
      avatar: (derivedName || 'A')[0].toUpperCase(),
    };

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    this.toastService.show(`Welcome back, ${user.name}!`, 'success');
    this.router.navigate(['/dashboard']);
    return true;
  }

  signup(fullName: string, email: string, password?: string): boolean {
    const firstName = fullName.trim().split(' ')[0] || 'User';
    const user: User = {
      id: `user-${Date.now()}`,
      name: firstName,
      fullName: fullName.trim(),
      email: email.trim(),
      role: 'Product Member',
      avatar: firstName[0].toUpperCase(),
    };

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    this.toastService.show(`Account created! Welcome, ${firstName}.`, 'success');
    this.router.navigate(['/dashboard']);
    return true;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.toastService.show('You have been logged out.', 'info');
    this.router.navigate(['/login']);
  }

  updateProfile(name: string, email: string, role: string): void {
    this.currentUser.update((u) => ({
      ...u,
      fullName: name,
      name: name.split(' ')[0],
      email,
      role,
      avatar: name[0].toUpperCase(),
    }));
    this.toastService.show('Profile updated successfully!', 'success');
  }
}

