import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastService.toast(); as toast) {
      <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-up-fade">
        <div class="glass-dark px-6 py-3 rounded-full flex items-center space-x-3 border border-white/20">
          @if (toast.type === 'success') {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-green-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
          <span class="text-white text-[14px] font-medium tracking-tight">{{ toast.message }}</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-slide-up-fade {
      animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUpFade {
      from {
        opacity: 0;
        transform: translate(-50%, 20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
