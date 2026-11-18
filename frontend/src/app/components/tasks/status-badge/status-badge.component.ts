import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStatus } from '../../../models/task.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      @if (interactive) {
        <button
          type="button"
          (click)="toggleMenu($event)"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:shadow-xs"
          [ngClass]="[
            statusStyles[status]?.bg || 'bg-slate-50',
            statusStyles[status]?.text || 'text-slate-700',
            statusStyles[status]?.border || 'border-slate-200'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="statusStyles[status]?.dot"></span>
          <span>{{ status }}</span>
          <svg class="w-3 h-3 opacity-60 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        @if (isOpen) {
          <div
            class="fixed inset-0 z-30"
            (click)="isOpen = false; $event.stopPropagation()"
          ></div>
          <div class="absolute left-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
            @for (opt of statusOptions; track opt) {
              <button
                type="button"
                (click)="selectStatus(opt, $event)"
                class="w-full text-left px-3 py-1.5 text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
                [ngClass]="status === opt ? 'font-bold text-[#5243E4] bg-purple-50/50' : 'text-gray-700'"
              >
                <span class="w-2 h-2 rounded-full" [ngClass]="statusStyles[opt]?.dot"></span>
                <span>{{ opt }}</span>
              </button>
            }
          </div>
        }
      } @else {
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none"
          [ngClass]="[
            statusStyles[status]?.bg || 'bg-slate-50',
            statusStyles[status]?.text || 'text-slate-700',
            statusStyles[status]?.border || 'border-slate-200'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="statusStyles[status]?.dot"></span>
          <span>{{ status }}</span>
        </span>
      }
    </div>
  `,
})
export class StatusBadgeComponent {
  @Input() status: TaskStatus = 'Pending';
  @Input() interactive: boolean = false;
  @Output() statusChange = new EventEmitter<TaskStatus>();

  isOpen = false;
  statusOptions: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

  statusStyles: Record<TaskStatus, { bg: string; text: string; border: string; dot: string }> = {
    'Pending': {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    },
    'In Progress': {
      bg: 'bg-purple-50',
      text: 'text-[#5243E4]',
      border: 'border-purple-200',
      dot: 'bg-[#5243E4]',
    },
    'Completed': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
  };

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  selectStatus(newStatus: TaskStatus, event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = false;
    if (newStatus !== this.status) {
      this.statusChange.emit(newStatus);
    }
  }
}

