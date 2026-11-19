import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#F8F7FD] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 select-none relative overflow-hidden">
      <!-- Ambient Purple Glows -->
      <div class="absolute top-0 -left-20 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-200/35 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 w-full max-w-md">
        <!-- Main Card -->
        <div class="bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-purple-500/5 p-6 sm:p-8 backdrop-blur-md">
          <!-- Brand Header with Official TaskFlow Logo -->
          <div class="flex flex-col items-center text-center mb-6">
            <img
              src="assets/images/taskflow-logo.png"
              alt="TaskFlow - Organize. Achieve. Connect."
              class="h-24 sm:h-28 w-auto object-contain mx-auto mb-2 select-none"
            />

            <h2 class="text-xl font-bold text-[#1E1B4B] mt-1">
              {{ isSignUp ? 'Create an account' : 'Welcome back!' }}
            </h2>
            <p class="text-xs text-gray-500 mt-1">
              {{ isSignUp ? 'Sign up to start organizing and managing your tasks' : 'Sign in to continue your journey and manage your tasks' }}
            </p>
          </div>

          <!-- Form -->
          <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Full Name (Sign Up only) -->
            @if (isSignUp) {
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">
                  Full Name <span class="text-[#5243E4]">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    formControlName="fullName"
                    placeholder="Alex Morgan"
                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 focus:bg-white text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#5243E4] focus:outline-none transition-all"
                  />
                </div>
              </div>
            }

            <!-- Email -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                Email Address <span class="text-[#5243E4]">*</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="alex.morgan@taskflow.dev"
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50/60 focus:bg-white text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#5243E4] focus:outline-none transition-all"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-gray-700">
                  Password <span class="text-[#5243E4]">*</span>
                </label>
                @if (!isSignUp) {
                  <button
                    type="button"
                    (click)="onForgotPassword()"
                    class="text-[11px] font-semibold text-[#5243E4] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                }
              </div>
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
                  class="w-full pl-10 pr-10 py-2.5 bg-gray-50/60 focus:bg-white text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#5243E4] focus:outline-none transition-all"
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
              <span>{{ isSignUp ? 'Create Account' : 'Log In' }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="px-3 bg-white text-gray-400 font-medium">or</span>
            </div>
          </div>

          <!-- Google Sign-In Demo Button -->
          <button
            type="button"
            (click)="onGoogleLogin()"
            class="w-full py-2.5 px-4 bg-white hover:bg-gray-50 active:scale-[0.99] text-gray-700 font-semibold text-xs sm:text-sm rounded-xl border border-gray-200 shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <!-- Quick 1-Click Demo Login -->
          <div class="mt-3.5 pt-3 border-t border-gray-100 flex justify-center">
            <button
              type="button"
              (click)="onDemoLogin()"
              class="text-xs text-[#5243E4] hover:text-[#4332D4] bg-purple-50 hover:bg-purple-100/70 px-3.5 py-1.5 rounded-xl transition-colors font-semibold border border-purple-200/60 cursor-pointer flex items-center gap-1.5"
            >
              <span>⚡ Instant 1-Click Demo Login</span>
            </button>
          </div>
        </div>

        <!-- Footer Toggle -->
        <div class="text-center mt-5 text-xs text-gray-500 font-medium space-y-2">
          <div>
            @if (isSignUp) {
              Already have an account?
              <button
                type="button"
                (click)="isSignUp = false"
                class="font-bold text-[#5243E4] hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            } @else {
              Don't have an account?
              <button
                type="button"
                (click)="isSignUp = true"
                class="font-bold text-[#5243E4] hover:underline cursor-pointer ml-1"
              >
                Create an account
              </button>
            }
          </div>

          <div class="pt-2 border-t border-gray-100">
            <span class="text-gray-400">System Administrator?</span>
            <a
              routerLink="/admin/login"
              class="font-bold text-[#5243E4] hover:underline ml-1 cursor-pointer"
            >
              Go to Admin Portal &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  isSignUp = false;
  showPassword = false;

  authForm: FormGroup = this.fb.group({
    fullName: [''],
    email: ['alex.morgan@taskflow.dev', [Validators.required, Validators.email]],
    password: ['taskflow2026', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.authForm.invalid) return;

    const { fullName, email, password } = this.authForm.value;
    if (this.isSignUp) {
      this.authService.signup(fullName || 'Alex Morgan', email, password);
    } else {
      this.authService.login(email, password);
    }
  }

  onDemoLogin(): void {
    this.authService.login('alex.morgan@taskflow.dev', 'taskflow2026', 'Alex Morgan');
  }

  onGoogleLogin(): void {
    this.toastService.show('Connecting with Google (Frontend UI Demo)...', 'info');
    setTimeout(() => {
      this.authService.login('alex.google@taskflow.dev', 'googledemo', 'Alex Morgan');
    }, 500);
  }

  onForgotPassword(): void {
    const email = this.authForm.get('email')?.value;
    if (!email) {
      this.toastService.show('Enter your email above to receive password reset instructions', 'info');
    } else {
      this.toastService.show(`Password reset link sent to ${email}`, 'success');
    }
  }
}

