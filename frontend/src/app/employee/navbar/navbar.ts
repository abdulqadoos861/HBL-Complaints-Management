import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="bg-white shadow-lg border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div class="flex items-center gap-4">
        <div class="bg-[#008269] p-2 rounded-xl">
          <i class="fas fa-shield-alt text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-black text-gray-900 tracking-tight">HBL <span class="text-[#008269]">Staff</span></h1>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Internal Portal</p>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <button (click)="changeView('dashboard')" class="text-sm font-bold text-gray-600 hover:text-[#008269] transition-colors">Dashboard</button>
        <button (click)="changeView('complaints')" class="text-sm font-bold text-gray-600 hover:text-[#008269] transition-colors">My Tasks</button>
        <button (click)="goToProfile()" class="text-sm font-bold text-gray-600 hover:text-[#008269] transition-colors">My Profile</button>
        
        <div class="h-6 w-[1px] bg-gray-200"></div>
        
        <div class="flex items-center gap-3 group cursor-pointer">
          <div class="text-right hidden md:block">
            <p class="text-xs font-black text-gray-900">Staff Member</p>
            <p class="text-[9px] font-bold text-gray-400 uppercase">Online</p>
          </div>
          <button (click)="logout()" class="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class EmployeeNavbarComponent {
  @Output() viewChanged = new EventEmitter<'dashboard' | 'complaints'>();

  constructor(private http: HttpClient, private router: Router) {}

  changeView(view: 'dashboard' | 'complaints') {
    this.viewChanged.emit(view);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.http.post('http://localhost:3000/api/logout', {}, { withCredentials: true }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
