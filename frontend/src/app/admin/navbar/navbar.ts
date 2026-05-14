import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  @Output() viewChanged = new EventEmitter<'dashboard' | 'add-employee' | 'complaints'>();
  
  activeView: 'dashboard' | 'add-employee' | 'complaints' = 'dashboard';

  constructor(private router: Router) {}

  changeView(view: 'dashboard' | 'add-employee' | 'complaints') {
    this.activeView = view;
    this.viewChanged.emit(view);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    console.log('Logging out...');
  }
}
