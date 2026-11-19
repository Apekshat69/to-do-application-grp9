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

    // Check token with backend on boot
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this.validateSessionWithBackend();
    }
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

  private validateSessionWithBackend(): void {
    this.http.get<{ success: boolean; user: User }>(`${this.API_URL}/me`).subscribe({
      next: (res) => {
        if (res.user) {
          this.currentUser.set(res.user);
          this.isAuthenticated.set(true);
          this.registerUserIfNew(res.user);
        }
      },
      error: () => {
        // Token expired or server unreachable, maintain current offline fallback
      },
    });
  }

  // Standard User Login via API
  login(email: string, password?: string, fullName?: string): boolean {
    const payload = {
      email: email.trim().toLowerCase(),
      password: password || 'taskflow2026',
    };

    this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).subscribe({
      next: (res) => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }
        const user = res.user || {
          ...this.defaultUser,
          email,
          fullName: fullName || email.split('@')[0],
          name: fullName ? fullName.split(' ')[0] : email.split('@')[0],
        };

        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.registerUserIfNew(user);
        this.toastService.show(res.message || `Welcome back, ${user.name}!`, 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Login failed. Please check backend server.';
        this.toastService.show(errorMsg, 'error');

        // Fallback for demo when backend is offline
        const derivedName = fullName ? fullName.split(' ')[0] : email.split('@')[0];
        const fallbackUser: User = {
          id: `user-${Date.now()}`,
          name: derivedName || 'Alex',
          fullName: fullName || email.split('@')[0] || 'Alex Morgan',
          email,
          role: 'user',
          title: 'Frontend Developer',
          department: 'Engineering',
          status: 'Active',
          joinedDate: 'Jan 15, 2026',
          avatar: (derivedName || 'A')[0].toUpperCase(),
        };
        this.currentUser.set(fallbackUser);
        this.isAuthenticated.set(true);
        this.router.navigate(['/dashboard']);
      },
    });

    return true;
  }

  // Dedicated Admin Login via API
  loginAdmin(email: string, password?: string, fullName?: string): boolean {
    const payload = {
      email: (email || 'admin@taskflow.dev').trim().toLowerCase(),
      password: password || 'admin123',
    };

    this.http.post<AuthResponse>(`${this.API_URL}/admin/login`, payload).subscribe({
      next: (res) => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }
        const adminUser = res.user || {
          ...this.defaultAdmin,
          email: payload.email,
        };

        this.currentUser.set(adminUser);
        this.isAuthenticated.set(true);
        this.toastService.show('Admin authentication successful! Access granted.', 'success');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Admin login failed. Checking backend.';
        this.toastService.show(errorMsg, 'error');

        // Offline fallback for demo
        const fallbackAdmin: User = {
          ...this.defaultAdmin,
          email: email || 'admin@taskflow.dev',
          fullName: fullName || 'TaskFlow Administrator',
          role: 'admin',
        };
        this.currentUser.set(fallbackAdmin);
        this.isAuthenticated.set(true);
        this.router.navigate(['/admin/dashboard']);
      },
    });

    return true;
  }

  // User Registration / Signup via API
  signup(fullName: string, email: string, password?: string): boolean {
    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password || 'taskflow2026',
    };

    this.http.post<AuthResponse>(`${this.API_URL}/register`, payload).subscribe({
      next: (res) => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }
        const user = res.user || {
          ...this.defaultUser,
          fullName: payload.fullName,
          email: payload.email,
          name: payload.fullName.split(' ')[0],
        };

        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.registerUserIfNew(user);
        this.toastService.show(res.message || `Account created! Welcome, ${user.name}.`, 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Registration failed.';
        this.toastService.show(errorMsg, 'error');
      },
    });

    return true;
  }

  logout(redirectRoute?: string): void {
    localStorage.removeItem(this.TOKEN_KEY);
    const target = redirectRoute || (this.isAdmin() ? '/admin/login' : '/login');
    this.isAuthenticated.set(false);
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
