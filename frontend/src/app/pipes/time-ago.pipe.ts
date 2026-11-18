import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDueDate',
  standalone: true,
})
export class FormatDueDatePipe implements PipeTransform {
  transform(dateStr: string): string {
    if (!dateStr) return 'No due date';

    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {}

    return dateStr;
  }
}

