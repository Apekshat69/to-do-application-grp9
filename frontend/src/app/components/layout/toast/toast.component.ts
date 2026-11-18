import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastService.toast(); as t) {
      <div class="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
        <div class="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-purple-100 text-xs sm:text-sm font-medium text-gray-800 max-w-sm">
          @if (t.type === 'success') {
            <div class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          } @else if (t.type === 'error') {
            <div class="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"></line>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"></line>
              </svg>
            </div>
          } @else {
            <div class="w-5 h-5 rounded-full bg-purple-100 text-[#5243E4] flex items-center justify-center shrink-0">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                <line x1="12" y1="16" x2="12" y2="12" stroke-width="2"></line>
                <line x1="12" y1="8" x2="12.01" y2="8" stroke-width="2"></line>
              </svg>
            </div>
          }

          <span class="flex-1">{{ t.message }}</span>

          <button
            type="button"
            (click)="toastService.clear()"
            class="text-gray-400 hover:text-gray-600 ml-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}

