import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  template: `
    <div class="p-10 text-center animate-pulse">
      <div class="mb-6">
        <i class="fas fa-tools text-6xl text-gray-300"></i>
      </div>
      <h2 class="text-3xl font-bold text-gray-400">Dashboard Content</h2>
      <p class="text-xl text-gray-400 mt-2">hey content will be uploaded soon...</p>
    </div>
  `
})
export class AdminHomeComponent {}
