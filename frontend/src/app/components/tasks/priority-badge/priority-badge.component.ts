import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskPriority } from '../../../models/task.model';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center justify-center font-medium rounded-full border select-none"
      [ngClass]="[
        size === 'xs' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5',
        priorityStyles[priority]?.bg || 'bg-gray-100',
        priorityStyles[priority]?.text || 'text-gray-700',
        priorityStyles[priority]?.border || 'border-gray-200'
      ]"
    >
      {{ priority }}
    </span>
  `,
})
export class PriorityBadgeComponent {
  @Input() priority: TaskPriority = 'Medium';
  @Input() size: 'xs' | 'sm' = 'sm';

  priorityStyles: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    High: {
      bg: 'bg-rose-50',
      text: 'text-rose-700 font-semibold',
      border: 'border-rose-200/80',
    },
    Medium: {
      bg: 'bg-amber-50',
      text: 'text-amber-800 font-semibold',
      border: 'border-amber-200/80',
    },
    Low: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700 font-semibold',
      border: 'border-emerald-200/80',
    },
  };
}

