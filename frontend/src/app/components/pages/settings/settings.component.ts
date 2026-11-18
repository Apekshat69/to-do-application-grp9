import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { TaskService } from '../../../services/task.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <!-- Profile Information Card -->
      <div class="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-5">
        <div>
          <h3 class="text-base font-bold text-[#1E1B4B]">Profile Information</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Update your display identity and workspace contact details.
          </p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                formControlName="fullName"
                class="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#5243E4] focus:outline-none bg-white"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#5243E4] focus:outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Title / Role</label>
            <input
              type="text"
              formControlName="role"
              class="w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#5243E4] focus:outline-none bg-white"
            />
          </div>

          <div class="pt-2 flex justify-end">
            <button
              type="submit"
              [disabled]="profileForm.invalid"
              class="px-4 py-2 bg-[#5243E4] hover:bg-[#4332D4] text-white rounded-xl text-xs font-bold shadow-button flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Task Backlog Maintenance -->
      <div class="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div>
          <h3 class="text-base font-bold text-[#1E1B4B]">Task Backlog Maintenance</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Manage your local workspace task records and backup exports.
          </p>
        </div>

        <div class="divide-y divide-gray-100">
          <!-- Export JSON Backup -->
          <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold text-gray-800">Export Task Backlog</p>
              <p class="text-xs text-gray-400">
                Download all {{ taskService.tasks().length }} tasks in JSON format for offline backup.
              </p>
            </div>
            <button
              type="button"
              (click)="onExportJson()"
              class="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span>Export JSON</span>
            </button>
          </div>

          <!-- Clear Completed Tasks -->
          <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold text-gray-800">Clear Completed Tasks</p>
              <p class="text-xs text-gray-400">
                Remove finished items from your backlog to keep your view streamlined.
              </p>
            </div>
            <button
              type="button"
              (click)="taskService.clearCompleted()"
              class="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              <span>Clear Completed</span>
            </button>
          </div>

          <!-- Reset Sample Tasks -->
          <div class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold text-gray-800">Reset to Sample Tasks</p>
              <p class="text-xs text-gray-400">
                Restore the default 10 sample tasks across Work, Personal, Study, and Other.
              </p>
            </div>
            <button
              type="button"
              (click)="taskService.resetTasks()"
              class="px-3.5 py-1.5 border border-purple-200 text-[#5243E4] hover:bg-purple-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Account & Session -->
      <div class="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div>
          <h3 class="text-base font-bold text-[#1E1B4B]">Account &amp; Session</h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Manage your session or sign out of the TaskFlow application.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <p class="text-xs font-bold text-gray-800">Signed in as {{ authService.currentUser().email }}</p>
            <p class="text-xs text-gray-400">You will be redirected to the login screen when signing out.</p>
          </div>

          <button
            type="button"
            (click)="authService.logout()"
            class="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;

  ngOnInit(): void {
    const user = this.authService.currentUser();
    this.profileForm = this.fb.group({
      fullName: [user.fullName, [Validators.required, Validators.minLength(2)]],
      email: [user.email, [Validators.required, Validators.email]],
      role: [user.role, Validators.required],
    });
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;
    const { fullName, email, role } = this.profileForm.value;
    this.authService.updateProfile(fullName.trim(), email.trim(), role.trim());
  }

  onExportJson(): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.taskService.tasks(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'taskflow_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.toastService.show('Tasks exported to taskflow_backup.json', 'success');
  }
}

