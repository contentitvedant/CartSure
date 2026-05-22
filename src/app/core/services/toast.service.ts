import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toast = signal<Toast | null>(null);
  toast = this._toast.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this._toast.set({ message, type });
    setTimeout(() => {
      this._toast.set(null);
    }, 3000);
  }
}
