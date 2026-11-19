import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#F8F7FD] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 select-none relative overflow-hidden">
      <!-- Ambient Purple & Lavender Glows -->
      <div class="absolute top-0 -left-20 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-200/35 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 w-full max-w-md">
        <!-- Main Admin Login Card -->
        <div class="bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-purple-500/5 p-6 sm:p-8 backdrop-blur-md">
          <!-- Official TaskFlow Logo & Admin Portal Badge -->
          <div class="flex flex-col items-center text-center mb-6">
            <img
              src="assets/images/taskflow-logo.png"
              alt="TaskFlow - Organize. Achieve. Connect."
              class="h-24 sm:h-28 w-auto object-contain mx-auto mb-2 select-none"
            />

            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-[#5243E4] text-xs font-bold uppercase tracking-wider mb-2">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span>Admin Portal</span>
            </div>

            <h2 class="text-xl font-bold text-[#1E1B4B]">
              Administrative Sign In
            </h2>
            <p class="text-xs text-gray-500 mt-1 max-w-xs">
              Access the centralized management console to audit tasks, monitor velocity, and review users.
            </p>
          </div>

          <!-- Form -->
          <form [formGroup]="adminForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                Admin Email <span class="text-[#5243E4]">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                </div>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="admin@taskflow.dev"
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 focus:bg-white text-[#1E1B4B] placeholder-gray-400 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#5243E4] focus:outline-none transition-all"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                Admin Password <span class="text-[#5243E4]">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke-width="2"></rect>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11V7a5 5 0 0110 0v4"></path>
                  </svg>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-2.5 bg-gray-50/60 focus:bg-white text-[#1E1B4B] placeholder-gray-400 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#5243E4] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  @if (showPassword) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full py-2.5 px-4 bg-[#5243E4] hover:bg-[#4332D4] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-button flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>Access Admin Dashboard</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </form>

          <!-- Quick 1-Click Demo Admin Login -->
          <div class="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
            <button
              type="button"
              (click)="onDemoAdminLogin()"
              class="w-full py-2 px-3 text-xs text-[#5243E4] hover:text-[#4332D4] bg-purple-50 hover:bg-purple-100/80 rounded-xl transition-colors font-semibold border border-purple-200/80 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>⚡ Instant 1-Click Admin Demo Login</span>
            </button>
            <p class="text-[11px] text-gray-400 text-center">
              Frontend demonstration with simulated admin session.
            </p>
          </div>
        </div>

        <!-- Switch to User Login Footer -->
        <div class="text-center mt-5 text-xs text-gray-500 font-medium">
          Need standard user workspace access?
          <a
            routerLink="/login"
            class="font-bold text-[#5243E4] hover:underline cursor-pointer ml-1"
          >
            Go to User Login &rarr;
          </a>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  showPassword = false;

  adminForm: FormGroup = this.fb.group({
    email: ['admin@taskflow.dev', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.adminForm.invalid) return;

    const { email, password } = this.adminForm.value;
    this.authService.loginAdmin(email, password);
  }

  onDemoAdminLogin(): void {
    this.authService.loginAdmin('admin@taskflow.dev', 'admin123', 'TaskFlow Administrator');
  }
}
