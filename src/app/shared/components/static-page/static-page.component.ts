import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-static-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-[800px] mx-auto px-4 py-20 text-center animate-fade-in">
      <h1 class="text-5xl font-semibold tracking-tight text-gray-900 mb-6">{{ title }}</h1>
      <p class="text-[19px] text-gray-500 leading-relaxed mb-10">{{ content }}</p>
      
      <div class="bg-gray-50 rounded-[2rem] p-10 border border-gray-100">
        <p class="text-gray-400 font-medium italic">This page is currently under construction to match the premium CartSure experience.</p>
      </div>

      <button routerLink="/" class="mt-12 bg-black text-white px-8 py-3.5 rounded-full text-[15px] font-medium hover:bg-gray-800 transition-colors">
        Back to Home
      </button>
    </div>
  `
})
export class StaticPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  title = '';
  content = '';

  ngOnInit() {
    this.route.url.subscribe(url => {
      const path = url[0].path;
      if (path === 'about') {
        this.title = 'About CartSure.';
        this.content = 'CartSure is a premium technology retailer dedicated to bringing the world\'s most advanced electronics to your doorstep with a seamless, Apple-inspired shopping experience.';
      } else {
        this.title = 'Contact Us';
        this.content = 'Have questions about your order or our products? Our specialist team is here to help you find exactly what you need.';
      }
    });
  }
}
