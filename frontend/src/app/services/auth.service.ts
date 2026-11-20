import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { ToastService } from './toast.service';
import { environment } from '../../environments/environment';

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'taskflow_token';
  private readonly AUTH_KEY = 'taskflow_ng_auth';
  private readonly USER_KEY = 'taskflow_ng_user';
  private readonly USERS_LIST_KEY = 'taskflow_ng_registered_users';

  private emptyUser: User = {
    id: '',
    name: '',
    fullName: '',
    email: '',
    role: 'user',
    title: '',
    department: '',
    status: 'Active',
    joinedDate: '',
    avatar: '',
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

    // Check token with backend on boot
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.validateSessionWithBackend();
    }
  }

  private loadAuth(): boolean {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const saved = localStorage.getItem(this.AUTH_KEY);
      return Boolean(token && saved && JSON.parse(saved) === true);
    } catch {
      return false;
    }
  }

  private loadUser(): User {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        const saved = localStorage.getItem(this.USER_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return this.emptyUser;
  }

  private loadRegisteredUsers(): User[] {
    try {
      const saved = localStorage.getItem(this.USERS_LIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }

  private registerUserIfNew(user: User): void {
    if (!user || !user.email) return;
    this.registeredUsers.update((prev) => {
      if (!prev.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
        return [...prev, user];
      }
      return prev;
    });
  }

  private validateSessionWithBackend(): void {
    this.http.get<{ success: boolean; user: User }>(`${this.API_URL}/me`).subscribe({
      next: (res) => {
        if (res.user) {
          this.currentUser.set(res.user);
          this.isAuthenticated.set(true);
          this.registerUserIfNew(res.user);
        }
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
      },
    });
  }

  // Standard User Login via API
  login(email: string, password?: string, fullName?: string): boolean {
    const payload = {
      email: email.trim().toLowerCase(),
      password: password || '',
    };

    this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).subscribe({
      next: (res) => {
        if (res.token && res.user) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.currentUser.set(res.user);
          this.isAuthenticated.set(true);
          this.registerUserIfNew(res.user);
          this.toastService.show(res.message || `Welcome back, ${res.user.name}!`, 'success');

          // Role-based dashboard redirection
          if (res.user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Login failed. Invalid email or password.';
        this.toastService.show(errorMsg, 'error');
      },
    });

    return true;
  }

  // Dedicated Admin Login via API
  loginAdmin(email: string, password?: string, fullName?: string): boolean {
    const payload = {
      email: (email || '').trim().toLowerCase(),
      password: password || '',
    };

    this.http.post<AuthResponse>(`${this.API_URL}/admin/login`, payload).subscribe({
      next: (res) => {
        if (res.token && res.user) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.currentUser.set(res.user);
          this.isAuthenticated.set(true);
          this.registerUserIfNew(res.user);
          this.toastService.show(res.message || 'Admin authentication successful! Access granted.', 'success');
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Administrative login failed. Access denied.';
        this.toastService.show(errorMsg, 'error');
      },
    });

    return true;
  }

  // User Registration / Signup via API
  signup(fullName: string, email: string, password?: string): boolean {
    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password || '',
    };

    this.http.post<AuthResponse>(`${this.API_URL}/register`, payload).subscribe({
      next: (res) => {
        if (res.token && res.user) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.currentUser.set(res.user);
          this.isAuthenticated.set(true);
          this.registerUserIfNew(res.user);
          this.toastService.show(res.message || `Account created! Welcome, ${res.user.name}.`, 'success');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Registration failed.';
        this.toastService.show(errorMsg, 'error');
      },
    });

    return true;
  }

  logout(redirectRoute?: string): void {
    const user = this.currentUser();
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('taskflow_ng_tasks_v20');
    if (user?.id) {
      localStorage.removeItem(`taskflow_ng_tasks_${user.id}`);
    }

    this.currentUser.set(this.emptyUser);
    this.isAuthenticated.set(false);

    const target = redirectRoute || '/login';
    this.toastService.show('You have been logged out.', 'info');
    this.router.navigate([target]);
  }

  updateProfile(name: string, email: string, role: string): void {
    const payload = {
      fullName: name,
      email,
      title: role,
    };

    this.http.put<{ success: boolean; user: User }>(`${environment.apiUrl}/users/profile`, payload).subscribe({
      next: (res) => {
        const updated = res.user || {
          ...this.currentUser(),
          fullName: name,
          name: name.split(' ')[0],
          email,
          title: role,
          avatar: name[0].toUpperCase(),
        };
        this.currentUser.set(updated);
        this.toastService.show('Profile updated successfully!', 'success');
      },
      error: () => {
        // Fallback for local update
        this.currentUser.update((u) => ({
          ...u,
          fullName: name,
          name: name.split(' ')[0],
          email,
          title: role,
          avatar: name[0].toUpperCase(),
        }));
        this.toastService.show('Profile updated locally!', 'success');
      },
    });
  }
}
