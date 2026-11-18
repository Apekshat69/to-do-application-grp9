import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCategory } from '../../../models/task.model';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 font-medium rounded-md border select-none"
      [ngClass]="[
        size === 'xs' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5',
        categoryStyles[category]?.bg || 'bg-gray-50',
        categoryStyles[category]?.text || 'text-gray-700',
        categoryStyles[category]?.border || 'border-gray-200'
      ]"
    >
      <span>{{ category }}</span>
    </span>
  `,
})
export class CategoryBadgeComponent {
  @Input() category: TaskCategory = 'Work';
  @Input() size: 'xs' | 'sm' = 'sm';

  categoryStyles: Record<TaskCategory, { bg: string; text: string; border: string }> = {
    Work: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-700 font-semibold',
      border: 'border-blue-200/60',
    },
    Personal: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-700 font-semibold',
      border: 'border-rose-200/60',
    },
    Study: {
      bg: 'bg-purple-50',
      text: 'text-[#5243E4] font-semibold',
      border: 'border-purple-200/80',
    },
    Other: {
      bg: 'bg-slate-50',
      text: 'text-slate-700 font-semibold',
      border: 'border-slate-200',
    },
  };
}

