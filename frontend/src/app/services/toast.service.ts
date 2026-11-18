import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toast = signal<ToastMessage | null>(null);

  show(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success'): void {
    const id = Date.now();
    this.toast.set({ id, message, type });

    setTimeout(() => {
      if (this.toast()?.id === id) {
        this.toast.set(null);
      }
    }, 3200);
  }

  clear(): void {
    this.toast.set(null);
  }
}

