import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  @Output() viewChanged = new EventEmitter<'dashboard' | 'add-employee' | 'complaints' | 'manage-employees' | 'add-product' | 'manage-products'>();
  
  activeView: 'dashboard' | 'add-employee' | 'complaints' | 'manage-employees' | 'add-product' | 'manage-products' = 'dashboard';

  constructor(private router: Router, private http: HttpClient) {}

  changeView(view: 'dashboard' | 'add-employee' | 'complaints' | 'manage-employees' | 'add-product' | 'manage-products') {
    this.activeView = view;
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
