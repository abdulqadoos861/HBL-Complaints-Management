import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="bg-white shadow-lg px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="bg-[#a91b2c] p-2 rounded-lg">
          <img src="https://www.hbl.com/assets/images/hbl-logo.png" class="h-6 invert brightness-0" alt="HBL">
        </div>
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">Customer <span class="text-[#a91b2c]">Care</span></h1>
      </div>

      <div class="flex items-center gap-6">
        <button (click)="changeView('dashboard')" class="text-sm font-bold text-gray-600 hover:text-[#a91b2c] transition-colors">Dashboard</button>
        <button (click)="changeView('register')" class="text-sm font-bold text-gray-600 hover:text-[#a91b2c] transition-colors">New Complaint</button>
        <button (click)="changeView('list')" class="text-sm font-bold text-gray-600 hover:text-[#a91b2c] transition-colors">Track Status</button>
        <button (click)="goToProfile()" class="text-sm font-bold text-gray-600 hover:text-[#a91b2c] transition-colors">My Profile</button>
        
        <div class="h-6 w-[1px] bg-gray-200"></div>
        
        <button (click)="logout()" class="text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-all">
          Logout
        </button>
      </div>
    </nav>
  `
})
export class CustomerNavbarComponent {
  @Output() viewChanged = new EventEmitter<'dashboard' | 'register' | 'list'>();

  constructor(private http: HttpClient, private router: Router) {}

  changeView(view: 'dashboard' | 'register' | 'list') {
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
